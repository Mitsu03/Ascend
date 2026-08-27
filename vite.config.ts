import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Build nativo (Capacitor). O service worker do PWA fica desligado dentro da
 * WKWebView: os ficheiros já vêm no bundle da app, e um SW a servir uma cópia
 * em cache só cria uma segunda fonte de verdade — a app deixaria de atualizar
 * ao instalar uma versão nova pela TestFlight.
 */
const isNativeBuild = process.env.CAP_BUILD === '1'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      disable: isNativeBuild,
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Ascend — Gotei 13',
        short_name: 'Ascend',
        description:
          'Fitness e nutrição gamificados no universo do Bleach. Treina, regista refeições, cumpre as ordens da tua divisão e sobe de patente no Gotei 13.',
        lang: 'pt-PT',
        theme_color: '#050507',
        background_color: '#050507',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
