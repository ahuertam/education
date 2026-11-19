// Tests de las fichas de álgebra y de la probabilidad.
//
// Son funciones puras, así que se prueban sin montar nada. Si se tocan,
// estos tests avisan.

import {
  TIPOS_FICHA, etiquetaFicha, COLOR_FICHA, bolsaVacia, anadirFicha, quitarFicha,
  totalFichas, mismaBolsa, expresionDeBolsa, bolsaDeExpresion, formatearExpresion,
  evaluar, areaCuadrado, bolsaAleatoria,
} from './algebra';
import {
  casosDe, totalCasos, fraccionDe, compararProbabilidades, formatearProbabilidad,
  repartosDe,
} from './probabilidad';

// --- Fichas ----------------------------------------------------------------

describe('bolsas de fichas', () => {
  it('una bolsa nueva está vacía', () => {
    expect(bolsaVacia()).toEqual({ x2: 0, x: 0, uno: 0 });
    expect(totalFichas(bolsaVacia())).toBe(0);
  });

  it('añadir y quitar fichas', () => {
    let bolsa = bolsaVacia();
    bolsa = anadirFicha(bolsa, 'x');
    bolsa = anadirFicha(bolsa, 'x');
    bolsa = anadirFicha(bolsa, 'uno');
    expect(bolsa).toEqual({ x2: 0, x: 2, uno: 1 });
    expect(totalFichas(bolsa)).toBe(3);

    bolsa = quitarFicha(bolsa, 'x');
    expect(bolsa.x).toBe(1);
  });

  it('quitar una ficha que no está no deja números negativos', () => {
    const bolsa = quitarFicha(bolsaVacia(), 'x2');
    expect(bolsa.x2).toBe(0);
  });

  it('dos bolsas con las mismas fichas son la misma', () => {
    expect(mismaBolsa({ x2: 1, x: 2, uno: 3 }, { x2: 1, x: 2, uno: 3 })).toBe(true);
    expect(mismaBolsa({ x2: 1, x: 2, uno: 3 }, { x2: 3, x: 2, uno: 1 })).toBe(false);
  });

  it('cada tipo de ficha tiene su etiqueta y su color', () => {
    for (const tipo of TIPOS_FICHA) {
      expect(etiquetaFicha(tipo).length).toBeGreaterThan(0);
      expect(COLOR_FICHA[tipo]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('expresiones', () => {
  it('la bolsa se convierte en expresión de mayor a menor grado', () => {
    const expresion = expresionDeBolsa({ x2: 1, x: 2, uno: 2 });
    expect(expresion).toEqual([
      { coef: 1, exp: 2 },
      { coef: 2, exp: 1 },
      { coef: 2, exp: 0 },
    ]);
  });

  it('los coeficientes cero no aparecen', () => {
    expect(expresionDeBolsa({ x2: 0, x: 3, uno: 0 })).toEqual([{ coef: 3, exp: 1 }]);
  });

  it('el viaje de ida y vuelta se conserva', () => {
    const bolsa = { x2: 1, x: 3, uno: 2 };
    expect(bolsaDeExpresion(expresionDeBolsa(bolsa))).toEqual(bolsa);
  });

  it('se formatea como se escribe en la libreta', () => {
    expect(formatearExpresion(expresionDeBolsa({ x2: 1, x: 2, uno: 2 }))).toBe('x² + 2x + 2');
    expect(formatearExpresion(expresionDeBolsa({ x2: 1, x: 1, uno: 1 }))).toBe('x² + x + 1');
    expect(formatearExpresion(expresionDeBolsa({ x2: 0, x: 2, uno: 0 }))).toBe('2x');
    expect(formatearExpresion(expresionDeBolsa({ x2: 0, x: 0, uno: 1 }))).toBe('1');
  });

  it('se evalúa con el valor de x', () => {
    expect(evaluar(expresionDeBolsa({ x2: 1, x: 2, uno: 1 }), 3)).toBe(9 + 6 + 1);
    expect(evaluar(expresionDeBolsa({ x2: 1, x: 2, uno: 1 }), 0)).toBe(1);
    expect(evaluar(expresionDeBolsa({ x2: 0, x: 3, uno: 0 }), 4)).toBe(12);
  });
});

describe('el modelo del área de (x + k)²', () => {
  it('las cuatro celdas suman la bolsa del cuadrado', () => {
    for (const k of [2, 3, 4]) {
      const area = areaCuadrado(k);
      const suma = area.celdas.reduce(
        (bolsa, celda) => ({
          x2: bolsa.x2 + celda.bolsa.x2,
          x: bolsa.x + celda.bolsa.x,
          uno: bolsa.uno + celda.bolsa.uno,
        }),
        bolsaVacia()
      );
      expect(suma).toEqual(area.total);
    }
  });

  it('(x + k)² da x² + 2kx + k²', () => {
    const area = areaCuadrado(2);
    // 1 x², 4 x y 4 unos → x² + 4x + 4, que es (x+2)².
    expect(formatearExpresion(expresionDeBolsa(area.total))).toBe('x² + 4x + 4');
    expect(evaluar(expresionDeBolsa(area.total), 2)).toBe(16);
  });
});

describe('bolsas aleatorias', () => {
  it('siempre tienen al menos dos tipos de ficha', () => {
    // Un PRNG con semilla, para que el test sea reproducible.
    let semilla = 12345;
    const azar = () => {
      semilla = (semilla * 1103515245 + 12345) % 2147483648;
      return semilla / 2147483648;
    };
    for (let i = 0; i < 500; i++) {
      const bolsa = bolsaAleatoria(azar);
      const tipos = TIPOS_FICHA.filter((t) => bolsa[t] > 0);
      expect(tipos.length).toBeGreaterThanOrEqual(2);
      expect(totalFichas(bolsa)).toBeGreaterThanOrEqual(2);
    }
  });
});

// --- Probabilidad ----------------------------------------------------------

describe('probabilidad', () => {
  const ruleta = ['rojo', 'rojo', 'rojo', 'azul', 'azul', 'verde', 'verde', 'verde'];

  it('cuenta los sectores de cada valor', () => {
    expect(casosDe(ruleta, 'rojo')).toBe(3);
    expect(casosDe(ruleta, 'verde')).toBe(3);
    expect(casosDe(ruleta, 'azul')).toBe(2);
    expect(casosDe(ruleta, 'morado')).toBe(0);
  });

  it('el total de casos son los sectores', () => {
    expect(totalCasos(ruleta)).toBe(8);
  });

  it('la probabilidad es una fracción', () => {
    expect(fraccionDe(ruleta, 'azul')).toEqual({ numerador: 2, denominador: 8 });
  });

  it('compara por producto cruzado, no con decimales', () => {
    // 1/4 y 2/8 son lo mismo aunque los decimales sean distintos de redondeo.
    const a = { sectores: ['a', 'b', 'c', 'd'], valor: 'a' };
    const b = { sectores: ['a', 'a', 'b', 'c', 'd', 'e', 'f', 'g'], valor: 'a' };
    expect(compararProbabilidades(a, b)).toBe('igual');
  });

  it('detecta cuál es más probable', () => {
    const rojo = { sectores: ruleta, valor: 'rojo' };
    const azul = { sectores: ruleta, valor: 'azul' };
    expect(compararProbabilidades(rojo, azul)).toBe('mayor');
    expect(compararProbabilidades(azul, rojo)).toBe('menor');
  });

  it('el texto de la probabilidad', () => {
    expect(formatearProbabilidad(ruleta, 'azul')).toBe('2/8');
    expect(formatearProbabilidad(ruleta, 'nada')).toBe('0 (imposible)');
    expect(formatearProbabilidad(['a'], 'a')).toBe('1 (seguro)');
  });

  it('reparte los sectores entre colores sin dejar ninguno a cero', () => {
    const repartos = repartosDe(4, ['rojo', 'azul']);
    expect(repartos.length).toBe(3);
    for (const r of repartos) {
      expect(r.rojo + r.azul).toBe(4);
      expect(r.rojo).toBeGreaterThan(0);
      expect(r.azul).toBeGreaterThan(0);
    }
  });

  it('con tres colores hay más repartos que con dos', () => {
    // Con 4 sectores y 3 colores salen 3 repartos (2-1-1 y sus dos órdenes),
    // los mismos que con 2 colores. Con 6 sectores ya hay diferencia:
    // 5 repartos con dos colores y 10 con tres.
    expect(repartosDe(6, ['a', 'b', 'c']).length).toBeGreaterThan(repartosDe(6, ['a', 'b']).length);
  });

  it('todos los repartos suman el total de sectores', () => {
    for (const r of repartosDe(4, ['a', 'b', 'c'])) {
      expect(r.a + r.b + r.c).toBe(4);
    }
  });
});
