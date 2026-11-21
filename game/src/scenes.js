// scenes.js — the scene registry: each entry bundles a painter, its
// difference list, and the rules of the round (time limit, par misses).
// Painters receive the set of difference ids to alter; the left panel
// always paints with the empty set, the twin with the full set.

import { paintBeach, BEACH_DIFFERENCES } from './art-beach.js';
import { paintMarket, MARKET_DIFFERENCES } from './art-market.js';
import { paintSpace, SPACE_DIFFERENCES } from './art-space.js';

export const SCENES = [
  {
    id: 'sunny-cove',
    name: 'Sunny Cove',
    blurb: 'A lazy beach day — but the twin picture is up to something.',
    timeLimit: 240,
    hints: 3,
    paint: paintBeach,
    differences: BEACH_DIFFERENCES,
  },
  {
    id: 'lantern-market',
    name: 'Lantern Market',
    blurb: 'Dusk, lanterns, and nine little changes hiding in the crowd.',
    timeLimit: 270,
    hints: 3,
    paint: paintMarket,
    differences: MARKET_DIFFERENCES,
  },
  {
    id: 'orbital-greenhouse',
    name: 'Orbital Greenhouse',
    blurb: 'Ten changes drift somewhere between the tomatoes and the stars.',
    timeLimit: 300,
    hints: 2,
    paint: paintSpace,
    differences: SPACE_DIFFERENCES,
  },
];

// The full altered set for a scene: every difference applied at once.
export function alteredSet(scene) {
  return new Set(scene.differences.map((d) => d.id));
}
