import { fileURLToPath, URL } from 'url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,png,svg,woff2}',
          'manifest.webmanifest',
        ],
      },
      manifest: {
        name: 'VIVEKFY-MUSIC',
        short_name: 'VFY-MUSIC',
        start_url: '/',
        display: 'standalone',
        background_color: '#000',
        theme_color: '#000',
        description: 'DEVELOPER vivekmasona: [
          {
            src: 'vivek.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/vivek.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/vivek.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      stream: 'stream-browserify',
    },
  },
  build: {
    sourceMap: true,
  },
});

