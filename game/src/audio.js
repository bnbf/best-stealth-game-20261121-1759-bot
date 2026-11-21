// The Quiet Gallery — synthesized sound, no audio files.
// Every sound is built with the Web Audio API at run time, so the game
// loads nothing over the network and ships no audio assets.

export class SoundEngine {
  constructor() {
    this.context = null;
    this.enabled = true;
    this.lastStepAt = 0;
  }

  unlock() {
    if (!this.context) {
      try {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        this.context = new Ctor();
      } catch (err) {
        this.context = null;
      }
    }
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  tone(freq, seconds, type, gainValue, when = 0) {
    if (!this.context || !this.enabled) return;
    const t0 = this.context.currentTime + when;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(gainValue, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    osc.connect(gain).connect(this.context.destination);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.05);
  }

  noiseBurst(seconds, gainValue, filterFreq) {
    if (!this.context || !this.enabled) return;
    const t0 = this.context.currentTime;
    const len = Math.max(1, Math.floor(this.context.sampleRate * seconds));
    const buffer = this.context.createBuffer(1, len, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const src = this.context.createBufferSource();
    src.buffer = buffer;
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const gain = this.context.createGain();
    gain.gain.value = gainValue;
    src.connect(filter).connect(gain).connect(this.context.destination);
    src.start(t0);
  }

  footstep(sneaking, running) {
    if (!this.context || !this.enabled) return;
    const now = performance.now();
    const gap = sneaking ? 340 : 250;
    if (now - this.lastStepAt < gap) return;
    this.lastStepAt = now;
    this.noiseBurst(0.07, sneaking ? 0.05 : running ? 0.16 : 0.11, sneaking ? 500 : 900);
  }

  guardHuh() {
    this.tone(340, 0.12, 'sine', 0.10);
    this.tone(430, 0.14, 'sine', 0.08, 0.09);
  }

  alarm() {
    this.tone(660, 0.16, 'square', 0.07);
    this.tone(880, 0.22, 'square', 0.07, 0.14);
  }

  coinClink() {
    this.tone(1560, 0.09, 'triangle', 0.10);
    this.tone(2090, 0.12, 'triangle', 0.08, 0.06);
  }

  pickup() {
    this.tone(523, 0.12, 'sine', 0.11);
    this.tone(659, 0.12, 'sine', 0.11, 0.08);
    this.tone(784, 0.20, 'sine', 0.11, 0.16);
  }

  levelClear() {
    [523, 659, 784, 1047].forEach((freq, i) => {
      this.tone(freq, 0.22, 'sine', 0.11, i * 0.11);
    });
  }

  caught() {
    this.tone(220, 0.30, 'sawtooth', 0.10);
    this.tone(165, 0.45, 'sawtooth', 0.10, 0.22);
  }

  victory() {
    [523, 659, 784, 1047, 1319].forEach((freq, i) => {
      this.tone(freq, 0.30, 'triangle', 0.11, i * 0.13);
    });
  }
}
