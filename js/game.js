// Last Tile: Trivia Temple
// Una spedizione attraversa fino a 10 sale. In ogni sala un enigma con 10 risposte su 10 lastre:
// una sola regge. Torce, corda e la scelta tra uscire col tesoro o scendere più a fondo.

import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700-italic.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import '@fontsource/cinzel/700.css';
import '@fontsource/cinzel/900.css';
import { generateQuestion } from './questions.js';
import { i18n } from './i18n.js';
import { sound } from './sound.js';
import { announcer } from './speech.js';
import { Temple3D } from './temple3d.js';
import {
  initMonetization, subscribeMonetization, getMonetization, trackAdAction, setGameplayActive,
  rewardAvailable, earnReward, buyPro, restorePro, toggleTestAds
} from './monetization.js';

const HALLS = 10;
const HALL_TREASURE = [100, 150, 250, 400, 600, 900, 1300, 1800, 2500, 3500];
const TORCH_HALLS = [3, 6, 9];       // sale in cui si trova una torcia in più
const LAST_TWO_SECONDS = 15;
const HISTORY_KEY = 'lasttile.history';
const STATS_KEY = 'lasttile.stats';

const exploreSeconds = (hall) => Math.max(25, 47 - hall * 2);

export class LastTileGame {
  constructor() {
    this.temple = null;
    this.question = null;
    this.hall = 1;
    this.bag = 0;
    this.torches = 1;
    this.ropes = 1;
    this.videoTorchUsed = false;
    this.selected = -1;
    this.other = -1;
    this.crumbled = new Set();
    this.state = 'INTRO';
    this.roundId = 0;
    this.timerSeconds = 0;
    this.timerMax = 1;
    this.timerInterval = null;
    this.timerPaused = false;
    this.history = loadJSON(HISTORY_KEY, { sigs: [], cats: [] });
    this.stats = loadJSON(STATS_KEY, { played: 0, escapes: 0, deepest: 0, best: 0 });

    const $ = (id) => document.getElementById(id);
    this.dom = {
      viewport: $('viewport-3d'),
      logoTop: $('logo-text-top'), logoBot: $('logo-text-bot'), modeTag: $('mode-tag'), logoShield: $('logo-shield'),
      hallLabel: $('hall-label'), bagLabel: $('bag-label'), bagVal: $('bag-val'),
      langSelect: $('lang-select'),
      timerDisplay: $('timer-display'), timerCircle: $('timer-circle-progress'), timerSub: $('timer-sub'),
      category: $('finale-category'), questionText: $('finale-question-text'), hint: $('hint-pill'),
      grid: $('options-grid'), boardHeader: $('options-board-header'), banner: $('status-banner'),
      standBtn: $('stand-btn'), torchBtn: $('torch-btn'), torchTitle: $('torch-title'), torchSub: $('torch-sub'),
      holdBtn: $('hold-btn'), holdSub: $('hold-sub'), leapBtn: $('leap-btn'), leapSub: $('leap-sub'),
      rulesModal: $('rules-modal'), rulesBtn: $('info-rules-btn'), closeRulesBtn: $('close-rules-btn'),
      audioBtn: $('audio-toggle-btn'), voiceBtn: $('voice-toggle-btn'), cameraBtn: $('camera-view-btn'),
      endModal: $('end-modal'), endTitle: $('end-title'), endDesc: $('end-desc'), endDetail: $('end-detail'),
      endBtn: $('end-btn'), endBtn2: $('end-btn-2'),
      proBtn: $('pro-btn'), proModal: $('pro-modal'), proCloseBtn: $('pro-close-btn'), proTitle: $('pro-title'),
      proSubtitle: $('pro-subtitle'), proBenefits: $('pro-benefits'), proStatus: $('pro-status'),
      proBuyBtn: $('pro-buy-btn'), proRestoreBtn: $('pro-restore-btn'), proMessage: $('pro-message'),
      webAdBar: $('web-ad-bar'), webAdProBtn: $('web-ad-pro-btn'),
      adDiag: $('ad-diag'), adDiagToggle: $('ad-diag-toggle'), adDiagLog: $('ad-diag-log')
    };

    this.temple = new Temple3D(this.dom.viewport);
    this.temple.onTileClick = (idx) => this.onTile(idx);
    if (this.dom.langSelect) this.dom.langSelect.value = i18n.getLanguage();
    announcer.setLanguage(i18n.t('langCode'));

    this.bindEvents();
    this.translateStatic();
    subscribeMonetization(st => this.onMonetizationChange(st));
    this.startExpedition();
    initMonetization();
  }

  /** setTimeout legato alla sala corrente: ignorato se nel frattempo ne è iniziata un'altra. */
  later(fn, ms) {
    const round = this.roundId;
    return setTimeout(() => { if (round === this.roundId) fn(); }, ms);
  }

  coins(n) {
    return `${n.toLocaleString(i18n.t('langCode'))} 🪙`;
  }

  setCtrl(btn, text) {
    if (!btn) return;
    const [icon, ...rest] = text.split(' ');
    btn.innerHTML = `<span class="ic">${icon}</span> <span class="lbl">${rest.join(' ')}</span>`;
    btn.title = text.replace(icon, '').trim();
  }

  setBtnText(btn, title, sub) {
    btn.querySelector('.btn-title').textContent = title;
    btn.querySelector('.btn-sub').textContent = sub;
  }

  // ---------- Monetizzazione ----------
  onMonetizationChange(st) {
    // Sui portali web (CrazyGames, itch.io) niente barra Pro e niente acquisto
    const showWebBar = !st.native && !st.isPro && !st.portal;
    this.dom.webAdBar.hidden = !showWebBar;
    const adH = st.isPro ? 0 : st.native ? st.bannerHeight : this.dom.webAdBar.offsetHeight;
    document.documentElement.style.setProperty('--ad-h', `${adH}px`);
    this.dom.proBtn.classList.toggle('owned', st.isPro);
    this.dom.proBtn.hidden = !!st.portal;
    this.renderPro();
    this.updateTorchButton();

    this.dom.adDiag.hidden = !(st.testAds && st.native);
    if (!this.dom.adDiag.hidden) {
      this.dom.adDiagToggle.textContent = `ADS DEBUG · ready=${st.adsReady} pro=${st.isPro} ${this.diagOpen === false ? '▲' : '▼'}`;
      this.dom.adDiagLog.hidden = this.diagOpen === false;
      this.dom.adDiagLog.innerHTML = (st.diag || []).map(l => `<div>${l}</div>`).join('');
    }
  }

  renderPro(message) {
    const st = getMonetization();
    const price = st.proPrice || i18n.t('proFallbackPrice');
    this.dom.proTitle.textContent = 'LAST TILE PRO';
    this.dom.proSubtitle.textContent = i18n.t('proSubtitle');
    this.dom.proBenefits.innerHTML = ['proBenefit1', 'proBenefit2', 'proBenefit3'].map(k => `<li>✔ ${i18n.t(k)}</li>`).join('');
    this.dom.proStatus.textContent = st.isPro ? i18n.t('proOwned') : (!st.native ? i18n.t('proWebOnly') : '');
    const canBuy = st.native && !st.isPro;
    this.dom.proBuyBtn.style.display = canBuy ? '' : 'none';
    this.dom.proRestoreBtn.style.display = canBuy ? '' : 'none';
    this.dom.proBuyBtn.textContent = i18n.t('proBuy', { price });
    this.dom.proRestoreBtn.textContent = i18n.t('proRestore');
    this.dom.proCloseBtn.setAttribute('aria-label', i18n.t('btnClose'));
    if (message !== undefined) this.dom.proMessage.textContent = message;
  }

  async runProAction(fn, okKey, failKey) {
    this.dom.proBuyBtn.disabled = true;
    this.dom.proRestoreBtn.disabled = true;
    this.renderPro('…');
    try {
      const ok = await fn();
      this.renderPro(i18n.t(ok ? okKey : failKey));
      if (ok && this.state === 'EXPLORE') this.updateTorchButton();
    } catch (err) {
      console.warn('Pro purchase error', err);
      this.renderPro(i18n.t('proError'));
    } finally {
      this.dom.proBuyBtn.disabled = false;
      this.dom.proRestoreBtn.disabled = false;
    }
  }

  // ---------- Eventi ----------
  bindEvents() {
    window.addEventListener('click', () => sound.init(), { once: true });
    window.addEventListener('keydown', () => sound.init(), { once: true });

    this.dom.langSelect?.addEventListener('change', (e) => {
      i18n.setLanguage(e.target.value);
      announcer.setLanguage(i18n.t('langCode'));
      this.translateStatic();
      this.startHall();
    });

    this.dom.audioBtn.addEventListener('click', () => {
      sound.init();
      const muted = sound.toggleMute();
      this.setCtrl(this.dom.audioBtn, i18n.t(muted ? 'btnAudioOff' : 'btnAudioOn'));
      this.dom.audioBtn.classList.toggle('muted', muted);
    });
    this.dom.voiceBtn.addEventListener('click', () => {
      const on = announcer.toggle();
      this.setCtrl(this.dom.voiceBtn, i18n.t(on ? 'btnVoiceOn' : 'btnVoiceOff'));
      this.dom.voiceBtn.classList.toggle('muted', !on);
    });
    this.dom.cameraBtn.addEventListener('click', () => {
      if (this.selected >= 0) this.temple.setCameraOnExplorer(this.selected);
      else this.temple.setCameraOverview();
    });

    this.dom.rulesBtn.addEventListener('click', () => {
      this.dom.rulesModal.classList.add('active');
      trackAdAction();
    });
    this.dom.closeRulesBtn.addEventListener('click', () => this.dom.rulesModal.classList.remove('active'));

    const openPro = () => {
      this.renderPro('');
      this.dom.proModal.classList.add('active');
    };
    this.dom.proBtn.addEventListener('click', openPro);
    this.dom.webAdProBtn.addEventListener('click', openPro);
    this.dom.proCloseBtn.addEventListener('click', () => this.dom.proModal.classList.remove('active'));
    this.dom.proBuyBtn.addEventListener('click', () => this.runProAction(buyPro, 'proOwned', 'proError'));
    this.dom.proRestoreBtn.addEventListener('click', () => this.runProAction(restorePro, 'proRestored', 'proNotFound'));

    // 7 tocchi sul logo: annunci di test on/off (per le build di prova)
    let taps = { n: 0, at: 0 };
    this.dom.logoShield.addEventListener('click', () => {
      const now = Date.now();
      taps = now - taps.at < 1500 ? { n: taps.n + 1, at: now } : { n: 1, at: now };
      if (taps.n >= 7) {
        taps = { n: 0, at: 0 };
        alert(i18n.t(toggleTestAds() ? 'testAdsOn' : 'testAdsOff'));
      }
    });
    this.dom.adDiagToggle.addEventListener('click', () => {
      this.diagOpen = this.diagOpen === false;
      this.onMonetizationChange(getMonetization());
    });

    this.dom.standBtn.addEventListener('click', () => {
      if (this.state === 'EXPLORE' && this.selected >= 0) this.lockTile();
    });
    this.dom.torchBtn.addEventListener('click', () => this.useTorch());
    this.dom.holdBtn.addEventListener('click', () => { if (this.state === 'LAST_TWO') this.hold(); });
    this.dom.leapBtn.addEventListener('click', () => { if (this.state === 'LAST_TWO') this.leap(); });

    // Il modale di fine sala ha fino a due scelte, decise da showEnd()
    this.dom.endBtn.addEventListener('click', () => this.endChoice(this.endActions?.[0]));
    this.dom.endBtn2.addEventListener('click', () => this.endChoice(this.endActions?.[1]));
  }

  translateStatic() {
    this.dom.logoTop.textContent = i18n.t('logoTop');
    this.dom.logoBot.textContent = i18n.t('logoBot');
    this.dom.modeTag.textContent = i18n.t('modeTag');
    this.dom.bagLabel.textContent = i18n.t('bagLabel');
    this.setCtrl(this.dom.rulesBtn, i18n.t('btnRules'));
    this.setCtrl(this.dom.audioBtn, i18n.t(sound.isMuted ? 'btnAudioOff' : 'btnAudioOn'));
    this.setCtrl(this.dom.voiceBtn, i18n.t(announcer.enabled ? 'btnVoiceOn' : 'btnVoiceOff'));
    this.setCtrl(this.dom.cameraBtn, i18n.t('btnCamera'));
    this.setCtrl(this.dom.proBtn, '👑 PRO');
    this.setBtnText(this.dom.standBtn, i18n.t('btnStandTitle'), i18n.t('btnStandSub'));
    for (const k of ['rulesSub', 'rulesTitle', 'rule1Title', 'rule1Desc', 'rule2Title', 'rule2Desc',
      'rule3Title', 'rule3Desc', 'rule4Title', 'rule4Desc']) {
      const el = document.getElementById(k.replace(/([A-Z])/g, '-$1').toLowerCase()); // rule1Title → rule1-title
      if (el) el.textContent = i18n.t(k);
    }
    this.dom.closeRulesBtn.textContent = i18n.t('btnCloseRules');
    this.renderPro();
    this.updateHud();
  }

  updateHud() {
    this.dom.hallLabel.textContent = i18n.t('hallLabel', { n: this.hall });
    this.dom.bagVal.textContent = this.coins(this.bag);
  }

  // ---------- Spedizione e sale ----------
  startExpedition() {
    this.hall = 1;
    this.bag = 0;
    this.torches = 1;
    this.ropes = 1;
    this.enterHall();
  }

  /** Entrata in una nuova sala: torce trovate (sale 3, 6, 9) e torcia Pro, poi la sala. */
  enterHall() {
    if (TORCH_HALLS.includes(this.hall)) this.torches++;
    if (getMonetization().isPro) this.torches++;
    this.startHall();
  }

  /** Prepara la sala corrente (anche quando cambia la lingua: nuovo enigma, stesse risorse). */
  startHall() {
    this.roundId++;
    clearInterval(this.timerInterval);
    sound.stopTension();
    sound.stopHeartbeat();
    this.dom.endModal.classList.remove('active');

    this.question = generateQuestion(i18n.getLanguage(), {
      recentSigs: this.history.sigs,
      recentCats: this.history.cats.slice(-2)
    });
    this.history.sigs = [...this.history.sigs, this.question.sig].slice(-80);
    this.history.cats = [...this.history.cats, this.question.catKey].slice(-4);
    saveJSON(HISTORY_KEY, this.history);

    this.selected = -1;
    this.other = -1;
    this.crumbled = new Set();
    this.videoTorchUsed = false;
    this.timerPaused = false;
    this.state = 'INTRO';
    setGameplayActive(true);

    this.updateHud();
    this.dom.category.textContent = this.question.category;
    this.dom.questionText.textContent = this.question.question;
    this.dom.hint.textContent = this.question.hint ? `💡 ${this.question.hint}` : '';
    this.dom.hint.style.display = this.question.hint ? '' : 'none';
    this.dom.boardHeader.textContent = i18n.t('boardHeader');
    this.dom.banner.textContent = i18n.t('bannerHall', { n: this.hall });
    this.dom.banner.className = 'status-banner intro';

    this.dom.standBtn.style.display = 'flex';
    this.dom.standBtn.disabled = true;
    this.dom.holdBtn.style.display = 'none';
    this.dom.leapBtn.style.display = 'none';
    this.resetTimerDisplay(exploreSeconds(this.hall));

    this.temple.setHall(this.question.options, this.hall);
    this.renderBoard();

    const intro = i18n.t('spkHall', { n: this.hall, cat: this.question.category, q: this.question.question });
    announcer.speak(this.hall === 1 ? `${i18n.t('spkWelcome')} ${intro}` : intro);
    this.later(() => this.startExplore(), 2600);
  }

  renderBoard() {
    this.dom.grid.innerHTML = '';
    this.question.options.forEach((opt, idx) => {
      const card = document.createElement('div');
      card.className = 'option-tile';
      card.id = `option-tile-${idx}`;
      card.innerHTML = `
        <div class="tile-number">${opt.id}</div>
        <div class="tile-text">${opt.text}</div>
        <div class="tile-status">${opt.id}</div>
      `;
      card.addEventListener('click', () => this.onTile(idx));
      this.dom.grid.appendChild(card);
    });
  }

  tileEl(idx) {
    return document.getElementById(`option-tile-${idx}`);
  }

  setTileStatus(idx, cls, text) {
    const el = this.tileEl(idx);
    if (!el) return;
    if (cls) el.classList.add(cls);
    const s = el.querySelector('.tile-status');
    if (s && text !== undefined) s.textContent = text;
  }

  onTile(idx) {
    if (this.crumbled.has(idx)) return;
    if (this.state === 'EXPLORE') this.stepOn(idx);
  }

  // ---------- Fase 1: esplorazione ----------
  startExplore() {
    this.state = 'EXPLORE';
    const secs = exploreSeconds(this.hall);
    this.startTimer(secs, () => {
      if (this.selected < 0) {
        const free = this.question.options.map((_, i) => i).filter(i => !this.crumbled.has(i));
        this.stepOn(free[Math.floor(Math.random() * free.length)]);
      }
      this.lockTile();
    });
    sound.startTension();
    sound.startHeartbeat(65);
    this.dom.banner.textContent = i18n.t('bannerExplore', { sec: secs });
    this.dom.banner.className = 'status-banner thinking';
    this.updateTorchButton();
    announcer.speak(i18n.t('spkExplore'));
  }

  stepOn(idx) {
    this.selected = idx;
    const opt = this.question.options[idx];
    this.temple.moveExplorerTo(idx);
    sound.playKeypress();
    document.querySelectorAll('.option-tile').forEach((tile, i) => {
      tile.classList.toggle('selected', i === idx);
      const s = tile.querySelector('.tile-status');
      if (s && !this.crumbled.has(i)) s.textContent = i === idx ? i18n.t('tileMine') : `${i + 1}`;
    });
    this.dom.standBtn.disabled = false;
    this.dom.banner.textContent = i18n.t('bannerChosen', { num: idx + 1, text: opt.text });
    this.updateTorchButton();
  }

  remaining() {
    return this.question.options.map((_, i) => i).filter(i => !this.crumbled.has(i));
  }

  /** Torcia: almeno 4 lastre in piedi, così ne restano sempre una sbagliata oltre alla tua. */
  torchUsable() {
    return this.state === 'EXPLORE' && this.remaining().length >= 4;
  }

  updateTorchButton() {
    const btn = this.dom.torchBtn;
    if (this.state !== 'EXPLORE') {
      btn.style.display = 'none';
      return;
    }
    const st = getMonetization();
    btn.style.display = 'flex';
    if (this.torches > 0) {
      this.dom.torchTitle.textContent = i18n.t('torchTitle', { n: this.torches });
      this.dom.torchSub.textContent = i18n.t('torchSub');
      btn.disabled = !this.torchUsable();
    } else if (!this.videoTorchUsed) {
      this.dom.torchTitle.textContent = i18n.t('torchVideoTitle');
      this.dom.torchSub.textContent = st.native || st.portal === 'crazygames' ? i18n.t('torchVideoSub') : i18n.t('torchSub');
      btn.disabled = !this.torchUsable() || !rewardAvailable();
    } else {
      btn.style.display = 'none';
    }
  }

  async useTorch() {
    if (!this.torchUsable() || this.torchBusy) return;
    const round = this.roundId;
    if (this.torches <= 0) {
      if (this.videoTorchUsed) return;
      this.torchBusy = true;
      this.timerPaused = true;
      const earned = await earnReward();
      this.torchBusy = false;
      this.timerPaused = false;
      if (round !== this.roundId || this.state !== 'EXPLORE' || !earned) return this.updateTorchButton();
      this.videoTorchUsed = true;
      this.torches++;
    }
    this.torches--;

    const wrong = this.remaining().filter(i => !this.question.options[i].isCorrect && i !== this.selected);
    const target = wrong[Math.floor(Math.random() * wrong.length)];
    this.crumbled.add(target);
    this.updateTorchButton();
    announcer.speak(i18n.t('spkTorch'), true);
    sound.playCrumble();
    this.temple.crumbleTile(target, () => {
      if (round !== this.roundId) return;
      this.setTileStatus(target, 'eliminated', i18n.t('tileCrumbled'));
    });
  }

  lockTile() {
    if (this.torchBusy || this.state !== 'EXPLORE') return;
    clearInterval(this.timerInterval);
    this.state = 'COLLAPSE';
    this.updateTorchButton();
    this.dom.standBtn.style.display = 'none';
    const opt = this.question.options[this.selected];
    announcer.speak(i18n.t('spkLocked', { id: opt.id, text: opt.text }), true);

    // L'altra lastra che resterà in piedi: la giusta se sei su una sbagliata, altrimenti una sbagliata a caso
    const others = this.remaining().filter(i => i !== this.selected);
    if (opt.isCorrect) {
      const wrong = others.filter(i => !this.question.options[i].isCorrect);
      this.other = wrong[Math.floor(Math.random() * wrong.length)];
    } else {
      this.other = others.find(i => this.question.options[i].isCorrect);
    }
    const toFall = others.filter(i => i !== this.other);
    for (let i = toFall.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [toFall[i], toFall[j]] = [toFall[j], toFall[i]];
    }

    this.later(() => {
      this.dom.banner.textContent = i18n.t('bannerCollapse');
      this.dom.banner.className = 'status-banner locked';
      announcer.speak(i18n.t('spkCollapse'));
      this.temple.setCameraOverview();
      this.temple.shakeCamera(0.35);
      this.collapse(toFall, 0);
    }, 1400);
  }

  // ---------- Fase 2: il crollo ----------
  collapse(list, k) {
    if (k >= list.length) {
      this.later(() => this.startLastTwo(), 900);
      return;
    }
    const idx = list[k];
    this.crumbled.add(idx);
    sound.playCrumble();
    this.temple.crumbleTile(idx, () => this.setTileStatus(idx, 'eliminated', i18n.t('tileCrumbled')));
    this.later(() => this.collapse(list, k + 1), 650);
  }

  // ---------- Fase 3: le ultime due lastre ----------
  startLastTwo() {
    this.state = 'LAST_TWO';
    this.dom.boardHeader.textContent = i18n.t('boardHeaderLast');
    const mine = this.question.options[this.selected];
    const other = this.question.options[this.other];
    this.setTileStatus(this.other, 'other-tile', i18n.t('tileOther'));
    this.temple.setCameraOnExplorer(this.selected);

    this.dom.holdBtn.style.display = 'flex';
    this.setBtnText(this.dom.holdBtn, i18n.t('btnHoldTitle'), i18n.t('btnHoldSub', { num: mine.id }));
    const canLeap = this.ropes > 0;
    this.dom.leapBtn.style.display = canLeap ? 'flex' : 'none';
    if (canLeap) {
      this.setBtnText(this.dom.leapBtn, i18n.t('btnLeapTitle'), i18n.t('btnLeapSub', { num: other.id, n: this.ropes }));
    }

    this.dom.banner.textContent = i18n.t(canLeap ? 'bannerLastTwo' : 'bannerLastTwoNoRope', { mine: mine.id, other: other.id });
    this.dom.banner.className = 'status-banner verdict';
    announcer.speak(i18n.t(canLeap ? 'spkLastTwo' : 'spkLastTwoNoRope', { id: other.id }));
    sound.startHeartbeat(85);

    if (!canLeap) {
      this.later(() => this.hold(), 3500);
      return;
    }
    this.startTimer(LAST_TWO_SECONDS, () => this.hold());
  }

  hold() {
    if (this.state !== 'LAST_TWO') return;
    clearInterval(this.timerInterval);
    announcer.speak(i18n.t('spkHold', { id: this.selected + 1 }), true);
    this.reveal();
  }

  leap() {
    if (this.state !== 'LAST_TWO' || this.ropes <= 0) return;
    clearInterval(this.timerInterval);
    this.ropes--;
    const from = this.selected;
    this.selected = this.other;
    this.other = from;
    sound.playLeap();
    this.temple.moveExplorerTo(this.selected);
    this.tileEl(from)?.classList.remove('selected');
    this.tileEl(this.selected)?.classList.remove('other-tile');
    this.setTileStatus(this.selected, 'selected', i18n.t('tileMine'));
    this.setTileStatus(from, null, i18n.t('tileOther'));
    announcer.speak(i18n.t('spkLeap', { id: this.selected + 1 }), true);
    this.reveal();
  }

  reveal() {
    this.state = 'REVEAL';
    this.dom.holdBtn.style.display = 'none';
    this.dom.leapBtn.style.display = 'none';
    this.dom.banner.textContent = i18n.t('bannerReveal');
    this.dom.banner.className = 'status-banner locked';
    this.showTimerWord('⚖️', i18n.t('timerLast'));
    this.temple.setTension(true);
    sound.startHeartbeat(130);

    const mine = this.question.options[this.selected];
    this.later(() => {
      sound.stopHeartbeat();
      sound.stopTension();
      this.temple.setTension(false);
      if (mine.isCorrect) this.survive();
      else this.fall();
    }, 2200);
  }

  // ---------- Esiti ----------
  survive() {
    this.state = 'SAFE';
    const otherIdx = this.other;
    sound.playCrumble();
    this.temple.crumbleTile(otherIdx, () => this.setTileStatus(otherIdx, 'eliminated', i18n.t('tileCrumbled')));
    this.crumbled.add(otherIdx);

    const gain = HALL_TREASURE[this.hall - 1];
    this.bag += gain;
    this.updateHud();
    this.showTimerWord('✔', i18n.t('timerSafe'));
    this.setTileStatus(this.selected, 'correct-reveal', i18n.t('tileCorrectReveal'));
    this.dom.banner.textContent = i18n.t('bannerSafe', { coins: this.coins(gain) });
    this.dom.banner.className = 'status-banner verdict';
    sound.playCorrect();
    this.temple.celebrate();
    announcer.speak(i18n.t('spkSafe', { n: this.hall }));
    setGameplayActive(false);

    const mine = this.question.options[this.selected];
    this.later(() => {
      if (this.hall >= HALLS) {
        this.bag *= 2;
        this.updateHud();
        this.recordExpedition(true);
        announcer.speak(i18n.t('spkConquered'));
        this.showEnd('victory', i18n.t('conqueredTitle'), i18n.t('conqueredDesc', { bag: this.coins(this.bag) }), mine,
          [{ label: i18n.t('btnNewRun'), action: 'new' }]);
        return;
      }
      this.showEnd('victory', i18n.t('safeTitle'),
        i18n.t('safeDesc', { n: this.hall, coins: this.coins(gain), bag: this.coins(this.bag) }), mine, [
          { label: i18n.t('btnDescend', { n: this.hall + 1 }), action: 'descend' },
          { label: i18n.t('btnEscape', { bag: this.coins(this.bag) }), action: 'escape' }
        ]);
    }, 1800);
  }

  fall() {
    this.state = 'FELL';
    const mine = this.question.options[this.selected];
    const right = this.question.options[this.other];
    sound.playWrong();
    this.showTimerWord('✕', i18n.t('timerFell'));
    this.setTileStatus(this.other, 'correct-reveal', i18n.t('tileCorrectReveal'));
    this.temple.setCameraOnExplorer(this.selected);
    announcer.speak(i18n.t('spkFall', { text: right.text }), true);
    setGameplayActive(false);
    const lost = this.bag;
    this.recordExpedition(false);

    const round = this.roundId;
    this.later(() => {
      sound.playCrumble();
      this.temple.dropExplorer(() => {
        if (round !== this.roundId) return;
        this.crumbled.add(this.selected);
        this.later(() => {
          this.showEnd('defeat', i18n.t('fallTitle'),
            i18n.t('fallDesc', { num: mine.id, n: this.hall, bag: this.coins(lost) }), right,
            [{ label: i18n.t('btnNewRun'), action: 'new' }], mine);
        }, 900);
      });
    }, 900);
  }

  showEnd(kind, title, desc, rightOpt, actions, wrongOpt) {
    this.endActions = actions;
    this.dom.endTitle.textContent = title;
    this.dom.endTitle.className = `end-title ${kind}`;
    this.dom.endDesc.innerHTML = desc;
    this.dom.endDetail.innerHTML = `
      ${wrongOpt ? `<strong>${wrongOpt.id} - ${wrongOpt.text}</strong> (✕)<br>` : ''}
      <strong>${rightOpt.id} - ${rightOpt.text}</strong> (✔)<br>
      <em>${rightOpt.detail}</em>
      ${this.statsLine()}
    `;
    this.dom.endBtn.textContent = actions[0].label;
    this.dom.endBtn2.hidden = !actions[1];
    if (actions[1]) this.dom.endBtn2.textContent = actions[1].label;
    this.dom.endModal.classList.add('active');
  }

  async endChoice(choice) {
    if (!choice) return;
    this.dom.endModal.classList.remove('active');
    if (choice.action === 'escape') {
      this.recordExpedition(true);
      announcer.speak(i18n.t('spkEscape', { bag: this.coins(this.bag) }));
      const hall = this.hall;
      this.showEnd('victory', i18n.t('escapeTitle'), i18n.t('escapeDesc', { n: hall, bag: this.coins(this.bag) }),
        this.question.options[this.selected], [{ label: i18n.t('btnNewRun'), action: 'new' }]);
      return;
    }
    // Passaggio tra due sale o tra due spedizioni: qui può comparire un interstitial
    await trackAdAction();
    if (choice.action === 'descend') {
      this.hall++;
      this.enterHall();
    } else {
      this.startExpedition();
    }
  }

  recordExpedition(escaped) {
    const s = this.stats;
    s.played++;
    s.deepest = Math.max(s.deepest, this.hall);
    if (escaped) {
      s.escapes++;
      s.best = Math.max(s.best, this.bag);
    }
    saveJSON(STATS_KEY, s);
  }

  statsLine() {
    const s = this.stats;
    return `<div class="stats-line">${i18n.t('statsLine', {
      played: s.played, escapes: s.escapes, deepest: s.deepest, best: this.coins(s.best)
    })}</div>`;
  }

  // ---------- Timer ----------
  resetTimerDisplay(secs) {
    this.timerSeconds = secs;
    this.timerMax = secs;
    this.dom.timerDisplay.classList.remove('urgent', 'word-mode');
    this.dom.timerCircle.classList.remove('urgent', 'word-mode');
    this.dom.timerSub.textContent = i18n.t('timerSec');
    this.updateTimerUI();
  }

  startTimer(secs, onEnd) {
    clearInterval(this.timerInterval);
    this.resetTimerDisplay(secs);
    this.timerInterval = setInterval(() => {
      if (this.timerPaused) return;
      this.timerSeconds--;
      this.updateTimerUI();
      if (this.timerSeconds <= 8) {
        sound.setHeartbeatBpm(130);
        sound.playTick(1200);
        this.temple.setTension(true);
      } else {
        sound.playTick(800);
      }
      if (this.timerSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.temple.setTension(false);
        onEnd();
      }
    }, 1000);
  }

  updateTimerUI() {
    this.dom.timerDisplay.textContent = this.timerSeconds;
    const c = 283;
    this.dom.timerCircle.style.strokeDashoffset = c - (this.timerSeconds / this.timerMax) * c;
    const urgent = this.timerSeconds <= 8;
    this.dom.timerDisplay.classList.toggle('urgent', urgent);
    this.dom.timerCircle.classList.toggle('urgent', urgent);
  }

  showTimerWord(icon, sub) {
    this.dom.timerDisplay.textContent = icon;
    this.dom.timerSub.textContent = sub;
    this.dom.timerCircle.style.strokeDashoffset = '0';
    this.dom.timerDisplay.classList.remove('urgent');
    this.dom.timerCircle.classList.remove('urgent');
    this.dom.timerDisplay.classList.add('word-mode');
    this.dom.timerCircle.classList.add('word-mode');
  }
}

function loadJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v && typeof v === 'object' ? { ...fallback, ...v } : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

window.addEventListener('DOMContentLoaded', () => {
  window.lastTileGame = new LastTileGame();
});
