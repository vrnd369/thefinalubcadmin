// Service Worker for caching assets
const CACHE_NAME = 'ubc-website-v1';
const IMAGE_CACHE = 'ubc-images-v1';
const VIDEO_CACHE = 'ubc-videos-v1';
const API_CACHE = 'ubc-api-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        // Ignore errors for missing files
        console.log('Some static assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== IMAGE_CACHE &&
            cacheName !== VIDEO_CACHE &&
            cacheName !== API_CACHE
          ) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Take control of all pages
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip admin routes
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/superadmin') || url.pathname.startsWith('/subadmin')) {
    return;
  }

  // Handle images
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i) ||
    url.hostname.includes('firebasestorage') ||
    url.hostname.includes('storage.googleapis.com')
  ) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Handle videos
  if (
    request.destination === 'video' ||
    url.pathname.match(/\.(mp4|webm|ogg|mov)$/i) ||
    url.hostname.includes('firebasestorage') ||
    url.hostname.includes('storage.googleapis.com')
  ) {
    event.respondWith(cacheFirst(request, VIDEO_CACHE));
    return;
  }

  // Handle API/Firestore requests - network first with cache fallback
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebaseapp.com')
  ) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Handle static assets - cache first
  if (
    url.pathname.startsWith('/static/') ||
    url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/i)
  ) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // Default: network first for HTML pages
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }
});

// Cache first strategy - check cache, then network
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    // Return cached version immediately
    return cached;
  }

  try {
    // Skip caching for non-HTTP/HTTPS schemes (e.g., chrome-extension://, data:, blob:)
    const url = new URL(request.url);
    if (!url.protocol.startsWith('http')) {
      // Just fetch and return without caching
      return await fetch(request);
    }

    // Fetch from network
    const response = await fetch(request);
    
    // Cache successful responses only if:
    // 1. Response is OK (status 200-299)
    // 2. Not a partial response (status 206)
    // 3. Response type is not opaque (CORS issues)
    if (response.ok && response.status !== 206 && response.type !== 'opaque') {
      try {
        // Clone response before caching (responses can only be read once)
        const responseToCache = response.clone();
        await cache.put(request, responseToCache);
      } catch (cacheError) {
        // Silently fail if caching is not possible (e.g., quota exceeded, unsupported scheme)
        console.warn('Failed to cache response:', cacheError);
      }
    }
    
    return response;
  } catch (error) {
    // Network failed and no cache - return error response
    return new Response('Network error', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

// Network first strategy - try network, fallback to cache
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    // Skip caching for non-HTTP/HTTPS schemes (e.g., chrome-extension://, data:, blob:)
    const url = new URL(request.url);
    if (!url.protocol.startsWith('http')) {
      // Just fetch and return without caching
      return await fetch(request);
    }

    // Try network first
    const response = await fetch(request);
    
    // Cache successful responses only if:
    // 1. Response is OK (status 200-299)
    // 2. Not a partial response (status 206)
    // 3. Response type is not opaque (CORS issues)
    if (response.ok && response.status !== 206 && response.type !== 'opaque') {
      try {
        const responseToCache = response.clone();
        await cache.put(request, responseToCache);
      } catch (cacheError) {
        // Silently fail if caching is not possible (e.g., quota exceeded, unsupported scheme)
        console.warn('Failed to cache response:', cacheError);
      }
    }
    
    return response;
  } catch (error) {
    // Network failed - try cache
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    // Both failed
    throw error;
  }
}

