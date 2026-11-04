// Generador único de cuentas para los ocho juegos de operaciones.
//
// Antes cada juego tenía su propio `generateProblem` con el mismo `switch`
// copiado: unas 330 líneas en total, con cinco tablas de dificultad distintas
// para el mismo concepto. Lo único que cambia de un juego a otro son los
// RANGOS, así que aquí viven los rangos y la lógica vive una vez.
//
// Un juego usa el generador así:
//
//   generateProblem({
//     operation,
//     profile: PROFILES.small,          // o PROFILES.difficulty(difficulty)
//     multiplicationConfig,              // opcional
//     maxTable,                          // tope por dificultad, opcional
//   })
//
// y recibe { a, b, answer, operator }.

import { generateMultiplicationProblem } from './multiplicationProblem';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Rango de una operación. `bFromZero` marca las restas cuyo segundo número va
// de 0 a a-1 en vez de de min a a.
const op = (a, b, extra = {}) => ({ a, b, ...extra });

// --- Perfiles -------------------------------------------------------------

// Los tres juegos con menú de dificultad (Pop de Burbujas, Defensor Espacial
// y El Salto de la Rana) comparten la misma tabla.
// `base` es el rango de multiplicación y división; `sum`, el de suma y resta.
export function difficultyRanges(difficulty) {
  const base =
    difficulty === 'hard' ? { min: 10, max: 20 }
    : difficulty === 'medium' ? { min: 5, max: 12 }
    : { min: 1, max: 9 };
  const sum =
    difficulty === 'hard' ? { min: 20, max: 100 }
    : difficulty === 'medium' ? { min: 10, max: 50 }
    : { min: 1, max: 20 };
  return { base, sum };
}

export const difficultyProfile = (difficulty) => {
  const { base, sum } = difficultyRanges(difficulty);
  return {
    addition: op([sum.min, sum.max], [sum.min, sum.max]),
    subtraction: op([sum.min, sum.max], [sum.min, sum.max]),
    division: { divisor: [base.min, base.max], quotient: [base.min, base.max] },
    multiplication: op([base.min, base.max], [base.min, base.max]),
  };
};

// Los cuatro juegos sin menú de dificultad (Alimenta al Monstruo, Carrera de
// Coches, Math Lander y Mathsteroids) comparten el rango de suma y resta; solo
// se diferencian en división y multiplicación.
const SUM_RANGE = op([1, 20], [1, 20]);
const SUB_RANGE = op([5, 24], [0, 0], { bFromZero: true });

// Alimenta al Monstruo y Carrera de Coches.
export const SMALL_PROFILE = {
  addition: SUM_RANGE,
  subtraction: SUB_RANGE,
  division: { divisor: [1, 9], quotient: [1, 9] },
  multiplication: op([1, 9], [1, 9]),
};

// Math Lander y Mathsteroids.
export const MEDIUM_PROFILE = {
  addition: SUM_RANGE,
  subtraction: SUB_RANGE,
  division: { divisor: [2, 10], quotient: [1, 9] },
  multiplication: op([2, 10], [2, 10]),
};

// Memorama: el nivel ensancha el rango.
export const memoryProfile = (level) => ({
  addition: op([1, 10 * level], [1, 10 * level]),
  // El primer número va de level+5 hasta 11*level+4: el original era
  // floor(random * (10 * level)) + level + 5.
  subtraction: op([level + 5, 11 * level + 4], [0, 0], { bFromZero: true }),
  division: { divisor: [2, 5 * level + 1], quotient: [1, 10] },
  multiplication: op([2, level + 3], [2, 10]),
});

// --- Generador ------------------------------------------------------------

export function generateProblem({
  operation,
  profile,
  multiplicationConfig = null,
  maxTable = Infinity,
}) {
  const ranges = profile[operation] ?? profile.multiplication;

  switch (operation) {
    case 'addition': {
      const a = rand(...ranges.a);
      const b = rand(...ranges.b);
      return { a, b, answer: a + b, operator: '+' };
    }

    case 'subtraction': {
      const a = rand(...ranges.a);
      const b = ranges.bFromZero ? Math.floor(Math.random() * a) : rand(ranges.b[0], a);
      return { a, b, answer: a - b, operator: '-' };
    }

    case 'division': {
      const b = rand(...ranges.divisor);
      const answer = rand(...ranges.quotient);
      return { a: b * answer, b, answer, operator: '÷' };
    }

    case 'multiplication':
    default: {
      // La configuración global manda si el niño ha elegido tablas. Devuelve
      // null cuando no hay configuración utilizable, y entonces cada juego
      // usa su propio rango.
      const fromConfig = generateMultiplicationProblem(multiplicationConfig, maxTable);
      if (fromConfig) {
        return { a: fromConfig.a, b: fromConfig.b, answer: fromConfig.answer, operator: '×' };
      }
      const a = rand(...ranges.a);
      const b = rand(...ranges.b);
      return { a, b, answer: a * b, operator: '×' };
    }
  }
}

// Las tablas que el niño ha elegido y que además caben en la dificultad
// actual. El menú de cada juego enseña estas, no las elegidas a secas: si no,
// el niño ve "Tablas: 15, 16, 17" en fácil y le salen cuentas del 2 al 9.
// Si ninguna cabe, se enseñan las elegidas: es lo que se le va a dar.
export function effectiveTables(multiplicationConfig, maxTable = Infinity) {
  if (!multiplicationConfig || !Array.isArray(multiplicationConfig.tables)) return [];
  const pool = multiplicationConfig.tables.filter((t) => t <= maxTable);
  return pool.length > 0 ? pool : multiplicationConfig.tables;
}

// Texto para el botón de dificultad: qué tablas se van a practicar.
export function tablesHint(multiplicationConfig, difficulty) {
  const tablas = effectiveTables(multiplicationConfig, difficultyRanges(difficulty).base.max);
  if (!tablas.length) return '';
  return `Tablas: ${tablas.join(', ')}`;
}
