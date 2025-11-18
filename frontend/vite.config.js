// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'

// export default defineConfig({
//   plugins: [
//     react(),
//     VitePWA({
//       registerType: 'autoUpdate',
//       includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
//       manifest: {
//         name: 'Smart Shelf AI',
//         short_name: 'SmartShelf',
//         description: 'Track expiries, get reminders, and chat with AI about your pantry.',
//         theme_color: '#0b5fff',
//         icons: [
//           { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
//           { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
//         ]
//       }
//     })
//   ]
// })


// vite.config.js
// vite.config.js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'Smart Shelf AI',
        short_name: 'SmartShelf',
        description: 'Track expiries, get reminders, and chat with AI about your pantry.',
        theme_color: '#0b5fff',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],

  // Force single React/ReactDOM resolution (avoid duplicate-react invalid hook)
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom')
    }
  },

  // HMR / dev server config — explicit host/port for websocket handshake
    server: {
    host: true,
    strictPort: true,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173,
    },
  },
});