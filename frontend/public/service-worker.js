/* service-worker.js — Safe GET-only caching + Push */

const CACHE_NAME = 'shelfai-cache-v3';
const ASSETS = [
  '/',                 // optional: only if your app serves index.html at /
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

/* ---------------- Install: warm basic assets (GET only) ---------------- */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      for (const url of ASSETS) {
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          if (res && res.ok) await cache.put(url, res.clone());
        } catch {
          // ignore individual asset fetch failures during dev
        }
      }
    } finally {
      self.skipWaiting();
    }
  })());
});

/* ---------------- Activate: remove old caches ---------------- */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : undefined))
    );
    await self.clients.claim();
  })());
});

/* ---------------- Fetch strategy ----------------
   - Only handle GET. Ignore POST/PUT/PATCH/DELETE to avoid errors.
   - /api/** : network-first, fallback to cache if offline.
   - everything else (static): cache-first, then network + cache.
--------------------------------------------------*/
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only cache GET requests
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // API → network-first
  if (url.pathname.startsWith('/api')) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        // Only cache successful, basic/opaque GET responses
        try {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, res.clone());
        } catch {}
        return res;
      } catch {
        const cached = await caches.match(req);
        return cached || new Response(
          JSON.stringify({ error: 'offline' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      }
    })());
    return;
  }

  // Static → cache-first
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    const res = await fetch(req);
    try {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, res.clone());
    } catch {}
    return res;
  })());
});

/* ---------------- Push notifications ---------------- */
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch {}

  const title = data.title || 'Notification';
  const options = {
    body: data.body || 'You have a message',
    icon: '/icons/icon-192.png',  // keep if you have these files
    badge: '/icons/badge-72.png', // optional
    data
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

/* ---------------- Click → focus or open app ---------------- */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil((async () => {
    const clientsList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of clientsList) {
      if (c.url.includes(self.location.origin)) return c.focus();
    }
    return clients.openWindow(targetUrl);
  })());
});
