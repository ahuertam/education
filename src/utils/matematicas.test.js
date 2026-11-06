import {
  mcd, mcm, simplificar, sonEquivalentes, compararFracciones, formatearFraccion,
  partesEnDiez, productosParciales, baseDiez, componerBaseDiez, redondear,
  areaPoligono, perimetroPoligono,
} from './matematicas';

describe('fracciones', () => {
  it('calcula el máximo común divisor', () => {
    expect(mcd(12, 8)).toBe(4);
    expect(mcd(9, 5)).toBe(1);
    expect(mcd(7, 0)).toBe(7);
  });

  it('simplifica', () => {
    expect(simplificar({ n: 4, d: 8 })).toEqual({ n: 1, d: 2 });
    expect(simplificar({ n: 6, d: 9 })).toEqual({ n: 2, d: 3 });
    expect(simplificar({ n: 3, d: 3 })).toEqual({ n: 1, d: 1 });
  });

  it('reconoce fracciones equivalentes', () => {
    expect(sonEquivalentes({ n: 2, d: 4 }, { n: 1, d: 2 })).toBe(true);
    expect(sonEquivalentes({ n: 2, d: 3 }, { n: 4, d: 6 })).toBe(true);
    expect(sonEquivalentes({ n: 1, d: 3 }, { n: 2, d: 4 })).toBe(false);
  });

  it('compara sin usar decimales', () => {
    expect(compararFracciones({ n: 2, d: 3 }, { n: 3, d: 5 })).toBe(1);
    expect(compararFracciones({ n: 1, d: 4 }, { n: 2, d: 3 })).toBe(-1);
    expect(compararFracciones({ n: 2, d: 4 }, { n: 1, d: 2 })).toBe(0);
  });

  it('escribe la fracción y el entero', () => {
    expect(formatearFraccion({ n: 3, d: 5 })).toBe('3/5');
    expect(formatearFraccion({ n: 4, d: 1 })).toBe('4');
  });

  it('calcula el mínimo común múltiplo', () => {
    expect(mcm(4, 6)).toBe(12);
    expect(mcm(3, 9)).toBe(9);
  });
});

describe('modelo de área', () => {
  it('parte un número en decenas y unidades', () => {
    expect(partesEnDiez(34)).toEqual({ decenas: 3, unidades: 4 });
    expect(partesEnDiez(7)).toEqual({ decenas: 0, unidades: 7 });
  });

  it('calcula los productos parciales', () => {
    // 34 × 7 = (30 × 7) + (4 × 7) = 210 + 28
    expect(productosParciales(34, 7)).toEqual({
      decenas: 3, unidades: 4, pDecenas: 210, pUnidades: 28, total: 238,
    });
    expect(productosParciales(7, 6).total).toBe(42);
  });
});

describe('base diez', () => {
  it('descompone en centenas, decenas y unidades', () => {
    expect(baseDiez(342)).toEqual({ centenas: 3, decenas: 4, unidades: 2 });
    expect(baseDiez(70)).toEqual({ centenas: 0, decenas: 7, unidades: 0 });
  });

  it('vuelve a componer el número', () => {
    expect(componerBaseDiez(baseDiez(342))).toBe(342);
    expect(componerBaseDiez({ centenas: 1, decenas: 0, unidades: 5 })).toBe(105);
  });

  it('redondea a la decena y a la centena', () => {
    expect(redondear(47, 1)).toBe(50);
    expect(redondear(42, 1)).toBe(40);
    expect(redondear(248, 2)).toBe(200);
    expect(redondear(261, 2)).toBe(300);
  });
});

describe('geoboard', () => {
  it('calcula el área de un rectángulo', () => {
    expect(areaPoligono([[0, 0], [4, 0], [4, 3], [0, 3]])).toBe(12);
  });

  it('calcula el área de una figura en L', () => {
    // 4×3 menos el hueco de 2×1 = 12 - 2 = 10
    const enL = [[0, 0], [4, 0], [4, 2], [2, 2], [2, 3], [0, 3]];
    expect(areaPoligono(enL)).toBe(10);
  });

  it('el perímetro es la suma de los lados', () => {
    expect(perimetroPoligono([[0, 0], [4, 0], [4, 3], [0, 3]])).toBe(14);
    const enL = [[0, 0], [4, 0], [4, 2], [2, 2], [2, 3], [0, 3]];
    expect(perimetroPoligono(enL)).toBe(14);
  });

  it('una figura sin cerrar no tiene área', () => {
    expect(areaPoligono([[0, 0], [2, 0]])).toBe(0);
    expect(areaPoligono([[0, 0]])).toBe(0);
  });

  it('un triángulo sí cuenta como figura', () => {
    expect(areaPoligono([[0, 0], [2, 0], [2, 2]])).toBe(2);
  });
});
