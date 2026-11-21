// input.js — mouse and keyboard play. A click (or tap) on either panel
// is converted to scene coordinates and handed to the game; the keyboard
// drives a lens (crosshair) that arrows move, Tab swaps between panels,
// and Enter or Space spots at the lens.

import { SCENE_W, SCENE_H } from './draw.js';

export function createInput(game, leftCanvas, rightCanvas) {
  const cursor = { side: 'right', x: SCENE_W / 2, y: SCENE_H / 2, visible: false };

  function toScene(canvas, clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * SCENE_W,
      y: ((clientY - rect.top) / rect.height) * SCENE_H,
    };
  }

  function bindPanel(canvas, side) {
    canvas.addEventListener('pointerdown', (ev) => {
      const p = toScene(canvas, ev.clientX, ev.clientY);
      cursor.side = side;
      cursor.x = p.x;
      cursor.y = p.y;
      game.attempt(side, p.x, p.y);
    });
  }
  bindPanel(leftCanvas, 'left');
  bindPanel(rightCanvas, 'right');

  function handleKey(ev) {
    const step = ev.shiftKey ? 3 : 14;
    switch (ev.key) {
      case 'ArrowLeft': cursor.x = Math.max(6, cursor.x - step); break;
      case 'ArrowRight': cursor.x = Math.min(SCENE_W - 6, cursor.x + step); break;
      case 'ArrowUp': cursor.y = Math.max(6, cursor.y - step); break;
      case 'ArrowDown': cursor.y = Math.min(SCENE_H - 6, cursor.y + step); break;
      case 'Tab':
        cursor.side = cursor.side === 'left' ? 'right' : 'left';
        break;
      case 'Enter':
      case ' ':
        game.attempt(cursor.side, cursor.x, cursor.y);
        break;
      case 'h': case 'H': game.useHint(); break;
      case 'p': case 'P': game.togglePause(); break;
      case 'm': case 'M': game.toggleMute(); break;
      default: return; // not one of ours — let the page have it
    }
    cursor.visible = true;
    ev.preventDefault();
    game.render();
  }

  window.addEventListener('keydown', handleKey);
  return { cursor, handleKey, toScene };
}
