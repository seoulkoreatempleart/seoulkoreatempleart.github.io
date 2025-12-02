const CACHE_NAME = 'temple-art-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/illustrations.html',
  '/paintings.html',
  '/musings.html',
  '/about.html',
  '/favicon-32.png',
  '/favicon-180.png',
  '/favicon-192.png',
  '/favicon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
