// ui.js — everything the player reads outside the two pictures: the
// HUD chips (counter, score, timer, misses), the flash message over the
// stage, and the overlay cards for title / level clear / time up / win.

export class UI {
  constructor() {
    this.el = {
      levelName: document.getElementById('level-name'),
      levelDots: document.getElementById('level-dots'),
      counterNumber: document.getElementById('counter-number'),
      score: document.getElementById('score'),
      timer: document.getElementById('timer'),
      timerBar: document.getElementById('timer-bar'),
      timerChip: document.getElementById('timer-chip'),
      misses: document.getElementById('misses'),
      hintBtn: document.getElementById('hint-btn'),
      hintCount: document.getElementById('hint-count'),
      pauseBtn: document.getElementById('pause-btn'),
      soundBtn: document.getElementById('sound-btn'),
      flash: document.getElementById('flash'),
      overlay: document.getElementById('overlay'),
      overlayTitle: document.getElementById('overlay-title'),
      overlayBody: document.getElementById('overlay-body'),
      overlayStats: document.getElementById('overlay-stats'),
      overlayButtons: document.getElementById('overlay-buttons'),
      blurb: document.getElementById('scene-blurb'),
      leftCanvas: document.getElementById('panel-left'),
      rightCanvas: document.getElementById('panel-right'),
    };
    this.flashTimer = null;
  }

  static formatTime(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  setLevelHeader(scene, index, total) {
    this.el.levelName.textContent = `Level ${index + 1} · ${scene.name}`;
    this.el.levelDots.textContent =
      '●'.repeat(index + 1) + '○'.repeat(total - index - 1);
    this.el.blurb.textContent = scene.blurb;
  }

  updateHUD(game) {
    const remaining = game.scene.differences.length - game.found.size;
    this.el.counterNumber.textContent = remaining;
    this.el.score.textContent = game.score;
    this.el.misses.textContent = game.misses;
    this.el.timer.textContent = UI.formatTime(game.remainingMs);
    const frac = Math.max(0, game.remainingMs / (game.scene.timeLimit * 1000));
    this.el.timerBar.style.width = `${frac * 100}%`;
    this.el.timerBar.classList.toggle('low', frac < 0.25);
    this.el.timerChip.classList.toggle('urgent', frac < 0.25 && game.state === 'playing');
    this.el.hintCount.textContent = game.hintsLeft;
    this.el.hintBtn.disabled = game.hintsLeft <= 0 || game.state !== 'playing';
    this.el.pauseBtn.textContent = game.state === 'paused' ? '▶ Resume' : '⏸ Pause';
  }

  setActivePanel(side) {
    this.el.leftCanvas.classList.toggle('active-panel', side === 'left');
    this.el.rightCanvas.classList.toggle('active-panel', side === 'right');
  }

  flash(text, good) {
    this.el.flash.textContent = text;
    this.el.flash.style.color = good === false ? '#ff9d8a' : '#ffffff';
    this.el.flash.classList.add('show');
    clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => this.el.flash.classList.remove('show'), 1150);
  }

  // buttons: [{ label, primary, onClick }]
  showOverlay({ title, body, stats, buttons }) {
    this.el.overlayTitle.textContent = title;
    this.el.overlayBody.innerHTML = body;
    this.el.overlayStats.innerHTML = (stats || [])
      .map(([value, label]) => `<div><b>${value}</b><span>${label}</span></div>`)
      .join('');
    this.el.overlayButtons.innerHTML = '';
    for (const b of buttons || []) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'overlay-btn' + (b.primary ? '' : ' secondary');
      btn.textContent = b.label;
      btn.addEventListener('click', b.onClick);
      this.el.overlayButtons.appendChild(btn);
    }
    this.el.overlay.classList.remove('hidden');
  }

  hideOverlay() {
    this.el.overlay.classList.add('hidden');
  }
}
