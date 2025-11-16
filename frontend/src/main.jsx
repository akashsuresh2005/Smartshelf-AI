// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import './css/style.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

/* Register service worker for PWA and handle notification permission safely */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      // expose for debugging / later use (optional)
      window.swRegistration = registration;
    } catch (err) {
      // ignore registration failure (dev) but log optionally
      // console.warn('SW registration failed', err);
    }

    // Request notification permission from the user only if needed
    if ('Notification' in window) {
      try {
        if (Notification.permission === 'default') {
          // You can remove this automatic request and instead call Notification.requestPermission()
          // from a user gesture (recommended). We request here to avoid the "showNotification permission" error.
          Notification.requestPermission().then((perm) => {
            if (perm !== 'granted') {
              // not granted — future push attempts will be ignored by SW (no uncaught errors)
              // console.log('Notifications permission:', perm)
            }
          }).catch(() => {});
        }
      } catch (e) {
        // ignore
      }
    }
  })
}

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
