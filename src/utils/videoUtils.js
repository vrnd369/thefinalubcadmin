import { getVideoById } from '../admin/services/videoService';
import { getCachedVideo, cacheVideo } from './cacheUtils';

// In-memory cache for videos
const videoCache = new Map();

/**
 * Extract Google Drive file ID and convert to direct video URL
 */
const convertGoogleDriveToVideoUrl = (url) => {
  if (!url || !url.includes('drive.google.com')) {
    return url;
  }

  // Extract file ID
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const fileId = fileMatch ? fileMatch[1] : (idMatch ? idMatch[1] : null);

  if (fileId) {
    // Convert to direct video stream URL using 'view' export (better for streaming)
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  return url;
};

/**
 * Resolve a video reference to a URL
 * Handles both video IDs (Firestore document IDs) and direct URLs (base64, http, or YouTube/Vimeo)
 * Uses IndexedDB cache for persistent storage across page reloads
 * @param {string} videoRef - Video ID or URL
 * @returns {Promise<string|null>} Video URL (base64 data URL, http URL, or YouTube/Vimeo URL)
 */
export const resolveVideoUrl = async (videoRef) => {
  if (!videoRef) return null;
  
  // If it's already a URL (base64, http, or any external video platform), convert Google Drive if needed
  if (typeof videoRef === 'string' && (
    videoRef.startsWith('data:') || 
    videoRef.startsWith('http://') || 
    videoRef.startsWith('https://')
  )) {
    // Convert Google Drive URLs to direct video stream URLs
    return convertGoogleDriveToVideoUrl(videoRef);
  }
  
  // Check in-memory cache first (fastest)
  if (videoCache.has(videoRef)) {
    const cached = videoCache.get(videoRef);
    return cached instanceof Promise ? cached : Promise.resolve(cached);
  }
  
  // Check IndexedDB cache (persistent across reloads)
  const indexedDBCache = await getCachedVideo(videoRef);
  if (indexedDBCache) {
    // Store in memory cache for faster access
    videoCache.set(videoRef, indexedDBCache);
    return indexedDBCache;
  }
  
  // Otherwise, it's a video ID - fetch from Firestore
  const fetchPromise = (async () => {
    try {
      const videoUrl = await getVideoById(videoRef);
      if (videoUrl) {
        // Return Storage URL (http/https) or base64 data URL (legacy)
        let finalUrl = null;
        if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
          finalUrl = videoUrl; // Storage URL
        } else if (videoUrl.startsWith('data:video/')) {
          finalUrl = videoUrl; // Base64 data URL (legacy)
        }
        
        if (finalUrl) {
          // Cache in memory and IndexedDB
          videoCache.set(videoRef, finalUrl);
          await cacheVideo(videoRef, finalUrl);
          return finalUrl;
        }
      }
      return null;
    } catch (error) {
      videoCache.delete(videoRef);
      console.error('Error resolving video:', error.message);
      return null;
    }
  })();

  // Store the pending promise to de-duplicate concurrent fetches
  videoCache.set(videoRef, fetchPromise);

  return fetchPromise;
};

