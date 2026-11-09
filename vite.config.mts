import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(readFileSync(resolve(import.meta.dirname, 'package.json'), 'utf8')) as { version: string }

// The desktop renderer never talks to the network directly (the main process
// does), so its policy is strict. The web build calls providers from the page.
const CSP = {
  desktop:
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'",
  web:
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https: http://localhost:* http://127.0.0.1:*; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'",
}

function contentSecurityPolicy(mode: string): Plugin {
  return {
    name: 'parallax-csp',
    apply: 'build',
    transformIndexHtml(html) {
      const policy = mode === 'web' ? CSP.web : CSP.desktop
      return html.replace('<head>', `<head>\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`)
    },
  }
}

export default defineConfig(({ mode }) => {
  const web = mode === 'web'
  return {
    root: resolve(import.meta.dirname, 'src/renderer'),
    // Relative asset paths work on GitHub Pages, from the local server and from file://.
    base: process.env.BASE_PATH ?? './',
    plugins: [
      react(),
      tailwindcss(),
      contentSecurityPolicy(mode),
      ...(web ? [VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'script',
        manifest: {
          name: 'Atlas Council',
          short_name: 'Atlas',
          description: 'Your personal three-member AI Council',
          display: 'standalone',
          start_url: './',
          scope: './',
          theme_color: '#111525',
          background_color: '#111525',
          icons: [
            { src: 'icons/atlas-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/atlas-512.png', sizes: '512x512', type: 'image/png' },
          ],
        },
        workbox: {
          // Local HTML contains a per-launch authentication token.
          // Never precache HTML, API responses, or chat data.
          globPatterns: ['**/*.{js,css,svg,png,woff,woff2,ttf}'],
          navigateFallback: null,
          runtimeCaching: [],
          cleanupOutdatedCaches: true,
        },
      })] : []),
    ],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    build: {
      outDir: resolve(import.meta.dirname, web ? 'dist/web' : 'dist/renderer'),
      emptyOutDir: true,
      chunkSizeWarningLimit: 4000,
    },
    server: {
      port: 5173,
      strictPort: true,
    },
  }
})
