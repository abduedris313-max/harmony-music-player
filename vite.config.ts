import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const base = '/harmony-music-player/';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? base : '/',

  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'service-worker.js',

      manifest: {
        id: base,
        name: 'Harmony Music Player',
        short_name: 'Harmony',
        description:
          'High-fidelity web music player with equalizer, offline support, and smart playlists.',

        start_url: base,
        scope: base,

        display: 'standalone',
        orientation: 'portrait-primary',

        background_color: '#09090b',
        theme_color: '#f43f5e',

        prefer_related_applications: false,

        categories: [
          'music',
          'entertainment',
          'utilities'
        ],

        icons: [
          {
            src: `${base}icon-192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: `${base}icon-192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: `${base}icon-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: `${base}icon-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },

      devOptions: {
        enabled: true
      }
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  },

  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {}
  }
}));