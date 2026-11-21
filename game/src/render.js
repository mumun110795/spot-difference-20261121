// render.js — paints one panel: the scene itself, then the player's
// marks on top. Found differences get a steady coral ring on BOTH
// panels; fresh finds pulse once; misses flash a red X; a hint breathes
// a dashed amber ring around one unfound difference.

import { SCENE_W, SCENE_H } from './draw.js';

const INK = '#22303a';
const CORAL = '#e4572e';
const AMBER = '#ffc53d';

// view: { scene, altered:Set, found:Set, effects:[], cursor|null, now }
export function drawPanel(canvas, view) {
  const ctx = canvas.getContext('2d');
  ctx.setTransform(2, 0, 0, 2, 0, 0); // canvas backing is 2x scene size
  ctx.clearRect(0, 0, SCENE_W, SCENE_H);
  view.scene.paint(ctx, view.altered);
  drawFoundMarkers(ctx, view);
  drawEffects(ctx, view);
  if (view.cursor) drawCursor(ctx, view.cursor);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function ring(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = CORAL;
  ctx.lineWidth = 3.4;
  ctx.stroke();
}

function drawFoundMarkers(ctx, view) {
  for (const diff of view.scene.differences) {
    if (!view.found.has(diff.id)) continue;
    ring(ctx, diff.x, diff.y, Math.max(13, diff.r * 0.72));
    // A tiny check tag at the ring's top-right, so finds read at a glance.
    ctx.beginPath();
    ctx.arc(diff.x + diff.r * 0.52, diff.y - diff.r * 0.52, 7, 0, Math.PI * 2);
    ctx.fillStyle = CORAL;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(diff.x + diff.r * 0.52 - 3.4, diff.y - diff.r * 0.52 + 0.4);
    ctx.lineTo(diff.x + diff.r * 0.52 - 1, diff.y - diff.r * 0.52 + 3);
    ctx.lineTo(diff.x + diff.r * 0.52 + 3.8, diff.y - diff.r * 0.52 - 3);
    ctx.stroke();
  }
}

function drawEffects(ctx, view) {
  for (const fx of view.effects) {
    if (fx.kind === 'pulse') {
      // Expanding ring in the half second after a find.
      const age = (view.now - fx.t0) / 480;
      if (age < 0 || age > 1) continue;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, 10 + age * 30, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(228, 87, 46, ${0.75 * (1 - age)})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    } else if (fx.kind === 'miss') {
      const age = (view.now - fx.t0) / 550;
      if (age < 0 || age > 1) continue;
      const s = 9, a = 1 - age * 0.6;
      ctx.strokeStyle = `rgba(255,255,255,${a})`;
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      ctx.moveTo(fx.x - s, fx.y - s); ctx.lineTo(fx.x + s, fx.y + s);
      ctx.moveTo(fx.x + s, fx.y - s); ctx.lineTo(fx.x - s, fx.y + s);
      ctx.stroke();
      ctx.strokeStyle = `rgba(194, 46, 31, ${a})`;
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(fx.x - s, fx.y - s); ctx.lineTo(fx.x + s, fx.y + s);
      ctx.moveTo(fx.x + s, fx.y - s); ctx.lineTo(fx.x - s, fx.y + s);
      ctx.stroke();
    } else if (fx.kind === 'hint') {
      if (view.now > fx.until) continue;
      const diff = view.scene.differences.find((d) => d.id === fx.id);
      if (!diff) continue;
      const breathe = 1 + Math.sin(view.now / 130) * 0.1;
      ctx.setLineDash([7, 6]);
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, (diff.r + 9) * breathe, 0, Math.PI * 2);
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

// The keyboard lens: an amber crosshair with an ink outline.
function drawCursor(ctx, cursor) {
  const { x, y } = cursor;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = AMBER;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 20, y); ctx.lineTo(x - 7, y);
  ctx.moveTo(x + 7, y); ctx.lineTo(x + 20, y);
  ctx.moveTo(x, y - 20); ctx.lineTo(x, y - 7);
  ctx.moveTo(x, y + 7); ctx.lineTo(x, y + 20);
  ctx.stroke();
}
