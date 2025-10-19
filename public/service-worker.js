// public/service-worker.js
const VERSION = 'v7';
const CACHE_STATIC = `cinemoria-static-${VERSION}`;
const CACHE_RUNTIME = `cinemoria-runtime-${VERSION}`;

// Bygg relativt till SW-scope (klarar /Cinemoria/)
const BASE = self.registration.scope;               // ex: https://<user>.github.io/Cinemoria/
const path = (p) => new URL(p, BASE).pathname;

// === Precache-lista (lägg till/ta bort här vid behov) ===
const PRECACHE = [
  path('index.html'),
  path('manifest.webmanifest'),
  path('favicon.ico'),
  // Ikoner
  path('icons/icon-192.png'),
  path('icons/icon-512.png'),
  // Vite assets (lägg gärna till din bundlade css/js när du vet filnamnen)
  // path('assets/index-XXXX.css'),
  // path('assets/index-XXXX.js'),
];

// Hjälp: bestäm om request är till vår egen origin
const isSameOrigin = (req) => new URL(req.url).origin === self.location.origin;
// Hjälp: enkel heuristic för statiska filer
const looksStatic = (url) => (
  url.pathname.startsWith(path('assets/')) ||
  url.pathname.startsWith(path('icons/'))  ||
  url.pathname.endsWith('.css') ||
  url.pathname.endsWith('.js')  ||
  url.pathname.endsWith('.png') ||
  url.pathname.endsWith('.jpg') ||
  url.pathname.endsWith('.svg') ||
  url.pathname.endsWith('.webp')||
  url.pathname.endsWith('.woff')||
  url.pathname.endsWith('.woff2')
);

// Install: pre-cachea kärnfiler
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((c) => c.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Aktiviera snabbt och städa gamla caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_STATIC && k !== CACHE_RUNTIME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch-strategi:
// - Navigationsförfrågningar (SPA): network-first + fallback till index.html
// - Egna statiska filer: cache-first
// - Övrigt: network-first (cacha svar om same-origin)
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Bara GET
  if (req.method !== 'GET') return;

  // 1) SPA navigationer
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          return fresh;
        } catch {
          const cache = await caches.open(CACHE_STATIC);
          const fallback = await cache.match(path('index.html'));
          return fallback || Response.error();
        }
      })()
    );
    return;
  }

  const url = new URL(req.url);

  // 2) Cache-first för våra statiska assets
  if (isSameOrigin(req) && looksStatic(url)) {
    event.respondWith(
      caches.match(req).then((hit) =>
        hit ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_STATIC).then((c) => c.put(req, copy));
          return res;
        })
      )
    );
    return;
  }

  // 3) Network-first för resten (cacha om same-origin)
  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(req);
        if (isSameOrigin(req)) {
          const copy = fresh.clone();
          const c = await caches.open(CACHE_RUNTIME);
          c.put(req, copy);
        }
        return fresh;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        // Sista utväg: om det var en sida, ge index.html
        if (req.headers.get('accept')?.includes('text/html')) {
          const c = await caches.open(CACHE_STATIC);
          const fallback = await c.match(path('index.html'));
          if (fallback) return fallback;
        }
        return Response.error();
      }
    })()
  );
});