import { generateLevel } from './levelGenerator';
import { validateLevel } from './solvability';

describe('FireWater procedural level', () => {
  test('generates deterministically by seed+difficulty', () => {
    const a = generateLevel({ seed: 'aula-7', difficulty: 'easy' });
    const b = generateLevel({ seed: 'aula-7', difficulty: 'easy' });
    const c = generateLevel({ seed: 'aula-7', difficulty: 'hard' });

    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  test('always validates for a set of seeds', () => {
    const cases = [
      { seed: 'demo1', difficulty: 'easy' },
      { seed: 'demo2', difficulty: 'medium' },
      { seed: 'demo3', difficulty: 'hard' },
      { seed: 'clase-2026', difficulty: 'medium' },
      { seed: 'x', difficulty: 'easy' }
    ];

    for (const t of cases) {
      const lvl = generateLevel(t);
      const v = validateLevel(lvl);
      if (!v.ok) {
        throw new Error(`Nivel inválido para ${t.seed}/${t.difficulty}: ${v.reasons.join(', ')}`);
      }
      expect(v.ok).toBe(true);
    }
  });
});
