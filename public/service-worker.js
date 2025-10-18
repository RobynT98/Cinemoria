const CACHE_NAME = 'cinemoria-v4';

// Bygg paths relativt till scope (funkar under /Cinemoria/)
const BASE = self.registration.scope; // ex: https://user.github.io/Cinemoria/
const url = (p) => new URL(p, BASE).pathname;

const ASSETS = [
  url('index.html'),
  url('manifest.webmanifest'),
];

// install: cachea kärnfiler
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// aktivera direkt och ta över öppna clients
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// cache-first för GET
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});