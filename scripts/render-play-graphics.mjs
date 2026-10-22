// Grafiche Google Play: icona 512x512 e immagine in evidenza 1024x500 (da assets/icon.svg).
import { chromium } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';

const OUT = 'store-assets/play';
await mkdir(OUT, { recursive: true });
const svg = await readFile('assets/icon.svg', 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 512, height: 512 } });
await page.setContent(`<html><body style="margin:0">${svg.replace('width="1024" height="1024"', 'width="512" height="512"')}</body></html>`);
await page.screenshot({ path: `${OUT}/icon-512.png` });

await page.setViewportSize({ width: 1024, height: 500 });
// 10 lastre di pietra: 9 crepate e una che regge, illuminata d'oro
const tiles = Array.from({ length: 10 }, (_, i) => `<div style="width:40px;height:30px;border-radius:4px;
  border:3px solid ${i === 6 ? '#ffcf5a' : '#1d150c'};background:${i === 6 ? '#8f7858' : '#3a2d1f'};
  box-shadow:${i === 6 ? '0 0 22px #ffcf5a' : 'none'}"></div>`).join('');
await page.setContent(`<html><body style="margin:0;width:1024px;height:500px;overflow:hidden;
  background:radial-gradient(circle at 72% 40%,#ffcf5a2e,transparent 55%),linear-gradient(135deg,#0d0906,#3a2412);font-family:Georgia,serif">
  <div style="position:absolute;left:60px;top:100px;width:300px;height:300px;border-radius:66px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.6)">
    ${svg.replace('width="1024" height="1024"', 'width="300" height="300"')}
  </div>
  <div style="position:absolute;left:400px;top:118px;color:#fff;font-weight:700;font-size:64px;letter-spacing:2px;white-space:nowrap">LAST TILE</div>
  <div style="position:absolute;left:404px;top:196px;color:#ffcf5a;font-weight:700;font-size:34px;letter-spacing:4px">TRIVIA TEMPLE</div>
  <div style="position:absolute;left:404px;top:252px;color:#d6c8ad;font:600 21px Arial,sans-serif;letter-spacing:2px">10 HALLS · 10 TILES · ONLY ONE HOLDS</div>
  <div style="position:absolute;left:404px;top:320px;display:flex;gap:10px">${tiles}</div>
</body></html>`);
await page.screenshot({ path: `${OUT}/feature-graphic-1024x500.png` });
await browser.close();
console.log('play graphics rendered');
