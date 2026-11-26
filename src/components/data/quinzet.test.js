// Tests de la hoja Quinzet.
//
// Lo que no puede fallar: la hoja tiene 60 cuentas (4 columnas de 15), cada
// cuenta cabe en el rango de su hoja, las opciones ofrecen siempre la
// correcta y tres fallos válidos, y el veredicto usa los umbrales del
// método (55 para subir, 15 para repetir).

import {
  HOJAS, hoja, opciones, veredicto, tablasDe, textoCuenta,
  OPERACIONES_HOJA, COLUMNAS, POR_COLUMNA, UMBRAL_SUBIR, UMBRAL_REPETIR,
  ESTRATEGIAS, PUESTOS, mercado,
} from './quinzet';

describe('la hoja', () => {
  it('tiene 60 cuentas: 4 columnas de 15', () => {
    expect(COLUMNAS * POR_COLUMNA).toBe(60);
    expect(OPERACIONES_HOJA).toBe(60);
    for (const h of HOJAS) {
      expect(hoja(h.id)).toHaveLength(60);
    }
  });

  it('cada cuenta cabe en el rango de su hoja', () => {
    for (const h of HOJAS) {
      for (const c of hoja(h.id)) {
        if (h.id === 1) {
          // 1º: sumas y restas del 1 al 20, sin restas tramposas.
          expect(c.answer).toBeGreaterThanOrEqual(0);
          if (c.operator === '+') expect(c.answer).toBeLessThanOrEqual(40);
          else {
            expect(c.b).toBeGreaterThanOrEqual(1);
            expect(c.answer).toBeLessThan(c.a);
          }
        }
        if (h.id === 3) {
          // 3º: de dos cifras, hasta 100.
          expect(c.answer).toBeLessThanOrEqual(100);
        }
        if (h.id === 4) {
          // 4º: las cuatro operaciones, con divisiones exactas.
          expect(c.answer).toBeGreaterThanOrEqual(0);
          if (c.operator === '÷') expect(c.a % c.b).toBe(0);
        }
      }
    }
  });

  it('la hoja 4 alterna las cuatro operaciones', () => {
    const cuentas = hoja(4);
    expect(cuentas[0].operator).toBe('+');
    expect(cuentas[1].operator).toBe('-');
    expect(cuentas[2].operator).toBe('×');
    expect(cuentas[3].operator).toBe('÷');
  });

  it('las multiplicaciones usan la tabla que eligió el niño', () => {
    const cuentas = hoja(2, { tables: [3, 7] });
    for (const c of cuentas) {
      expect([3, 7]).toContain(c.a);
      expect(c.answer).toBe(c.a * c.b);
    }
  });

  it('si el niño eligió tablas de más, manda el método', () => {
    expect(tablasDe({ tables: [15, 16] }, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(tablasDe({ tables: [2, 5] }, 10)).toEqual([2, 5]);
    expect(tablasDe(null, 12)).toHaveLength(12);
  });
});

describe('las opciones', () => {
  it('ofrecen la correcta y tres fallos distintos y válidos', () => {
    for (const h of HOJAS) {
      for (const c of hoja(h.id)) {
        const ops = opciones(c.answer, [c.a - c.b, c.a + c.b]);
        expect(ops).toHaveLength(4);
        expect(new Set(ops).size).toBe(4);
        expect(ops).toContain(c.answer);
        for (const v of ops) {
          expect(Number.isInteger(v)).toBe(true);
          expect(v).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});

describe('el veredicto', () => {
  it('usa los umbrales del método: 55 sube, menos de 15 repite', () => {
    expect(veredicto(UMBRAL_SUBIR).accion).toBe('sube');
    expect(veredicto(UMBRAL_SUBIR + 5).accion).toBe('sube');
    expect(veredicto(UMBRAL_SUBIR - 1).accion).toBe('sigue');
    expect(veredicto(UMBRAL_REPETIR).accion).toBe('sigue');
    expect(veredicto(UMBRAL_REPETIR - 1).accion).toBe('repite');
    expect(veredicto(0).accion).toBe('repite');
  });
});

describe('la cuenta escrita', () => {
  it('se lee como en la hoja', () => {
    expect(textoCuenta({ a: 8, b: 3, operator: '+' })).toBe('8 + 3');
    expect(textoCuenta({ a: 12, b: 4, operator: '÷' })).toBe('12 ÷ 4');
  });
});

describe('el mercadillo', () => {
  it('cada ronda trae un problema con sus pasos y tres tarjetas', () => {
    const rondas = mercado();
    expect(rondas).toHaveLength(8);
    for (const r of rondas) {
      expect(r.enunciado).toBeTruthy();
      expect(r.pasos.length).toBeGreaterThanOrEqual(1);
      expect(r.tarjetas).toHaveLength(3);
      // Una de las tres tarjetas es la estrategia buena, y solo una.
      expect(r.tarjetas.filter((e) => e.id === r.estrategia)).toHaveLength(1);
      // Los dos señuelos son estrategias que existen.
      for (const e of r.tarjetas) {
        expect(ESTRATEGIAS.map((s) => s.id)).toContain(e.id);
      }
      // Cada paso tiene su respuesta, y el último es la respuesta del problema.
      for (const p of r.pasos) {
        expect(Number.isInteger(p.respuesta)).toBe(true);
        expect(p.respuesta).toBeGreaterThanOrEqual(0);
        expect(p.texto).toBeTruthy();
      }
      expect(r.pasos[r.pasos.length - 1].respuesta).toBe(r.resultado);
    }
  });

  it('los pasos de cada estrategia dan el total de la compra', () => {
    for (const r of mercado(40)) {
      if (r.estrategia === 'doble') {
        // Multiplicar por 2 es un solo duplicado; por 4, dos.
        if (r.pasos.length === 1) expect(r.total % 2).toBe(0);
        else expect(r.total % 4).toBe(0);
      }
      if (r.estrategia === 'x10') expect(r.total % 10).toBe(0);
      if (r.estrategia === 'complemento') expect(r.total).toBeGreaterThan(10);
      if (r.estrategia === 'redondo') expect(r.total).toBeGreaterThan(0);
      if (r.estrategia === 'reparto') {
        // El total sale justo en las partes: "Reparte 24 en 4 partes iguales".
        const partes = Number(r.pasos[0].texto.match(/ en (\d+) partes/)[1]);
        expect(r.total % partes).toBe(0);
      }
    }
  });

  it('cada problema se compra en un puesto que existe', () => {
    for (const r of mercado(20)) {
      expect(PUESTOS.map((p) => p.nombre)).toContain(r.puesto.nombre);
      expect(r.puesto.svg).toMatch(/\.svg$/);
    }
  });
});
