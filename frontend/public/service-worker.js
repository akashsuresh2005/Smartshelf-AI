/* public/service-worker.js — Safe GET-only caching + robust Push handling */

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
        } catch (err) {
          // ignore individual asset fetch failures during dev
        }
      }
    } finally {
      // activate worker immediately
      self.skipWaiting();
    }
  })());
});

/* ---------------- Activate: remove old caches ---------------- */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : undefined)));
      await self.clients.claim();
    } catch (err) {
      // ignore
    }
  })());
});

/* ---------------- Fetch strategy (only GET handled) ----------------
   - /api/**  -> network-first, fallback to cache
   - static  -> cache-first, then network + cache
--------------------------------------------------*/
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // API requests -> network-first
  if (url.pathname.startsWith('/api')) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        try {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, res.clone()).catch(() => {});
        } catch {}
        return res;
      } catch {
        const cached = await caches.match(req);
        return cached || new Response(JSON.stringify({ error: 'offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    })());
    return;
  }

  // Static assets -> cache-first
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    const res = await fetch(req);
    try {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, res.clone()).catch(() => {});
    } catch {}
    return res;
  })());
});

/* ---------------- Push handler (robust, accepts JSON or text) ---------------- */
self.addEventListener('push', (event) => {
  let data = {};
  try {
    if (event.data) {
      // Try JSON first, fallback to text
      try {
        data = event.data.json();
      } catch (e) {
        try {
          const text = event.data.text ? event.data.text() : String(event.data);
          data = { body: text };
        } catch (e2) {
          data = { body: 'You have a message' };
        }
      }
    }
  } catch (e) {
    data = { body: 'You have a message' };
  }

  const title = data.title || 'Notification';
  const options = {
    body: data.body || 'You have a message',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/badge-72.png',
    data: data
  };

  // Show the notification — guard with try/catch to avoid uncaught promise
  event.waitUntil((async () => {
    try {
      await self.registration.showNotification(title, options);
      // Optionally, inform clients that a push arrived (useful for UI updates)
      try {
        const allClients = await clients.matchAll({ includeUncontrolled: true });
        for (const c of allClients) {
          c.postMessage({ type: 'PUSH_RECEIVED', title, body: options.body, data });
        }
      } catch {}
    } catch (err) {
      // If notification fails (e.g. permission issues), notify clients so they can surface it
      try {
        const allClients = await clients.matchAll({ includeUncontrolled: true });
        for (const c of allClients) {
          c.postMessage({ type: 'PUSH_IGNORED', reason: String(err), data });
        }
      } catch {}
    }
  })());
});

/* ---------------- Click → focus or open app ---------------- */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil((async () => {
    try {
      const clientsList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const c of clientsList) {
        // focus an open window that matches origin
        if (c.url && c.url.includes(self.location.origin)) {
          try { c.focus(); } catch {}
          return;
        }
      }
      // open a new window/tab if none found
      return clients.openWindow(targetUrl);
    } catch (err) {
      // ignore
    }
  })());
});
