// Twin Vistas — the hand-in program (Node 22, standard library only).
//
// The game itself is the static site in game/ (open game/index.html in a
// browser and play; it needs no server and makes no network requests).
// This program delivers it: it copies game/ and screenshots/ from beside
// this file into the output directory and writes dossier.json there with
// buildDossier from the vendored make.fun library — the summary the
// judges read. In the grader the output directory is /output; anywhere
// else, MAKEFUN_OUTPUT_DIR names it:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps, passed so the dossier is shaped exactly the
// way the gate rebuilds it: at most 4 screenshots of 256 KiB, at most
// 993 game files and 48 MiB of game, no game path over 1,000 bytes, and
// the dossier's source text capped at 160 KiB.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'game'), join(outputDir, 'game'), { recursive: true });

const shotsDir = join(repoDir, 'screenshots');
if (existsSync(shotsDir)) {
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, DOSSIER_CAPS),
);
