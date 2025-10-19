// public/service-worker.js
const VERSION = 'v9';
const CACHE_STATIC  = `cinemoria-static-${VERSION}`;
const CACHE_RUNTIME = `cinemoria-runtime-${VERSION}`;

// Bygg relativt till SW-scope (klarar /Cinemoria/)
const BASE = self.registration.scope; // ex: https://<user>.github.io/Cinemoria/
const path = (p) => new URL(p, BASE).pathname;

// === Precache-lista ===
// Tips: låt denna bara innehålla “kärnfiler”. Övriga assets fångas av looksStatic().
const PRECACHE = [
  path('index.html'),
  path('manifest.webmanifest'),
  path('favicon.ico'),
  path('icons/icon-192.png'),
  path('icons/icon-512.png'),
  // valfritt: lägg till bundlade filer här när du vet namnen
  // path('assets/index-XXXX.css'),
  // path('assets/index-XXXX.js'),
];

// Hjälpfunktioner
const isSameOrigin = (req) => new URL(req.url).origin === self.location.origin;
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
const okToCache = (res) => res && res.status === 200 && (res.type === 'basic' || res.type === 'default');

// Install: pre-cachea kärnfiler
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_STATIC).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

// Aktiviera snabbt, städa gamla caches och slå på navigation preload
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k !== CACHE_STATIC && k !== CACHE_RUNTIME)
        .map((k) => caches.delete(k))
    );
    if ('navigationPreload' in self.registration) {
      try { await self.registration.navigationPreload.enable(); } catch {}
    }
  })());
  self.clients.claim();
});

// Möjliggör att klienten kan trigga skipWaiting()
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// Fetch-strategi:
// - Navigationsförfrågningar (SPA): network-first (med preload) + fallback index.html
// - Egna statiska filer: cache-first
// - Övrigt: network-first (cacha om same-origin)
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  // 1) SPA navigationer
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // använd preload-svar om tillgängligt
        const preload = await event.preloadResponse;
        if (preload) return preload;

        const fresh = await fetch(req);
        return fresh;
      } catch {
        const cache = await caches.open(CACHE_STATIC);
        // försök hitta exakt index.html
        let fallback = await cache.match(path('index.html'), { ignoreSearch: true });
        // sista chans: global match i static-cachen
        if (!fallback) fallback = await caches.match(path('index.html'), { ignoreSearch: true });
        return fallback || Response.error();
      }
    })());
    return;
  }

  const url = new URL(req.url);

  // 2) Cache-first för våra statiska assets
  if (isSameOrigin(req) && looksStatic(url)) {
    event.respondWith(
      caches.match(req).then((hit) =>
        hit ||
        fetch(req).then((res) => {
          if (okToCache(res)) {
            const copy = res.clone();
            caches.open(CACHE_STATIC).then((c) => c.put(req, copy));
          }
          return res;
        })
      )
    );
    return;
  }

  // 3) Network-first för resten (cacha om same-origin)
  event.respondWith((async () => {
    try {
      const fresh = await fetch(req);
      if (isSameOrigin(req) && okToCache(fresh)) {
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
        const fallback = await c.match(path('index.html'), { ignoreSearch: true });
        if (fallback) return fallback;
      }
      return Response.error();
    }
  })());
});