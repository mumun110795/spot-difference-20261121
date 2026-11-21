// art-market.js — Scene 2, "Lantern Market": market stalls at dusk under
// string lights and paper lanterns. Same contract as every scene: the
// painter draws from data, and each difference is one element drawn two
// ways depending on the `altered` set.

import {
  SCENE_W, seededRandom, circle, ellipse, roundRect, rect,
  triangle, line, sparkle, vGradient, signText,
} from './draw.js';

export const MARKET_DIFFERENCES = [
  { id: 'moon-phase', x: 495, y: 52, r: 24, label: 'The moon filled out' },
  { id: 'bulb-colour', x: 112, y: 95, r: 13, label: 'One bulb glows green' },
  { id: 'lantern-gone', x: 330, y: 124, r: 16, label: 'A lantern is missing' },
  { id: 'awning-colour', x: 280, y: 166, r: 40, label: 'The middle awning changed colour' },
  { id: 'sign-word', x: 455, y: 202, r: 22, label: 'The tea stall renamed itself' },
  { id: 'flag-gone', x: 302, y: 231, r: 12, label: 'A bunting flag is gone' },
  { id: 'jar-extra', x: 322, y: 244, r: 12, label: 'An extra jar appeared' },
  { id: 'fruit-swap', x: 105, y: 318, r: 24, label: 'Oranges became apples' },
  { id: 'cat-gone', x: 300, y: 362, r: 20, label: 'The market cat wandered off' },
];

function drawMoon(ctx, altered) {
  circle(ctx, 495, 52, 23, '#f7ead9');
  if (!altered.has('moon-phase')) {
    // Crescent: bite a dusk-coloured circle out of the full moon.
    circle(ctx, 484, 46, 20, '#2c2a55');
  } else {
    circle(ctx, 488, 46, 3.4, '#e3d3ae');
    circle(ctx, 503, 60, 2.6, '#e3d3ae');
  }
}

function drawStringLights(ctx, altered) {
  const curves = [
    { p0: [0, 54], c: [140, 112], p2: [280, 66] },
    { p0: [280, 66], c: [420, 114], p2: [560, 52] },
  ];
  const bulbColours = ['#ffc53d', '#ff8c42', '#ffd166', '#ff8c42'];
  let bulbIndex = 0;
  for (const { p0, c, p2 } of curves) {
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.quadraticCurveTo(c[0], c[1], p2[0], p2[1]);
    ctx.strokeStyle = '#191736';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    for (const t of [0.18, 0.4, 0.62, 0.84]) {
      const mt = 1 - t;
      const x = mt * mt * p0[0] + 2 * mt * t * c[0] + t * t * p2[0];
      const y = mt * mt * p0[1] + 2 * mt * t * c[1] + t * t * p2[1];
      let colour = bulbColours[bulbIndex % bulbColours.length];
      // DIFFERENCE: the second bulb on the first wire glows green.
      if (bulbIndex === 1 && altered.has('bulb-colour')) colour = '#37d67a';
      bulbIndex++;
      line(ctx, x, y, x, y + 6, '#191736', 2);
      circle(ctx, x, y + 11, 6, colour);
      circle(ctx, x, y + 11, 10, 'rgba(255,197,61,0.16)');
    }
  }
}

function drawLanterns(ctx, altered) {
  const spots = [[90, 128], [205, 116], [330, 128], [452, 116]];
  for (const [x, y] of spots) {
    if (x === 330 && altered.has('lantern-gone')) continue; // DIFFERENCE
    line(ctx, x, 84, x, y - 16, '#191736', 2);
    ellipse(ctx, x, y, 15, 18, '#e4572e');
    ctx.strokeStyle = 'rgba(120,30,10,0.55)';
    ctx.lineWidth = 1.6;
    for (const dx of [-8, 0, 8]) {
      ctx.beginPath();
      ctx.ellipse(x, y, Math.abs(dx) + 2, 18, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    rect(ctx, x - 6, y - 21, 12, 5, '#ffc53d');
    rect(ctx, x - 6, y + 16, 12, 5, '#ffc53d');
    line(ctx, x, y + 21, x, y + 30, '#ffc53d', 2.5);
  }
}

function drawStall(ctx, x, w, awning, sign, altered) {
  // Posts and body.
  rect(ctx, x + 5, 178, 8, 222, '#5b3a24');
  rect(ctx, x + w - 13, 178, 8, 222, '#5b3a24');
  // Shadowed interior the goods sit in.
  rect(ctx, x + 10, 184, w - 20, 116, '#43304a');
  rect(ctx, x, 300, w, 100, '#6e452a');
  rect(ctx, x, 300, w, 14, '#54331d');
  // Awning: slanted striped canopy.
  const stripeW = 18;
  for (let sx = x - 8; sx < x + w + 8; sx += stripeW) {
    ctx.beginPath();
    ctx.moveTo(sx, 182);
    ctx.lineTo(sx + stripeW, 182);
    ctx.lineTo(sx + stripeW - 5, 148);
    ctx.lineTo(sx - 5, 148);
    ctx.closePath();
    const idx = Math.round((sx - x) / stripeW);
    ctx.fillStyle = idx % 2 === 0 ? awning : '#fff6e8';
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(25,23,54,0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 8, 182); ctx.lineTo(x + w + 8, 182);
  ctx.moveTo(x - 13, 148); ctx.lineTo(x + w + 3, 148);
  ctx.stroke();
  // Hanging sign board.
  if (sign) {
    roundRect(ctx, x + w / 2 - 34, 190, 68, 24, 5, '#2c2a55');
    signText(ctx, sign, x + w / 2, 203, 15, '#ffd166');
  }
}

function drawFruitCrate(ctx, x, y, fruit, leaf) {
  ctx.beginPath();
  ctx.moveTo(x - 26, y - 12); ctx.lineTo(x + 26, y - 12);
  ctx.lineTo(x + 21, y + 14); ctx.lineTo(x - 21, y + 14);
  ctx.closePath();
  ctx.fillStyle = '#9c6b3c';
  ctx.fill();
  const fruits = [[-14, -14], [0, -17], [14, -14], [-7, -8], [8, -8]];
  for (const [dx, dy] of fruits) {
    circle(ctx, x + dx, y + dy, 8, fruit);
    if (leaf) triangle(ctx, x + dx + 2, y + dy - 10, x + dx + 9, y + dy - 13, x + dx + 4, y + dy - 5, '#2e9e4f');
  }
  rect(ctx, x - 26, y - 4, 52, 4, 'rgba(60,35,10,0.4)');
}

function drawCat(ctx, altered) {
  if (altered.has('cat-gone')) return; // DIFFERENCE: no cat at all.
  const x = 300, y = 372;
  ellipse(ctx, x, y, 17, 12, '#3a3f4a');
  circle(ctx, x + 13, y - 12, 10, '#3a3f4a');
  triangle(ctx, x + 6, y - 19, x + 10, y - 27, x + 13, y - 19, '#3a3f4a');
  triangle(ctx, x + 15, y - 19, x + 20, y - 26, x + 21, y - 17, '#3a3f4a');
  ctx.beginPath(); // curled tail
  ctx.arc(x - 16, y + 4, 8, Math.PI * 0.4, Math.PI * 1.5);
  ctx.strokeStyle = '#3a3f4a';
  ctx.lineWidth = 4.5;
  ctx.stroke();
  circle(ctx, x + 10, y - 13, 1.8, '#ffd166');
  circle(ctx, x + 17, y - 13, 1.8, '#ffd166');
}

export function paintMarket(ctx, altered) {
  const rand = seededRandom(7741);
  // Dusk sky and rooftops behind the stalls.
  ctx.fillStyle = vGradient(ctx, 0, 332, [[0, '#232150'], [0.62, '#4b2e63'], [1, '#8a4a6b']]);
  ctx.fillRect(0, 0, SCENE_W, 332);
  for (let i = 0; i < 40; i++) {
    sparkle(ctx, rand() * SCENE_W, rand() * 130, 2 + rand() * 2.6, 'rgba(255,246,220,0.8)');
  }
  ctx.fillStyle = '#1d1b40';
  rect(ctx, 0, 128, 90, 112, '#1d1b40');
  rect(ctx, 452, 118, 108, 122, '#1d1b40');
  triangle(ctx, -6, 128, 96, 128, 45, 100, '#1d1b40');
  triangle(ctx, 446, 118, 566, 118, 506, 88, '#1d1b40');
  ctx.fillStyle = '#ffd166';
  for (const [wx, wy] of [[22, 152], [52, 178], [478, 146], [516, 172], [486, 196]]) {
    rect(ctx, wx, wy, 11, 14, '#ffd166');
  }
  // Ground: dark pavement with cobble hints.
  ctx.fillStyle = vGradient(ctx, 330, 400, [[0, '#3d3350'], [1, '#2b2440']]);
  ctx.fillRect(0, 330, SCENE_W, 70);
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  for (let i = 0; i < 26; i++) ellipse(ctx, rand() * SCENE_W, 340 + rand() * 54, 13, 4.5, 'rgba(255,255,255,0.07)');
  drawMoon(ctx, altered);
  drawStringLights(ctx, altered);
  drawLanterns(ctx, altered);
  // The three stalls.
  const midAwning = altered.has('awning-colour') ? '#0e7c86' : '#7b4ba8';
  drawStall(ctx, 30, 150, '#c33d2a', 'MELONS', altered);
  drawStall(ctx, 205, 150, midAwning, 'SPICE', altered);
  drawStall(ctx, 380, 150, '#2e7d4f', altered.has('sign-word') ? 'POT' : 'TEA', altered);
  // Left stall goods: melon pile + the swap crate.
  for (const [mx, my] of [[52, 288], [74, 292], [63, 276]]) {
    ellipse(ctx, mx, my, 13, 10, '#3f9e4d');
    ctx.strokeStyle = '#2c7038';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(mx, my, 6, 9, 0, 0, Math.PI * 2); ctx.stroke();
  }
  const swapped = altered.has('fruit-swap');
  drawFruitCrate(ctx, 105, 322, swapped ? '#d93636' : '#ff8c42', swapped);
  drawFruitCrate(ctx, 148, 322, '#ffd23e', false);
  // Middle stall: spice bowls and a jar shelf.
  const spices = ['#d93636', '#ffc53d', '#7b4ba8', '#e2703a'];
  spices.forEach((c, i) => {
    const bx = 226 + i * 32, by = 292;
    ctx.beginPath();
    ctx.arc(bx, by, 13, Math.PI, 2 * Math.PI);
    ctx.fillStyle = c; ctx.fill();
    rect(ctx, bx - 14, by, 28, 9, '#54331d');
  });
  rect(ctx, 218, 244, 124, 6, '#54331d');
  const jarAt = (jx, colour) => {
    roundRect(ctx, jx - 8, 232, 16, 20, 4, colour);
    rect(ctx, jx - 6, 226, 12, 6, '#2c2a55');
  };
  jarAt(238, '#d98e4a');
  jarAt(268, '#a85b9e');
  jarAt(298, '#4a90d9');
  if (altered.has('jar-extra')) jarAt(322, '#37d67a'); // DIFFERENCE: extra jar.
  // Bunting across the middle stall; one flag is a difference.
  ctx.beginPath();
  ctx.moveTo(210, 216);
  ctx.quadraticCurveTo(280, 230, 350, 216);
  ctx.strokeStyle = '#191736';
  ctx.lineWidth = 2;
  ctx.stroke();
  const flagColours = ['#e4572e', '#ffc53d', '#0e7c86', '#7b4ba8', '#d93636'];
  [228, 252, 276, 304, 330].forEach((fx, i) => {
    if (fx === 304 && altered.has('flag-gone')) return; // DIFFERENCE
    const fy = 222 + Math.sin((fx - 210) / 140 * Math.PI) * 5;
    triangle(ctx, fx - 8, fy, fx + 8, fy, fx, fy + 15, flagColours[i]);
  });
  // Right stall goods: teapot and cups.
  ellipse(ctx, 428, 292, 20, 14, '#d9dee6');
  circle(ctx, 428, 276, 6, '#d9dee6');
  ctx.beginPath(); ctx.arc(410, 290, 8, Math.PI * 0.9, Math.PI * 1.7); ctx.strokeStyle = '#d9dee6'; ctx.lineWidth = 5; ctx.stroke();
  line(ctx, 446, 288, 458, 282, '#d9dee6', 5);
  for (const [cx2, cy2] of [[478, 296], [502, 296], [490, 282]]) {
    roundRect(ctx, cx2 - 9, cy2 - 6, 18, 12, 3, '#ffd166');
  }
  drawCat(ctx, altered);
}
