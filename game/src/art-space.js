// art-space.js — Scene 3, "Orbital Greenhouse": a space-station garden
// with a big round window, grow lights, plant shelves and a robot
// gardener. Ten differences — the hardest set in the game.

import {
  SCENE_W, seededRandom, circle, ellipse, roundRect, rect,
  triangle, line, sparkle, vGradient,
} from './draw.js';

export const SPACE_DIFFERENCES = [
  { id: 'earth-ring', x: 110, y: 112, r: 46, label: 'Earth grew a ring' },
  { id: 'star-gone', x: 160, y: 60, r: 11, label: 'A bright star blinked out' },
  { id: 'lamp-off', x: 380, y: 64, r: 17, label: 'A grow light went dark' },
  { id: 'droplet-extra', x: 452, y: 140, r: 12, label: 'An extra water droplet' },
  { id: 'leaf-gone', x: 521, y: 168, r: 13, label: 'A vine leaf is missing' },
  { id: 'tomato-green', x: 300, y: 246, r: 12, label: 'One tomato is still green' },
  { id: 'pot-gone', x: 350, y: 272, r: 17, label: 'A plant pot is missing' },
  { id: 'robot-eye', x: 498, y: 282, r: 16, label: "The robot's eye changed colour" },
  { id: 'button-colour', x: 70, y: 330, r: 12, label: 'The big button changed colour' },
  { id: 'sprout-flower', x: 208, y: 340, r: 13, label: 'A sprout burst into flower' },
];

function drawWindow(ctx, altered) {
  const cx = 120, cy = 112;
  // The view: deep space, stars, and Earth.
  circle(ctx, cx, cy, 76, '#10142e');
  const rand = seededRandom(4242);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, 76, 0, Math.PI * 2);
  ctx.clip();
  for (let i = 0; i < 26; i++) {
    circle(ctx, cx - 72 + rand() * 144, cy - 72 + rand() * 144, 1.3, 'rgba(255,255,255,0.85)');
  }
  if (!altered.has('star-gone')) sparkle(ctx, 160, 60, 9, '#ffe9a8'); // DIFFERENCE
  // Earth.
  circle(ctx, 105, 122, 38, '#2f6fd0');
  ellipse(ctx, 92, 108, 15, 9, '#37b06a');
  ellipse(ctx, 122, 138, 13, 8, '#37b06a');
  ellipse(ctx, 118, 100, 8, 5, '#37b06a');
  ellipse(ctx, 96, 128, 16, 5, 'rgba(255,255,255,0.75)');
  if (altered.has('earth-ring')) {
    // DIFFERENCE: a thin ring around Earth.
    ctx.beginPath();
    ctx.ellipse(105, 122, 56, 13, -0.32, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 4;
    ctx.stroke();
  }
  ctx.restore();
  // Frame and bolts.
  ctx.beginPath();
  ctx.arc(cx, cy, 80, 0, Math.PI * 2);
  ctx.strokeStyle = '#8d99ae';
  ctx.lineWidth = 9;
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    circle(ctx, cx + Math.cos(a) * 80, cy + Math.sin(a) * 80, 3.4, '#5c6779');
  }
}

function drawLamp(ctx, x, altered, offId) {
  const off = altered.has(offId);
  line(ctx, x, 40, x, 52, '#5c6779', 4);
  ctx.beginPath();
  ctx.moveTo(x - 16, 70); ctx.lineTo(x + 16, 70); ctx.lineTo(x + 9, 52); ctx.lineTo(x - 9, 52);
  ctx.closePath();
  ctx.fillStyle = off ? '#4a4a55' : '#ffc53d';
  ctx.fill();
  circle(ctx, x, 72, 5, off ? '#33333d' : '#fff3b0');
  if (!off) {
    ctx.beginPath();
    ctx.moveTo(x - 13, 74); ctx.lineTo(x + 13, 74); ctx.lineTo(x + 34, 196); ctx.lineTo(x - 34, 196);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,213,79,0.13)';
    ctx.fill();
  }
}

function drawPot(ctx, x, shelfY, leafColour) {
  ctx.beginPath();
  ctx.moveTo(x - 12, shelfY - 24); ctx.lineTo(x + 12, shelfY - 24);
  ctx.lineTo(x + 9, shelfY); ctx.lineTo(x - 9, shelfY);
  ctx.closePath();
  ctx.fillStyle = '#c96f2e';
  ctx.fill();
  rect(ctx, x - 13, shelfY - 27, 26, 5, '#a8561f');
  // Leafy tuft.
  ctx.strokeStyle = leafColour;
  ctx.lineWidth = 4;
  for (const dx of [-8, 0, 8]) {
    ctx.beginPath();
    ctx.moveTo(x, shelfY - 26);
    ctx.quadraticCurveTo(x + dx, shelfY - 40, x + dx * 1.7, shelfY - 46 - Math.abs(dx));
    ctx.stroke();
  }
  circle(ctx, x, shelfY - 34, 4, leafColour);
}

function drawRobot(ctx, altered) {
  const x = 498;
  // Arm reaching toward the plants, holding a watering can.
  line(ctx, x - 18, 322, x - 46, 336, '#8d99ae', 9);
  ctx.beginPath();
  ctx.moveTo(x - 58, 330); ctx.lineTo(x - 38, 330); ctx.lineTo(x - 41, 348); ctx.lineTo(x - 55, 348);
  ctx.closePath();
  ctx.fillStyle = '#0e7c86';
  ctx.fill();
  line(ctx, x - 56, 336, x - 66, 330, '#0e7c86', 4);
  // Body and base.
  roundRect(ctx, x - 24, 306, 48, 58, 12, '#d9dee6');
  roundRect(ctx, x - 24, 306, 48, 58, 12, 'rgba(0,0,0,0)');
  rect(ctx, x - 14, 322, 28, 16, '#8d99ae');
  circle(ctx, x, 330, 5, '#e4572e');
  rect(ctx, x - 28, 364, 56, 10, '#5c6779');
  circle(ctx, x - 16, 380, 8, '#333a45');
  circle(ctx, x + 16, 380, 8, '#333a45');
  // Head dome with one big eye — its colour is a difference.
  ctx.beginPath();
  ctx.arc(x, 292, 24, Math.PI, 2 * Math.PI);
  ctx.closePath();
  ctx.fillStyle = '#eef1f5';
  ctx.fill();
  rect(ctx, x - 24, 290, 48, 5, '#8d99ae');
  circle(ctx, x, 282, 9, altered.has('robot-eye') ? '#e83e8c' : '#22c3d6');
  circle(ctx, x, 282, 4, '#22303a');
  line(ctx, x, 268, x, 256, '#8d99ae', 3);
  circle(ctx, x, 253, 4, '#ffc53d');
}

export function paintSpace(ctx, altered) {
  const rand = seededRandom(90210);
  // Station wall and ceiling band.
  ctx.fillStyle = vGradient(ctx, 0, 400, [[0, '#cfd4e4'], [0.75, '#b7bdd2'], [1, '#a7adc2']]);
  ctx.fillRect(0, 0, SCENE_W, 400);
  rect(ctx, 0, 0, SCENE_W, 36, '#8d99ae');
  rect(ctx, 0, 36, SCENE_W, 5, '#5c6779');
  for (let x = 26; x < SCENE_W; x += 52) circle(ctx, x, 18, 3, '#5c6779');
  // Deck floor.
  ctx.fillStyle = vGradient(ctx, 366, 400, [[0, '#7c8698'], [1, '#626b7d']]);
  ctx.fillRect(0, 366, SCENE_W, 34);
  ctx.strokeStyle = 'rgba(30,34,48,0.35)';
  ctx.lineWidth = 2;
  for (let x = 40; x < SCENE_W; x += 64) line(ctx, x, 368, x - 12, 400, 'rgba(30,34,48,0.35)', 2);
  drawWindow(ctx, altered);
  // A round pressure gauge on the wall (decoy detail).
  circle(ctx, 246, 116, 21, '#eef1f5');
  ctx.beginPath(); ctx.arc(246, 116, 21, 0, Math.PI * 2); ctx.strokeStyle = '#5c6779'; ctx.lineWidth = 4; ctx.stroke();
  line(ctx, 246, 116, 258, 104, '#e4572e', 3);
  circle(ctx, 246, 116, 3.4, '#22303a');
  // Vent grille.
  for (let i = 0; i < 4; i++) rect(ctx, 36, 216 + i * 9, 54, 5, '#8d99ae');
  // Grow-light rail and lamps.
  rect(ctx, 268, 38, 252, 6, '#5c6779');
  drawLamp(ctx, 300, altered, 'never-off-a');
  drawLamp(ctx, 380, altered, 'lamp-off'); // DIFFERENCE lives here.
  drawLamp(ctx, 460, altered, 'never-off-b');
  // Plant shelves.
  for (const shelfY of [212, 292]) {
    rect(ctx, 242, shelfY, 206, 7, '#5c6779');
    rect(ctx, 250, shelfY + 7, 6, 20, '#5c6779');
    rect(ctx, 434, shelfY + 7, 6, 20, '#5c6779');
  }
  drawPot(ctx, 278, 212, '#2e9e4f');
  drawPot(ctx, 332, 212, '#37b06a');
  drawPot(ctx, 386, 212, '#2e9e4f');
  drawPot(ctx, 428, 212, '#7bc950');
  drawPot(ctx, 278, 292, '#37b06a');
  if (!altered.has('pot-gone')) drawPot(ctx, 350, 292, '#2e9e4f'); // DIFFERENCE
  drawPot(ctx, 420, 292, '#7bc950');
  // Hanging vine down the right wall.
  ctx.beginPath();
  ctx.moveTo(532, 40);
  ctx.quadraticCurveTo(524, 130, 532, 226);
  ctx.strokeStyle = '#2e7d4f';
  ctx.lineWidth = 4;
  ctx.stroke();
  const leafAt = (x, y, flip) => {
    ctx.beginPath();
    ctx.ellipse(x, y, 11, 5.5, flip * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = '#37b06a';
    ctx.fill();
  };
  leafAt(524, 74, -1);
  leafAt(528, 106, 1);
  leafAt(523, 138, -1);
  if (!altered.has('leaf-gone')) leafAt(521, 168, 1); // DIFFERENCE
  leafAt(526, 200, -1);
  // Floating water droplets (station gravity is gentle here).
  const droplet = (x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x, y - 9 * s);
    ctx.quadraticCurveTo(x + 7 * s, y + 2 * s, x, y + 6 * s);
    ctx.quadraticCurveTo(x - 7 * s, y + 2 * s, x, y - 9 * s);
    ctx.fillStyle = 'rgba(90,180,240,0.75)';
    ctx.fill();
  };
  droplet(238, 168, 1);
  droplet(428, 176, 0.8);
  droplet(516, 116, 0.9);
  if (altered.has('droplet-extra')) droplet(452, 140, 1); // DIFFERENCE: one more.
  // Tomato plant in its floor planter, in front of the shelves.
  rect(ctx, 246, 338, 112, 30, '#8a5a2b');
  rect(ctx, 246, 338, 112, 7, '#6e452a');
  ctx.strokeStyle = '#2e7d4f';
  ctx.lineWidth = 4;
  for (const [tx, ty] of [[272, 300], [302, 288], [330, 302]]) {
    ctx.beginPath();
    ctx.moveTo(tx + 8, 340);
    ctx.quadraticCurveTo(tx, 316, tx, ty + 12);
    ctx.stroke();
    ellipse(ctx, tx - 6, ty + 16, 10, 5, '#37b06a');
    ellipse(ctx, tx + 12, ty + 22, 10, 5, '#2e9e4f');
  }
  circle(ctx, 272, 268, 11, '#d93636');
  circle(ctx, 300, 246, 11, altered.has('tomato-green') ? '#7bc950' : '#d93636'); // DIFFERENCE
  circle(ctx, 328, 270, 11, '#d93636');
  // Control panel, bottom left.
  roundRect(ctx, 34, 262, 128, 96, 10, '#39415a');
  roundRect(ctx, 46, 274, 66, 34, 5, '#9fd8e8');
  line(ctx, 52, 298, 76, 284, '#0e7c86', 3);
  line(ctx, 76, 284, 90, 292, '#0e7c86', 3);
  line(ctx, 90, 292, 104, 280, '#0e7c86', 3);
  circle(ctx, 128, 282, 7, '#37d67a');
  circle(ctx, 128, 300, 7, '#ffc53d');
  // The big button — its colour is a difference.
  circle(ctx, 70, 330, 13, altered.has('button-colour') ? '#37d67a' : '#d93636');
  circle(ctx, 70, 330, 13, 'rgba(0,0,0,0)');
  circle(ctx, 104, 330, 9, '#ffc53d');
  circle(ctx, 134, 330, 9, '#4a90d9');
  // Sprout tray on the floor.
  rect(ctx, 172, 356, 76, 12, '#5c6779');
  for (const sx of [184, 208, 232]) {
    line(ctx, sx, 356, sx, 344, '#2e7d4f', 3.5);
    ellipse(ctx, sx - 5, 344, 6, 3.4, '#37b06a');
    ellipse(ctx, sx + 5, 344, 6, 3.4, '#37b06a');
  }
  // DIFFERENCE: the middle sprout is a bud normally, a flower in the twin.
  if (altered.has('sprout-flower')) {
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      circle(ctx, 208 + Math.cos(a) * 6, 336 + Math.sin(a) * 6, 4.6, '#f6a8c1');
    }
    circle(ctx, 208, 336, 3.6, '#ffc53d');
  } else {
    circle(ctx, 208, 338, 5.5, '#2e9e4f');
  }
  drawRobot(ctx, altered);
  // A few drifting dust motes for depth.
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let i = 0; i < 12; i++) circle(ctx, rand() * SCENE_W, 50 + rand() * 300, 1.4, 'rgba(255,255,255,0.35)');
}
