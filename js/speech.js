// Sistema di Annunciatore Vocale TV Multilingue (Web Speech API)
// Supporta IT, EN, ES, FR, DE con selezione intelligente della voce locale

class SpeechAnnouncer {
  constructor() {
    this.enabled = true;
    this.synth = window.speechSynthesis || null;
    this.currentLangCode = 'it-IT';
    this.voicesByLang = {};
    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;
    const cacheVoices = () => {
      const allVoices = this.synth.getVoices();
      ['it', 'en', 'es', 'fr', 'de'].forEach(lang => {
        // Cerca prima voce maschile per tono televisivo o la migliore disponibile
        const matching = allVoices.filter(v => v.lang.toLowerCase().startsWith(lang));
        const preferred = matching.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('george') || v.name.toLowerCase().includes('cosimo') || v.name.toLowerCase().includes('jorge'))
          || matching[0] || null;
        this.voicesByLang[lang] = preferred;
      });
    };

    cacheVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = cacheVoices;
    }
  }

  setLanguage(langCode) {
    this.currentLangCode = langCode;
  }

  speak(text, priority = false) {
    if (!this.enabled || !this.synth) return;
    try {
      if (priority) {
        this.synth.cancel();
      }
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = this.currentLangCode;

      const prefix = this.currentLangCode.slice(0, 2).toLowerCase();
      if (this.voicesByLang[prefix]) {
        utter.voice = this.voicesByLang[prefix];
      }

      utter.rate = 1.05; // ritmo televisivo energico
      utter.pitch = 0.95;
      utter.volume = 0.95;
      this.synth.speak(utter);
    } catch (e) {}
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.synth) {
      this.synth.cancel();
    }
    return this.enabled;
  }
}

export const announcer = new SpeechAnnouncer();
