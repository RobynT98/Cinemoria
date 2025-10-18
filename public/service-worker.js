const CACHE_NAME = 'cinemoria-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
];

// Installera och cacha kärnfiler
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Serve ur cache, fallback till nätet
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});

// Rensa gamla cacheversioner
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});