// Screenshot per gli store dal gioco reale (spedizione vera giocata in automatico), nella lingua scelta.
// Prerequisito: `npx vite --port 5193` avviato.
// Uso: node scripts/capture-store-screenshots.mjs [iphone|ipad|android] [it|en|fr|es|de]
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const device = ['ipad', 'android'].includes(process.argv[2]) ? process.argv[2] : 'iphone';
const lang = process.argv[3] || 'it';
const SIZES = {
  iphone: { viewport: { width: 440, height: 956 }, deviceScaleFactor: 3, suffix: '1320x2868' },
  ipad: { viewport: { width: 1032, height: 1376 }, deviceScaleFactor: 2, suffix: 'ipad-2064x2752' },
  android: { viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, suffix: 'android-1080x1920' }
};
const size = SIZES[device];
const OUT = `store-assets/screenshots/${lang}`;
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ args: ['--use-gl=angle', '--enable-webgl', '--ignore-gpu-blocklist'] });
const context = await browser.newContext({
  viewport: size.viewport,
  deviceScaleFactor: size.deviceScaleFactor,
  isMobile: device !== 'ipad',
  hasTouch: true,
  locale: lang
});
await context.addInitScript(l => {
  localStorage.setItem('lasttile.lang', l);
  // Statistiche realistiche per le schermate di fine sala
  localStorage.setItem('lasttile.stats', JSON.stringify({ played: 17, escapes: 9, deepest: 7, best: 4100 }));
  // Niente voce durante la cattura
  if (window.speechSynthesis) window.speechSynthesis.speak = () => {};
}, lang);
const page = await context.newPage();
await page.goto('http://localhost:5193/?storeshot');
// Il pannello diagnostico annunci e la barra Pro del browser non esistono nell'app pubblicata.
// Chromium su Windows non ha le bandiere emoji: font Noto Color Emoji.
await page.addStyleTag({ content: `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=block');
  #ad-diag, #web-ad-bar { display: none !important; }
  .lang-select, .ctrl-btn .ic { font-family: 'Noto Color Emoji', var(--font-tech), sans-serif; }
  .digital-currency { font-family: var(--font-display), 'Noto Color Emoji', serif; }
` });

const game = fn => page.evaluate(fn);
const waitState = st => page.waitForFunction(s => window.lastTileGame?.state === s, st, { timeout: 60000 });
const shot = async (name, wait = 1200) => {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `${OUT}/${name}-${size.suffix}.png` });
  console.log('saved', device, lang, name);
};

// Spedizione già avviata: sala 4 con un po' di tesoro e due torce
await waitState('EXPLORE');
await game(() => {
  const g = window.lastTileGame;
  g.hall = 4;
  g.bag = 500;
  g.torches = 2;
  g.startHall();
});
await waitState('EXPLORE');

// 1) La sala: esploratore sulla lastra giusta, una lastra sbagliata già crollata con la torcia
await game(() => {
  const g = window.lastTileGame;
  g.stepOn(g.question.options.findIndex(o => o.isCorrect));
  g.useTorch();
});
await shot('01-sala', 3000);

// 2) Il crollo: restano due lastre, resti o salti con la corda?
await game(() => window.lastTileGame.lockTile());
await waitState('LAST_TWO');
await shot('02-ultime-due', 2500);

// 3) La lastra regge: tesoro della sala, scendere o uscire
await game(() => window.lastTileGame.hold());
await page.waitForSelector('#end-modal.active', { timeout: 30000 });
await shot('03-regge', 1500);

// 4) Le regole del tempio
await game(() => {
  document.getElementById('end-modal').classList.remove('active');
  document.getElementById('rules-modal').classList.add('active');
});
await shot('04-regole', 1200);

// 5) Pro
await game(() => {
  document.getElementById('rules-modal').classList.remove('active');
  document.getElementById('pro-btn').click();
});
await shot('05-pro', 1200);

await browser.close();
