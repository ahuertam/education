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
export function opciones(respuesta, tipicas = []) {
  const candidatos = [
    ...tipicas,
    respuesta + 1, respuesta - 1, respuesta + 10, respuesta - 10,
    respuesta + 2, respuesta - 2,
  ];
  const fallos = [];
  for (const valor of revueltos(candidatos)) {
    if (!Number.isInteger(valor) || valor < 0 || valor === respuesta || fallos.includes(valor)) continue;
    fallos.push(valor);
    if (fallos.length === 3) break;
  }
  return revueltos([respuesta, ...fallos]);
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

// --- El mercadillo: el cálculo global del método --------------------------
//
// La otra mitad del método: no automatizar la cuenta, sino elegir la
// estrategia y aplicarla. Cada problema trae sus pasos —lo que hay que
// responder, en orden— porque no se valida solo el resultado final: se valida
// el camino.

export const ESTRATEGIAS = [
  { id: 'doble', nombre: 'Doble y mitad', emoji: '✌️', explica: 'Duplicar es más rápido que multiplicar.' },
  { id: 'x10', nombre: '×10 y ÷10', emoji: '🔟', explica: 'Pon un cero o quítalo.' },
  { id: 'complemento', nombre: 'Complemento a 10', emoji: '🧩', explica: 'Completa hasta 10 y luego suma.' },
  { id: 'redondo', nombre: 'Número redondo', emoji: '🔵', explica: 'Rodea a 10 o a 100 y corrige.' },
  { id: 'reparto', nombre: 'Reparto en partes', emoji: '🍬', explica: 'Dividir es repartir en partes iguales.' },
];

// Los puestos del mercado. Cada problema se compra en uno. Los dibujos son
// los del huerto: public/huerto/.
export const PUESTOS = [
  { nombre: 'la frutería', emoji: '🍎', svg: 'fruto.svg', producto: 'ciruelas' },
  { nombre: 'el puesto de semillas', emoji: '🌰', svg: 'semilla.svg', producto: 'semillas' },
  { nombre: 'el vivero', emoji: '🪴', svg: 'planta.svg', producto: 'plantas' },
  { nombre: 'la fuente', emoji: '💧', svg: 'gota.svg', producto: 'gotas' },
];

const rnd = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const puestoAlAzar = () => PUESTOS[rnd(0, PUESTOS.length - 1)];

// Multiplicar por 2 o por 4: duplicar.
const problemaDoble = () => {
  const puesto = puestoAlAzar();
  const bolsas = rnd(2, 5);
  const porBolsa = Math.random() < 0.5 ? 2 : 4;
  const total = bolsas * porBolsa;
  return {
    puesto,
    enunciado: `En ${puesto.nombre} compras ${bolsas} bolsas de ${porBolsa} ${puesto.producto}. ¿Cuántas llevas?`,
    estrategia: 'doble',
    pasos: porBolsa === 2
      ? [{ texto: `Duplica ${bolsas}: ${bolsas} + ${bolsas}`, respuesta: total }]
      : [
          { texto: `Duplica ${bolsas}: ${bolsas} + ${bolsas}`, respuesta: bolsas * 2 },
          { texto: `Vuelve a duplicar: ${bolsas * 2} + ${bolsas * 2}`, respuesta: total },
        ],
    resultado: total,
    total,
  };
};

// Multiplicar por 10: poner un cero.
const problemaX10 = () => {
  const puesto = puestoAlAzar();
  const bolsas = rnd(2, 9);
  return {
    puesto,
    enunciado: `En ${puesto.nombre} compras ${bolsas} bolsas de 10 ${puesto.producto}. ¿Cuántas llevas?`,
    estrategia: 'x10',
    pasos: [{ texto: `Pon un cero al ${bolsas}: ${bolsas} → ?`, respuesta: bolsas * 10 }],
    resultado: bolsas * 10,
    total: bolsas * 10,
  };
};

// Sumar un número cercano al 10: completar hasta 10.
const problemaComplemento = () => {
  const puesto = puestoAlAzar();
  const a = rnd(6, 9);
  const b = rnd(11 - a, 9);
  return {
    puesto,
    enunciado: `En ${puesto.nombre} pides ${a} ${puesto.producto} y luego ${b} más. ¿Cuántas llevas?`,
    estrategia: 'complemento',
    pasos: [
      { texto: `Completa el ${a} hasta 10: ¿cuánto falta?`, respuesta: 10 - a },
      { texto: `Ahora suma: 10 + ${b} = ?`, respuesta: a + b },
    ],
    resultado: a + b,
    total: a + b,
  };
};

// Restar de 100: redondear y corregir.
const problemaRedondo = () => {
  const puesto = puestoAlAzar();
  const gastado = rnd(23, 89);
  const decenas = Math.ceil(gastado / 10) * 10;
  const primero = 100 - decenas;
  return {
    puesto,
    enunciado: `En ${puesto.nombre} te dan 100 ${puesto.producto} y te llevas ${gastado}. ¿Cuántas te quedan?`,
    estrategia: 'redondo',
    pasos: [
      { texto: `Rodea el ${gastado} a ${decenas}: 100 − ${decenas} = ?`, respuesta: primero },
      { texto: `Suma lo que sobró: ${primero} + ${decenas - gastado} = ?`, respuesta: 100 - gastado },
    ],
    resultado: 100 - gastado,
    total: 100 - gastado,
  };
};

// Dividir: repartir en partes iguales.
const problemaReparto = () => {
  const puesto = puestoAlAzar();
  const partes = rnd(2, 5);
  const porParte = rnd(2, 9);
  return {
    puesto,
    enunciado: `En ${puesto.nombre} reparten ${partes * porParte} ${puesto.producto} en ${partes} bolsas iguales. ¿Cuántas lleva cada bolsa?`,
    estrategia: 'reparto',
    pasos: [{ texto: `Reparte ${partes * porParte} en ${partes} partes iguales: ¿cuántas en cada una?`, respuesta: porParte }],
    // Aquí la respuesta es lo que lleva cada bolsa, no la compra entera.
    resultado: porParte,
    total: partes * porParte,
  };
};

const GENERADORES = [problemaDoble, problemaX10, problemaComplemento, problemaRedondo, problemaReparto];

// Las rondas del mercadillo: cada una con su problema, sus pasos y las tres
// tarjetas de estrategia (la buena y dos señuelos).
export function mercado(cuantas = 8) {
  const rondas = [];
  for (let i = 0; i < cuantas; i++) {
    const problema = GENERADORES[i % GENERADORES.length]();
    const buena = ESTRATEGIAS.find((e) => e.id === problema.estrategia);
    const otras = ESTRATEGIAS.filter((e) => e.id !== problema.estrategia);
    const tarjetas = revueltos([buena, ...revueltos(otras).slice(0, 2)]);
    rondas.push({ ...problema, tarjetas });
  }
  return rondas;
}
