// src/main.jsx

// ---------------------------
// Defensive startup guard
// Must run BEFORE any other imports so injected hooks can't break the app.
// ---------------------------
(function installHookGuard() {
  if (typeof window === 'undefined') return;

  try {
    // Provide a safe no-op shim for React DevTools hook
    if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
        configurable: true,
        enumerable: false,
        writable: true,
        value: {
          supportsFiber: true,
          inject: function () {},
          on: function () {},
          off: function () {},
          getFiberRoots: function () { return new Map(); },
        }
      });
    }
  } catch (e) {
    // defensive - ignore
    // eslint-disable-next-line no-console
    console.warn('installHookGuard: react hook shim failed', e);
  }

  try {
    // Provide a safe no-op shim for Vue DevTools hook
    if (!window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      Object.defineProperty(window, '__VUE_DEVTOOLS_GLOBAL_HOOK__', {
        configurable: true,
        enumerable: false,
        writable: true,
        value: {
          emit: function () {},
          on: function () {},
          once: function () {},
          off: function () {},
          Vue: null
        }
      });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('installHookGuard: vue hook shim failed', e);
  }

  // Global handlers to swallow injected hook errors that mention "installhook"
  try {
    window.addEventListener('error', (ev) => {
      const msg = ev && ev.error && ev.error.message ? ev.error.message : ev.message || '';
      if (typeof msg === 'string' && msg.toLowerCase().includes('installhook')) {
        ev.preventDefault && ev.preventDefault();
        return;
      }
      // allow other errors to surface (they will still be logged)
      // eslint-disable-next-line no-console
      console.warn('Global caught error:', msg);
    });

    window.addEventListener('unhandledrejection', (ev) => {
      const reason = ev && ev.reason ? (ev.reason.message || ev.reason.toString()) : '';
      if (typeof reason === 'string' && reason.toLowerCase().includes('installhook')) {
        ev.preventDefault && ev.preventDefault();
        return;
      }
      // eslint-disable-next-line no-console
      console.warn('UnhandledRejection:', reason);
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('installHookGuard: global handlers failed', e);
  }
})();

// ---------------------------
// Normal app bootstrap
// ---------------------------
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import './css/style.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

/* Register service worker for PWA */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js')
      window.swRegistration = registration
    } catch (err) {
      // Optional: console.warn('SW registration failed', err)
    }
  })
}

/* Safer notification permission handling (request on user gesture) */
(function setupNotificationPermission() {
  if (!('Notification' in window)) return
  // Expose a function to request permission from a user gesture (e.g., button click)
  window.requestNotificationsPermission = async () => {
    try {
      const perm = await Notification.requestPermission()
      // Optional: handle 'granted'/'denied' states here
      return perm
    } catch {
      return 'denied'
    }
  }
})()

/* Install prompt capture */
let deferredPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  window.deferredInstallPrompt = deferredPrompt
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
