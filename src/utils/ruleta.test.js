// Tests de los generadores de ronda de La Ruleta y los Dados.
//
// Lo que se rompe en este juego es que la respuesta marcada no sea la que se
// ve en la ruleta: el niño cuenta los sectores y ve que la que dice la
// pantalla no es la buena. Eso solo se comprueba mirando los datos.

import { casosDe, compararProbabilidades } from './probabilidad';
import {
  CARAS, COLORES, RONDAS,
  crearAzar, crearRondas, esRepartoEquitativo, masFrecuente,
  rondaComparar, rondaConstruir, rondaDados, rondaLeer, rondaRelacionar,
} from './ruleta';

const SEMILLAS = Array.from({ length: 100 }, (_, i) => i + 1);

describe('la ruleta', () => {
  it('"leer" marca como correcta el color que más sale', () => {
    SEMILLAS.forEach((s) => {
      const r = rondaLeer(crearAzar(s));
      const cuentas = COLORES.map((c) => casosDe(r.sectores, c.nombre));
      const max = Math.max(...cuentas);
      expect(casosDe(r.sectores, r.correcta)).toBe(max);
      // Y es el único con ese número: si hay empate, la pregunta no tiene
      // respuesta única.
      expect(cuentas.filter((n) => n === max)).toHaveLength(1);
    });
  });

  it('"relacionar" compara los dos colores que nombra', () => {
    SEMILLAS.forEach((s) => {
      const r = rondaRelacionar(crearAzar(s));
      const [colorA, colorB] = r.opciones;
      const comparacion = compararProbabilidades(
        { sectores: r.sectores, valor: colorA },
        { sectores: r.sectores, valor: colorB },
      );
      const esperado =
        comparacion === 'mayor' ? colorA : comparacion === 'menor' ? colorB : 'Empate';
      expect(r.correcta).toBe(esperado);
      // El enunciado dice qué colores hay que contar.
      expect(r.enunciado).toContain(colorA);
      expect(r.enunciado).toContain(colorB);
    });
  });

  it('"comparar" dice qué color hay que contar en las dos ruletas', () => {
    SEMILLAS.forEach((s) => {
      const r = rondaComparar(crearAzar(s));
      const comparacion = compararProbabilidades(
        { sectores: r.sectoresA, valor: r.color },
        { sectores: r.sectoresB, valor: r.color },
      );
      const esperado =
        comparacion === 'mayor' ? 'La primera' : comparacion === 'menor' ? 'La segunda' : 'Empate';
      expect(r.correcta).toBe(esperado);
      expect(r.enunciado).toContain(r.color);
      // El color sale en las dos ruletas: si no, la pregunta es trivial.
      expect(casosDe(r.sectoresA, r.color)).toBeGreaterThan(0);
      expect(casosDe(r.sectoresB, r.color)).toBeGreaterThan(0);
    });
  });

  it('"construir" empieza mal y se arregla cambiando un sector', () => {
    SEMILLAS.forEach((s) => {
      const r = rondaConstruir(crearAzar(s));
      // 3 y 1: todavía no está repartido.
      expect(esRepartoEquitativo(r.sectores)).toBe(false);
      // El objetivo es el color que más sale; el otro es el siguiente de la
      // lista, que es al que pasa el sector cuando se toca.
      const objetivo = r.colorObjetivo;
      const pos = COLORES.findIndex((c) => c.nombre === objetivo);
      const otro = COLORES[(pos + 1) % COLORES.length].nombre;
      const repartido = [otro, ...r.sectores.slice(1)];
      expect(esRepartoEquitativo(repartido)).toBe(true);
    });
  });

  it('los dados: el número que más sale es el único', () => {
    SEMILLAS.forEach((s) => {
      const r = rondaDados(crearAzar(s));
      const cuentas = CARAS.map((c) => casosDe(r.tiradas, c));
      const max = Math.max(...cuentas);
      expect(cuentas.filter((n) => n === max)).toHaveLength(1);
      expect(casosDe(r.tiradas, r.correcta)).toBe(max);
    });
  });

  it('sin un valor único no hay respuesta', () => {
    expect(masFrecuente(['rojo', 'rojo', 'azul', 'azul'])).toBeNull();
    expect(masFrecuente(['rojo', 'rojo', 'azul'])).toBe('rojo');
  });

  it('la partida son 8 rondas de los cinco tipos', () => {
    const rondas = crearRondas(crearAzar(3));
    expect(rondas).toHaveLength(RONDAS);
    const tipos = new Set(rondas.map((r) => r.tipo));
    expect(tipos).toEqual(new Set(['leer', 'relacionar', 'comparar', 'construir', 'dados']));
    // Cada ronda con su dibujo y sus opciones.
    const construir = rondas.filter((r) => r.tipo === 'construir');
    const normales = rondas.filter((r) => r.tipo !== 'construir');
    construir.forEach((r) => expect(r.sectores).toHaveLength(4));
    normales.forEach((r) => {
      expect(r.opciones.length).toBeGreaterThan(0);
      expect(r.opciones).toContain(r.correcta);
    });
  });

  it('la misma semilla da la misma partida', () => {
    expect(crearRondas(crearAzar(11))).toEqual(crearRondas(crearAzar(11)));
  });
});
