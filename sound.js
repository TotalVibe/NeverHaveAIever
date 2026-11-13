// High-fidelity synthesized sound effects using the Web Audio API
// Zero external audio files required, instant latency, full cross-browser compatibility

class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Soft tactile click
  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Smooth swipe whoosh
  playSwoosh(direction = 'neutral') {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    filter.type = 'bandpass';
    filter.Q.value = 3;

    // Pitch variation based on direction
    let startFreq = 300;
    let endFreq = 700;
    if (direction === 'top') { startFreq = 400; endFreq = 950; }
    else if (direction === 'bottom') { startFreq = 650; endFreq = 280; }
    else if (direction === 'left') { startFreq = 450; endFreq = 350; }
    else if (direction === 'right') { startFreq = 350; endFreq = 750; }

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.16);

    filter.frequency.setValueAtTime(startFreq * 1.5, now);
    filter.frequency.exponentialRampToValueAtTime(endFreq * 2, now + 0.16);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Elastic snap back when card is dropped without swiping
  playSnapBack() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Category specific sound effects
  playCategorySound(direction) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    switch (direction) {
      case 'top': // 😈 Spicy: fiery sizzle & bass pulse
        this.playSpicySound(now);
        break;
      case 'left': // 😳 Cringe: comical spring wobble / boing
        this.playCringeSound(now);
        break;
      case 'right': // 🥳 Party: cheerful celebratory fanfare
        this.playPartySound(now);
        break;
      case 'bottom': // 😇 Wholesome: sweet crystalline chime
        this.playWholesomeSound(now);
        break;
      default:
        this.playSwoosh();
    }
  }

  playSpicySound(now) {
    // Low sub rumble + harmonic sizzle
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(110, now);
    osc1.frequency.exponentialRampToValueAtTime(220, now + 0.12);
    osc1.frequency.exponentialRampToValueAtTime(55, now + 0.28);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(220, now);
    osc2.frequency.exponentialRampToValueAtTime(440, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(110, now + 0.28);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.28);
    osc2.stop(now + 0.28);
  }

  playCringeSound(now) {
    // Comedic "boing" pitch bend
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(420, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.18);
    osc.frequency.linearRampToValueAtTime(320, now + 0.26);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  playPartySound(now) {
    // Energetic synth chord fanfare [C5, E5, G5, C6]
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const delay = idx * 0.04;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.1, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.25);
    });
  }

  playWholesomeSound(now) {
    // Dreamy crystalline bell arpeggio [E5, G#5, B5, E6]
    const notes = [659.25, 830.61, 987.77, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const delay = idx * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.12, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.35);
    });
  }

  // Player reaction: "I Have!" (triumphant chime)
  playIHave() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [587.33, 880].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + (i * 0.06));
      gain.gain.setValueAtTime(0.15, now + (i * 0.06));
      gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.06) + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + (i * 0.06));
      osc.stop(now + (i * 0.06) + 0.2);
    });
  }

  // Player reaction: "Never!" (soft wood tap)
  playNever() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.07);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  playCheers() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const rollHits = 8;

    for (let i = 0; i < rollHits; i++) {
      const start = now + i * 0.075;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(115 - i * 5, start);
      osc.frequency.exponentialRampToValueAtTime(48, start + 0.065);
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.07);
    }

    const impact = now + 0.92;
    [110, 146.83, 196].forEach((frequency, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = index === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(frequency * 1.04, impact);
      osc.frequency.exponentialRampToValueAtTime(frequency, impact + 0.12);
      gain.gain.setValueAtTime(0.001, impact);
      gain.gain.linearRampToValueAtTime(index === 0 ? 0.16 : 0.065, impact + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.001, impact + 1.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(impact);
      osc.stop(impact + 1.16);
    });
  }
}

export const sounds = new SoundEffects();
