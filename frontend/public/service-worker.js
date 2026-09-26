/* public/service-worker.js — Clean PWA & Push Service Worker */

const CACHE_NAME = 'shelfai-cache-v5';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

/* ---------------- Install ---------------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

/* ---------------- Activate ---------------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null))
      );
    }).then(() => self.clients.claim())
  );
});

/* ---------------- Fetch Strategy ---------------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Skip internal Vite dev endpoints & extensions
  if (!url.protocol.startsWith('http')) return;
  if (url.pathname.includes('/@') || url.pathname.includes('node_modules')) return;

  // 1) Navigation requests (HTML pages)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 2) API requests -> network first
  if (url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // 3) Static assets -> cache-first, then network
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).catch(() => null))
  );
});

/* ---------------- Push Notification Handler ---------------- */
self.addEventListener('push', (event) => {
  let data = {};
  try {
    if (event.data) {
      try {
        data = event.data.json();
      } catch (e) {
        data = { body: event.data.text ? event.data.text() : String(event.data) };
      }
    }
  } catch (e) {
    data = { body: 'You have a new notification' };
  }

  const title = data.title || 'SmartShelf Notification';
  const options = {
    body: data.body || 'You have a new alert',
    icon: data.icon || '/assets/logo.png',
    badge: data.badge || '/assets/logo2.png',
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(title, options).then(() => {
      return clients.matchAll({ includeUncontrolled: true }).then((allClients) => {
        for (const c of allClients) {
          c.postMessage({ type: 'PUSH_RECEIVED', title, body: options.body, data });
        }
      });
    }).catch(() => {})
  );
});

/* ---------------- Notification Click Handler ---------------- */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      for (const c of clientsList) {
        if (c.url && c.url.includes(self.location.origin)) {
          return c.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});
