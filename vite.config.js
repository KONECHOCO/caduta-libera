import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';

// Build per i portali di giochi web: VITE_PORTAL=crazygames|itch (npm run build:crazygames / build:itch).
// Al posto di js/monetization.js (AdMob + acquisto Pro) usa js/monetization-portal.js.
// Rete prima (aggiornamenti subito), cache come riserva quando si è offline
const SERVICE_WORKER = `const CACHE = 'last-tile-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(fetch(e.request).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return res;
  }).catch(() => caches.match(e.request)));
});
`;

export default defineConfig(({ mode }) => {
  const portal = loadEnv(mode, process.cwd(), 'VITE_').VITE_PORTAL || process.env.VITE_PORTAL;
  return {
    base: './',
    build: { outDir: portal ? `dist-${portal}` : 'dist', target: 'es2020' },
    server: { port: 5173 },
    resolve: portal ? {
      alias: [{ find: /^\.\/monetization\.js$/, replacement: fileURLToPath(new URL('./js/monetization-portal.js', import.meta.url)) }]
    } : {},
    plugins: portal === 'crazygames' ? [{
      name: 'crazygames-sdk',
      // 'pre': prima che Vite riscriva i percorsi dei <script>
      transformIndexHtml: {
        order: 'pre',
        handler: html => html.replace(/<script src="\/three\.min\.js"><\/script>/,
          '<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>\n  <script src="/three.min.js"></script>')
      }
    }] : portal === 'msstore' ? [{
      // Microsoft Store (PWA impacchettata con PWABuilder): service worker per giocare anche offline
      name: 'msstore-pwa',
      transformIndexHtml: html => html.replace('</body>',
        "  <script>if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');</script>\n</body>"),
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'sw.js', source: SERVICE_WORKER });
      }
    }] : []
  };
});
