// // frontend/src/utils/pushClient.js
// // Helper to ensure the current browser has a PushSubscription registered and saved on the server.

// import api from './api.js';

// const PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY; // base64url-encoded VAPID public key

// function urlBase64ToUint8Array(base64String) {
//   const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
//   const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
//   const raw = atob(base64);
//   const output = new Uint8Array(raw.length);
//   for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
//   return output;
// }

// /** Register SW (if not yet), subscribe to push, POST subscription to backend */
// export async function ensureSubscribed() {
//   if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

//   // Ask for notification permission if not granted
//   if (Notification.permission === 'default') {
//     const perm = await Notification.requestPermission();
//     if (perm !== 'granted') return;
//   } else if (Notification.permission !== 'granted') {
//     return;
//   }

//   // Register the service worker (if Vite, SW must be in /public/service-worker.js)
//   const reg = await navigator.serviceWorker.register('/service-worker.js');

//   // Get existing subscription or create a new one
//   let sub = await reg.pushManager.getSubscription();
//   if (!sub) {
//     if (!PUBLIC_KEY) {
//       console.warn('[pushClient] Missing VITE_VAPID_PUBLIC_KEY');
//       return;
//     }
//     sub = await reg.pushManager.subscribe({
//       userVisibleOnly: true,
//       applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY),
//     });
//   }

//   // Save subscription to backend
//   await api.post('/notifications/subscribe', sub.toJSON());
// }
// Helper to ensure the current browser has a PushSubscription registered and saved on the server.
// src/utils/pushClient.js
// Call ensureSubscribed() from a user gesture or app init (recommended on user click)
// src/utils/pushClient.js
import api from './api.js'; // your axios/fetch wrapper that includes auth token header
const PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY; // must match server's WEB_PUSH_PUBLIC_VAPID_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}

/** Register SW, subscribe to push, POST subscription to backend
 *  Call this after user login (so api includes auth header)
 */
export async function ensureSubscribed() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[pushClient] Push not supported in this browser.');
    return;
  }

  // Request permission if not decided
  if (Notification.permission === 'default') {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      console.warn('[pushClient] Notification permission not granted');
      return;
    }
  } else if (Notification.permission !== 'granted') {
    console.warn('[pushClient] Notification permission not granted');
    return;
  }

  // Ensure SW registered (will return existing reg if already registered)
  const reg = await navigator.serviceWorker.register('/service-worker.js');

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    if (!PUBLIC_KEY) {
      console.warn('[pushClient] Missing VITE_VAPID_PUBLIC_KEY');
      return;
    }
    try {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY)
      });
      console.log('[pushClient] New subscription created');
    } catch (err) {
      console.error('[pushClient] subscribe() failed', err);
      return;
    }
  } else {
    console.log('[pushClient] Existing subscription found');
  }

  // POST to server route used by backend
  try {
    await api.post('/api/push/subscribe', sub.toJSON()); // note the /api/push path
    console.log('[pushClient] Subscription POSTed to server');
  } catch (err) {
    console.error('[pushClient] Failed to POST subscription to server', err);
  }
}
