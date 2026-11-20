// El estado del huerto.
//
// A diferencia de los demás juegos, aquí el estado se queda: el huerto sigue
// mañana. Se guarda en localStorage, como el álbum y el progreso.
//
// ponytail: un solo objeto con un solo formato. Si algún día cambia, se
// borra la clave y el huerto vuelve a empezar.

import { ESTADO_INICIAL } from '../components/huerta/logic';

const CLAVE = 'edutika:huerta';

const FASES = ['inicio', 'plantar', 'regar', 'crecer', 'final'];

const esNumero = (v) => typeof v === 'number' && Number.isFinite(v);

// Lo que se ha plantado cada día: [{ dia, cantidad }] con las dos cosas
// números. Si no lo es, se descarta: un NaJ en el total dejaría el huerto
// inservible y sin forma de arreglarlo.
const plantonesValidos = (lista) => (
  Array.isArray(lista)
  && lista.every((p) => p && esNumero(p.dia) && esNumero(p.cantidad))
  ? lista
  : []
);

export function cargarHuerta() {
  try {
    const texto = localStorage.getItem(CLAVE);
    if (!texto) return { ...ESTADO_INICIAL, plantones: [] };
    const datos = JSON.parse(texto);
    if (!datos || typeof datos !== 'object') return { ...ESTADO_INICIAL, plantones: [] };

    const estado = {
      ...ESTADO_INICIAL,
      ...datos,
      dia: esNumero(datos.dia) ? datos.dia : ESTADO_INICIAL.dia,
      monedas: esNumero(datos.monedas) ? datos.monedas : 0,
      plantones: plantonesValidos(datos.plantones),
      fase: FASES.includes(datos.fase) ? datos.fase : 'inicio',
    };

    // Las fases de plantar y regar necesitan las cuentas del día. Si no
    // están (un json antiguo, un guardado a medias), se vuelve al inicio
    // en vez de dejar la pantalla en blanco.
    if ((estado.fase === 'plantar' || estado.fase === 'regar') && !estado.tareas) {
      estado.fase = 'inicio';
    }

    return estado;
  } catch (e) {
    // Sin localStorage o con el JSON corrupto: huerto nuevo.
    return { ...ESTADO_INICIAL, plantones: [] };
  }
}

export function guardarHuerta(estado) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch (e) {
    // Sin localStorage el huerto solo vive en esta sesión.
  }
  return estado;
}

// Empezar de cero.
export function reiniciarHuerta() {
  const nuevo = { ...ESTADO_INICIAL, plantones: [] };
  try {
    localStorage.removeItem(CLAVE);
  } catch (e) {
    // Nada que hacer.
  }
  return nuevo;
}
