// Helper compartido para generar problemas de multiplicación
// respetando la configuración global de tablas (1-20) y cifras (1-3).
//
// `config` tiene la forma:
//   { tables: number[], digitMode: 1 | 2 | 3 }
//
// - `a` (multiplicador) se elige al azar de `tables`.
// - `b` (multiplicando) es 1 cifra (1-9) si `a < 10`.
//   Si `a >= 10`, `b` se genera según `digitMode`:
//     1 → 1-9, 2 → 10-99, 3 → 100-999.

export function randomByDigits(a, digitMode) {
  if (a < 10) {
    // Tablas pequeñas: siempre 1 cifra
    return Math.floor(Math.random() * 9) + 1;
  }
  switch (digitMode) {
    case 2:
      return Math.floor(Math.random() * 90) + 10;   // 10-99
    case 3:
      return Math.floor(Math.random() * 900) + 100; // 100-999
    case 1:
    default:
      return Math.floor(Math.random() * 9) + 1;     // 1-9
  }
}

// Devuelve { a, b, answer, text } listo para usar en cualquier juego.
// Si `config` no trae tablas o no es válido, devuelve `null` y el juego
// debe usar su propio fallback (min/max hardcodeado por dificultad).
//
// `maxTable` es el tope de la dificultad del juego (fácil 9, media 12, difícil 20).
// Las tablas por encima del tope se descartan, de modo que el selector de
// dificultad de cada juego sigue mandando sobre qué tablas entran.
// Si el jugador solo ha elegido tablas por encima del tope, devuelve `null` y el
// juego cae a su propio rango.
export function generateMultiplicationProblem(config, maxTable = Infinity) {
  if (!config || !Array.isArray(config.tables) || config.tables.length === 0) {
    return null;
  }
  const { digitMode } = config;
  const pool = config.tables.filter(t => t <= maxTable);
  if (pool.length === 0) {
    return null;
  }
  const a = pool[Math.floor(Math.random() * pool.length)];
  const b = randomByDigits(a, digitMode);
  const answer = a * b;
  return {
    a,
    b,
    answer,
    text: `${a} × ${b}`,
  };
}
