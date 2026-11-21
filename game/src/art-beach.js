// art-beach.js — Scene 1, "Sunny Cove": a bright beach with a palm tree,
// an umbrella, a sailboat and a crab. The painter draws the whole scene
// from data; each difference is one small element drawn two ways — the
// normal way on the left panel, the altered way on the twin.

import {
  SCENE_W, seededRandom, circle, ellipse, roundRect, rect,
  triangle, line, cloud, star, vGradient,
} from './draw.js';

export const BEACH_DIFFERENCES = [
  { id: 'sun-glasses', x: 66, y: 58, r: 30, label: 'The sun put on sunglasses' },
  { id: 'cloud-gone', x: 330, y: 72, r: 36, label: 'A cloud drifted away' },
  { id: 'umbrella-stripes', x: 118, y: 224, r: 42, label: 'The umbrella changed colour' },
  { id: 'sail-colour', x: 430, y: 146, r: 27, label: 'The sail changed colour' },
  { id: 'ball-panel', x: 208, y: 332, r: 17, label: 'One ball panel changed colour' },
  { id: 'crab-claw', x: 348, y: 354, r: 17, label: 'The crab lost a claw' },
  { id: 'starfish-gone', x: 458, y: 348, r: 16, label: 'The starfish vanished' },
  { id: 'coconut-gone', x: 493, y: 127, r: 15, label: 'A coconut is missing' },
];

function drawSun(ctx, altered) {
  // Rays first, then the face.
  ctx.strokeStyle = '#f5a623';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + 0.4;
    line(ctx, 66 + Math.cos(a) * 38, 58 + Math.sin(a) * 38,
         66 + Math.cos(a) * 50, 58 + Math.sin(a) * 50, '#f5a623', 5);
  }
  circle(ctx, 66, 58, 31, '#ffd23e');
  circle(ctx, 66, 58, 31, null);
  if (altered.has('sun-glasses')) {
    // DIFFERENCE: chunky sunglasses across the sun's face.
    roundRect(ctx, 44, 48, 19, 15, 6, '#22303a');
    roundRect(ctx, 69, 48, 19, 15, 6, '#22303a');
    rect(ctx, 61, 52, 10, 4, '#22303a');
    line(ctx, 44, 52, 34, 46, '#22303a', 4);
    line(ctx, 88, 52, 98, 46, '#22303a', 4);
  } else {
    circle(ctx, 56, 54, 3.4, '#7a3b12');
    circle(ctx, 76, 54, 3.4, '#7a3b12');
    ctx.beginPath();
    ctx.arc(66, 62, 9, 0.25, Math.PI - 0.25);
    ctx.strokeStyle = '#7a3b12';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function drawUmbrella(ctx, altered) {
  const stripe = altered.has('umbrella-stripes') ? '#2f6fd0' : '#e4572e';
  // Pole, then a scalloped canopy of alternating stripes.
  line(ctx, 118, 226, 128, 318, '#8a5a2b', 5);
  const cx = 118, cy = 228, R = 62;
  for (let i = 0; i < 6; i++) {
    const a0 = Math.PI + (i * Math.PI) / 6;
    const a1 = Math.PI + ((i + 1) * Math.PI) / 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, a0, a1);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? stripe : '#fff6e8';
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, R, Math.PI, 2 * Math.PI);
  ctx.strokeStyle = '#22303a';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  circle(ctx, cx, cy - R - 3, 5, '#ffc53d');
}

function drawBoat(ctx, altered) {
  const sail = altered.has('sail-colour') ? '#ff8c42' : '#ffffff';
  line(ctx, 430, 118, 430, 168, '#6b4226', 4);
  triangle(ctx, 434, 122, 434, 164, 462, 164, sail);
  triangle(ctx, 426, 128, 426, 164, 404, 164, '#ffe9a8');
  ctx.beginPath(); // hull
  ctx.moveTo(398, 168);
  ctx.lineTo(464, 168);
  ctx.lineTo(454, 184);
  ctx.lineTo(408, 184);
  ctx.closePath();
  ctx.fillStyle = '#b23a2e';
  ctx.fill();
  rect(ctx, 398, 164, 66, 5, '#6b4226');
}

function drawPalm(ctx, altered) {
  // Curved trunk built from stacked segments.
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 13;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(540, 402);
  ctx.quadraticCurveTo(520, 280, 502, 138);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(90,55,20,0.5)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    const y = 350 - i * 44;
    line(ctx, 528 - i * 5, y, 542 - i * 5, y - 8, 'rgba(90,55,20,0.5)', 3);
  }
  // Fronds.
  ctx.strokeStyle = '#2e9e4f';
  ctx.lineWidth = 8;
  const fronds = [
    [502, 132, 448, 96, 402, 116],
    [502, 132, 470, 82, 428, 66],
    [502, 132, 516, 78, 500, 44],
    [502, 132, 548, 92, 560, 66],
    [502, 132, 540, 118, 560, 118],
    [502, 132, 478, 104, 452, 138],
  ];
  for (const [x0, y0, x1, y1, x2, y2] of fronds) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(x1, y1, x2, y2);
    ctx.stroke();
  }
  // Coconuts: two in the original; the twin is missing one.
  circle(ctx, 514, 140, 10, '#6b4226');
  if (!altered.has('coconut-gone')) circle(ctx, 493, 127, 10, '#7a4a26');
}

function drawBeachBall(ctx, altered) {
  const x = 208, y = 332, r = 17;
  circle(ctx, x, y, r, '#ffffff');
  const panels = ['#e4572e', altered.has('ball-panel') ? '#2e9e4f' : '#ffc53d', '#2f6fd0'];
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, r, -Math.PI / 2 + (i * 2 * Math.PI) / 3, -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / 3);
    ctx.closePath();
    ctx.fillStyle = panels[i];
    ctx.fill();
  }
  circle(ctx, x, y, 4.5, '#ffffff');
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(34,48,58,0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawCrab(ctx, altered) {
  const x = 338, y = 362;
  // Legs.
  ctx.strokeStyle = '#c33d2a';
  ctx.lineWidth = 3.5;
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      line(ctx, x + s * 12, y + 4, x + s * (20 + i * 3), y + 10 + i * 3, '#c33d2a', 3.5);
    }
  }
  // Left claw always; right claw is a difference.
  circle(ctx, x - 20, y - 8, 8, '#e4572e');
  if (!altered.has('crab-claw')) circle(ctx, x + 20, y - 8, 8, '#e4572e');
  ellipse(ctx, x, y, 17, 12, '#e4572e');
  line(ctx, x - 6, y - 10, x - 6, y - 17, '#22303a', 2.5);
  line(ctx, x + 6, y - 10, x + 6, y - 17, '#22303a', 2.5);
  circle(ctx, x - 6, y - 18, 3.4, '#22303a');
  circle(ctx, x + 6, y - 18, 3.4, '#22303a');
}

export function paintBeach(ctx, altered) {
  const rand = seededRandom(1123);
  // Sky and sea.
  rect(ctx, 0, 0, SCENE_W, 400, '#aee3f5');
  ctx.fillStyle = vGradient(ctx, 140, 272, [[0, '#3fb6c9'], [1, '#7fd4c1']]);
  ctx.fillRect(0, 150, SCENE_W, 122);
  // Distant headland.
  ctx.beginPath();
  ctx.moveTo(0, 150);
  ctx.quadraticCurveTo(60, 108, 128, 150);
  ctx.closePath();
  ctx.fillStyle = '#5da85f';
  ctx.fill();
  // Sand.
  ctx.fillStyle = vGradient(ctx, 268, 400, [[0, '#f7dc9a'], [1, '#f0c978']]);
  ctx.fillRect(0, 268, SCENE_W, 132);
  // Foam along the shoreline.
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 3;
  for (let row = 0; row < 2; row++) {
    ctx.beginPath();
    for (let x = 0; x <= SCENE_W; x += 28) {
      const y = 266 + row * 9 + Math.sin(x / 40 + row) * 2.5;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // Wave sparkles on the water.
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    const x = 20 + rand() * 500, y = 165 + rand() * 90, w = 12 + rand() * 16;
    line(ctx, x, y, x + w, y, 'rgba(255,255,255,0.5)', 2);
  }
  drawSun(ctx, altered);
  cloud(ctx, 185, 48, 0.8, '#ffffff');
  if (!altered.has('cloud-gone')) cloud(ctx, 330, 72, 1.0, '#ffffff');
  cloud(ctx, 472, 40, 0.66, '#ffffff');
  // Seagulls.
  ctx.strokeStyle = '#43657a';
  ctx.lineWidth = 2.5;
  for (const [gx, gy] of [[252, 104], [392, 96]]) {
    ctx.beginPath();
    ctx.arc(gx - 7, gy, 7, Math.PI * 1.15, Math.PI * 1.85);
    ctx.arc(gx + 7, gy, 7, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }
  drawBoat(ctx, altered);
  drawPalm(ctx, altered);
  drawUmbrella(ctx, altered);
  // Striped towel under the umbrella.
  const towel = ['#e4572e', '#fff6e8', '#0e7c86', '#fff6e8', '#e4572e'];
  towel.forEach((c, i) => rect(ctx, 66 + i * 21, 306, 21, 34, c));
  rect(ctx, 66, 306, 105, 34, 'rgba(0,0,0,0)');
  ctx.strokeStyle = 'rgba(34,48,58,0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(66, 306, 105, 34);
  // Bucket and spade.
  ctx.beginPath();
  ctx.moveTo(258, 306); ctx.lineTo(282, 306); ctx.lineTo(278, 332); ctx.lineTo(262, 332);
  ctx.closePath();
  ctx.fillStyle = '#2f6fd0';
  ctx.fill();
  rect(ctx, 256, 300, 28, 7, '#ffc53d');
  line(ctx, 292, 322, 306, 306, '#e4572e', 4);
  triangle(ctx, 306, 306, 316, 300, 312, 314, '#e4572e');
  // Sandcastle with two towers.
  rect(ctx, 392, 312, 44, 26, '#eec27a');
  rect(ctx, 390, 290, 14, 48, '#eec27a');
  rect(ctx, 424, 290, 14, 48, '#eec27a');
  triangle(ctx, 390, 290, 404, 290, 397, 276, '#e4572e');
  triangle(ctx, 424, 290, 438, 290, 431, 276, '#e4572e');
  rect(ctx, 408, 322, 10, 16, '#8a5a2b');
  drawBeachBall(ctx, altered);
  drawCrab(ctx, altered);
  if (!altered.has('starfish-gone')) {
    star(ctx, 458, 348, 15, '#ff8c42');
    circle(ctx, 458, 348, 3, '#e4572e');
  }
  // Shells and sand speckles as decoys.
  for (const [sx, sy] of [[150, 372], [398, 366], [70, 356]]) {
    ctx.beginPath();
    ctx.arc(sx, sy, 7, Math.PI, 2 * Math.PI);
    ctx.fillStyle = '#f6a8c1';
    ctx.fill();
    line(ctx, sx - 7, sy, sx + 7, sy, '#d96b92', 2);
  }
  ctx.fillStyle = 'rgba(160,120,50,0.5)';
  for (let i = 0; i < 46; i++) circle(ctx, rand() * SCENE_W, 282 + rand() * 112, 1.6, 'rgba(160,120,50,0.5)');
}
