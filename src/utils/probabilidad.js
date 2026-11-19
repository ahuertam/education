// Probabilidad con ruleta y dados.
//
// Una ruleta es una lista de sectores: un color por sector. Si la ruleta
// tiene 3 sectores rojos, 3 azules y 2 verdes, son 8 casos iguales y el rojo
// sale 3 de cada 8 veces.
//
// Todo son enteros y producto cruzado: comparar "3/8" con "1/4" con decimales
// da errores de redondeo. Aquí se multiplica en cruz y ya está.

// Cuántos sectores de la ruleta son de ese valor.
export const casosDe = (sectores, valor) =>
  sectores.reduce((n, sector) => (sector === valor ? n + 1 : n), 0);

// El número total de casos equiprobables.
export const totalCasos = (sectores) => sectores.length;

// La probabilidad como fracción { numerador, denominador }.
export const fraccionDe = (sectores, valor) => ({
  numerador: casosDe(sectores, valor),
  denominador: totalCasos(sectores),
});

// Compara dos probabilidades por producto cruzado. Devuelve 'igual', 'mayor'
// o 'menor'. Cada par es { sectores, valor }.
export const compararProbabilidades = (a, b) => {
  const na = casosDe(a.sectores, a.valor);
  const da = totalCasos(a.sectores);
  const nb = casosDe(b.sectores, b.valor);
  const db = totalCasos(b.sectores);
  const izquierda = na * db;
  const derecha = nb * da;
  if (izquierda === derecha) return 'igual';
  return izquierda > derecha ? 'mayor' : 'menor';
};

// El texto de la probabilidad: "3/8", o "1" si sale seguro.
export const formatearProbabilidad = (sectores, valor) => {
  const { numerador, denominador } = fraccionDe(sectores, valor);
  if (denominador === 0) return '—';
  if (numerador === denominador) return '1 (seguro)';
  if (numerador === 0) return '0 (imposible)';
  return `${numerador}/${denominador}`;
};

// Reparte n sectores entre los colores dados. Devuelve un array con una
// entrada por reparto posible, cada una { [color]: sectores }.
//
// Con 4 sectores y 2 colores hay 3 repartos (1-3, 2-2 y 3-1). Con 4 y 3
// colores hay 10. Se usa para las preguntas "qué ruleta cumple esto".
export const repartosDe = (n, colores) => {
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
  // Sin colores en un reparto: un reparto con 0 sectores de un color no
  // cuenta, porque ese color no saldría nunca.
  return resultado.filter((r) => Object.values(r).every((v) => v > 0));
};
