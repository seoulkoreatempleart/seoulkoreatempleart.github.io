const PAGE_CACHE = 'temple-art-pages-v1';
const MEDIA_CACHE = 'temple-art-media-v1';

const PRECACHE_PAGES = [
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

const MAX_MEDIA_ITEMS = 120; // images + PDFs

// INSTALL — core pages
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PAGE_CACHE).then(cache => cache.addAll(PRECACHE_PAGES))
  );
});

// FETCH
self.addEventListener('fetch', event => {
  const request = event.request;

  // 🖼️ Images & PDFs — cache-first
  if (
    request.destination === 'image' ||
    request.destination === 'document' && request.url.endsWith('.pdf')
  ) {
    event.respondWith(cacheMedia(request));
    return;
  }

  // 📄 Pages & others — network first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Cache media with limit
async function cacheMedia(request) {
  const cache = await caches.open(MEDIA_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  await cache.put(request, response.clone());
  await trimCache(cache, MAX_MEDIA_ITEMS);

  return response;
}

// Trim oldest cache entries
async function trimCache(cache, maxItems) {
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
  }
}

// ACTIVATE — cleanup
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => ![PAGE_CACHE, MEDIA_CACHE].includes(k))
          .map(k => caches.delete(k))
      )
    )
  );
});
