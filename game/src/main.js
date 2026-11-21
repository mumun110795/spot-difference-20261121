// main.js — boots Twin Vistas: builds the game, wires the HUD buttons,
// starts the clock loop, and handles the maker's own modes —
// ?shot=<name> freezes an exact mid-game state for the entry's
// screenshots, and ?selftest=1 plays a whole game by itself and reports.

import { Game } from './game.js';
import { UI } from './ui.js';
import { SoundFX } from './audio.js';
import { createInput } from './input.js';
import { SCENES } from './scenes.js';

window.__errors = [];
window.addEventListener('error', (ev) => window.__errors.push(String(ev.message)));

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const frozen = Boolean(shot);

const ui = new UI();
const sfx = new SoundFX();
const game = new Game({
  ui,
  sfx,
  leftCanvas: ui.el.leftCanvas,
  rightCanvas: ui.el.rightCanvas,
  frozen,
});
game.input = createInput(game, ui.el.leftCanvas, ui.el.rightCanvas);

document.getElementById('hint-btn').addEventListener('click', () => game.useHint());
document.getElementById('pause-btn').addEventListener('click', () => game.togglePause());
document.getElementById('sound-btn').addEventListener('click', () => game.toggleMute());

// Screenshot states: real mid-round positions, reached through the
// game's own setup, rendered by the game's own code.
const SHOTS = {
  cover: () => game.setupShot({
    level: 0,
    foundIds: ['sun-glasses', 'umbrella-stripes', 'ball-panel'],
    score: 300, misses: 1, hintsLeft: 3, remainingMs: 187000,
  }),
  market: () => game.setupShot({
    level: 1,
    foundIds: ['moon-phase', 'lantern-gone', 'awning-colour', 'fruit-swap'],
    score: 720, misses: 2, hintsLeft: 2, remainingMs: 163000,
  }),
  space: () => game.setupShot({
    level: 2,
    foundIds: ['earth-ring', 'star-gone', 'lamp-off', 'tomato-green', 'pot-gone', 'robot-eye', 'button-colour'],
    score: 1640, misses: 3, hintsLeft: 1, remainingMs: 41000,
  }),
  win: () => game.setupWin({ score: 2310, misses: 6, hintsUsed: 3 }),
};

if (shot && SHOTS[shot]) {
  SHOTS[shot]();
} else if (params.get('selftest') === '1') {
  runSelfTest(game).catch((err) => reportSelfTest(game, { pass: false, fatal: String(err) }));
} else {
  game.showTitle();
}

if (!frozen) {
  const loop = (t) => { game.tick(t); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}

// ---------- the automated play-through ----------

function reportSelfTest(game, result) {
  result.errors = window.__errors;
  if (window.__errors.length) result.pass = false;
  const pre = document.createElement('pre');
  pre.id = 'selftest-result';
  pre.textContent = JSON.stringify(result);
  document.body.appendChild(pre);
  document.title = result.pass ? 'SELFTEST PASS' : 'SELFTEST FAIL';
}

async function runSelfTest(game) {
  const checks = [];
  const check = (name, ok) => checks.push([name, Boolean(ok)]);
  game.startGame();
  check('starts playing', game.state === 'playing');

  for (let level = 0; level < SCENES.length; level++) {
    const scene = SCENES[level];
    check(`level ${level + 1} loaded`, game.scene === scene && game.found.size === 0);
    if (level === 0) {
      const before = game.remainingMs;
      const missResult = game.attempt('right', 8, 392); // empty sand corner
      check('a wrong click is a miss', missResult === 'miss' && game.misses === 1);
      check('a miss costs 5 seconds', game.remainingMs <= before - 5000);
      game.useHint();
      check('hint is spent', game.hintsLeft === scene.hints - 1);
      check('keyboard handler exists', typeof game.input.handleKey === 'function');
      // One find through the real pointer path, coordinates and all.
      const first = scene.differences[0];
      const rect = ui.el.rightCanvas.getBoundingClientRect();
      ui.el.rightCanvas.dispatchEvent(new PointerEvent('pointerdown', {
        clientX: rect.left + (first.x / 560) * rect.width,
        clientY: rect.top + (first.y / 400) * rect.height,
        bubbles: true,
      }));
      check('pointer click finds a difference', game.found.has(first.id));
    }
    for (const diff of scene.differences) {
      if (game.found.has(diff.id)) continue;
      const res = game.attempt(level % 2 ? 'left' : 'right', diff.x, diff.y);
      if (res !== 'found') { check(`find ${scene.id}/${diff.id}`, false); break; }
    }
    check(`level ${level + 1} cleared`, game.found.size === scene.differences.length);
    check(`level ${level + 1} complete state`, game.state === 'levelComplete');
    game.nextLevel();
  }
  check('game is won after the last scene', game.state === 'won');
  check('score is positive', game.score > 0);
  reportSelfTest(game, { pass: checks.every(([, ok]) => ok), checks });
}
