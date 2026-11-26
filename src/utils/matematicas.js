// Utilidades matemáticas puras para los juegos nuevos: fracciones, modelo de
// área (productos parciales) y valor posicional (base diez).
//
// Sin React, sin estado y sin efectos: son funciones puras, así que se pueden
// probar sin montar nada (ver matematicas.test.js).

/** Máximo común divisor por el algoritmo de Euclides. */
export const mcd = (a, b) => (b === 0 ? Math.abs(a) : mcd(b, a % b));

/** Simplifica una fracción { n, d }. */
export const simplificar = ({ n, d }) => {
  const g = mcd(n, d) || 1;
  return { n: n / g, d: d / g };
};

/**
 * ¿Son equivalentes dos fracciones? Se responde con producto cruzado, sin
 * tocar decimales: así 2/4 y 1/2 son equivalentes de verdad.
 */
export const sonEquivalentes = (a, b) => a.n * b.d === b.n * a.d;

/** Compara dos fracciones: -1 si a < b, 0 si a === b, 1 si a > b. */
export const compararFracciones = (a, b) => {
  const izq = a.n * b.d;
  const der = b.n * a.d;
  if (izq === der) return 0;
  return izq < der ? -1 : 1;
};

/** Escribe una fracción: "3/5" y, si el denominador es 1, solo "4". */
export const formatearFraccion = ({ n, d }) => (d === 1 ? String(n) : `${n}/${d}`);

/** Número con formato español: 1.234,5 */
export const numeroES = (n) => n.toLocaleString('es-ES');

/** Mínimo común múltiplo. */
export const mcm = (a, b) => (a === 0 || b === 0 ? 0 : Math.abs(a * b) / mcd(a, b));

/** Parte un número en decenas y unidades. */
export const partesEnDiez = (n) => ({ decenas: Math.floor(n / 10), unidades: n % 10 });

/**
 * Modelo de área: a × b = (decenas de a × b) + (unidades de a × b).
 * Es lo que el niño ve en la rejilla y lo que tiene que saber escribir.
 */
export const productosParciales = (a, b) => {
  const { decenas, unidades } = partesEnDiez(a);
  const pDecenas = decenas * 10 * b;
  const pUnidades = unidades * b;
  return { decenas, unidades, pDecenas, pUnidades, total: pDecenas + pUnidades };
};

/** Descompone un número en centenas, decenas y unidades. */
export const baseDiez = (n) => ({
  centenas: Math.floor(n / 100),
  decenas: Math.floor((n % 100) / 10),
  unidades: n % 10,
});

/** Vuelve a componer el número desde sus partes. */
export const componerBaseDiez = ({ centenas, decenas, unidades }) =>
  centenas * 100 + decenas * 10 + unidades;

/** Redondea a la decena (orden 1) o a la centena (orden 2). */
export const redondear = (n, orden) => {
  const paso = 10 ** orden;
  return Math.round(n / paso) * paso;
};

/**
 * Cuatro opciones numéricas: la correcta y tres parecidas.
 *
 * `candidatas` son los fallos que tienen sentido para esa cuenta (sumar en vez
 * de restar, cambiar el orden de las cifras...). Si no llegan a cuatro, se
 * inventan alrededor de la correcta.
 */
export const opcionesNumericas = (correcto, candidatas = []) => {
  const vistas = new Set([String(correcto)]);
  const out = [correcto];
  for (const c of candidatas) {
    if (out.length >= 4) break;
    if (!Number.isFinite(c) || c < 0 || vistas.has(String(c))) continue;
    vistas.add(String(c));
    out.push(c);
  }
  let intentos = 0;
  while (out.length < 4 && intentos < 60) {
    intentos++;
    const c = correcto + Math.floor(Math.random() * 81) - 40;
    if (c < 0 || vistas.has(String(c))) continue;
    vistas.add(String(c));
    out.push(c);
  }
  // Barajadas: la correcta no siempre en el mismo sitio.
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// --- Geoboard -------------------------------------------------------------

/**
 * Área de un polígono por la fórmula del cordón. Con los vértices en la
 * rejilla y lados recto, el resultado siempre es un número entero de casillas.
 */
export const areaPoligono = (puntos) => {
  if (puntos.length < 3) return 0;
  let suma = 0;
  for (let i = 0; i < puntos.length; i++) {
    const [x1, y1] = puntos[i];
    const [x2, y2] = puntos[(i + 1) % puntos.length];
    suma += x1 * y2 - x2 * y1;
  }
  return Math.abs(suma) / 2;
};

/** Perímetro de un polígono: la suma de la longitud de los lados. */
export const perimetroPoligono = (puntos) => {
  let total = 0;
  for (let i = 0; i < puntos.length; i++) {
    const [x1, y1] = puntos[i];
    const [x2, y2] = puntos[(i + 1) % puntos.length];
    total += Math.hypot(x2 - x1, y2 - y1);
  }
  return total;
};

// --- El número que falta ---------------------------------------------------

/**
 * Las cuatro operaciones, con los signos tipográficos que se usan en la
 * libreta. OJO: el signo menos es U+2212 (−), no el guion ASCII (-). Si se
 * mezclan, las comparaciones fallan en silencio.
 */
export const OPERACIONES = ['+', '−', '×', '÷'];

/** Aplica una operación. Devuelve null si no se puede (dividir por cero). */
export const aplicarOperacion = (op, a, b) => {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? null : a / b;
    default: return null;
  }
};

/**
 * La operación inversa: dado "a op b = c", el número que falta.
 * Devuelve null si no hay solución entera (o si no se puede dividir).
 */
export const despejarOperando = (op, a, c) => {
  switch (op) {
    case '+': return c - a;
    case '−': return a - c;
    case '×': return a === 0 || c % a !== 0 ? null : c / a;
    case '÷': return c === 0 || a % c !== 0 ? null : a / c;
    default: return null;
  }
};

/**
 * Qué operaciones de las cuatro cumplen "a op b = c".
 * Puede haber más de una: 2 + 2 = 4 y también 2 × 2 = 4. El generador de
 * preguntas tiene que descartar esos casos o la pregunta es ambigua.
 */
export const operacionesQueCumplen = (a, b, c) =>
  OPERACIONES.filter((op) => {
    const resultado = aplicarOperacion(op, a, b);
    return resultado !== null && resultado === c;
  });

/**
 * Todas las formas de partir n en dos números positivos.
 * Se usa para las familias numéricas: 4, 6 y 10 son familia porque
 * 4 + 6 = 10.
 */
export const particionesDe = (n) => {
  const salida = [];
  for (let a = 1; a < n; a++) salida.push({ a, b: n - a });
  return salida;
};
