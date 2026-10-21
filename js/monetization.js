/**
 * Monetizzazione: AdMob (video all'apertura, banner, interstitial tra le manche, video premio "Jolly") + Trap10 Pro.
 *
 * - Trap10 Pro = acquisto una tantum (non consumabile, 2,99 €) che rimuove TUTTA la pubblicità
 *   e rende il Jolly di Leo gratuito in ogni manche. Prodotto da creare su App Store Connect e Play Console
 *   con ID PRO_PRODUCT_ID.
 * - Gli ID AdMob reali arrivano dalle variabili VITE_ADMOB_* (Codemagic / .env.production). Senza di esse si usano
 *   gli ID di test ufficiali Google: non pubblicare mai l'app con gli annunci di test.
 * - Nel browser non ci sono annunci: resta solo la barra di anteprima con il pulsante Pro.
 * - Gli annunci a schermo intero non partono mai a manche in corso (timer attivi): vedi setGameplayActive().
 */
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import {
  AdMob,
  AdmobConsentStatus,
  AppOpenAdPluginEvents,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize,
  RewardAdPluginEvents
} from '@capacitor-community/admob';
import { NativePurchases, PURCHASE_TYPE } from '@capgo/native-purchases';

export const PRO_PRODUCT_ID = 'trap10_pro';

const native = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform();
const env = import.meta.env;

// ID di test ufficiali Google (https://developers.google.com/admob/android/test-ads)
const TEST_IDS = {
  android: {
    banner: 'ca-app-pub-3940256099942544/9214589741',
    appOpen: 'ca-app-pub-3940256099942544/9257395921',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917'
  },
  ios: {
    banner: 'ca-app-pub-3940256099942544/2435281174',
    appOpen: 'ca-app-pub-3940256099942544/5575463023',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/1712485313'
  }
};

const P = platform === 'ios' ? 'IOS' : 'ANDROID';
const REAL_IDS = {
  banner: env[`VITE_ADMOB_${P}_BANNER`],
  appOpen: env[`VITE_ADMOB_${P}_APP_OPEN`],
  interstitial: env[`VITE_ADMOB_${P}_INTERSTITIAL`],
  rewarded: env[`VITE_ADMOB_${P}_REWARDED`]
};

// Frequenze come OmniTransit: tanti annunci ma sempre nei punti di passaggio, mai a raffica
const INTERSTITIAL_EVERY_N_ACTIONS = 2;
const MIN_GAP_BETWEEN_FULLSCREEN_MS = 45 * 1000;
const APP_OPEN_MIN_BACKGROUND_MS = 20 * 1000;
const APP_OPEN_LOAD_TIMEOUT_MS = 8000;

const PRO_KEY = 'trap10.pro';

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage non disponibile
  }
}

// In sviluppo sempre annunci di test: cliccare i propri annunci reali viola le norme AdMob.
// Nelle build di prova (TestFlight / test interno) si attivano toccando 7 volte il logo: vedi toggleTestAds().
const TEST_ADS_KEY = 'trap10.testAds';
const USE_TEST_ADS = env.DEV || !REAL_IDS.banner || readStorage(TEST_ADS_KEY, false);
const AD_IDS = USE_TEST_ADS ? TEST_IDS[platform] || TEST_IDS.android : REAL_IDS;

// ---------- Stato osservabile ----------
// Solo in sviluppo: ?storeshot mostra l'interfaccia d'acquisto nativa per gli screenshot degli store
const previewNative = env.DEV && typeof location !== 'undefined' && location.search.includes('storeshot');

let state = {
  native: native || previewNative,
  isPro: readStorage(PRO_KEY, false),
  proPrice: null,
  adsReady: false,
  rewardedReady: false,
  bannerHeight: 0,
  testAds: USE_TEST_ADS,
  diag: []
};
const listeners = new Set();
function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach(l => l(state));
}
export function getMonetization() {
  return state;
}
/** Registra una funzione chiamata a ogni cambio di stato (e subito una prima volta). */
export function subscribeMonetization(cb) {
  listeners.add(cb);
  cb(state);
  return () => listeners.delete(cb);
}

// ---------- Annunci ----------
let lastFullscreenAt = 0;
let actionCount = 0;
let backgroundedAt = 0;
let interstitialLoaded = false;
let appOpenLoaded = false;
let fullscreenShowing = false;
let rewardEarned = false;
let gameplayActive = false;

/** Il gioco segnala quando una manche è in corso: niente annunci a schermo intero durante i timer. */
export function setGameplayActive(active) {
  gameplayActive = active;
}

function adsAllowed() {
  return native && state.adsReady && !state.isPro;
}

async function prepareInterstitial() {
  try {
    await AdMob.prepareInterstitial({ adId: AD_IDS.interstitial, isTesting: USE_TEST_ADS });
    interstitialLoaded = true;
    diag('interstitial caricato');
  } catch (err) {
    interstitialLoaded = false;
    diag(`interstitial non disponibile: ${err?.message || err}`);
  }
}

async function prepareRewarded() {
  try {
    await AdMob.prepareRewardVideoAd({ adId: AD_IDS.rewarded, isTesting: USE_TEST_ADS });
    setState({ rewardedReady: true });
  } catch {
    setState({ rewardedReady: false });
  }
}

async function loadAppOpen() {
  try {
    await AdMob.loadAppOpen({ adId: AD_IDS.appOpen });
    appOpenLoaded = true;
    diag('app open caricato');
  } catch (err) {
    appOpenLoaded = false;
    diag(`app open non disponibile: ${err?.message || err}`);
  }
}

async function showAppOpen() {
  if (!adsAllowed() || fullscreenShowing || gameplayActive) return;
  if (!appOpenLoaded) {
    // All'avvio aspettiamo al massimo pochi secondi: meglio perdere l'annuncio che bloccare l'utente
    await Promise.race([loadAppOpen(), new Promise(r => setTimeout(r, APP_OPEN_LOAD_TIMEOUT_MS))]);
  }
  if (!appOpenLoaded || gameplayActive) return;
  try {
    fullscreenShowing = true;
    appOpenLoaded = false;
    await AdMob.showAppOpen();
    lastFullscreenAt = Date.now();
  } catch {
    fullscreenShowing = false;
  }
}

async function showBanner() {
  if (!adsAllowed()) return;
  try {
    await AdMob.showBanner({
      adId: AD_IDS.banner,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: USE_TEST_ADS
    });
    diag('banner richiesto');
  } catch (err) {
    diag(`banner errore: ${err?.message || err}`);
  }
}

async function removeAllAds() {
  if (!native) return;
  try {
    await AdMob.removeBanner();
  } catch {
    // nessun banner attivo
  }
  setState({ bannerHeight: 0 });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function waitUntilActive() {
  const { isActive } = await CapApp.getState();
  if (isActive) return;
  await new Promise(resolve => {
    const handle = CapApp.addListener('appStateChange', ({ isActive: active }) => {
      if (active) {
        handle.then(h => h.remove());
        resolve();
      }
    });
  });
}

// Registro diagnostico (visibile nell'app in modalità test): mostra cosa succede passo per passo sul telefono
export function diag(msg) {
  const line = `${new Date().toLocaleTimeString()} ${msg}`;
  console.info('[ads]', line);
  setState({ diag: [...(state.diag || []).slice(-30), line] });
}

// App Tracking Transparency (iOS): il popup viene mostrato dal codice nativo (SceneDelegate.swift)
// appena l'app è attiva; dopo 3 s lo chiediamo anche dal plugin come riserva. Si aspetta al massimo
// 10 s: se il popup non compare si va avanti con annunci non personalizzati invece di bloccare tutto.
async function requestTrackingPermission() {
  if (platform !== 'ios') return;
  try {
    await waitUntilActive();
    diag(`ATT iniziale: ${(await AdMob.trackingAuthorizationStatus()).status}`);
    for (let waited = 0; waited <= 15000; waited += 1000) {
      const { status } = await AdMob.trackingAuthorizationStatus();
      if (status !== 'notDetermined') {
        diag(`ATT: ${status} dopo ${waited / 1000} s`);
        return;
      }
      // Riserva al popup nativo (SceneDelegate.swift): nuove richieste se iOS non l'ha ancora mostrato
      if (waited === 4000 || waited === 9000) {
        diag(`ATT: richiesta dal plugin (${waited / 1000} s)`);
        AdMob.requestTrackingAuthorization().catch(err => diag(`ATT richiesta errore: ${err?.message || err}`));
      }
      await sleep(1000);
    }
    diag('ATT: nessuna risposta in 15 s, si prosegue');
  } catch (err) {
    diag(`ATT errore: ${err?.message || err}`);
  }
}

// Consenso GDPR (UMP, obbligatorio in UE/UK per AdMob), PRIMA della richiesta ATT come indica Google.
// Restituisce se si possono richiedere annunci. Un errore non deve bloccare l'app.
async function gatherConsent() {
  let canRequestAds = true;
  try {
    let info = await Promise.race([
      AdMob.requestConsentInfo(),
      sleep(10000).then(() => { throw new Error('UMP timeout'); })
    ]);
    diag(`UMP: stato=${info.status} modulo=${info.isConsentFormAvailable} canRequestAds=${info.canRequestAds}`);
    if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) {
      info = await AdMob.showConsentForm();
      diag(`UMP dopo il modulo: stato=${info.status} canRequestAds=${info.canRequestAds}`);
    }
    canRequestAds = info.canRequestAds !== false;
  } catch (err) {
    diag(`UMP errore: ${err?.message || err}`);
  }
  await requestTrackingPermission();
  return canRequestAds;
}

/** Da chiamare una volta all'avvio dell'app. */
export async function initMonetization() {
  if (!native) return;
  // StoreKit può non rispondere mai (es. TestFlight con prodotto non ancora approvato):
  // la verifica Pro non deve bloccare la richiesta ATT, quindi ha un tempo massimo
  await Promise.race([refreshProStatus(), sleep(4000)]);
  if (state.isPro) return;

  diag(`avvio: test=${USE_TEST_ADS} piattaforma=${platform}`);
  const canRequestAds = await gatherConsent();
  // Senza consenso Google non permette annunci reali; quelli di test si mostrano comunque per le prove
  if (!canRequestAds && !USE_TEST_ADS) {
    diag('annunci non consentiti (consenso GDPR mancante)');
    return;
  }

  try {
    await AdMob.initialize({ initializeForTesting: USE_TEST_ADS });
  } catch (err) {
    diag(`AdMob initialize errore: ${err?.message || err}`);
    return;
  }
  setState({ adsReady: true });
  diag('AdMob pronto');

  AdMob.addListener(BannerAdPluginEvents.SizeChanged, size => setState({ bannerHeight: size.height || 0 }));
  AdMob.addListener(BannerAdPluginEvents.Loaded, () => diag('banner caricato'));
  AdMob.addListener(BannerAdPluginEvents.FailedToLoad, err => diag(`banner fallito: ${err?.message || err?.code || JSON.stringify(err)}`));
  AdMob.addListener(AppOpenAdPluginEvents.Closed, () => {
    fullscreenShowing = false;
    lastFullscreenAt = Date.now();
    loadAppOpen();
  });
  // Il premio conta solo se AdMob conferma che il video è stato guardato fino alla fine
  AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
    rewardEarned = true;
  });
  AdMob.addListener(AppOpenAdPluginEvents.FailedToShow, () => {
    fullscreenShowing = false;
    loadAppOpen();
  });

  // 1) Annuncio a schermo intero all'apertura (app open; se non disponibile, interstitial video),
  // 2) banner fisso, 3) precarico interstitial e video premio
  showBanner();
  await prepareInterstitial();
  prepareRewarded();
  await showAppOpen();
  if (!fullscreenShowing && !gameplayActive && Date.now() - lastFullscreenAt > MIN_GAP_BETWEEN_FULLSCREEN_MS && interstitialLoaded) {
    await showInterstitialNow();
  }

  // Video anche quando l'utente torna nell'app dopo averla lasciata in background (mai a manche in corso)
  CapApp.addListener('appStateChange', ({ isActive }) => {
    if (!isActive) {
      backgroundedAt = Date.now();
      return;
    }
    const away = backgroundedAt ? Date.now() - backgroundedAt : 0;
    if (away >= APP_OPEN_MIN_BACKGROUND_MS && Date.now() - lastFullscreenAt >= MIN_GAP_BETWEEN_FULLSCREEN_MS) {
      showAppOpen();
    }
  });
}

async function showInterstitialNow() {
  try {
    fullscreenShowing = true;
    interstitialLoaded = false;
    await AdMob.showInterstitial();
    lastFullscreenAt = Date.now();
  } catch {
    // annuncio non disponibile
  } finally {
    fullscreenShowing = false;
    prepareInterstitial();
  }
}

/**
 * Da chiamare nei "punti di passaggio" naturali (nuova manche, apertura regole).
 * Mostra un interstitial video ogni N azioni, con distanza minima. Si risolve a annuncio chiuso.
 */
export async function trackAdAction() {
  if (!adsAllowed() || fullscreenShowing || gameplayActive) return;
  actionCount += 1;
  if (actionCount % INTERSTITIAL_EVERY_N_ACTIONS !== 0) return;
  if (Date.now() - lastFullscreenAt < MIN_GAP_BETWEEN_FULLSCREEN_MS) return;
  if (!interstitialLoaded) {
    prepareInterstitial();
    return;
  }
  await showInterstitialNow();
}

// ---------- Video premio: Jolly di Leo ----------
/** Il Jolly è disponibile gratis con Pro e nel browser; nell'app gratuita serve un video premio pronto. */
export function jollyAvailable() {
  if (state.isPro || !native) return true;
  return adsAllowed() && state.rewardedReady;
}

/** Mostra un video premio; restituisce true solo se AdMob conferma che è stato guardato fino alla fine. */
export async function earnJolly() {
  if (state.isPro || !native) return true;
  if (!adsAllowed()) return false;
  try {
    fullscreenShowing = true;
    rewardEarned = false;
    await AdMob.showRewardVideoAd();
    lastFullscreenAt = Date.now();
    return rewardEarned;
  } catch {
    return false;
  } finally {
    fullscreenShowing = false;
    setState({ rewardedReady: false });
    prepareRewarded();
  }
}

// ---------- Trap10 Pro (acquisto una tantum) ----------
function setPro(isPro) {
  writeStorage(PRO_KEY, isPro);
  setState({ isPro });
  if (isPro) removeAllAds();
}

function ownsPro(purchases) {
  return (purchases || []).some(p =>
    p.productIdentifier === PRO_PRODUCT_ID && (platform !== 'android' || p.purchaseState === '1' || p.purchaseState == null)
  );
}

export async function refreshProStatus() {
  if (!native) return;
  try {
    const { purchases } = await NativePurchases.getPurchases({ productType: PURCHASE_TYPE.INAPP });
    setPro(ownsPro(purchases));
  } catch (err) {
    // offline: teniamo l'ultimo stato noto
    console.info('Verifica Pro non riuscita', err);
  }
  // Il prezzo localizzato serve solo alla schermata Pro: lo carichiamo senza attenderlo
  NativePurchases.getProduct({ productIdentifier: PRO_PRODUCT_ID, productType: PURCHASE_TYPE.INAPP })
    .then(({ product }) => setState({ proPrice: product?.priceString || null }))
    .catch(() => {
      // prodotto non ancora configurato negli store
    });
}

export async function buyPro() {
  if (!native) throw new Error('Acquisto disponibile solo nell\'app');
  const tx = await NativePurchases.purchaseProduct({
    productIdentifier: PRO_PRODUCT_ID,
    productType: PURCHASE_TYPE.INAPP,
    quantity: 1
  });
  if (tx?.productIdentifier === PRO_PRODUCT_ID) setPro(true);
  return state.isPro;
}

export async function restorePro() {
  if (!native) return false;
  try {
    await NativePurchases.restorePurchases();
  } catch {
    // proseguiamo comunque con la lettura degli acquisti
  }
  await refreshProStatus();
  return state.isPro;
}

/** Interruttore nascosto per le build di prova: attiva/disattiva gli annunci di test (serve riavviare l'app). */
export function toggleTestAds() {
  const next = !readStorage(TEST_ADS_KEY, false);
  writeStorage(TEST_ADS_KEY, next);
  return next;
}
