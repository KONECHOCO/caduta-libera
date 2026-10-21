// Screenshot per gli store dal gioco reale (partita vera giocata in automatico), nella lingua scelta.
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
  localStorage.setItem('trap10.lang', l);
  // Statistiche realistiche per la schermata di vittoria
  localStorage.setItem('trap10.stats', JSON.stringify({ played: 23, wins: 9, totalWon: 1450000, bestWin: 300000, streak: 2, bestStreak: 4 }));
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
` });
await page.waitForFunction(() => window.dieciBotoleGame?.gameState === 'INITIAL_CHOICE_90S', null, { timeout: 20000 });

const shot = async (name, wait = 1200) => {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `${OUT}/${name}-${size.suffix}.png` });
  console.log('saved', device, lang, name);
};
const game = fn => page.evaluate(fn);
const waitState = st => page.waitForFunction(s => window.dieciBotoleGame.gameState === s, st, { timeout: 60000 });

// 1) Domanda con la scelta sulla botola giusta, timer in corsa
await page.waitForTimeout(6000);
await game(() => {
  const g = window.dieciBotoleGame;
  g.selectInitialBotola(g.currentQuestion.options.findIndex(o => o.isCorrect));
});
await shot('01-scelta', 2500);

// 2) Dopo l'apertura delle 5 botole: mantieni o cambia (montepremi dimezzato)
await game(() => window.dieciBotoleGame.lockInitialChoice());
await waitState('DECISION_30S');
await shot('02-decisione', 2500);

// 3) Confronto diretto botola per botola
await game(() => window.dieciBotoleGame.confirmKeepOriginalChoice());
await waitState('CONFRONTATION_CHOICE');
await game(() => {
  const g = window.dieciBotoleGame;
  const target = [...g.activeBotolaIndices].find(i => i !== g.selectedBotolaIndex);
  g.startBotolaConfrontation(target);
});
await shot('03-confronto', 1000);

// 4) Vittoria
for (;;) {
  await page.waitForFunction(() => ['CONFRONTATION_CHOICE', 'END_GAME'].includes(window.dieciBotoleGame.gameState), null, { timeout: 60000 });
  const done = await game(() => {
    const g = window.dieciBotoleGame;
    if (g.gameState === 'END_GAME') return true;
    const target = [...g.activeBotolaIndices].find(i => i !== g.selectedBotolaIndex);
    g.startBotolaConfrontation(target);
    return false;
  });
  if (done) break;
}
await page.waitForSelector('#end-modal.active', { timeout: 30000 });
await shot('04-vittoria', 1500);

// 5) Pro
await game(() => {
  document.getElementById('end-modal').classList.remove('active');
  document.getElementById('pro-btn').click();
});
await shot('05-pro', 1200);

await browser.close();
