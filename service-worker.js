const CACHE_NAME = 'temple-art-cache-v2';

// Files to pre-cache (static pages & icons)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/illustrations.html',
  '/paintings.html',
  '/musings.html',
  '/about.html',

  // Your individual illustration pages
  '/illustration1.html',
  '/illustration2.html',
  '/illustration3.html',
  '/illustration4.html',
  '/illustration5.html',

  // Icons
  '/favicon-32.png',
  '/favicon-180.png',
  '/favicon-192.png',
  '/favicon-512.png',

  // Offline fallback page
  '/offline.html'
];

// Install: cache core pages & icons
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
});

// Fetch: cache-first for all images + pages
self.addEventListener('fetch', event => {
  const request = event.request;

  // If it's an image → use cache-first and auto-cache future images
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        return (
          cachedResponse ||
          fetch(request).then(networkResponse => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(request, networkResponse.clone());
              return networkResponse;
            });
          })
        );
      })
    );
    return;
  }

  // For pages & other files → network first, fallback to offline page
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request).then(response => {
        return response || caches.match('/offline.html');
      });
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});
