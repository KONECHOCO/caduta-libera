/**
 * Monetizzazione per i portali di giochi web (al posto di js/monetization.js, scelto da vite.config.js).
 *
 * - crazygames: annunci del portale con il loro SDK v3 (midgame tra le sale, video premio per la torcia extra),
 *   eventi gameplayStart/Stop e loadingStart/Stop. Niente AdMob, niente acquisti in-app (le regole del portale).
 * - itch: nessun annuncio e nessun acquisto: la torcia extra è sempre gratuita.
 * Stessa interfaccia di monetization.js, così il gioco non cambia.
 */
import { sound } from './sound.js';

const PORTAL = import.meta.env.VITE_PORTAL;
const SDK = () => (PORTAL === 'crazygames' ? window.CrazyGames?.SDK : null);

export const PRO_PRODUCT_ID = '';
const MIN_GAP_BETWEEN_MIDGAME_MS = 3 * 60 * 1000;

let state = {
  native: false, isPro: false, portal: PORTAL, proPrice: null, adsReady: false,
  rewardedReady: false, bannerHeight: 0, testAds: false, diag: []
};
const listeners = new Set();
function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach(l => l(state));
}
export function getMonetization() {
  return state;
}
export function subscribeMonetization(cb) {
  listeners.add(cb);
  cb(state);
  return () => listeners.delete(cb);
}
export function diag() {}

let gameplayActive = false;
let lastMidgameAt = Date.now();
export function setGameplayActive(active) {
  if (active === gameplayActive) return;
  gameplayActive = active;
  const sdk = SDK();
  // Prima di init() lo stato viene solo ricordato: initMonetization lo invia appena l'SDK è pronto
  if (!sdk || !state.adsReady) return;
  try {
    active ? sdk.game.gameplayStart() : sdk.game.gameplayStop();
  } catch {}
}

export async function initMonetization() {
  const sdk = SDK();
  if (!sdk) return;
  try {
    await sdk.init();
    sdk.game.loadingStop();
    setState({ adsReady: true, rewardedReady: true });
    if (gameplayActive) sdk.game.gameplayStart();
  } catch (err) {
    console.warn('CrazyGames SDK', err);
  }
}

/** Mostra un annuncio del portale; risolve true se è stato visto fino in fondo. Audio in pausa durante l'annuncio. */
function requestAd(type) {
  const sdk = SDK();
  if (!sdk || !state.adsReady) return Promise.resolve(false);
  return new Promise(resolve => {
    const wasMuted = sound.isMuted;
    sdk.ad.requestAd(type, {
      adStarted: () => { if (!wasMuted) sound.toggleMute(); },
      adFinished: () => { if (!wasMuted && sound.isMuted) sound.toggleMute(); resolve(true); },
      // Nessun video disponibile (Basic launch con annunci disattivati, nessun riempimento): il premio resta valido,
      // un pulsante premio che non fa nulla è motivo di rifiuto per CrazyGames
      adError: () => { if (!wasMuted && sound.isMuted) sound.toggleMute(); resolve(type === 'rewarded'); }
    });
  });
}

/** Punto di passaggio tra due sale: un annuncio midgame al massimo ogni 3 minuti. */
export async function trackAdAction() {
  if (PORTAL !== 'crazygames' || gameplayActive) return;
  if (Date.now() - lastMidgameAt < MIN_GAP_BETWEEN_MIDGAME_MS) return;
  lastMidgameAt = Date.now();
  await requestAd('midgame');
}

export function rewardAvailable() {
  return true;
}

/** Torcia extra: video premio su CrazyGames (gratis se il video non è disponibile), gratis su itch.io. */
export async function earnReward() {
  if (PORTAL !== 'crazygames' || !state.adsReady) return true;
  return requestAd('rewarded');
}

export async function refreshProStatus() {}
export async function buyPro() { return false; }
export async function restorePro() { return false; }
export function toggleTestAds() { return false; }
