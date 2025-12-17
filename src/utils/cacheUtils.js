/**
 * IndexedDB cache utility for persistent storage of images and videos
 * Provides fast access to cached media assets
 */

const DB_NAME = 'ubc_media_cache';
const DB_VERSION = 1;
const STORE_IMAGES = 'images';
const STORE_VIDEOS = 'videos';
const STORE_METADATA = 'metadata';

// Cache expiration: 7 days
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

let dbPromise = null;

/**
 * Initialize IndexedDB
 */
function initDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create image store
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        const imageStore = db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
        imageStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Create video store
      if (!db.objectStoreNames.contains(STORE_VIDEOS)) {
        const videoStore = db.createObjectStore(STORE_VIDEOS, { keyPath: 'id' });
        videoStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Create metadata store
      if (!db.objectStoreNames.contains(STORE_METADATA)) {
        db.createObjectStore(STORE_METADATA, { keyPath: 'key' });
      }
    };
  });

  return dbPromise;
}

/**
 * Get cached image from IndexedDB
 */
export async function getCachedImage(imageId) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_IMAGES], 'readonly');
    const store = transaction.objectStore(STORE_IMAGES);
    const request = store.get(imageId);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result && Date.now() - result.timestamp < CACHE_EXPIRY) {
          resolve(result.url);
        } else {
          // Expired or not found
          if (result) {
            // Delete expired entry
            deleteCachedImage(imageId);
          }
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    return null;
  }
}

/**
 * Cache image URL in IndexedDB
 */
export async function cacheImage(imageId, url) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_IMAGES], 'readwrite');
    const store = transaction.objectStore(STORE_IMAGES);
    await store.put({
      id: imageId,
      url: url,
      timestamp: Date.now(),
    });
  } catch (error) {
    // Silently fail - caching is optional
  }
}

/**
 * Delete cached image
 */
async function deleteCachedImage(imageId) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_IMAGES], 'readwrite');
    const store = transaction.objectStore(STORE_IMAGES);
    await store.delete(imageId);
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Get cached video from IndexedDB
 */
export async function getCachedVideo(videoId) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_VIDEOS], 'readonly');
    const store = transaction.objectStore(STORE_VIDEOS);
    const request = store.get(videoId);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result && Date.now() - result.timestamp < CACHE_EXPIRY) {
          resolve(result.url);
        } else {
          // Expired or not found
          if (result) {
            // Delete expired entry
            deleteCachedVideo(videoId);
          }
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    return null;
  }
}

/**
 * Cache video URL in IndexedDB
 */
export async function cacheVideo(videoId, url) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_VIDEOS], 'readwrite');
    const store = transaction.objectStore(STORE_VIDEOS);
    await store.put({
      id: videoId,
      url: url,
      timestamp: Date.now(),
    });
  } catch (error) {
    // Silently fail - caching is optional
  }
}

/**
 * Delete cached video
 */
async function deleteCachedVideo(videoId) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_VIDEOS], 'readwrite');
    const store = transaction.objectStore(STORE_VIDEOS);
    await store.delete(videoId);
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Clean up expired cache entries
 */
export async function cleanupExpiredCache() {
  try {
    const db = await initDB();
    const now = Date.now();

    // Clean images
    const imageTransaction = db.transaction([STORE_IMAGES], 'readwrite');
    const imageStore = imageTransaction.objectStore(STORE_IMAGES);
    const imageIndex = imageStore.index('timestamp');
    const imageRange = IDBKeyRange.upperBound(now - CACHE_EXPIRY);
    const imageRequest = imageIndex.openCursor(imageRange);

    imageRequest.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    // Clean videos
    const videoTransaction = db.transaction([STORE_VIDEOS], 'readwrite');
    const videoStore = videoTransaction.objectStore(STORE_VIDEOS);
    const videoIndex = videoStore.index('timestamp');
    const videoRange = IDBKeyRange.upperBound(now - CACHE_EXPIRY);
    const videoRequest = videoIndex.openCursor(videoRange);

    videoRequest.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  } catch (error) {
    // Ignore cleanup errors
  }
}

// Run cleanup on load (once per session)
if (typeof window !== 'undefined') {
  // Run cleanup after a delay to not block initial load
  setTimeout(cleanupExpiredCache, 5000);
}

