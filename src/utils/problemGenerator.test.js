// Test diferencial del generador compartido.
//
// Cada juego tenía su propio `generateProblem` copiado. Este test mantiene
// esas implementaciones antiguas como REFERENCIA y comprueba que el
// generador compartido produce exactamente el mismo conjunto de cuentas
// alcanzables. Si un solo par (a, b) aparece o desaparece, el test falla.
//
// Para que la comparación sea exacta se sustituye Math.random por un PRNG con
// semilla: las dos implementaciones reciben la misma secuencia de números.

import {
  generateProblem,
  difficultyProfile,
  SMALL_PROFILE,
  MEDIUM_PROFILE,
  memoryProfile,
} from './problemGenerator';
import { generateMultiplicationProblem } from './multiplicationProblem';

// --- PRNG con semilla -----------------------------------------------------

function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    // xorshift32
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

function withSeed(seed, fn) {
  const original = Math.random;
  Math.random = seededRandom(seed);
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

const collect = (fn, iterations = 4000) => {
  const seen = new Set();
  for (let i = 0; i < iterations; i++) {
    const r = fn();
    seen.add(`${r.a}|${r.b}`);
  }
  return seen;
};


// --- Implementaciones de referencia (las antiguas, copiadas tal cual) ------

const randRef = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// BubblePop / SpaceDefender / FrogJump
function refDifficulty(operation, difficulty, multConfig, maxTable) {
  let a, b, answer, operator;
  let min, max;
  switch (difficulty) {
    case 'hard':
      min = 10; max = 20;
      if (operation === 'addition' || operation === 'subtraction') { min = 20; max = 100; }
      break;
    case 'medium':
      min = 5; max = 12;
      if (operation === 'addition' || operation === 'subtraction') { min = 10; max = 50; }
      break;
    case 'easy':
    default:
      min = 1; max = 9;
      if (operation === 'addition' || operation === 'subtraction') { min = 1; max = 20; }
  }
  switch (operation) {
    case 'addition':
      a = randRef(min, max); b = randRef(min, max); answer = a + b; operator = '+';
      break;
    case 'subtraction':
      a = randRef(min, max); b = Math.floor(Math.random() * (a - min + 1)) + min;
      answer = a - b; operator = '-';
      break;
    case 'division':
      b = randRef(min, max); answer = randRef(min, max); a = b * answer; operator = '÷';
      break;
    case 'multiplication':
    default:
      if (operation === 'multiplication' && multConfig && multConfig.tables && multConfig.tables.length > 0) {
        const f = generateMultiplicationProblem(multConfig, maxTable);
        if (f) { a = f.a; b = f.b; answer = f.answer; operator = '×'; break; }
      }
      a = randRef(min, max); b = randRef(min, max); answer = a * b; operator = '×';
  }
  return { a, b, answer, operator };
}

// MonsterFeeder / CarRacing
function refSmall(operation, multConfig) {
  let a, b, answer, operator;
  const min = 1, max = 9;
  switch (operation) {
    case 'addition':
      a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 20) + 1;
      answer = a + b; operator = '+';
      break;
    case 'subtraction':
      a = Math.floor(Math.random() * 20) + 5; b = Math.floor(Math.random() * a);
      answer = a - b; operator = '-';
      break;
    case 'division':
      b = randRef(min, max); answer = randRef(min, max); a = b * answer; operator = '÷';
      break;
    case 'multiplication':
    default:
      if (multConfig && multConfig.tables && multConfig.tables.length > 0) {
        const f = generateMultiplicationProblem(multConfig);
        if (f) { a = f.a; b = f.b; answer = f.answer; operator = '×'; break; }
      }
      a = randRef(min, max); b = randRef(min, max); answer = a * b; operator = '×';
  }
  return { a, b, answer, operator };
}

// MathLander / Mathsteroids
function refMedium(operation, multConfig) {
  let a, b, answer, operator;
  switch (operation) {
    case 'addition':
      a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 20) + 1;
      answer = a + b; operator = '+';
      break;
    case 'subtraction':
      a = Math.floor(Math.random() * 20) + 5; b = Math.floor(Math.random() * a);
      answer = a - b; operator = '-';
      break;
    case 'division':
      b = Math.floor(Math.random() * 9) + 2; answer = Math.floor(Math.random() * 9) + 1;
      a = b * answer; operator = '÷';
      break;
    case 'multiplication':
    default:
      if (multConfig && multConfig.tables && multConfig.tables.length > 0) {
        const f = generateMultiplicationProblem(multConfig);
        if (f) { a = f.a; b = f.b; answer = f.answer; operator = '×'; break; }
      }
      a = Math.floor(Math.random() * 9) + 2; b = Math.floor(Math.random() * 9) + 2;
      answer = a * b; operator = '×';
  }
  return { a, b, answer, operator };
}

// MemoryGame
function refMemory(operation, level, multConfig) {
  let a, b, answer, operator;
  switch (operation) {
    case 'addition': {
      const a1 = Math.floor(Math.random() * (10 * level)) + 1;
      const b1 = Math.floor(Math.random() * (10 * level)) + 1;
      a = a1; b = b1; answer = a1 + b1; operator = '+';
      break;
    }
    case 'subtraction': {
      const a2 = Math.floor(Math.random() * (10 * level)) + level + 5;
      const b2 = Math.floor(Math.random() * a2);
      a = a2; b = b2; answer = a2 - b2; operator = '-';
      break;
    }
    case 'division': {
      const b3 = Math.floor(Math.random() * (5 * level)) + 2;
      const a3 = b3 * (Math.floor(Math.random() * 10) + 1);
      a = a3; b = b3; answer = a3 / b3; operator = '÷';
      break;
    }
    case 'multiplication':
    default:
      if (multConfig && multConfig.tables && multConfig.tables.length > 0) {
        const f = generateMultiplicationProblem(multConfig, level + 2);
        if (f) { a = f.a; b = f.b; answer = f.answer; operator = '×'; break; }
      }
      a = Math.floor(Math.random() * (level + 2)) + 2;
      b = Math.floor(Math.random() * 9) + 2;
      answer = a * b; operator = '×';
  }
  return { a, b, answer, operator };
}

// --- Tests ----------------------------------------------------------------

const OPERATIONS = ['addition', 'subtraction', 'division', 'multiplication'];

describe('generateProblem reproduce las cuentas de cada juego', () => {
  it.each(OPERATIONS)('juegos con dificultad, %s', (operation) => {
    for (const difficulty of ['easy', 'medium', 'hard']) {
      const expected = withSeed(42, () =>
        collect(() => refDifficulty(operation, difficulty, null, Infinity)));
      const actual = withSeed(42, () =>
        collect(() => generateProblem({
          operation,
          profile: difficultyProfile(difficulty),
        })));
      expect(actual).toEqual(expected);
    }
  });

  it.each(OPERATIONS)('juegos de rango pequeño, %s', (operation) => {
    const expected = withSeed(7, () => collect(() => refSmall(operation, null)));
    const actual = withSeed(7, () =>
      collect(() => generateProblem({ operation, profile: SMALL_PROFILE })));
    expect(actual).toEqual(expected);
  });

  it.each(OPERATIONS)('juegos de rango medio, %s', (operation) => {
    const expected = withSeed(11, () => collect(() => refMedium(operation, null)));
    const actual = withSeed(11, () =>
      collect(() => generateProblem({ operation, profile: MEDIUM_PROFILE })));
    expect(actual).toEqual(expected);
  });

  it.each(OPERATIONS)('memorama por nivel, %s', (operation) => {
    for (const level of [1, 2, 3]) {
      const expected = withSeed(99, () => collect(() => refMemory(operation, level, null)));
      const actual = withSeed(99, () =>
        collect(() => generateProblem({ operation, profile: memoryProfile(level) })));
      expect(actual).toEqual(expected);
    }
  });
});

describe('generateProblem con la configuración de multiplicación', () => {
  const config = { tables: [1, 2, 3, 12, 15, 20], digitMode: 2 };

  it.each([
    ['dificultad', () => difficultyProfile('hard'), 20],
    ['rango pequeño', () => SMALL_PROFILE, Infinity],
    ['rango medio', () => MEDIUM_PROFILE, Infinity],
    ['memorama', () => memoryProfile(3), 5],
  ])('usa las tablas elegidas en %s', (_nombre, profile, maxTable) => {
    const r = generateProblem({
      operation: 'multiplication',
      profile: profile(),
      multiplicationConfig: config,
      maxTable,
    });
    expect(r.operator).toBe('×');
    expect(r.answer).toBe(r.a * r.b);
    // La tabla usada sale de las elegidas; si el tope deja alguna dentro, sale
    // de las que caben en la dificultad.
    const caben = config.tables.filter((t) => t <= maxTable);
    expect(caben.length ? caben : config.tables).toContain(r.a);
  });

  it('cae al rango del juego si la configuración no es utilizable', () => {
    const r = generateProblem({
      operation: 'multiplication',
      profile: SMALL_PROFILE,
      multiplicationConfig: { tables: [], digitMode: 1 },
    });
    expect(r.a).toBeGreaterThanOrEqual(1);
    expect(r.a).toBeLessThanOrEqual(9);
    expect(r.b).toBeGreaterThanOrEqual(1);
    expect(r.b).toBeLessThanOrEqual(9);
  });

  it('respeta las tablas elegidas aunque no quepan en la dificultad', () => {
    // El niño eligió solo tablas del 15 al 20 y pulsa "fácil" (tope 9).
    // Antes el pool quedaba vacío y el juego le daba cuentas de su propio
    // rango en silencio. Ahora le da las que pidió.
    const config = { tables: [15, 16, 17, 18, 19, 20], digitMode: 1 };
    for (let i = 0; i < 200; i++) {
      const r = generateProblem({
        operation: 'multiplication',
        profile: difficultyProfile('easy'),
        multiplicationConfig: config,
        maxTable: 9,
      });
      expect(r.a).toBeGreaterThanOrEqual(15);
      expect(r.a).toBeLessThanOrEqual(20);
    }
  });

  it('sí recorta las tablas que no encajan cuando hay otras que sí', () => {
    const config = { tables: [1, 2, 15, 16, 17, 18, 19, 20], digitMode: 1 };
    const vistos = new Set();
    for (let i = 0; i < 500; i++) {
      const r = generateProblem({
        operation: 'multiplication',
        profile: difficultyProfile('easy'),
        multiplicationConfig: config,
        maxTable: 9,
      });
      vistos.add(r.a);
    }
    expect([...vistos].sort((x, y) => x - y)).toEqual([1, 2]);
  });
});

describe('invariantes de las cuentas', () => {
  const perfiles = [
    ['dificultad fácil', difficultyProfile('easy')],
    ['dificultad media', difficultyProfile('medium')],
    ['dificultad difícil', difficultyProfile('hard')],
    ['rango pequeño', SMALL_PROFILE],
    ['rango medio', MEDIUM_PROFILE],
    ['memorama 1', memoryProfile(1)],
    ['memorama 4', memoryProfile(4)],
  ];

  it.each(perfiles)('%s: la resta nunca es negativa', (_n, profile) => {
    for (let i = 0; i < 300; i++) {
      const r = generateProblem({ operation: 'subtraction', profile });
      expect(r.answer).toBeGreaterThanOrEqual(0);
      expect(r.answer).toBe(r.a - r.b);
    }
  });

  it.each(perfiles)('%s: la división es exacta', (_n, profile) => {
    for (let i = 0; i < 300; i++) {
      const r = generateProblem({ operation: 'division', profile });
      expect(r.b).not.toBe(0);
      expect(r.a % r.b).toBe(0);
      expect(r.answer).toBe(r.a / r.b);
    }
  });

  it.each(perfiles)('%s: la suma y la multiplicación cuadran', (_n, profile) => {
    for (let i = 0; i < 300; i++) {
      const s = generateProblem({ operation: 'addition', profile });
      expect(s.answer).toBe(s.a + s.b);
      const m = generateProblem({ operation: 'multiplication', profile });
      expect(m.answer).toBe(m.a * m.b);
    }
  });
});
