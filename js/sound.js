// Sound Engine per Trap10 Quiz
// Generato interamente con Web Audio API: zero dipendenze esterne, zero lag!

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.tensionOsc1 = null;
    this.tensionOsc2 = null;
    this.tensionGain = null;
    this.heartbeatTimer = null;
    this.currentBpm = 60;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopTension();
      this.stopHeartbeat();
    }
    return this.isMuted;
  }

  // Bip di countdown al secondo
  playTick(pitch = 880) {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  // Tensione: battito cardiaco accelerato
  startHeartbeat(initialBpm = 65) {
    if (this.isMuted || !this.ctx) return;
    this.stopHeartbeat();
    this.currentBpm = initialBpm;

    const playThump = () => {
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      // Primo battito (lub)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(80, now);
      osc1.frequency.exponentialRampToValueAtTime(35, now + 0.09);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.1);

      // Secondo battito (dub - 120ms dopo)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(70, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(30, now + 0.22);
      gain2.gain.setValueAtTime(0.25, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.24);

      const intervalMs = (60 / this.currentBpm) * 1000;
      this.heartbeatTimer = setTimeout(playThump, intervalMs);
    };

    playThump();
  }

  setHeartbeatBpm(bpm) {
    this.currentBpm = bpm;
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Drone di tensione studio (basso profondo e archi sintetici)
  startTension() {
    if (this.isMuted || !this.ctx) return;
    this.stopTension();

    try {
      const now = this.ctx.currentTime;
      this.tensionGain = this.ctx.createGain();
      this.tensionGain.gain.setValueAtTime(0.01, now);
      this.tensionGain.gain.linearRampToValueAtTime(0.12, now + 1.5);

      this.tensionOsc1 = this.ctx.createOscillator();
      this.tensionOsc1.type = 'sawtooth';
      this.tensionOsc1.frequency.setValueAtTime(55, now); // La grave

      this.tensionOsc2 = this.ctx.createOscillator();
      this.tensionOsc2.type = 'sine';
      this.tensionOsc2.frequency.setValueAtTime(110, now);

      // Filtro passa-basso per dare calore e mistero
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now);

      this.tensionOsc1.connect(filter);
      this.tensionOsc2.connect(filter);
      filter.connect(this.tensionGain);
      this.tensionGain.connect(this.ctx.destination);

      this.tensionOsc1.start();
      this.tensionOsc2.start();
    } catch (e) {}
  }

  stopTension() {
    if (this.tensionGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.tensionGain.gain.linearRampToValueAtTime(0.001, now + 0.3);
        setTimeout(() => {
          if (this.tensionOsc1) { this.tensionOsc1.stop(); this.tensionOsc1 = null; }
          if (this.tensionOsc2) { this.tensionOsc2.stop(); this.tensionOsc2 = null; }
          this.tensionGain = null;
        }, 350);
      } catch (e) {}
    }
  }

  // Risposta Esatta! Tonalità trionfale da quiz televisivo
  playCorrect() {
    if (this.isMuted || !this.ctx) return;
    this.stopTension();
    this.stopHeartbeat();

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do acuto
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.6);
    });

    this.playCheer();
  }

  // Lettera svelata / click tasto
  playKeypress() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Risposta Errata / Buzzer
  playWrong() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.linearRampToValueAtTime(95, now + 0.25);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Jolly "PASSO"
  playPasso() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // L'EFFETTO CLOU: LA CADUTA NELLA BOTOLA!
  // Silenzio -> Sblocco metallico -> Risucchio d'aria -> Urlo sintetico caduta -> Tonfo nel vuoto
  playBotolaDrop() {
    if (this.isMuted || !this.ctx) return;
    this.stopTension();
    this.stopHeartbeat();

    const now = this.ctx.currentTime;

    // 1. Sblocco serratura meccanica pesante (Clang!)
    const metalOsc = this.ctx.createOscillator();
    const metalGain = this.ctx.createGain();
    metalOsc.type = 'square';
    metalOsc.frequency.setValueAtTime(140, now);
    metalOsc.frequency.exponentialRampToValueAtTime(45, now + 0.15);
    metalGain.gain.setValueAtTime(0.4, now);
    metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    metalOsc.connect(metalGain);
    metalGain.connect(this.ctx.destination);
    metalOsc.start(now);
    metalOsc.stop(now + 0.18);

    // 2. Whoosh idraulico apertura botola (rumore bianco filtrato)
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(600, now + 0.05);
    noiseFilter.frequency.exponentialRampToValueAtTime(150, now + 1.2);
    noiseFilter.Q.setValueAtTime(3.0, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now + 0.05);
    noise.stop(now + 1.3);

    // 3. Frequenza che precipita nel vuoto (effetto doppler caduta)
    const fallOsc = this.ctx.createOscillator();
    const fallGain = this.ctx.createGain();
    fallOsc.type = 'sawtooth';
    fallOsc.frequency.setValueAtTime(400, now + 0.1);
    fallOsc.frequency.exponentialRampToValueAtTime(40, now + 1.1);

    fallGain.gain.setValueAtTime(0.01, now + 0.1);
    fallGain.gain.linearRampToValueAtTime(0.3, now + 0.2);
    fallGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    fallOsc.connect(fallGain);
    fallGain.connect(this.ctx.destination);
    fallOsc.start(now + 0.1);
    fallOsc.stop(now + 1.2);

    // 4. Tonfo sordo nel vuoto a fine corsa
    setTimeout(() => {
      if (this.isMuted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const thud = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(90, t);
      thud.frequency.exponentialRampToValueAtTime(25, t + 0.4);
      thudGain.gain.setValueAtTime(0.5, t);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      thud.connect(thudGain);
      thudGain.connect(this.ctx.destination);
      thud.start(t);
      thud.stop(t + 0.4);
    }, 700);
  }

  // Rullo di tamburi e rivelazione "Piede Bianco o Nero"
  playPiedeRoll() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    // Rullo di tamburo
    for (let i = 0; i < 20; i++) {
      const t = now + (i * 0.06);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100 + Math.random() * 20, t);
      gain.gain.setValueAtTime(0.05 + (i * 0.008), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    }
  }

  playPiedeReveal() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    // Crash di piatto / Campana di vittoria
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1174.66, now); // Re acuto
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
  }

  // Applausi e boato del pubblico
  playCheer() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const dur = 2.0;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin(i / 100);
    }
    const cheer = this.ctx.createBufferSource();
    cheer.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    cheer.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    cheer.start(now);
    cheer.stop(now + dur);
  }
}

export const sound = new SoundEngine();
