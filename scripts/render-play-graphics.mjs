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
// 10 botole: 9 azzurre e una rossa aperta
const doors = Array.from({ length: 10 }, (_, i) => `<div style="width:36px;height:28px;border-radius:8px;border:4px solid ${i === 6 ? '#ff2a44' : '#00d2ff'};
  background:${i === 6 ? '#2a0008' : '#0a1f4d'};box-shadow:0 0 18px ${i === 6 ? '#ff2a44aa' : '#00d2ff66'}"></div>`).join('');
await page.setContent(`<html><body style="margin:0;width:1024px;height:500px;overflow:hidden;
  background:radial-gradient(circle at 75% 35%,#ffd70033,transparent 55%),linear-gradient(135deg,#040814,#0d2a66);font-family:'Arial Black',Arial,sans-serif">
  <div style="position:absolute;left:60px;top:100px;width:300px;height:300px;border-radius:66px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.5)">
    ${svg.replace('width="1024" height="1024"', 'width="300" height="300"')}
  </div>
  <div style="position:absolute;left:400px;top:110px;color:#fff;font-weight:900;font-size:66px;letter-spacing:1px;white-space:nowrap">TRAP<span style="color:#ffd700">10</span> QUIZ</div>
  <div style="position:absolute;left:404px;top:205px;color:#00d2ff;font:800 24px Arial,sans-serif;letter-spacing:3px">10 ANSWERS · ONLY 1 IS RIGHT</div>
  <div style="position:absolute;left:404px;top:300px;display:flex;gap:10px">${doors}</div>
</body></html>`);
await page.screenshot({ path: `${OUT}/feature-graphic-1024x500.png` });
await browser.close();
console.log('play graphics rendered');
