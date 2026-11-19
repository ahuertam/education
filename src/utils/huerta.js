// El estado del huerto.
//
// A diferencia de los demás juegos, aquí el estado se queda: el huerto sigue
// mañana. Se guarda en localStorage, como el álbum y el progreso.
//
// ponytail: un solo objeto con un solo formato. Si algún día cambia, se
// borra la clave y el huerto vuelve a empezar.

import { ESTADO_INICIAL } from '../components/huerta/logic';

const CLAVE = 'edutika:huerta';

export function cargarHuerta() {
  try {
    const texto = localStorage.getItem(CLAVE);
    if (!texto) return { ...ESTADO_INICIAL, plantones: [] };
    const datos = JSON.parse(texto);
    return {
      ...ESTADO_INICIAL,
      ...datos,
      plantones: Array.isArray(datos.plantones) ? datos.plantones : [],
    };
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
