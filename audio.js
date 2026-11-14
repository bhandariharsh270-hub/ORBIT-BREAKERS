/**
 * Space Mission Design Game - Procedural Web Audio Sound Engine
 * NASA Space Apps Challenge 2026
 */

window.SpaceMissionGame = window.SpaceMissionGame || {};

window.SpaceMissionGame.Audio = {
  ctx: null,
  isMuted: false,

  init: function() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  },

  resume: function() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  toggleMute: function() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  },

  // 1. Telemetry UI Click / Tick
  playClick: function() {
    if (this.isMuted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  },

  // 2. NASA Quindar Tone (Comms contact established)
  playQuindarTone: function() {
    if (this.isMuted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      // Classic Quindar intro frequency: 2525 Hz
      osc.frequency.setValueAtTime(2525, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch (e) {}
  },

  // 3. Thruster Burst (RCS burn / momentum dump)
  playThrusterBurn: function(durationSec) {
    if (this.isMuted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    try {
      const duration = durationSec || 0.6;
      // White noise buffer for thruster gas hiss
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.8));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      // Low pass filter for deep rumble
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
  },

  // 4. Anomaly Warning Alarm (Two-tone emergency siren)
  playAlarm: function() {
    if (this.isMuted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';

      const t0 = this.ctx.currentTime;
      osc.frequency.setValueAtTime(780, t0);
      osc.frequency.setValueAtTime(580, t0 + 0.15);
      osc.frequency.setValueAtTime(780, t0 + 0.30);
      osc.frequency.setValueAtTime(580, t0 + 0.45);

      gain.gain.setValueAtTime(0.12, t0);
      gain.gain.exponentialRampToValueAtTime(0.01, t0 + 0.65);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(t0 + 0.65);
    } catch (e) {}
  },

  // 5. Triumphant Mission Success Fanfare
  playVictory: function() {
    if (this.isMuted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + (i * 0.14));

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + (i * 0.14));
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (i * 0.14) + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + (i * 0.14));
        osc.stop(this.ctx.currentTime + (i * 0.14) + 0.45);
      });
    } catch (e) {}
  }
};
