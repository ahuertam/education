// Fichas de álgebra: el modelo de Polypad.
//
// Un Expresión es un multiconjunto de fichas. Hay tres tipos:
//   x2  →  x²   (azul)
//   x   →  x    (teal)
//   uno →  1    (naranja)
//
// "x² + 2x + 2" es la bolsa { x2: 1, x: 2, uno: 2 }.
//
// Todo es puro y sin React: la lógica va en funciones y aquí, y el juego solo
// las pinta. Es lo mismo que hace matematicas.js con las fracciones.

// Los tres tipos de ficha, en el orden en que se muestran.
export const TIPOS_FICHA = ['x2', 'x', 'uno'];

export const etiquetaFicha = (tipo) => ({ x2: 'x²', x: 'x', uno: '1' })[tipo];

// El color de cada ficha. Cambian de sitio los de "x²" y "1" con respecto a
// la app original, que usa azul para x², verde para x y amarillo para 1.
export const COLOR_FICHA = { x2: '#4a80c8', x: '#12b3b0', uno: '#ff8a2a' };

export const bolsaVacia = () => ({ x2: 0, x: 0, uno: 0 });

export const anadirFicha = (bolsa, tipo) => ({ ...bolsa, [tipo]: bolsa[tipo] + 1 });

export const quitarFicha = (bolsa, tipo) => ({ ...bolsa, [tipo]: Math.max(0, bolsa[tipo] - 1) });

export const totalFichas = (bolsa) => bolsa.x2 + bolsa.x + bolsa.uno;

// Dos bolsas son la misma si tienen las mismas fichas, sin importar el orden.
export const mismaBolsa = (a, b) => a.x2 === b.x2 && a.x === b.x && a.uno === b.uno;

// La bolsa como expresión: [{ coef, exp }], de mayor grado a menor.
// Los coeficientes 0 se descartan.
export const expresionDeBolsa = (bolsa) =>
  [
    { coef: bolsa.x2, exp: 2 },
    { coef: bolsa.x, exp: 1 },
    { coef: bolsa.uno, exp: 0 },
  ].filter((t) => t.coef > 0);

// Al revés: de una expresión a la bolsa de fichas que la forma.
export const bolsaDeExpresion = (expresion) => {
  const bolsa = bolsaVacia();
  for (const { coef, exp } of expresion) {
    if (exp === 2) bolsa.x2 += coef;
    else if (exp === 1) bolsa.x += coef;
    else bolsa.uno += coef;
  }
  return bolsa;
};

// "x² + 2x + 2". El coeficiente 1 no se pone delante, como se escribe en la
// libreta: x² y no 1x².
const SUPERINDICE = { 2: '²', 3: '³' };

export const formatearExpresion = (expresion) =>
  expresion
    .map(({ coef, exp }) => {
      const base = exp === 0 ? '' : 'x';
      const exponente = exp === 0 || exp === 1 ? '' : SUPERINDICE[exp] ?? `^${exp}`;
      const prefijo = coef === 1 && exp !== 0 ? '' : String(coef);
      return `${prefijo}${base}${exponente}`;
    })
    .join(' + ') || '0';

// Cuánto vale la expresión con ese número en lugar de x.
export const evaluar = (expresion, x) =>
  expresion.reduce((total, { coef, exp }) => total + coef * Math.pow(x, exp), 0);

// El modelo del área de (x + k)².
//
// Un cuadrado partido en cuatro: x·x, x·k, k·x y k·k. Las fichas que caben en
// cada trozo son las que da el modelo.
//
//   (x + k)²  =  x²  +  2kx  +  k²
//
// Con k = 2:  x·x → 1 x²   x·2 → 2 x   2·x → 2 x   2·2 → 4 unos
// Total: 1 x², 4 x y 4 unos, que es x² + 4x + 4.
export const areaCuadrado = (k) => ({
  celdas: [
    { etiqueta: 'x · x', bolsa: { x2: 1, x: 0, uno: 0 } },
    { etiqueta: `x · ${k}`, bolsa: { x2: 0, x: k, uno: 0 } },
    { etiqueta: `${k} · x`, bolsa: { x2: 0, x: k, uno: 0 } },
    { etiqueta: `${k} · ${k}`, bolsa: { x2: 0, x: 0, uno: k * k } },
  ],
  total: { x2: 1, x: 2 * k, uno: k * k },
});

// Una bolsa "bonita" para jugar: pocas fichas y más de un tipo, que si no la
// pregunta es trivial ("¿cuántas fichas hay? una").
export const bolsaAleatoria = (azar, maximo = 4) => {
  const bolsa = bolsaVacia();
  const cuantas = 2 + Math.floor(azar() * (maximo - 1));
  for (let i = 0; i < cuantas; i++) {
    const tipo = TIPOS_FICHA[Math.floor(azar() * TIPOS_FICHA.length)];
    bolsa[tipo] += 1;
  }
  const tiposUsados = TIPOS_FICHA.filter((t) => bolsa[t] > 0);
  if (tiposUsados.length < 2) return { x2: 1, x: 1, uno: 1 };
  return bolsa;
};
