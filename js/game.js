// Game Manager di TRAP10 QUIZ
// Con supporto completo Multilingua (i18n): IT, EN, ES, FR, DE

// Font inclusi nell'app: funzionano offline e senza richieste a servizi esterni
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700-italic.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import '@fontsource/orbitron/600.css';
import '@fontsource/orbitron/800.css';
import '@fontsource/orbitron/900.css';
import '@fontsource/rajdhani/600.css';
import '@fontsource/rajdhani/700.css';
import { generateQuestion } from './questions.js';
import { i18n } from './i18n.js';
import { sound } from './sound.js';
import { announcer } from './speech.js';
import { Studio3D } from './studio3d.js';
import {
  initMonetization, subscribeMonetization, getMonetization, trackAdAction, setGameplayActive,
  jollyAvailable, earnJolly, buyPro, restorePro, toggleTestAds
} from './monetization.js';

export class DieciBotoleGame {
  constructor() {
    this.studio = null;
    this.currentQuestion = null;
    this.selectedBotolaIndex = -1; // botola su cui sta il campione
    this.pendingChangeIndex = -1;  // botola provvisoria scelta durante i 30s
    this.originalSelectedBotolaIndex = -1;
    this.initialPrizeNum = 100000;
    this.currentPrizeNum = 100000;
    this.isPrizeHalved = false;

    this.timerSeconds = 90;
    this.timerInterval = null;
    this.gameState = 'INTRO';

    this.activeBotolaIndices = new Set([0,1,2,3,4,5,6,7,8,9]);
    this.eliminatedBotolaIndices = new Set();
    this.roundId = 0;
    this.history = loadJSON(HISTORY_KEY, { sigs: [], cats: [] });
    this.stats = loadJSON(STATS_KEY, { played: 0, wins: 0, totalWon: 0, bestWin: 0, streak: 0, bestStreak: 0 });

    // Referenze DOM
    this.dom = {
      viewport3d: document.getElementById('viewport-3d'),
      logoTop: document.getElementById('logo-text-top'),
      logoBot: document.getElementById('logo-text-bot'),
      modeTag: document.getElementById('mode-tag'),
      jackpotLabel: document.getElementById('jackpot-label'),
      prizeDisplay: document.getElementById('montepremi-val'),
      langSelect: document.getElementById('lang-select'),
      timerDisplay: document.getElementById('timer-display'),
      timerCircle: document.getElementById('timer-circle-progress'),
      timerSub: document.getElementById('timer-sub'),
      questionCategory: document.getElementById('finale-category'),
      questionText: document.getElementById('finale-question-text'),
      optionsGrid: document.getElementById('options-grid'),
      optionsBoardHeader: document.getElementById('options-board-header'),
      statusBanner: document.getElementById('status-banner'),
      confirmBtn: document.getElementById('confirm-botola-btn'),
      keepChoiceBtn: document.getElementById('keep-choice-btn'),
      changeChoiceBtn: document.getElementById('change-choice-btn'),
      changeBtnTitle: document.getElementById('change-btn-title'),
      changePrizeSub: document.getElementById('change-prize-sub'),
      keepPrizeSub: document.getElementById('keep-prize-sub'),
      rulesModal: document.getElementById('rules-modal'),
      infoRulesBtn: document.getElementById('info-rules-btn'),
      closeRulesBtn: document.getElementById('close-rules-btn'),
      audioToggleBtn: document.getElementById('audio-toggle-btn'),
      voiceToggleBtn: document.getElementById('voice-toggle-btn'),
      cameraViewBtn: document.getElementById('camera-view-btn'),
      endModal: document.getElementById('end-modal'),
      endTitle: document.getElementById('end-title'),
      endDesc: document.getElementById('end-desc'),
      endDetail: document.getElementById('end-detail'),
      endBtn: document.getElementById('end-btn'),
      hintPill: document.getElementById('hint-pill'),
      logoShield: document.getElementById('logo-shield'),
      jollyBtn: document.getElementById('jolly-btn'),
      jollyTitle: document.getElementById('jolly-title'),
      jollySub: document.getElementById('jolly-sub'),
      proBtn: document.getElementById('pro-btn'),
      proModal: document.getElementById('pro-modal'),
      proCloseBtn: document.getElementById('pro-close-btn'),
      proTitle: document.getElementById('pro-title'),
      proSubtitle: document.getElementById('pro-subtitle'),
      proBenefits: document.getElementById('pro-benefits'),
      proStatus: document.getElementById('pro-status'),
      proBuyBtn: document.getElementById('pro-buy-btn'),
      proRestoreBtn: document.getElementById('pro-restore-btn'),
      proMessage: document.getElementById('pro-message'),
      webAdBar: document.getElementById('web-ad-bar'),
      webAdProBtn: document.getElementById('web-ad-pro-btn'),
      adDiag: document.getElementById('ad-diag'),
      adDiagToggle: document.getElementById('ad-diag-toggle'),
      adDiagLog: document.getElementById('ad-diag-log'),

      // Regole
      rulesSub: document.getElementById('rules-sub'),
      rulesTitle: document.getElementById('rules-title'),
      rule1Title: document.getElementById('rule1-title'),
      rule1Desc: document.getElementById('rule1-desc'),
      rule2Title: document.getElementById('rule2-title'),
      rule2Desc: document.getElementById('rule2-desc'),
      rule3Title: document.getElementById('rule3-title'),
      rule3Desc: document.getElementById('rule3-desc'),
      rule4Title: document.getElementById('rule4-title'),
      rule4Desc: document.getElementById('rule4-desc')
    };

    this.init();
  }

  // setTimeout legato alla manche corrente: se nel frattempo è iniziata una nuova manche
  // (es. cambio lingua) la callback viene ignorata
  later(fn, ms) {
    const round = this.roundId;
    return setTimeout(() => {
      if (round === this.roundId) fn();
    }, ms);
  }

  init() {
    this.studio = new Studio3D(this.dom.viewport3d);

    this.studio.onBotolaClickCallback = (idx) => {
      this.handleBotolaInteraction(idx);
    };

    if (this.dom.langSelect) {
      this.dom.langSelect.value = i18n.getLanguage();
    }
    announcer.setLanguage(i18n.t('langCode'));

    this.setupEventListeners();
    this.updateStaticUITranslations();
    subscribeMonetization(st => this.onMonetizationChange(st));
    this.startNewFinaleRound();
    initMonetization();
  }

  // Pulsanti della barra: icona sempre visibile, testo nascosto sugli schermi stretti
  setCtrl(btn, text) {
    if (!btn) return;
    const [icon, ...rest] = text.split(' ');
    btn.innerHTML = `<span class="ic">${icon}</span> <span class="lbl">${rest.join(' ')}</span>`;
    btn.title = text.replace(icon, '').trim();
  }

  // Aggiorna Pro, banner e pannello diagnostico quando cambia lo stato della monetizzazione
  onMonetizationChange(st) {
    // Spazio in fondo per il banner nativo o per la barra di anteprima nel browser
    const showWebBar = !st.native && !st.isPro;
    this.dom.webAdBar.hidden = !showWebBar;
    const adH = st.isPro ? 0 : st.native ? st.bannerHeight : this.dom.webAdBar.offsetHeight;
    document.documentElement.style.setProperty('--ad-h', `${adH}px`);

    this.dom.proBtn.classList.toggle('owned', st.isPro);
    this.renderProModal();
    this.updateJollyButton();

    this.dom.adDiag.hidden = !(st.testAds && st.native);
    if (!this.dom.adDiag.hidden) {
      this.dom.adDiagToggle.textContent = `ADS DEBUG · ready=${st.adsReady} pro=${st.isPro} ${this.diagOpen === false ? '▲' : '▼'}`;
      this.dom.adDiagLog.hidden = this.diagOpen === false;
      this.dom.adDiagLog.innerHTML = (st.diag || []).map(l => `<div>${l}</div>`).join('');
    }
  }

  renderProModal(message) {
    const st = getMonetization();
    const price = st.proPrice || i18n.t('proFallbackPrice');
    this.dom.proTitle.textContent = 'TRAP10 PRO';
    this.dom.proSubtitle.textContent = i18n.t('proSubtitle');
    this.dom.proBenefits.innerHTML = ['proBenefit1', 'proBenefit2', 'proBenefit3']
      .map(k => `<li>✔ ${i18n.t(k)}</li>`).join('');
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
    this.renderProModal('…');
    try {
      const ok = await fn();
      this.renderProModal(i18n.t(ok ? okKey : failKey));
    } catch (err) {
      console.warn('Pro purchase error', err);
      this.renderProModal(i18n.t('proError'));
    } finally {
      this.dom.proBuyBtn.disabled = false;
      this.dom.proRestoreBtn.disabled = false;
    }
  }

  // ---------- Jolly di Leo: elimina 2 risposte sbagliate nella fase di scelta ----------
  updateJollyButton() {
    if (!this.dom.jollyBtn) return;
    const visible = this.gameState === 'INITIAL_CHOICE_90S' && !this.jollyUsed;
    this.dom.jollyBtn.style.display = visible ? 'flex' : 'none';
    if (!visible) return;
    const st = getMonetization();
    this.dom.jollyTitle.textContent = i18n.t('jollyTitle');
    this.dom.jollySub.textContent = st.isPro || !st.native ? i18n.t('jollySubFree') : i18n.t('jollySubVideo');
    this.dom.jollyBtn.disabled = !jollyAvailable();
  }

  async useJolly() {
    if (this.gameState !== 'INITIAL_CHOICE_90S' || this.jollyUsed || this.jollyBusy) return;
    this.jollyBusy = true;
    this.timerPaused = true;
    const round = this.roundId;
    const earned = await earnJolly();
    this.jollyBusy = false;
    this.timerPaused = false;
    if (round !== this.roundId || this.gameState !== 'INITIAL_CHOICE_90S' || !earned) {
      this.updateJollyButton();
      return;
    }
    this.jollyUsed = true;
    this.updateJollyButton();

    const candidates = this.currentQuestion.options
      .map((opt, idx) => ({ opt, idx }))
      .filter(({ opt, idx }) => !opt.isCorrect && idx !== this.selectedBotolaIndex && !this.eliminatedBotolaIndices.has(idx));
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    announcer.speak(i18n.t('spkJolly'), true);
    candidates.slice(0, 2).forEach(({ idx }) => {
      sound.playBotolaDrop();
      this.studio.eliminateBotola(idx, () => {
        if (round !== this.roundId) return;
        this.activeBotolaIndices.delete(idx);
        this.eliminatedBotolaIndices.add(idx);
        const tile = document.getElementById(`option-tile-${idx}`);
        if (tile) {
          tile.classList.add('eliminated');
          const statusEl = tile.querySelector('.tile-status');
          if (statusEl) statusEl.textContent = i18n.t('tileEliminated');
        }
      });
    });
  }

  setupEventListeners() {
    window.addEventListener('click', () => sound.init(), { once: true });
    window.addEventListener('keydown', () => sound.init(), { once: true });

    // Cambio lingua istantaneo
    if (this.dom.langSelect) {
      this.dom.langSelect.addEventListener('change', (e) => {
        i18n.setLanguage(e.target.value);
        announcer.setLanguage(i18n.t('langCode'));
        this.updateStaticUITranslations();
        this.startNewFinaleRound();
      });
    }

    this.dom.audioToggleBtn.addEventListener('click', () => {
      sound.init();
      const muted = sound.toggleMute();
      this.setCtrl(this.dom.audioToggleBtn, muted ? i18n.t('btnAudioOff') : i18n.t('btnAudioOn'));
      this.dom.audioToggleBtn.classList.toggle('muted', muted);
    });

    this.dom.voiceToggleBtn.addEventListener('click', () => {
      const active = announcer.toggle();
      this.setCtrl(this.dom.voiceToggleBtn, active ? i18n.t('btnVoiceOn') : i18n.t('btnVoiceOff'));
      this.dom.voiceToggleBtn.classList.toggle('muted', !active);
    });

    this.dom.cameraViewBtn.addEventListener('click', () => {
      if (this.selectedBotolaIndex >= 0) {
        this.studio.setCameraChampionOnBotola(this.selectedBotolaIndex);
      } else {
        this.studio.setCameraOverview();
      }
    });

    // Modale Regole
    this.dom.infoRulesBtn.addEventListener('click', () => {
      this.dom.rulesModal.classList.add('active');
      trackAdAction();
    });

    // Versione Pro
    const openPro = () => {
      this.renderProModal('');
      this.dom.proModal.classList.add('active');
    };
    this.dom.proBtn.addEventListener('click', openPro);
    this.dom.webAdProBtn.addEventListener('click', openPro);
    this.dom.proCloseBtn.addEventListener('click', () => this.dom.proModal.classList.remove('active'));
    this.dom.proBuyBtn.addEventListener('click', () => this.runProAction(buyPro, 'proOwned', 'proError'));
    this.dom.proRestoreBtn.addEventListener('click', () => this.runProAction(restorePro, 'proRestored', 'proNotFound'));

    // Jolly di Leo
    this.dom.jollyBtn.addEventListener('click', () => this.useJolly());

    // 7 tocchi sul logo: annunci di test on/off (per le build di prova), poi riaprire l'app
    let taps = { n: 0, at: 0 };
    this.dom.logoShield.addEventListener('click', () => {
      const now = Date.now();
      taps = now - taps.at < 1500 ? { n: taps.n + 1, at: now } : { n: 1, at: now };
      if (taps.n >= 7) {
        taps = { n: 0, at: 0 };
        const on = toggleTestAds();
        alert(i18n.t(on ? 'testAdsOn' : 'testAdsOff'));
      }
    });
    this.dom.adDiagToggle.addEventListener('click', () => {
      this.diagOpen = this.diagOpen === false;
      this.onMonetizationChange(getMonetization());
    });
    this.dom.closeRulesBtn.addEventListener('click', () => {
      this.dom.rulesModal.classList.remove('active');
    });

    // Tasto Conferma Scelta Iniziale (Fase 1)
    this.dom.confirmBtn.addEventListener('click', () => {
      if (this.selectedBotolaIndex >= 0 && this.gameState === 'INITIAL_CHOICE_90S') {
        this.lockInitialChoice();
      }
    });

    // Tasto Mantieni Botola (Fase 3 - 30 Secondi)
    this.dom.keepChoiceBtn.addEventListener('click', () => {
      if (this.gameState === 'DECISION_30S') {
        this.confirmKeepOriginalChoice();
      }
    });

    // Tasto Cambia Botola con Dimezzamento (Fase 3 - 30 Secondi)
    this.dom.changeChoiceBtn.addEventListener('click', () => {
      if (this.gameState === 'DECISION_30S' && this.pendingChangeIndex >= 0) {
        this.confirmSwitchChoice();
      }
    });

    // Tasto Rigioca
    this.dom.endBtn.addEventListener('click', async () => {
      this.dom.endModal.classList.remove('active');
      // Punto di passaggio tra due manche: qui può comparire un interstitial
      await trackAdAction();
      this.startNewFinaleRound();
    });
  }

  // Aggiorna tutti i testi dell'interfaccia nella lingua selezionata
  updateStaticUITranslations() {
    if (this.dom.logoTop) this.dom.logoTop.textContent = i18n.t('logoTop');
    if (this.dom.logoBot) this.dom.logoBot.textContent = i18n.t('logoBot');
    if (this.dom.modeTag) this.dom.modeTag.textContent = i18n.t('modeTag');
    if (this.dom.jackpotLabel) this.dom.jackpotLabel.textContent = i18n.t('jackpotLabel');

    this.setCtrl(this.dom.infoRulesBtn, i18n.t('btnRules'));
    this.setCtrl(this.dom.audioToggleBtn, sound.isMuted ? i18n.t('btnAudioOff') : i18n.t('btnAudioOn'));
    this.setCtrl(this.dom.voiceToggleBtn, announcer.enabled ? i18n.t('btnVoiceOn') : i18n.t('btnVoiceOff'));
    this.setCtrl(this.dom.cameraViewBtn, i18n.t('btnCamera'));
    this.setCtrl(this.dom.proBtn, '👑 PRO');
    this.renderProModal();

    // Bottoni azione
    const confirmTitle = this.dom.confirmBtn.querySelector('.btn-title');
    const confirmSub = this.dom.confirmBtn.querySelector('.btn-sub');
    if (confirmTitle) confirmTitle.textContent = i18n.t('btnConfirmTitle');
    if (confirmSub) confirmSub.textContent = i18n.t('btnConfirmSub');

    const keepTitle = this.dom.keepChoiceBtn.querySelector('.btn-title');
    if (keepTitle) keepTitle.textContent = i18n.t('btnKeepTitle');
    if (this.dom.keepPrizeSub) {
      this.dom.keepPrizeSub.textContent = i18n.t('btnKeepSub', { prize: this.formatPrize(this.currentPrizeNum) });
    }

    if (this.dom.changeBtnTitle) this.dom.changeBtnTitle.textContent = i18n.t('btnChangeTitle');
    if (this.dom.changePrizeSub) {
      const half = Math.floor(this.currentPrizeNum / 2);
      this.dom.changePrizeSub.textContent = i18n.t('btnChangeSub', { prize: this.formatPrize(half) });
    }

    // Regole
    if (this.dom.rulesSub) this.dom.rulesSub.textContent = i18n.t('rulesSub');
    if (this.dom.rulesTitle) this.dom.rulesTitle.textContent = i18n.t('rulesTitle');
    if (this.dom.rule1Title) this.dom.rule1Title.textContent = i18n.t('rule1Title');
    if (this.dom.rule1Desc) this.dom.rule1Desc.textContent = i18n.t('rule1Desc');
    if (this.dom.rule2Title) this.dom.rule2Title.textContent = i18n.t('rule2Title');
    if (this.dom.rule2Desc) this.dom.rule2Desc.textContent = i18n.t('rule2Desc');
    if (this.dom.rule3Title) this.dom.rule3Title.textContent = i18n.t('rule3Title');
    if (this.dom.rule3Desc) this.dom.rule3Desc.textContent = i18n.t('rule3Desc');
    if (this.dom.rule4Title) this.dom.rule4Title.textContent = i18n.t('rule4Title');
    if (this.dom.rule4Desc) this.dom.rule4Desc.textContent = i18n.t('rule4Desc');
    if (this.dom.closeRulesBtn) this.dom.closeRulesBtn.textContent = i18n.t('btnCloseRules');

    if (this.dom.endBtn) this.dom.endBtn.textContent = i18n.t('btnPlayAgain');
  }

  // =========================================================================
  // FASE 0: INIZIALIZZAZIONE NUOVA MANCHE CON LINGUA ATTIVA
  // =========================================================================
  startNewFinaleRound() {
    this.roundId++;
    clearInterval(this.timerInterval);
    sound.stopTension();
    sound.stopHeartbeat();

    this.currentQuestion = generateQuestion(i18n.getLanguage(), {
      recentSigs: this.history.sigs,
      recentCats: this.history.cats.slice(-2)
    });
    this.history.sigs = [...this.history.sigs, this.currentQuestion.sig].slice(-80);
    this.history.cats = [...this.history.cats, this.currentQuestion.catKey].slice(-4);
    saveJSON(HISTORY_KEY, this.history);

    this.initialPrizeNum = this.currentQuestion.prizeValue || 100000;
    this.currentPrizeNum = this.initialPrizeNum;
    this.isPrizeHalved = false;

    this.selectedBotolaIndex = -1;
    this.pendingChangeIndex = -1;
    this.originalSelectedBotolaIndex = -1;
    this.activeBotolaIndices = new Set([0,1,2,3,4,5,6,7,8,9]);
    this.eliminatedBotolaIndices = new Set();
    this.gameState = 'INTRO';
    this.jollyUsed = false;
    this.timerPaused = false;
    setGameplayActive(true);

    // Aggiorna UI
    this.updatePrizeDisplay();
    if (this.dom.timerDisplay) {
      this.dom.timerDisplay.classList.remove('urgent', 'confront-mode');
      this.dom.timerDisplay.textContent = "90";
    }
    if (this.dom.timerCircle) {
      this.dom.timerCircle.classList.remove('urgent', 'confront-mode');
      this.dom.timerCircle.style.strokeDashoffset = "0";
    }
    if (this.dom.timerSub) {
      this.dom.timerSub.textContent = "SEC";
    }
    this.dom.questionCategory.textContent = this.currentQuestion.category;
    this.dom.questionText.textContent = this.currentQuestion.question;
    this.dom.hintPill.textContent = this.currentQuestion.hint ? `💡 ${this.currentQuestion.hint}` : '';
    this.dom.hintPill.style.display = this.currentQuestion.hint ? '' : 'none';
    this.dom.optionsBoardHeader.textContent = i18n.t('boardHeader');

    this.dom.confirmBtn.style.display = 'flex';
    this.dom.confirmBtn.disabled = true;
    this.dom.keepChoiceBtn.style.display = 'none';
    this.dom.changeChoiceBtn.style.display = 'none';

    this.dom.statusBanner.textContent = i18n.t('bannerIntro');
    this.dom.statusBanner.className = "status-banner intro";

    this.studio.setQuestionOptions(this.currentQuestion.options);
    this.render2DOptionsBoard();

    // Leo, il conduttore virtuale, nella lingua attiva
    announcer.speak(i18n.t('spkIntro', {
      prize: this.formatPrize(this.currentPrizeNum),
      cat: this.currentQuestion.category,
      q: this.currentQuestion.question
    }));

    this.later(() => {
      this.startInitialChoicePhase();
    }, 3200);
  }

  updatePrizeDisplay() {
    this.dom.prizeDisplay.textContent = this.formatPrize(this.currentPrizeNum);
  }

  // Montepremi virtuale (nessun denaro reale) nel formato della lingua attiva
  formatPrize(num) {
    const lang = i18n.getLanguage();
    if (lang === 'en') return `$${num.toLocaleString('en-US')}`;
    if (lang === 'it') return `€ ${num.toLocaleString('it-IT')}`;
    return `${num.toLocaleString(i18n.t('langCode'))} €`;
  }

  render2DOptionsBoard() {
    this.dom.optionsGrid.innerHTML = '';
    this.currentQuestion.options.forEach((opt, idx) => {
      const card = document.createElement('div');
      card.className = 'option-tile';
      card.id = `option-tile-${idx}`;
      card.innerHTML = `
        <div class="tile-number">${opt.id}</div>
        <div class="tile-text">${opt.text}</div>
        <div class="tile-status">${opt.id}</div>
      `;

      card.addEventListener('click', () => {
        this.handleBotolaInteraction(idx);
      });

      this.dom.optionsGrid.appendChild(card);
    });
  }

  // =========================================================================
  // GESTORE CLICK BOTOLA UNIFICATO
  // =========================================================================
  handleBotolaInteraction(idx) {
    if (this.eliminatedBotolaIndices.has(idx)) return;

    if (this.gameState === 'INITIAL_CHOICE_90S') {
      this.selectInitialBotola(idx);
    } else if (this.gameState === 'DECISION_30S') {
      this.selectPendingChangeBotola(idx);
    } else if (this.gameState === 'CONFRONTATION_CHOICE') {
      if (idx !== this.selectedBotolaIndex) {
        this.startBotolaConfrontation(idx);
      }
    }
  }

  // =========================================================================
  // FASE 1: SCELTA INIZIALE (90 SECONDI)
  // =========================================================================
  startInitialChoicePhase() {
    this.gameState = 'INITIAL_CHOICE_90S';
    this.timerSeconds = 90;
    this.dom.timerSub.textContent = "SEC";
    this.updateTimerUI(90);

    sound.startTension();
    sound.startHeartbeat(65);

    this.dom.statusBanner.textContent = i18n.t('bannerPhase1');
    this.dom.statusBanner.className = "status-banner thinking";
    this.updateJollyButton();

    announcer.speak(i18n.t('spkPhase1'));

    this.timerInterval = setInterval(() => {
      if (this.timerPaused) return;
      this.timerSeconds--;
      this.updateTimerUI(90);

      if (this.timerSeconds <= 15) {
        sound.setHeartbeatBpm(130);
        sound.playTick(1200);
        this.studio.setTensionMode(true);
      } else if (this.timerSeconds <= 45) {
        sound.setHeartbeatBpm(90);
        sound.playTick(900);
      } else {
        sound.playTick(750);
      }

      if (this.timerSeconds <= 0) {
        clearInterval(this.timerInterval);
        if (this.selectedBotolaIndex < 0) this.selectInitialBotola(Math.floor(Math.random() * 10));
        this.lockInitialChoice();
      }
    }, 1000);
  }

  selectInitialBotola(idx) {
    this.selectedBotolaIndex = idx;
    const opt = this.currentQuestion.options[idx];

    this.studio.moveChampionToBotola(idx);
    sound.playKeypress();

    document.querySelectorAll('.option-tile').forEach((tile, i) => {
      tile.classList.toggle('selected', i === idx);
      const statusEl = tile.querySelector('.tile-status');
      if (statusEl) {
        statusEl.textContent = (i === idx) ? i18n.t('tileChampion') : `${i + 1}`;
      }
    });

    this.dom.confirmBtn.disabled = false;
    this.dom.statusBanner.textContent = i18n.t('bannerChosen', { num: idx + 1, text: opt.text });
  }

  lockInitialChoice() {
    if (this.jollyBusy) return;
    clearInterval(this.timerInterval);
    this.originalSelectedBotolaIndex = this.selectedBotolaIndex;
    this.dom.confirmBtn.disabled = true;
    this.gameState = 'LOCKED';
    this.updateJollyButton();

    const opt = this.currentQuestion.options[this.selectedBotolaIndex];
    announcer.speak(i18n.t('spkLocked', { id: opt.id, text: opt.text }), true);

    this.later(() => {
      this.runAutoElimination5();
    }, 1800);
  }

  // =========================================================================
  // FASE 2: IL PROGRAMMA ELIMINA 5 RISPOSTE SBAGLIATE
  // =========================================================================
  runAutoElimination5() {
    this.gameState = 'AUTO_ELIMINATING_5';
    this.dom.confirmBtn.style.display = 'none';

    this.dom.statusBanner.textContent = i18n.t('bannerPhase2');
    this.dom.statusBanner.className = "status-banner locked";

    announcer.speak(i18n.t('spkPhase2'));

    const wrongCandidateIndices = [];
    this.currentQuestion.options.forEach((opt, idx) => {
      if (!opt.isCorrect && idx !== this.selectedBotolaIndex) {
        wrongCandidateIndices.push(idx);
      }
    });

    // Fisher-Yates: estrazione uniforme delle 5 botole da aprire
    for (let i = wrongCandidateIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wrongCandidateIndices[i], wrongCandidateIndices[j]] = [wrongCandidateIndices[j], wrongCandidateIndices[i]];
    }
    const fiveToDrop = wrongCandidateIndices.slice(0, 5);

    this.later(() => {
      this.dropBatchSequentially(fiveToDrop, 0, () => {
        this.later(() => {
          this.start30SecondsDecisionPhase();
        }, 1500);
      });
    }, 1200);
  }

  dropBatchSequentially(indices, currentIdx, onComplete) {
    if (currentIdx >= indices.length) {
      if (onComplete) onComplete();
      return;
    }

    const botolaIdx = indices[currentIdx];
    const opt = this.currentQuestion.options[botolaIdx];

    announcer.speak(i18n.t('spkDropBotola', { id: opt.id }));

    const round = this.roundId;
    this.later(() => {
      sound.playBotolaDrop();
      this.studio.eliminateBotola(botolaIdx, () => {
        if (round !== this.roundId) return;
        this.activeBotolaIndices.delete(botolaIdx);
        this.eliminatedBotolaIndices.add(botolaIdx);

        const tile = document.getElementById(`option-tile-${botolaIdx}`);
        if (tile) {
          tile.classList.add('eliminated');
          const statusEl = tile.querySelector('.tile-status');
          if (statusEl) statusEl.textContent = i18n.t('tileEliminated');
        }

        this.later(() => {
          this.dropBatchSequentially(indices, currentIdx + 1, onComplete);
        }, 1600);
      });
    }, 1200);
  }

  // =========================================================================
  // FASE 3: I 30 SECONDI PER RIFLETTERE & DIMEZZARE
  // =========================================================================
  start30SecondsDecisionPhase() {
    this.gameState = 'DECISION_30S';
    this.pendingChangeIndex = -1;
    this.timerSeconds = 30;
    this.dom.timerSub.textContent = "SEC";
    this.updateTimerUI(30);

    this.studio.setCameraChampionOnBotola(this.selectedBotolaIndex);
    this.studio.setTensionMode(false);
    sound.startHeartbeat(75);

    this.dom.keepChoiceBtn.style.display = 'flex';
    this.dom.changeChoiceBtn.style.display = 'flex';
    this.dom.changeChoiceBtn.disabled = true;

    this.dom.keepPrizeSub.textContent = i18n.t('btnKeepSub', { prize: this.formatPrize(this.currentPrizeNum) });
    const halfPrize = Math.floor(this.currentPrizeNum / 2);
    this.dom.changePrizeSub.textContent = i18n.t('btnChangeSub', { prize: this.formatPrize(halfPrize) });
    this.dom.changeBtnTitle.textContent = i18n.t('btnChangeTitle');

    this.dom.statusBanner.textContent = i18n.t('bannerPhase3');
    this.dom.statusBanner.className = "status-banner thinking";

    announcer.speak(i18n.t('spkPhase3'));

    this.timerInterval = setInterval(() => {
      if (this.timerPaused) return;
      this.timerSeconds--;
      this.updateTimerUI(30);

      if (this.timerSeconds <= 8) {
        sound.setHeartbeatBpm(130);
        sound.playTick(1200);
        this.studio.setTensionMode(true);
      } else {
        sound.playTick(800);
      }

      if (this.timerSeconds <= 0) {
        clearInterval(this.timerInterval);
        if (this.pendingChangeIndex >= 0) {
          this.confirmSwitchChoice();
        } else {
          this.confirmKeepOriginalChoice();
        }
      }
    }, 1000);
  }

  selectPendingChangeBotola(idx) {
    if (idx === this.selectedBotolaIndex) {
      this.pendingChangeIndex = -1;
      this.studio.moveChampionToBotola(this.selectedBotolaIndex);
      this.dom.changeChoiceBtn.disabled = true;
      this.dom.changeBtnTitle.textContent = i18n.t('btnChangeTitle');
      return;
    }

    this.pendingChangeIndex = idx;
    const halfPrize = Math.floor(this.currentPrizeNum / 2);

    this.studio.moveChampionToBotola(idx);
    sound.playKeypress();

    document.querySelectorAll('.option-tile').forEach((tile, i) => {
      tile.classList.remove('selected');
      if (i === idx) tile.classList.add('selected');
      if (i === this.selectedBotolaIndex) {
        const s = tile.querySelector('.tile-status');
        if (s) s.textContent = i18n.t('tileOriginal');
      }
    });

    this.dom.changeChoiceBtn.disabled = false;
    this.dom.changeBtnTitle.textContent = i18n.t('btnChangeConfirm', { num: idx + 1 });
    this.dom.changePrizeSub.textContent = i18n.t('btnChangeSub', { prize: this.formatPrize(halfPrize) });
  }

  setTimerToConfrontationMode(icon = "VS", sub = null) {
    this.dom.timerDisplay.textContent = icon;
    this.dom.timerSub.textContent = sub || i18n.t('confrontDuel') || "DUELLO";
    this.dom.timerCircle.style.strokeDashoffset = "0";
    this.dom.timerDisplay.classList.remove('urgent');
    this.dom.timerCircle.classList.remove('urgent');
    this.dom.timerDisplay.classList.add('confront-mode');
    this.dom.timerCircle.classList.add('confront-mode');
  }

  confirmKeepOriginalChoice() {
    clearInterval(this.timerInterval);
    sound.stopHeartbeat();
    this.pendingChangeIndex = -1;

    // Aggiorna subito il timer in modalità duello (niente più secondi bloccati a schermo!)
    this.setTimerToConfrontationMode("VS", i18n.t('confrontDuel') || "DUELLO");
    this.dom.statusBanner.textContent = i18n.t('bannerPhase3Confirmed');
    this.dom.statusBanner.className = "status-banner locked";

    this.studio.moveChampionToBotola(this.selectedBotolaIndex);
    announcer.speak(i18n.t('spkKeepConfirm', { id: this.selectedBotolaIndex + 1, prize: this.formatPrize(this.currentPrizeNum) }), true);

    this.prepareConfrontationPhase();
  }

  confirmSwitchChoice() {
    clearInterval(this.timerInterval);
    sound.stopHeartbeat();

    this.selectedBotolaIndex = this.pendingChangeIndex;
    this.pendingChangeIndex = -1;
    this.isPrizeHalved = true;
    this.currentPrizeNum = Math.floor(this.currentPrizeNum / 2);
    this.updatePrizeDisplay();

    // Aggiorna subito il timer in modalità duello
    this.setTimerToConfrontationMode("VS", i18n.t('confrontDuel') || "DUELLO");
    this.dom.statusBanner.textContent = i18n.t('bannerPhase3Confirmed');
    this.dom.statusBanner.className = "status-banner locked";

    sound.playPasso();
    const opt = this.currentQuestion.options[this.selectedBotolaIndex];
    announcer.speak(i18n.t('spkChangeConfirm', { id: opt.id, prize: this.formatPrize(this.currentPrizeNum) }), true);

    this.prepareConfrontationPhase();
  }

  // =========================================================================
  // FASE 4: IL CONFRONTO PROGRESSIVO ("SCEGLI QUALE BOTOLA CONFRONTARE")
  // =========================================================================
  prepareConfrontationPhase() {
    this.gameState = 'PREPARING_CONFRONTATION';
    this.dom.keepChoiceBtn.style.display = 'none';
    this.dom.changeChoiceBtn.style.display = 'none';

    this.later(() => {
      this.startConfrontationChoice();
    }, 1100);
  }

  startConfrontationChoice() {
    this.gameState = 'CONFRONTATION_CHOICE';

    this.studio.setCameraOverview();
    this.studio.setTensionMode(false);
    sound.startTension();

    this.setTimerToConfrontationMode("VS", i18n.t('confrontDuel') || "DUELLO");

    const chosenOpt = this.currentQuestion.options[this.selectedBotolaIndex];
    const remainingOpponentsCount = this.activeBotolaIndices.size - 1;

    this.dom.statusBanner.textContent = i18n.t('bannerPhase4', { myId: chosenOpt.id, rem: remainingOpponentsCount });
    this.dom.statusBanner.className = "status-banner verdict";
    this.dom.optionsBoardHeader.textContent = i18n.t('boardHeaderConfront', { myId: chosenOpt.id });

    document.querySelectorAll('.option-tile').forEach((tile, i) => {
      tile.classList.remove('confrontable', 'challenging');
      if (this.activeBotolaIndices.has(i)) {
        if (i === this.selectedBotolaIndex) {
          tile.classList.add('selected');
          const s = tile.querySelector('.tile-status');
          if (s) s.textContent = i18n.t('tileChampion');
        } else {
          tile.classList.add('confrontable');
          const s = tile.querySelector('.tile-status');
          if (s) s.textContent = i18n.t('tileConfront');
        }
      } else {
        tile.classList.add('eliminated');
        const s = tile.querySelector('.tile-status');
        if (s) s.textContent = i18n.t('tileEliminated');
      }
    });

    announcer.speak(i18n.t('spkPhase4', { id: chosenOpt.id }));
  }

  startBotolaConfrontation(targetIdx) {
    if (this.gameState === 'CONFRONTING' || this.gameState === 'END_GAME') return;
    if (!this.activeBotolaIndices.has(targetIdx) || targetIdx === this.selectedBotolaIndex) return;

    this.gameState = 'CONFRONTING';
    const targetOpt = this.currentQuestion.options[targetIdx];
    const myOpt = this.currentQuestion.options[this.selectedBotolaIndex];

    // Aggiorna subito le tessere graficamente
    document.querySelectorAll('.option-tile').forEach((t, i) => {
      t.classList.remove('confrontable');
      if (i === targetIdx) {
        t.classList.add('challenging');
        const s = t.querySelector('.tile-status');
        if (s) s.textContent = i18n.t('tileChallenging') || "⚔️ IN CONFRONTO...";
      } else if (this.activeBotolaIndices.has(i) && i !== this.selectedBotolaIndex) {
        const s = t.querySelector('.tile-status');
        if (s) s.textContent = i18n.t('tileWaiting') || "IN ATTESA";
      }
    });

    this.setTimerToConfrontationMode("⚔️", i18n.t('timerChallenge'));

    this.dom.statusBanner.textContent = i18n.t('bannerConfronting', { targetId: targetOpt.id, text: targetOpt.text, myId: myOpt.id });
    this.dom.statusBanner.className = "status-banner locked";

    this.studio.setCameraOnSpecificBotola(targetIdx);
    this.studio.setTensionMode(true);
    sound.startHeartbeat(130);

    announcer.speak(i18n.t('spkConfronting', { id: targetOpt.id, text: targetOpt.text }), true);

    // Suspense televisiva snella (1800ms)
    const round = this.roundId;
    this.later(() => {
      sound.stopHeartbeat();
      sound.stopTension();

      if (!targetOpt.isCorrect) {
        // ESITO: LA BOTOLA SFIDATA È ERRATA (CADE)
        sound.playBotolaDrop();
        this.studio.eliminateBotola(targetIdx, () => {
          if (round !== this.roundId) return;
          this.activeBotolaIndices.delete(targetIdx);
          this.eliminatedBotolaIndices.add(targetIdx);

          const targetTile = document.getElementById(`option-tile-${targetIdx}`);
          if (targetTile) {
            targetTile.classList.remove('challenging');
            targetTile.classList.add('eliminated');
            const s = targetTile.querySelector('.tile-status');
            if (s) s.textContent = i18n.t('tileEliminated');
          }

          const remainingOpponents = this.activeBotolaIndices.size - 1;

          if (remainingOpponents <= 0) {
            this.later(() => {
              this.handleVictory();
            }, 1000);
          } else {
            announcer.speak(i18n.t('spkConfrontSafe', { id: targetOpt.id }));
            this.dom.statusBanner.textContent = i18n.t('bannerConfrontSafe', { targetId: targetOpt.id, rem: remainingOpponents });

            this.later(() => {
              this.startConfrontationChoice();
            }, 1400);
          }
        });
      } else {
        // ESITO: LA BOTOLA SFIDATA ERA QUELLA ESATTA! (CADE IL CAMPIONE)
        const targetTile = document.getElementById(`option-tile-${targetIdx}`);
        if (targetTile) {
          targetTile.classList.remove('challenging');
          targetTile.classList.add('correct-reveal');
          const s = targetTile.querySelector('.tile-status');
          if (s) s.textContent = i18n.t('tileCorrectReveal');
        }

        announcer.speak(i18n.t('spkConfrontWrongChampion', { id: targetOpt.id }), true);
        sound.playWrong();

        this.later(() => {
          this.handleDefeat(myOpt, targetOpt);
        }, 1500);
      }
    }, 1800);
  }

  // =========================================================================
  // VITTORIA
  // =========================================================================
  handleVictory() {
    this.gameState = 'END_GAME';
    setGameplayActive(false);
    const myOpt = this.currentQuestion.options[this.selectedBotolaIndex];

    this.setTimerToConfrontationMode("🏆", i18n.t('timerWon'));
    this.recordResult(this.currentPrizeNum);
    sound.playCorrect();
    this.studio.celebrateChampion();

    announcer.speak(i18n.t('spkVictory', { prize: this.formatPrize(this.currentPrizeNum) }));

    this.later(() => {
      this.dom.endModal.classList.add('active');
      this.dom.endTitle.textContent = i18n.t('victoryTitle');
      this.dom.endTitle.className = "end-title victory";
      this.dom.endDesc.innerHTML = i18n.t('victoryDesc', {
        myId: myOpt.id,
        prize: this.formatPrize(this.currentPrizeNum)
      });
      this.dom.endDetail.innerHTML = `
        <strong>${myOpt.text}</strong><br>
        <em>${myOpt.detail}</em>
        ${this.renderStatsLine()}
      `;
      this.dom.endBtn.textContent = i18n.t('btnPlayAgain');
    }, 1800);
  }

  // =========================================================================
  // SCONFITTA
  // =========================================================================
  handleDefeat(myOpt, correctOpt) {
    this.gameState = 'END_GAME';
    setGameplayActive(false);
    sound.playBotolaDrop();

    this.setTimerToConfrontationMode("✕", i18n.t('timerFell'));
    this.recordResult(0);
    this.studio.setCameraChampionOnBotola(this.selectedBotolaIndex);
    const round = this.roundId;
    this.studio.dropChampion(this.selectedBotolaIndex, () => {
      if (round !== this.roundId) return;
      this.later(() => {
        this.dom.endModal.classList.add('active');
        this.dom.endTitle.textContent = i18n.t('defeatTitle');
        this.dom.endTitle.className = "end-title defeat";
        this.dom.endDesc.innerHTML = i18n.t('defeatDesc', {
          prize: this.formatPrize(this.currentPrizeNum)
        });
        this.dom.endDetail.innerHTML = `
          <strong>${myOpt.id} - ${myOpt.text}</strong> (✕)<br>
          <strong>${correctOpt.id} - ${correctOpt.text}</strong> (✔)<br>
          <em>${correctOpt.detail}</em>
          ${this.renderStatsLine()}
        `;
        this.dom.endBtn.textContent = i18n.t('btnPlayAgain');
      }, 1200);
    });
  }

  // Statistiche salvate sul dispositivo
  recordResult(prizeWon) {
    const s = this.stats;
    s.played++;
    if (prizeWon > 0) {
      s.wins++;
      s.totalWon += prizeWon;
      s.bestWin = Math.max(s.bestWin, prizeWon);
      s.streak++;
      s.bestStreak = Math.max(s.bestStreak, s.streak);
    } else {
      s.streak = 0;
    }
    saveJSON(STATS_KEY, s);
  }

  renderStatsLine() {
    const s = this.stats;
    const pct = s.played ? Math.round((s.wins / s.played) * 100) : 0;
    return `<div class="stats-line">${i18n.t('statsLine', {
      played: s.played, wins: s.wins, pct, streak: s.streak, best: this.formatPrize(s.bestWin)
    })}</div>`;
  }

  updateTimerUI(maxSec = 90) {
    this.dom.timerDisplay.textContent = this.timerSeconds;
    const totalCircumference = 283;
    const progress = (this.timerSeconds / maxSec) * totalCircumference;
    this.dom.timerCircle.style.strokeDashoffset = totalCircumference - progress;

    if (this.timerSeconds <= 8) {
      this.dom.timerDisplay.classList.add('urgent');
      this.dom.timerCircle.classList.add('urgent');
    } else {
      this.dom.timerDisplay.classList.remove('urgent');
      this.dom.timerCircle.classList.remove('urgent');
    }
  }
}

const HISTORY_KEY = 'trap10.history';
const STATS_KEY = 'trap10.stats';

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

// Avvio
window.addEventListener('DOMContentLoaded', () => {
  window.dieciBotoleGame = new DieciBotoleGame();
});
