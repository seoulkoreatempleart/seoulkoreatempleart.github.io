const PAGE_CACHE = 'temple-art-pages-v1';
const MEDIA_CACHE = 'temple-art-media-v1';

const PRECACHE_PAGES = [
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

const MAX_MEDIA_ITEMS = 120;

// INSTALL
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(PAGE_CACHE).then(cache => cache.addAll(PRECACHE_PAGES))
  );
});

// ACTIVATE
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(k => ![PAGE_CACHE, MEDIA_CACHE].includes(k))
            .map(k => caches.delete(k))
        )
      )
    ])
  );
});

// FETCH
self.addEventListener('fetch', event => {
  // App shell for offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(res => res || fetch(event.request))
    );
    return;
  }

  // Images & PDFs
  if (
    event.request.destination === 'image' ||
    event.request.url.endsWith('.pdf')
  ) {
    event.respondWith(cacheMedia(event.request));
    return;
  }

  // Everything else
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});

// MEDIA CACHE
async function cacheMedia(request) {
  const cache = await caches.open(MEDIA_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  await cache.put(request, response.clone());
  await trimCache(cache, MAX_MEDIA_ITEMS);
  return response;
}

// Trim oldest
async function trimCache(cache, maxItems) {
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
  }
}
