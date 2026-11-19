// Tests de la lógica de Mi Huerta.
//
// Lo que hace que la huerta funcione: las cuentas del día (multiplicación al
// plantar, fracción por planta al regar), el crecimiento y la cosecha.

import {
  DIAS,
  ETAPAS,
  OBJETIVO_MONEDAS,
  OBJETIVO_PLANTAS,
  cerrarDia,
  crearHuerta,
  etapaDe,
  faltaParaObjetivo,
  objetivoCumplido,
  opciones,
  plantar,
  regar,
  tareaPlantar,
  tareaRegar,
  tareasDelDia,
  totalPlantas,
} from './logic';

// Un azar que siempre da lo mismo: 0.5.
const azarMedio = () => 0.5;

describe('las cuentas del huerto', () => {
  it('plantar es una multiplicación de las tablas', () => {
    const tarea = tareaPlantar(azarMedio);
    expect(tarea.filas).toBeGreaterThanOrEqual(2);
    expect(tarea.columnas).toBeGreaterThanOrEqual(2);
    expect(tarea.total).toBe(tarea.filas * tarea.columnas);
  });

  it('las cuatro opciones incluyen la respuesta buena y son distintas', () => {
    const tarea = tareaPlantar(azarMedio);
    expect(tarea.opciones).toHaveLength(4);
    expect(new Set(tarea.opciones).size).toBe(4);
    expect(tarea.opciones).toContain(tarea.total);
    tarea.opciones.forEach((n) => expect(n).toBeGreaterThan(0));
  });

  it('regar sale en botellas enteras', () => {
    // 12 plantas: con 1/2 son 6 botellas, con 1/3 son 4, con 1/4 son 3.
    const tarea = tareaRegar(12, azarMedio);
    expect(Number.isInteger(tarea.botellas)).toBe(true);
    expect(tarea.botellas).toBe(12 / tarea.fraccion.denominador);
    expect(tarea.opciones).toContain(tarea.botellas);
  });

  it('regar siempre encuentra una fracción que divide a las plantas', () => {
    [6, 8, 9, 12, 16, 20, 24, 36].forEach((plantas) => {
      const tarea = tareaRegar(plantas, azarMedio);
      expect(Number.isInteger(tarea.botellas)).toBe(true);
    });
  });

  it('las opciones siempre son cuatro números diferentes', () => {
    [1, 5, 12, 30, 81].forEach((correcto) => {
      const op = opciones(correcto, azarMedio);
      expect(op).toHaveLength(4);
      expect(new Set(op).size).toBe(4);
      expect(op).toContain(correcto);
    });
  });

  it('el día trae las dos tareas', () => {
    const tareas = tareasDelDia(1, azarMedio);
    expect(tareas.plantar.total).toBe(tareas.plantar.filas * tareas.plantar.columnas);
    expect(tareas.regar.plantas).toBe(tareas.plantar.total);
  });
});

describe('el huerto', () => {
  it('empieza vacío, en el día 1', () => {
    const h = crearHuerta();
    expect(h.dia).toBe(1);
    expect(totalPlantas(h)).toBe(0);
    expect(h.monedas).toBe(0);
  });

  it('plantar suma las plantas', () => {
    let h = crearHuerta();
    h = plantar(h, 1, 12);
    expect(totalPlantas(h)).toBe(12);
  });

  it('las plantas crecen con los días', () => {
    expect(etapaDe(1, 1)).toBe(ETAPAS[0]);
    expect(etapaDe(1, 2)).toBe(ETAPAS[1]);
    expect(etapaDe(1, 3)).toBe(ETAPAS[2]);
    expect(etapaDe(1, 4)).toBe(ETAPAS[3]);
    // Una planta vieja no retrocede, y una nueva empieza en semilla.
    expect(etapaDe(1, 9)).toBe(ETAPAS[3]);
    expect(etapaDe(5, 5)).toBe(ETAPAS[0]);
  });

  it('al cerrar el día las plantas dan monedas y pasa el día', () => {
    let h = crearHuerta();
    h = plantar(h, 1, 12);
    h = cerrarDia(h, 1);
    expect(h.dia).toBe(2);
    expect(h.monedas).toBe(12);
    expect(h.regadasHoy).toBe(0);
  });

  it('al final de los días el huerto está terminado', () => {
    let h = crearHuerta();
    for (let dia = 1; dia <= DIAS; dia += 1) {
      h = plantar(h, dia, 12);
      h = cerrarDia(h, dia);
    }
    expect(h.terminado).toBe(true);
    expect(h.dia).toBe(DIAS + 1);
    expect(h.monedas).toBe(12 * DIAS);
  });

  it('regar anota las plantas regadas', () => {
    const h = regar(crearHuerta(), 6);
    expect(h.regadasHoy).toBe(6);
  });

  it('el objetivo se cumple con suficientes plantas y monedas', () => {
    let h = crearHuerta();
    h = plantar(h, 1, OBJETIVO_PLANTAS);
    h = { ...h, monedas: OBJETIVO_MONEDAS };
    expect(objetivoCumplido(h)).toBe(true);
    expect(faltaParaObjetivo(h)).toEqual({ plantas: 0, monedas: 0 });
  });

  it('si faltan plantas o monedas, el objetivo no está', () => {
    let h = crearHuerta();
    h = plantar(h, 1, 10);
    expect(objetivoCumplido(h)).toBe(false);
    expect(faltaParaObjetivo(h).plantas).toBe(OBJETIVO_PLANTAS - 10);
  });
});
