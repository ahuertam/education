// El método Quinzet: cálculo mental automatizado.
//
// La unidad de trabajo es la hoja: 4 columnas de 15 operaciones, 60 cuentas en
// total, y se hacen en dos minutos. Los umbrales también son los del método:
// 55 o más para subir de nivel y menos de 15 para repetir la hoja anterior.
//
// Aquí vive solo lo que se puede probar sin navegador: los rangos de cada
// hoja, el reparto de cuentas y los distractores. El juego es el que las va
// enseñando una a una.

import { generateProblem } from '../../utils/problemGenerator';

export const COLUMNAS = 4;
export const POR_COLUMNA = 15;
export const OPERACIONES_HOJA = COLUMNAS * POR_COLUMNA; // 60
export const SEGUNDOS_HOJA = 120;
export const UMBRAL_SUBIR = 55;
export const UMBRAL_REPETIR = 15;

// Las hojas, de menos a más. Cada una tiene su familia de operaciones y sus
// rangos: los del método (sumas y restas del 1 al 20, tablas hasta el 12).
//
// `perfiles` es lo que entiende el generador compartido. La multiplicación no
// está ahí: la hace `cuenta()`, porque el multiplicando es la tabla que
// eligió el niño.
export const HOJAS = [
  {
    id: 1,
    emoji: '➕',
    titulo: 'Hoja 1 · 1º',
    ayuda: 'Sumas y restas del 1 al 20. La primera hoja del método.',
    categorias: ['addition', 'subtraction'],
    operaciones: ['addition', 'subtraction'],
    perfiles: {
      addition: { a: [1, 20], b: [1, 20] },
      subtraction: { a: [5, 24], b: [0, 0], bFromZero: true },
    },
  },
  {
    id: 2,
    emoji: '✖️',
    titulo: 'Hoja 2 · 2º',
    ayuda: 'Las tablas de multiplicar, con la tabla que hayas elegido.',
    categorias: ['multiplication'],
    operaciones: ['multiplication'],
    topeTablas: 10,
  },
  {
    id: 3,
    emoji: '💯',
    titulo: 'Hoja 3 · 3º',
    ayuda: 'Sumas y restas de dos cifras, hasta 100.',
    categorias: ['addition', 'mixed_math'],
    operaciones: ['addition', 'subtraction'],
    perfiles: {
      addition: { a: [10, 50], b: [10, 50] },
      subtraction: { a: [20, 100], b: [0, 0], bFromZero: true },
    },
  },
  {
    id: 4,
    emoji: '🎲',
    titulo: 'Hoja 4 · 4º',
    ayuda: 'Las cuatro operaciones: sumas, restas, multiplicaciones y divisiones.',
    categorias: ['mixed_math', 'addition', 'subtraction', 'multiplication'],
    operaciones: ['addition', 'subtraction', 'multiplication', 'division'],
    topeTablas: 12,
    perfiles: {
      addition: { a: [1, 100], b: [1, 100] },
      subtraction: { a: [10, 100], b: [0, 0], bFromZero: true },
      division: { divisor: [2, 12], quotient: [2, 12] },
    },
  },
];

const revueltos = (lista) => {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Las tablas que tocan: las que eligió el niño si caben en el método; si solo
// eligió tablas de más, manda el método.
export const tablasDe = (config, tope) => {
  const elegidas = (config?.tables ?? []).filter(
    (t) => Number.isInteger(t) && t >= 1 && t <= tope
  );
  return elegidas.length > 0
    ? elegidas
    : Array.from({ length: tope }, (_, i) => i + 1);
};

// La resta: nunca "menos cero" ni "menos el mismo número". En una hoja de dos
// minutos, esas dos cuentas son dos huecos perdidos.
const resta = (rango) => {
  const a = rango.a[0] + Math.floor(Math.random() * (rango.a[1] - rango.a[0] + 1));
  const b = 1 + Math.floor(Math.random() * (a - 1));
  return { a, b, answer: a - b, operator: '-' };
};

// Una cuenta de la hoja. Las sumas y las divisiones salen del generador
// compartido; las multiplicaciones las hace esta, con la tabla del niño.
const cuenta = (operation, h, config) => {
  if (operation === 'multiplication') {
    const tablas = tablasDe(config, h.topeTablas ?? 10);
    const a = tablas[Math.floor(Math.random() * tablas.length)];
    const b = 1 + Math.floor(Math.random() * 10);
    return { a, b, answer: a * b, operator: '×' };
  }
  if (operation === 'subtraction') return resta(h.perfiles.subtraction);
  return generateProblem({ operation, profile: h.perfiles });
};

// Las 60 cuentas de una hoja, en el orden en que salen.
export function hoja(id, config = null) {
  const h = HOJAS.find((x) => x.id === id) || HOJAS[0];
  const cuentas = [];
  for (let i = 0; i < OPERACIONES_HOJA; i++) {
    const operation = h.operaciones[i % h.operaciones.length];
    cuentas.push(cuenta(operation, h, config));
  }
  return cuentas;
}

// La cuenta escrita: "8 + 3".
export const textoCuenta = (c) => `${c.a} ${c.operator} ${c.b}`;

// Cuatro opciones: la correcta y tres fallos típicos (cambiar el signo,
// cambiar la operación, equivocarse en uno o en diez).
export function opciones(c) {
  const { a, b, answer } = c;
  const candidatos = [
    a - b, a + b, answer + 1, answer - 1, answer + 10, answer - 10,
    answer + 2, answer - 2,
  ];
  const fallos = [];
  for (const valor of revueltos(candidatos)) {
    if (!Number.isInteger(valor) || valor < 0 || valor === answer || fallos.includes(valor)) continue;
    fallos.push(valor);
    if (fallos.length === 3) break;
  }
  return revueltos([answer, ...fallos]);
}

// El veredicto del método: 55 o más para subir de nivel, menos de 15 para
// repetir la hoja anterior.
export function veredicto(aciertos) {
  if (aciertos >= UMBRAL_SUBIR) {
    return {
      accion: 'sube',
      titulo: '🏅 ¡Subes de nivel!',
      texto: `Has hecho ${UMBRAL_SUBIR} o más cuentas en dos minutos. A la próxima, una hoja más difícil.`,
    };
  }
  if (aciertos < UMBRAL_REPETIR) {
    return {
      accion: 'repite',
      titulo: '🔁 Toca repetir',
      texto: `Menos de ${UMBRAL_REPETIR}. Repite la hoja anterior hasta que te salga sola.`,
    };
  }
  return {
    accion: 'sigue',
    titulo: '🎉 ¡Hoja superada!',
    texto: 'Ahora te toca la siguiente hoja.',
  };
}
