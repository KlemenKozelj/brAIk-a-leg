// Actor Coach PWA — Service Worker
// Caches app assets only (not API responses or videos)

const CACHE_NAME = 'actor-coach-v1';

// App shell assets to pre-cache
const APP_ASSETS = [
  '/',
  '/roulette',
  '/record',
  '/feedback',
  '/manifest.json',
];

// Install: pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve from cache for app assets, network for everything else
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only cache same-origin GET requests for app pages/assets
  if (
    request.method === 'GET' &&
    url.origin === self.location.origin &&
    (url.pathname === '/' ||
      url.pathname.startsWith('/_next/') ||
      url.pathname.startsWith('/icons/') ||
      url.pathname === '/manifest.json')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        // Return cached if available, otherwise fetch and cache
        return (
          cached ||
          fetch(request).then((response) => {
            // Don't cache non-OK responses
            if (!response || response.status !== 200) return response;
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
        );
      })
    );
    return;
  }

  // For API calls and other requests, go to network only
  event.respondWith(fetch(request).catch(() => {
    // If offline and it's a page navigation, show cached version
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    return new Response('Offline', { status: 503 });
  }));
});
