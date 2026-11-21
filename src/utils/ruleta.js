// La Ruleta y los Dados: los generadores de ronda.
//
// La lógica vive aquí para que se pueda testear sin navegador. Lo que sale
// mal en este juego es que la respuesta marcada no sea la que se ve en la
// ruleta, y eso solo se comprueba mirando los datos.
//
// ponytail: el azar entra por parámetro. Sin eso no se puede comprobar que
// dos partidas con la misma semilla dan lo mismo.

import { casosDe, compararProbabilidades, formatearProbabilidad } from './probabilidad';

export const RONDAS = 8;

// Los colores de la ruleta. Se eligieron los del ábaco: rojo, azul y
// amarillo, que son los que el niño ya conoce.
export const COLORES = [
  { nombre: 'rojo', color: '#e05555' },
  { nombre: 'azul', color: '#4a80c8' },
  { nombre: 'amarillo', color: '#f0b429' },
];

// Las caras del dado. Son texto para que el número de la opción y el de la
// cara sean el mismo valor y se puedan comparar.
export const CARAS = ['1', '2', '3', '4', '5', '6'];

export const crearAzar = (semilla) => {
  let s = semilla >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
};

export const colorDe = (nombre) => COLORES.find((c) => c.nombre === nombre)?.color ?? '#5b7286';

// Reparte n sectores entre los colores: cada reparto posible, barajado.
const repartosDe = (n, colores) => {
  const resultado = [];
  const actual = {};
  const repartir = (indice, quedan) => {
    if (indice === colores.length - 1) {
      actual[colores[indice]] = quedan;
      resultado.push({ ...actual });
      return;
    }
    for (let i = 0; i <= quedan; i++) {
      actual[colores[indice]] = i;
      repartir(indice + 1, quedan - i);
    }
    delete actual[colores[indice]];
  };
  repartir(0, n);
  return resultado.filter((r) => Object.values(r).every((v) => v > 0));
};

// Una ruleta con n sectores repartidos entre los colores. Cada sector es un
// color, así que la lista de sectores ES el espacio muestral.
export const ruletaCon = (azar, sectores = 8) => {
  const reparto = repartosDe(sectores, COLORES.map((c) => c.nombre));
  const elegido = reparto[Math.floor(azar() * reparto.length)];
  const lista = [];
  for (const [color, cuantos] of Object.entries(elegido)) {
    for (let i = 0; i < cuantos; i++) lista.push(color);
  }
  // Barajados, para que los sectores del mismo color no salgan juntos.
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
};

// El valor que sale más a menudo. Si hay empate devuelve null: la pregunta
// "¿qué color sale más?" no tiene respuesta única y hay que tirar otra vez.
export const masFrecuente = (sectores, valores = COLORES.map((c) => c.nombre)) => {
  const cuentas = valores.map((v) => ({ valor: v, n: casosDe(sectores, v) }));
  const max = Math.max(...cuentas.map((c) => c.n));
  const ganadores = cuentas.filter((c) => c.n === max);
  return ganadores.length === 1 ? ganadores[0].valor : null;
};

// Dos colores distintos, al azar.
const dosColores = (azar) => {
  const a = Math.floor(azar() * COLORES.length);
  let b = Math.floor(azar() * COLORES.length);
  if (b === a) b = (b + 1) % COLORES.length;
  return [COLORES[a].nombre, COLORES[b].nombre];
};

// --- Generadores de ronda -------------------------------------------------

// Leer: qué color sale más a menudo.
export const rondaLeer = (azar) => {
  const sectores = ruletaCon(azar);
  // La respuesta es el color que más sale, no uno cualquiera: si no, el niño
  // cuenta los sectores y ve que la respuesta marcada no es la buena.
  const correcta = masFrecuente(sectores);
  // Sin un color único no hay respuesta: se tira otra ruleta.
  if (!correcta) return rondaLeer(azar);
  const n = casosDe(sectores, correcta);
  return {
    tipo: 'leer',
    enunciado: '¿Qué color sale más a menudo?',
    ayuda: 'Cuenta los sectores de cada color.',
    sectores,
    visual: 'ruleta',
    opciones: COLORES.map((c) => c.nombre),
    correcta,
    explicacion:
      `El ${correcta} sale ${n} de ${sectores.length} veces (${formatearProbabilidad(sectores, correcta)}). ` +
      'Los otros salen menos.',
  };
};

// Relacionar: dos probabilidades comparadas en la misma ruleta.
export const rondaRelacionar = (azar) => {
  const sectores = ruletaCon(azar);
  const [colorA, colorB] = dosColores(azar);
  const comparacion = compararProbabilidades(
    { sectores, valor: colorA },
    { sectores, valor: colorB },
  );
  const correcta = comparacion === 'mayor' ? colorA : comparacion === 'menor' ? colorB : 'Empate';
  return {
    tipo: 'relacionar',
    enunciado: `¿Qué color sale más a menudo, el ${colorA} o el ${colorB}?`,
    ayuda: `Cuenta los sectores ${colorA} y los ${colorB}.`,
    sectores,
    visual: 'ruleta',
    opciones: [colorA, colorB, 'Empate'],
    correcta,
    explicacion:
      `El ${colorA} sale ${casosDe(sectores, colorA)} de ${sectores.length} veces ` +
      `y el ${colorB} sale ${casosDe(sectores, colorB)} de ${sectores.length}. ` +
      (correcta === 'Empate'
        ? 'Por eso salen igual.'
        : `Por eso sale más el ${correcta}.`),
  };
};

// Comparar: dos ruletas con el MISMO color en las dos.
export const rondaComparar = (azar) => {
  const sectoresA = ruletaCon(azar);
  let sectoresB = ruletaCon(azar);
  const color = COLORES[Math.floor(azar() * COLORES.length)].nombre;
  // Que no sean la misma ruleta: si lo son, la respuesta sería siempre la
  // misma y la ronda no diría nada.
  let intentos = 0;
  while (sectoresB.join() === sectoresA.join() && intentos < 20) {
    sectoresB = ruletaCon(azar);
    intentos += 1;
  }
  // El color tiene que salir en las dos ruletas: si no sale en una, la
  // pregunta es trivial.
  if (casosDe(sectoresA, color) === 0 || casosDe(sectoresB, color) === 0) {
    return rondaComparar(azar);
  }
  const comparacion = compararProbabilidades(
    { sectores: sectoresA, valor: color },
    { sectores: sectoresB, valor: color },
  );
  const correcta =
    comparacion === 'mayor' ? 'La primera' : comparacion === 'menor' ? 'La segunda' : 'Empate';
  return {
    tipo: 'comparar',
    enunciado: `¿En qué ruleta sale más a menudo el ${color}?`,
    ayuda: `Cuenta los sectores ${color} en las dos ruletas.`,
    sectoresA,
    sectoresB,
    color,
    visual: 'dos',
    opciones: ['La primera', 'La segunda', 'Empate'],
    correcta,
    explicacion:
      `En la primera el ${color} sale ${casosDe(sectoresA, color)} veces ` +
      `y en la segunda ${casosDe(sectoresB, color)}. ` +
      (correcta === 'Empate'
        ? 'Por eso salen igual.'
        : `Por eso sale más en ${correcta.toLowerCase()}.`),
  };
};

// Construir: el niño reparte los 4 sectores en 2 y 2.
export const rondaConstruir = (azar) => {
  const colorObjetivo = COLORES[Math.floor(azar() * COLORES.length)].nombre;
  const otro = COLORES[(COLORES.findIndex((c) => c.nombre === colorObjetivo) + 1) % COLORES.length].nombre;
  // El reparto inicial NO cumple el objetivo: 3 de un color y 1 del otro. El
  // niño tiene que mover un sector para que queden 2 y 2.
  const repartoInicial = [colorObjetivo, colorObjetivo, colorObjetivo, otro];
  return {
    tipo: 'construir',
    enunciado: 'Reparte los 4 sectores en dos colores: 2 de cada uno',
    ayuda: 'Toca un sector para cambiarlo de color. Necesitas dos colores con 2 sectores cada uno.',
    visual: 'construir',
    sectores: repartoInicial,
    colorObjetivo,
    correcta: null,
    explicacion:
      'Para que un color salga la mitad de las veces tiene que tener 2 de los 4 sectores. ' +
      'Repartir 2 y 2 lo cumple; 3 y 1 no.',
  };
};

// Dados: ocho dados tirados y qué número sale más a menudo.
export const rondaDados = (azar) => {
  const tiradas = [];
  for (let i = 0; i < 8; i++) tiradas.push(CARAS[Math.floor(azar() * CARAS.length)]);
  const correcta = masFrecuente(tiradas, CARAS);
  // Sin un número único no hay respuesta: se tiran otra vez.
  if (!correcta) return rondaDados(azar);
  const n = casosDe(tiradas, correcta);
  return {
    tipo: 'dados',
    enunciado: '¿Qué número sale más a menudo?',
    ayuda: 'Cuenta las caras de los dados.',
    tiradas,
    visual: 'dados',
    opciones: CARAS,
    correcta,
    explicacion:
      `El ${correcta} sale ${n} de ${tiradas.length} veces (${formatearProbabilidad(tiradas, correcta)}). ` +
      'Los otros salen menos.',
  };
};

// ¿Está el reparto en 2 y 2? Dos colores con 2 sectores cada uno.
export const esRepartoEquitativo = (sectores) =>
  COLORES.filter((c) => casosDe(sectores, c.nombre) === 2).length === 2;

const TIPOS = [rondaLeer, rondaRelacionar, rondaComparar, rondaConstruir, rondaDados];

export const crearRondas = (azar) =>
  Array.from({ length: RONDAS }, (_, i) => TIPOS[i % TIPOS.length](azar));
