// audio.js — every sound is synthesized live with WebAudio oscillators:
// no audio files, nothing to load, and a mute toggle for quiet hunting.

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  // The context can only start after a player gesture; every play call
  // funnels through here and quietly does nothing until then.
  ensure() {
    if (this.muted) return null;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  tone(freq, at, dur, type = 'sine', gain = 0.16) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  // A bright two-note chime when a difference is spotted.
  find() {
    this.tone(880, 0, 0.14, 'triangle', 0.18);
    this.tone(1318, 0.07, 0.22, 'triangle', 0.18);
  }

  // A dull buzz for a wrong click.
  miss() {
    this.tone(140, 0, 0.16, 'sawtooth', 0.07);
    this.tone(110, 0.02, 0.18, 'sawtooth', 0.06);
  }

  // A short tick for buttons and keyboard spots.
  tick() {
    this.tone(620, 0, 0.06, 'square', 0.05);
  }

  // Rising arpeggio when a scene is cleared.
  clear() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, i * 0.09, 0.2, 'triangle', 0.16));
  }

  // A little fanfare for finishing the whole game.
  fanfare() {
    [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) =>
      this.tone(f, i * 0.11, 0.26, 'triangle', 0.17));
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}
