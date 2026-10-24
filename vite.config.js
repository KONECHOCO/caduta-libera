import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';

// Build per i portali di giochi web: VITE_PORTAL=crazygames|itch (npm run build:crazygames / build:itch).
// Al posto di js/monetization.js (AdMob + acquisto Pro) usa js/monetization-portal.js.
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
    }] : []
  };
});
