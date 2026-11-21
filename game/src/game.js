// game.js — the rules of Twin Vistas: rounds, scoring, the clock,
// hints, misses, level flow and the win. Rendering and input live in
// their own modules; this class owns the state they share.

import { SCENES, alteredSet } from './scenes.js';
import { drawPanel } from './render.js';

const EMPTY = new Set();
const FIND_POINTS = 100;
const MISS_PENALTY_POINTS = 25;
const MISS_PENALTY_MS = 5000;
const HINT_COST_POINTS = 40;
const SECOND_BONUS = 2; // points per second left when a scene is cleared

export class Game {
  constructor({ ui, sfx, leftCanvas, rightCanvas, frozen = false }) {
    this.ui = ui;
    this.sfx = sfx;
    this.leftCanvas = leftCanvas;
    this.rightCanvas = rightCanvas;
    this.frozen = frozen;
    this.fixedNow = 1000;
    this.input = null; // wired by main.js after construction

    this.state = 'title';
    this.levelIndex = 0;
    this.scene = SCENES[0];
    this.found = new Set();
    this.effects = [];
    this.score = 0;
    this.misses = 0;
    this.hintsLeft = 0;
    this.hintsUsedThisLevel = 0;
    this.remainingMs = 0;
    this.levelStartScore = 0;
    this.totalMisses = 0;
    this.totalHints = 0;
    this.stars = [];
    this.lastTick = null;
  }

  // ---------- flow ----------

  showTitle() {
    this.state = 'title';
    this.loadLevel(0);
    this.ui.showOverlay({
      title: 'Twin Vistas',
      body:
        'Every vista has a twin — and the twin is never quite right.<br>' +
        'Hunt the changed details across <b>3 scenes</b> and <b>27 differences</b>: ' +
        'a sunny cove, a lantern market at dusk, and a greenhouse in orbit.<br>' +
        'Click a difference in either picture. Wrong clicks cost time!',
      stats: [['27', 'differences'], ['3', 'scenes'], ['−5s', 'per miss']],
      buttons: [{ label: '▶ Start hunting', primary: true, onClick: () => this.startGame() }],
    });
    this.render();
  }

  startGame() {
    this.score = 0;
    this.totalMisses = 0;
    this.totalHints = 0;
    this.stars = [];
    this.startLevel(0);
  }

  loadLevel(index) {
    this.levelIndex = index;
    this.scene = SCENES[index];
    this.found = new Set();
    this.effects = [];
    this.misses = 0;
    this.hintsLeft = this.scene.hints;
    this.hintsUsedThisLevel = 0;
    this.remainingMs = this.scene.timeLimit * 1000;
    this.levelStartScore = this.score;
    this.ui.setLevelHeader(this.scene, index, SCENES.length);
    this.ui.updateHUD(this);
  }

  startLevel(index) {
    this.loadLevel(index);
    this.state = 'playing';
    this.ui.hideOverlay();
    this.sfx.tick();
    this.render();
  }

  nextLevel() {
    if (this.levelIndex + 1 < SCENES.length) {
      this.startLevel(this.levelIndex + 1);
    } else {
      this.showWin();
    }
  }

  retryLevel() {
    this.score = this.levelStartScore;
    this.startLevel(this.levelIndex);
  }

  // ---------- play ----------

  attempt(side, x, y) {
    if (this.state !== 'playing') return 'ignored';
    const now = this.now();
    // Nearest unfound difference whose hit circle holds the point.
    let best = null;
    let bestDist = Infinity;
    for (const diff of this.scene.differences) {
      if (this.found.has(diff.id)) continue;
      const d = Math.hypot(diff.x - x, diff.y - y);
      if (d <= diff.r && d < bestDist) { best = diff; bestDist = d; }
    }
    if (best) {
      this.found.add(best.id);
      this.score += FIND_POINTS;
      this.effects.push({ kind: 'pulse', x: best.x, y: best.y, t0: now });
      this.sfx.find();
      if (this.found.size >= this.scene.differences.length) {
        this.completeLevel();
      } else {
        this.ui.flash(`✔ ${best.label}!`, true);
      }
      this.ui.updateHUD(this);
      this.render();
      return 'found';
    }
    // A miss: points, time, and a red X where the player clicked.
    this.misses += 1;
    this.totalMisses += 1;
    this.score = Math.max(0, this.score - MISS_PENALTY_POINTS);
    this.remainingMs = Math.max(0, this.remainingMs - MISS_PENALTY_MS);
    this.effects.push({ kind: 'miss', side, x, y, t0: now });
    this.sfx.miss();
    this.ui.flash('✖ Not a difference — −5 seconds', false);
    this.ui.updateHUD(this);
    this.render();
    return 'miss';
  }

  useHint() {
    if (this.state !== 'playing' || this.hintsLeft <= 0) return;
    const unfound = this.scene.differences.filter((d) => !this.found.has(d.id));
    if (!unfound.length) return;
    const pick = unfound[Math.floor(Math.random() * unfound.length)];
    this.hintsLeft -= 1;
    this.hintsUsedThisLevel += 1;
    this.totalHints += 1;
    this.score = Math.max(0, this.score - HINT_COST_POINTS);
    this.effects = this.effects.filter((fx) => fx.kind !== 'hint');
    this.effects.push({ kind: 'hint', id: pick.id, until: this.now() + 1800 });
    this.sfx.tick();
    this.ui.flash('💡 Something glimmers…', true);
    this.ui.updateHUD(this);
    this.render();
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.ui.showOverlay({
        title: 'Paused',
        body: 'The twin waits. It is patient like that.',
        stats: [],
        buttons: [{ label: '▶ Keep hunting', primary: true, onClick: () => this.togglePause() }],
      });
    } else if (this.state === 'paused') {
      this.state = 'playing';
      this.ui.hideOverlay();
    }
    this.ui.updateHUD(this);
    this.render();
  }

  toggleMute() {
    const muted = this.sfx.toggleMute();
    document.getElementById('sound-btn').textContent = muted ? '🔇 Muted' : '🔊 Sound';
    return muted;
  }

  completeLevel() {
    const bonus = Math.ceil(this.remainingMs / 1000) * SECOND_BONUS;
    this.score += bonus;
    const stars = this.misses === 0 && this.hintsUsedThisLevel === 0 ? 3
      : this.misses <= 2 && this.hintsUsedThisLevel <= 1 ? 2 : 1;
    this.stars[this.levelIndex] = stars;
    this.state = 'levelComplete';
    this.sfx.clear();
    const last = this.levelIndex + 1 >= SCENES.length;
    this.ui.showOverlay({
      title: `${this.scene.name} — cleared!`,
      body: `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}<br>` +
        `Every difference found, with ${Math.ceil(this.remainingMs / 1000)} seconds to spare.`,
      stats: [
        [`+${bonus}`, 'time bonus'],
        [this.misses, 'misses'],
        [this.score, 'score'],
      ],
      buttons: [{
        label: last ? '🏆 See your result' : '▶ Next scene',
        primary: true,
        onClick: () => this.nextLevel(),
      }],
    });
    this.ui.updateHUD(this);
  }

  timeUp() {
    this.state = 'timeUp';
    this.sfx.miss();
    this.ui.showOverlay({
      title: "Time's up!",
      body: `The twin kept ${this.scene.differences.length - this.found.size} of its secrets. ` +
        'Rewind the clock and try the scene again.',
      stats: [[this.found.size, 'found'], [this.scene.differences.length, 'hidden']],
      buttons: [
        { label: '↻ Retry this scene', primary: true, onClick: () => this.retryLevel() },
        { label: 'Title screen', onClick: () => this.showTitle() },
      ],
    });
    this.ui.updateHUD(this);
  }

  showWin() {
    this.state = 'won';
    this.sfx.fanfare();
    const totalStars = this.stars.reduce((a, b) => a + (b || 0), 0);
    const rank = this.score >= 3200 ? 'Eagle-Eye Legend'
      : this.score >= 2700 ? 'Sharp-Eyed Sleuth'
      : this.score >= 2100 ? 'Keen Spotter' : 'Happy Hunter';
    this.ui.showOverlay({
      title: '🏆 Every vista solved!',
      body: `You out-spotted all three twins and earned the title<br><b>${rank}</b>`,
      stats: [
        [this.score, 'final score'],
        [`${totalStars}/9`, 'stars'],
        [this.totalMisses, 'misses'],
        [this.totalHints, 'hints used'],
      ],
      buttons: [
        { label: '↻ Play again', primary: true, onClick: () => this.startGame() },
        { label: 'Title screen', onClick: () => this.showTitle() },
      ],
    });
    this.ui.updateHUD(this);
  }

  // ---------- clock & rendering ----------

  now() {
    return this.frozen ? this.fixedNow : performance.now();
  }

  tick(nowMs) {
    if (this.frozen) return;
    if (this.lastTick == null) this.lastTick = nowMs;
    const dt = nowMs - this.lastTick;
    this.lastTick = nowMs;
    if (this.state === 'playing') {
      this.remainingMs -= dt;
      if (this.remainingMs <= 0) {
        this.remainingMs = 0;
        this.timeUp();
      }
      this.ui.updateHUD(this);
    }
    // Expire one-shot effects.
    this.effects = this.effects.filter((fx) =>
      fx.kind === 'hint' ? nowMs <= fx.until : nowMs - fx.t0 < 700);
    this.render();
  }

  render() {
    const now = this.now();
    const cursor = this.input && this.input.cursor.visible
      ? this.input.cursor : null;
    for (const [canvas, side, altered] of [
      [this.leftCanvas, 'left', EMPTY],
      [this.rightCanvas, 'right', alteredSet(this.scene)],
    ]) {
      drawPanel(canvas, {
        scene: this.scene,
        altered,
        found: this.found,
        effects: this.effects.filter((fx) => !fx.side || fx.side === side),
        cursor: cursor && cursor.side === side ? cursor : null,
        now,
      });
    }
    if (this.input) this.ui.setActivePanel(this.input.cursor.side);
  }

  // ---------- screenshot / debug setups ----------

  // Places the game in an exact mid-round state (used for the entry's
  // screenshots and by the automated self-test's visual checks).
  setupShot({ level, foundIds, score, misses, hintsLeft, remainingMs }) {
    this.loadLevel(level);
    this.state = 'playing';
    for (const id of foundIds) this.found.add(id);
    this.score = score;
    this.misses = misses;
    this.hintsLeft = hintsLeft;
    this.remainingMs = remainingMs;
    this.ui.hideOverlay();
    this.ui.updateHUD(this);
    this.render();
  }

  setupWin({ score, misses, hintsUsed }) {
    this.loadLevel(SCENES.length - 1);
    for (const d of this.scene.differences) this.found.add(d.id);
    this.score = score;
    this.totalMisses = misses;
    this.totalHints = hintsUsed;
    this.stars = [3, 2, 3];
    this.remainingMs = 0;
    this.showWin();
    this.render();
  }
}
