// src/main.jsx
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
