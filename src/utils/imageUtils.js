import { getImageById } from '../admin/services/imageService';
import { getCachedImage, cacheImage } from './cacheUtils';

// Simple in-memory cache to avoid refetching the same image ID repeatedly.
// Keeps both the pending promise and the resolved URL for fastest reuse.
const imageCache = new Map();

/**
 * Resolve an image reference to a URL
 * Handles both image IDs (Firestore document IDs) and direct URLs (base64, http, or Storage URLs)
 * Uses IndexedDB cache for persistent storage across page reloads
 * @param {string} imageRef - Image ID or URL
 * @returns {Promise<string|null>} Image URL (Storage URL, base64 data URL, or http URL)
 */
export const resolveImageUrl = async (imageRef) => {
  if (!imageRef) return null;
  
  // If it's already a URL (base64 or http), return it directly
  if (typeof imageRef === 'string' && (
    imageRef.startsWith('data:') || 
    imageRef.startsWith('http://') || 
    imageRef.startsWith('https://') ||
    imageRef.startsWith('/') // treat public asset paths as already-resolved
  )) {
    return imageRef;
  }

  // Check in-memory cache first (fastest)
  if (imageCache.has(imageRef)) {
    const cached = imageCache.get(imageRef);
    // If it's a promise, return it; if it's a URL, return it
    return cached instanceof Promise ? cached : Promise.resolve(cached);
  }
  
  // Check IndexedDB cache (persistent across reloads)
  const indexedDBCache = await getCachedImage(imageRef);
  if (indexedDBCache) {
    // Store in memory cache for faster access
    imageCache.set(imageRef, indexedDBCache);
    return indexedDBCache;
  }
  
  // Otherwise, it's an image ID - fetch from Firestore
  const fetchPromise = (async () => {
    try {
      const imageUrl = await getImageById(imageRef);
      // Cache the final URL for instant reuse; clear if missing
      if (imageUrl) {
        imageCache.set(imageRef, imageUrl);
        // Also cache in IndexedDB for persistence
        await cacheImage(imageRef, imageUrl);
      } else {
        imageCache.delete(imageRef);
      }
      return imageUrl;
    } catch (error) {
      imageCache.delete(imageRef);
      throw error;
    }
  })();

  // Store the pending promise to de-duplicate concurrent fetches
  imageCache.set(imageRef, fetchPromise);

  try {
    return await fetchPromise;
  } catch (error) {
    // Only log errors in development mode to reduce console noise
    // Missing images are common when data is cleaned up or migrated
    if (process.env.NODE_ENV === 'development') {
      console.debug('Error resolving image:', imageRef, error.message);
    }
    return null;
  }
};

// Note: React hook removed - use resolveImageUrl directly in useEffect

