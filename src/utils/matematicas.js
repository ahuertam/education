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
