# spot-difference-20261121

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/mumun110795/spot-difference-20261121/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/mumun110795/spot-difference-20261121/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

# Twin Vistas — Spot the Difference

Every vista has a twin, and the twin is never quite right. **Twin Vistas** is a
complete, original spot-the-difference game that plays offline in a desktop
browser from static files — no build step, no network requests, nothing to
install. Two near-identical pictures sit side by side; click what changed, in
either picture, before the clock runs out.

## How to play

- **Mouse:** click a difference in either panel. Found differences get a coral
  ring with a check tag on **both** pictures, and the big counter in the HUD
  ticks down.
- **Keyboard:** arrow keys move the amber lens, `Enter`/`Space` spots at the
  lens, `Tab` swaps panels, `H` asks for a hint, `P` pauses, `M` mutes.
- A **miss** costs 25 points and 5 seconds, and leaves a red X where you
  clicked. A **hint** (2–3 per scene) costs 40 points and makes one unfound
  difference glimmer for a moment.
- Each find scores 100 points; clearing a scene adds a time bonus of 2 points
  per second left. Scenes earn 1–3 stars for clean play. Clear all three
  scenes to win a spotter title, from *Happy Hunter* to *Eagle-Eye Legend*.

## The scenes — 27 differences

| # | Scene | Differences | Time limit |
|---|-------|-------------|------------|
| 1 | **Sunny Cove** — a bright beach: palm tree, striped umbrella, sailboat, crab | 8 | 4:00 |
| 2 | **Lantern Market** — market stalls at dusk under string lights and paper lanterns | 9 | 4:30 |
| 3 | **Orbital Greenhouse** — a space-station garden with Earth out the window and a robot gardener | 10 | 5:00 |

The differences are real picture changes, defined as data and painted from
that data so both panels always agree: objects that vanish (a starfish, the
market cat, a plant pot), objects that appear (sunglasses on the sun, a ring
around Earth, an extra jar), colour changes (an awning, a sail, a robot's
eye), and quiet swaps (oranges become apples, a crescent moon fills out, a
sprout bursts into flower). Difficulty rises scene by scene — more changes,
smaller ones, busier pictures.

## Screenshots

The four files in `screenshots/` are real renders of the game in a browser,
taken mid-round through the game's own screenshot states (`shots.json` lists
the exact URLs): the cover shows Sunny Cove with 3 of 8 differences found and
ringed and 5 still hidden; then the Lantern Market mid-hunt; then the Orbital
Greenhouse endgame with 41 seconds left; and the win screen after the last
scene.

## How it is built

Plain HTML, CSS and ES modules under `game/` — no library, no framework, no
assets: every scene is drawn procedurally on canvas from seeded data, and
every sound is synthesized live with WebAudio.

- `game/index.html` + `game/style.css` — the page, HUD and overlay cards
- `game/src/scenes.js` — the scene registry (painter, differences, rules)
- `game/src/art-beach.js`, `art-market.js`, `art-space.js` — one painter per scene
- `game/src/game.js` — rounds, scoring, clock, hints, level flow, the win
- `game/src/render.js` — panels, found rings, miss marks, hint glimmer, lens
- `game/src/input.js` — mouse + keyboard play
- `game/src/ui.js` — HUD chips, flash messages, overlay cards
- `game/src/audio.js` — WebAudio chimes, buzzes and fanfares
- `game/src/draw.js` — shared canvas helpers and the seeded randomiser

`main.ts` (Node 22, standard library only) hands the game in: it copies
`game/` and `screenshots/` to the output directory and writes `dossier.json`
with `buildDossier` from `vendor/makefun-game.ts`. Open the game with
`?selftest=1` and it plays a whole game by itself and reports every check.

## Run it

```sh
node serve.ts
# then open http://localhost:8080 — or serve game/ with any static
# file server; it plays exactly the same offline.

mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# builds the hand-in: out/game, out/screenshots, out/dossier.json
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=vdsf53gd&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
