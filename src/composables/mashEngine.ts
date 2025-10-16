import type { Category, Option } from '@/types';

export type MashEvent =
  | { type: 'cursor'; catIdx: number; optIdx: number; tick: number; step: number }
  | { type: 'eliminate'; catIdx: number; optIdx: number; option: Option }
  | { type: 'lock'; catIdx: number }
  | { type: 'done'; winners: Record<string, Option> };

function remaining(c: Category) {
  return c.options.filter(o => !o.eliminated).length;
}

function ringMap(cats: Category[]): Array<{ catIdx: number; optIdx: number }> {
  const map: Array<{ catIdx: number; optIdx: number }> = [];
  cats.forEach((c, ci) => {
    if (remaining(c) <= 1) return; // locked
    c.options.forEach((o, oi) => {
      if (!o.eliminated) map.push({ catIdx: ci, optIdx: oi });
    });
  });
  return map;
}

export function cloneCategories(categories: Category[]): Category[] {
  return categories.map(c => ({
    ...c,
    locked: false,
    options: c.options.map(o => ({ ...o, eliminated: false })),
  }));
}

/**
 * Generator creating a stream of animation-friendly events.
 * Cursor moves step-1 ticks on current ring, then eliminates landing option.
 */
export function* mashSequence(categoriesIn: Category[], step: number): Generator<MashEvent, void> {
  if (step < 1 || !Number.isFinite(step)) throw new Error('Step must be >= 1');
  const cats = cloneCategories(categoriesIn);

  // main loop
  let cursor = 0;

  const allLocked = () => cats.every(c => remaining(c) === 1);

  while (!allLocked()) {
    let map = ringMap(cats);
    if (map.length === 0) break;

    // Move cursor step-1 times (emit cursor events)
    for (let tick = 1; tick < step; tick++) {
      const pos = (cursor + 1) % map.length;
      const { catIdx, optIdx } = map[pos];
      yield { type: 'cursor', catIdx, optIdx, tick, step };
      cursor = pos;
      map = ringMap(cats); // ring doesn't change during ticks, but safe if UI changes
      if (map.length === 0) break;
    }

    // Landing position (the next item)
    map = ringMap(cats);
    if (map.length === 0) break;
    const targetPos = (cursor + 1) % map.length;
    const { catIdx, optIdx } = map[targetPos];

    // Eliminate
    const cat = cats[catIdx];
    const opt = cat.options[optIdx];
    opt.eliminated = true;
    yield { type: 'eliminate', catIdx, optIdx, option: { ...opt } };

    // Lock if one remains
    if (remaining(cat) === 1) {
      cat.locked = true;
      yield { type: 'lock', catIdx };
    }

    // Next cursor is the position *after* the removed item in the new ring
    const newMap = ringMap(cats);
    if (newMap.length === 0) break;
    cursor = targetPos % newMap.length;
  }

  // Winners
  const winners: Record<string, Option> = {};
  cats.forEach(c => {
    const w = c.options.find(o => !o.eliminated);
    if (w) winners[c.id] = { ...w };
  });

  yield { type: 'done', winners };
}
