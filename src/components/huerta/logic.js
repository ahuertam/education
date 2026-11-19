// La lógica de Mi Huerta.
//
// El huerto es una simulación donde la matemática es el motor: si no sabes
// multiplicar, no plantas; si no sabes fracciones, no riegas.
//
// Todo lo que decide algo vive aquí (las cuentas del día, las opciones de
// respuesta, el crecimiento y la cosecha) para que se pueda testear sin
// navegador. Lo que dibuja, en HuertaGame.js.
//
// ponytail: el azar entra por parámetro. Sin eso no se puede comprobar que
// dos huertas con la misma semilla dan la misma huerta.

export const DIAS = 5;
export const OBJETIVO_PLANTAS = 100;
export const OBJETIVO_MONEDAS = 50;

// Las etapas de una planta, de la más nueva a la más crecida.
export const ETAPAS = ['semilla', 'brote', 'planta', 'fruto'];

export const ESTADO_INICIAL = {
  dia: 1,
  fase: 'inicio',  // inicio | plantar | regar | crecer | final
  plantones: [],   // [{ dia, cantidad }]: lo que se plantó cada día
  monedas: 0,
  tareas: null,    // { plantar, regar } del día en curso
  plantado: false,
  regado: false,
  terminado: false,
};

const barajar = (lista, azar) => {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};

const entero = (azar, min, max) => min + Math.floor(azar() * (max - min + 1));

// Cuatro opciones: la buena y tres números que se parezcan pero no.
// Que no se repitan y que todas sean positivas.
export function opciones(correcto, azar) {
  const conjunto = new Set([correcto]);
  const candidatos = [
    correcto + 1, correcto - 1, correcto + 2, correcto - 2,
    correcto * 2, Math.max(1, correcto - 3), correcto + 3, correcto + 10,
  ];
  barajar(candidatos, azar).forEach((n) => {
    if (conjunto.size < 4 && n > 0 && n !== correcto) conjunto.add(n);
  });
  // Si no hay suficientes (no pasa con estos candidatos, pero por si acaso).
  let extra = correcto + 4;
  while (conjunto.size < 4) {
    conjunto.add(extra);
    extra += 1;
  }
  return barajar([...conjunto].slice(0, 4), azar);
}

// La cuenta de plantar: filas × columnas plantones.
// Las filas van de 2 a 9 y las columnas de 2 a 9, como las tablas.
export function tareaPlantar(azar) {
  const filas = entero(azar, 2, 9);
  const columnas = entero(azar, 2, 9);
  const total = filas * columnas;
  return {
    filas,
    columnas,
    total,
    enunciado: `Siembras ${filas} filas de ${columnas} plantones.`,
    ayuda: '¿Cuántos plantones quedan en la tierra?',
    opciones: opciones(total, azar),
  };
}

// La cuenta de regar: cada planta necesita una fracción de botella.
// El denominador siempre divide al total de plantas, para que salgan
// botellas enteras.
export function tareaRegar(plantas, azar) {
  const denominadores = [2, 3, 4].filter((d) => plantas % d === 0);
  const denominador = denominadores.length
    ? denominadores[Math.floor(azar() * denominadores.length)]
    : 1;

  const fraccion = { numerador: 1, denominador };
  const botellas = (plantas * fraccion.numerador) / fraccion.denominador;

  return {
    plantas,
    fraccion,
    botellas,
    enunciado: `Cada planta necesita ${fraccion.numerador}/${fraccion.denominador} de botella.`,
    ayuda: `¿Cuántas botellas gastas para regar ${plantas} plantas?`,
    opciones: opciones(botellas, azar),
  };
}

// Qué tareas tocan el día `dia`. Se eligen las cuentas aquí para que el
// componente no tenga que inventar nada.
export function tareasDelDia(dia, azar) {
  const plantar = tareaPlantar(azar);
  const regar = tareaRegar(plantar.total, azar);
  return { dia, plantar, regar };
}

// --- El estado del huerto -------------------------------------------------

export function crearHuerta() {
  return { ...ESTADO_INICIAL, plantones: [] };
}

// Cuántas plantas hay en total.
export function totalPlantas(estado) {
  return estado.plantones.reduce((suma, p) => suma + p.cantidad, 0);
}

// En qué etapa está una planta plantada el día `diaPlantado`.
export function etapaDe(diaPlantado, diaActual) {
  const etapa = diaActual - diaPlantado;
  return ETAPAS[Math.min(ETAPAS.length - 1, Math.max(0, etapa))];
}

// Plantar lo que dice la cuenta del día.
export function plantar(estado, dia, cantidad) {
  return {
    ...estado,
    plantones: [...estado.plantones, { dia, cantidad }],
  };
}

// Regar: se anota cuántas plantas quedan regadas hoy.
export function regar(estado, plantasRegadas) {
  return { ...estado, regadasHoy: plantasRegadas };
}

// Al terminar el día, las plantas dan una moneda cada una y pasa el día.
export function cerrarDia(estado, dia) {
  const plantasDelDia = estado.plantones
    .filter((p) => p.dia === dia)
    .reduce((suma, p) => suma + p.cantidad, 0);

  const siguiente = dia + 1;
  return {
    ...estado,
    dia: siguiente,
    monedas: estado.monedas + plantasDelDia,
    regadasHoy: 0,
    terminado: siguiente > DIAS,
  };
}

// ¿Se ha conseguido el objetivo?
export function objetivoCumplido(estado) {
  return totalPlantas(estado) >= OBJETIVO_PLANTAS && estado.monedas >= OBJETIVO_MONEDAS;
}

// Cómo va: las plantas que faltan y las monedas que faltan.
export function faltaParaObjetivo(estado) {
  return {
    plantas: Math.max(0, OBJETIVO_PLANTAS - totalPlantas(estado)),
    monedas: Math.max(0, OBJETIVO_MONEDAS - estado.monedas),
  };
}
