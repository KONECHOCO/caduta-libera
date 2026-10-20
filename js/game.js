// Game Manager per "LE DIECI BOTOLE" / "STILL STANDING"
// Con supporto completo Multilingua (i18n): IT, EN, ES, FR, DE

import { QUESTIONS_BY_LANG } from './questions.js';
import { i18n } from './i18n.js';
import { sound } from './sound.js';
import { announcer } from './speech.js';
import { Studio3D } from './studio3d.js';

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
    this.usedQuestionIds = new Set();

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
    this.startNewFinaleRound();
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
      this.dom.audioToggleBtn.innerHTML = muted ? i18n.t('btnAudioOff') : i18n.t('btnAudioOn');
      this.dom.audioToggleBtn.classList.toggle('muted', muted);
    });

    this.dom.voiceToggleBtn.addEventListener('click', () => {
      const active = announcer.toggle();
      this.dom.voiceToggleBtn.innerHTML = active ? i18n.t('btnVoiceOn') : i18n.t('btnVoiceOff');
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
    this.dom.endBtn.addEventListener('click', () => {
      this.dom.endModal.classList.remove('active');
      this.startNewFinaleRound();
    });
  }

  // Aggiorna tutti i testi dell'interfaccia nella lingua selezionata
  updateStaticUITranslations() {
    if (this.dom.logoTop) this.dom.logoTop.textContent = i18n.t('logoTop');
    if (this.dom.logoBot) this.dom.logoBot.textContent = i18n.t('logoBot');
    if (this.dom.modeTag) this.dom.modeTag.textContent = i18n.t('modeTag');
    if (this.dom.jackpotLabel) this.dom.jackpotLabel.textContent = i18n.t('jackpotLabel');

    if (this.dom.infoRulesBtn) this.dom.infoRulesBtn.innerHTML = i18n.t('btnRules');
    if (this.dom.audioToggleBtn) {
      this.dom.audioToggleBtn.innerHTML = sound.isMuted ? i18n.t('btnAudioOff') : i18n.t('btnAudioOn');
    }
    if (this.dom.voiceToggleBtn) {
      this.dom.voiceToggleBtn.innerHTML = announcer.enabled ? i18n.t('btnVoiceOn') : i18n.t('btnVoiceOff');
    }
    if (this.dom.cameraViewBtn) this.dom.cameraViewBtn.innerHTML = i18n.t('btnCamera');

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
    clearInterval(this.timerInterval);
    sound.stopTension();
    sound.stopHeartbeat();

    const lang = i18n.getLanguage();
    const questionsForLang = QUESTIONS_BY_LANG[lang] || QUESTIONS_BY_LANG.it;

    if (this.usedQuestionIds.size >= questionsForLang.length) {
      this.usedQuestionIds.clear();
    }

    const available = questionsForLang.filter(q => !this.usedQuestionIds.has(q.id));
    this.currentQuestion = available[Math.floor(Math.random() * available.length)] || questionsForLang[0];
    this.usedQuestionIds.add(this.currentQuestion.id);

    this.initialPrizeNum = this.currentQuestion.prizeValue || 100000;
    this.currentPrizeNum = this.initialPrizeNum;
    this.isPrizeHalved = false;

    this.selectedBotolaIndex = -1;
    this.pendingChangeIndex = -1;
    this.originalSelectedBotolaIndex = -1;
    this.activeBotolaIndices = new Set([0,1,2,3,4,5,6,7,8,9]);
    this.eliminatedBotolaIndices = new Set();
    this.gameState = 'INTRO';

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
    this.dom.hintPill.textContent = `💡 ${this.currentQuestion.hint}`;
    this.dom.optionsBoardHeader.textContent = i18n.t('boardHeader');

    this.dom.confirmBtn.style.display = 'flex';
    this.dom.confirmBtn.disabled = true;
    this.dom.keepChoiceBtn.style.display = 'none';
    this.dom.changeChoiceBtn.style.display = 'none';

    this.dom.statusBanner.textContent = i18n.t('bannerIntro');
    this.dom.statusBanner.className = "status-banner intro";

    this.studio.setQuestionOptions(this.currentQuestion.options);
    this.render2DOptionsBoard();

    // Gerry / Annunciatore in lingua locale
    announcer.speak(i18n.t('spkIntro', {
      prize: this.formatPrize(this.currentPrizeNum),
      cat: this.currentQuestion.category,
      q: this.currentQuestion.question
    }));

    setTimeout(() => {
      this.startInitialChoicePhase();
    }, 3200);
  }

  updatePrizeDisplay() {
    this.dom.prizeDisplay.textContent = this.formatPrize(this.currentPrizeNum);
  }

  formatPrize(num) {
    const lang = i18n.getLanguage();
    if (lang === 'en') return `$ ${num.toLocaleString('en-US')}`;
    if (lang === 'fr') return `${num.toLocaleString('fr-FR')} €`;
    return `€ ${num.toLocaleString('it-IT')}`;
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

    announcer.speak(i18n.t('spkPhase1'));

    this.timerInterval = setInterval(() => {
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
        if (this.selectedBotolaIndex < 0) this.selectInitialBotola(0);
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
    clearInterval(this.timerInterval);
    this.originalSelectedBotolaIndex = this.selectedBotolaIndex;
    this.dom.confirmBtn.disabled = true;

    const opt = this.currentQuestion.options[this.selectedBotolaIndex];
    announcer.speak(i18n.t('spkLocked', { id: opt.id, text: opt.text }), true);

    setTimeout(() => {
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

    const shuffled = wrongCandidateIndices.sort(() => 0.5 - Math.random());
    const fiveToDrop = shuffled.slice(0, 5);

    setTimeout(() => {
      this.dropBatchSequentially(fiveToDrop, 0, () => {
        setTimeout(() => {
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

    setTimeout(() => {
      sound.playBotolaDrop();
      this.studio.eliminateBotola(botolaIdx, () => {
        this.activeBotolaIndices.delete(botolaIdx);
        this.eliminatedBotolaIndices.add(botolaIdx);

        const tile = document.getElementById(`option-tile-${botolaIdx}`);
        if (tile) {
          tile.classList.add('eliminated');
          const statusEl = tile.querySelector('.tile-status');
          if (statusEl) statusEl.textContent = i18n.t('tileEliminated');
        }

        setTimeout(() => {
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

    setTimeout(() => {
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

    this.setTimerToConfrontationMode("⚔️", "SFIDA");

    this.dom.statusBanner.textContent = i18n.t('bannerConfronting', { targetId: targetOpt.id, text: targetOpt.text, myId: myOpt.id });
    this.dom.statusBanner.className = "status-banner locked";

    this.studio.setCameraOnSpecificBotola(targetIdx);
    this.studio.setTensionMode(true);
    sound.startHeartbeat(130);

    announcer.speak(i18n.t('spkConfronting', { id: targetOpt.id, text: targetOpt.text }), true);

    // Suspense televisiva snella (1800ms)
    setTimeout(() => {
      sound.stopHeartbeat();
      sound.stopTension();

      if (!targetOpt.isCorrect) {
        // ESITO: LA BOTOLA SFIDATA È ERRATA (CADE)
        sound.playBotolaDrop();
        this.studio.eliminateBotola(targetIdx, () => {
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
            setTimeout(() => {
              this.handleVictory();
            }, 1000);
          } else {
            announcer.speak(i18n.t('spkConfrontSafe', { id: targetOpt.id }));
            this.dom.statusBanner.textContent = i18n.t('bannerConfrontSafe', { targetId: targetOpt.id, rem: remainingOpponents });

            setTimeout(() => {
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

        setTimeout(() => {
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
    const myOpt = this.currentQuestion.options[this.selectedBotolaIndex];

    this.setTimerToConfrontationMode("🏆", "VINTO!");
    sound.playCorrect();
    this.studio.celebrateChampion();

    announcer.speak(i18n.t('spkVictory', { prize: this.formatPrize(this.currentPrizeNum) }));

    setTimeout(() => {
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
      `;
      this.dom.endBtn.textContent = i18n.t('btnPlayAgain');
    }, 1800);
  }

  // =========================================================================
  // SCONFITTA
  // =========================================================================
  handleDefeat(myOpt, correctOpt) {
    this.gameState = 'END_GAME';
    sound.playBotolaDrop();

    this.setTimerToConfrontationMode("✕", "CADUTA");
    this.studio.setCameraChampionOnBotola(this.selectedBotolaIndex);
    this.studio.dropChampion(this.selectedBotolaIndex, () => {
      setTimeout(() => {
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
        `;
        this.dom.endBtn.textContent = i18n.t('btnPlayAgain');
      }, 1200);
    });
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

// Avvio
window.addEventListener('DOMContentLoaded', () => {
  window.dieciBotoleGame = new DieciBotoleGame();
});
