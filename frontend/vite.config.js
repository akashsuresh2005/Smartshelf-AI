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
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      // Disable PWA during dev (good decision)
      disable: true,

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

  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom')
    }
  },

  // ✅ SAFE DEV SERVER CONFIG
  server: {
    port: 3001,       // 🔥 change port
    strictPort: true
    // ❌ NO custom hmr block
  }
})

