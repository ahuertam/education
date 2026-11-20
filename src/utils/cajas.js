// El nivel de Cajas y Números, guardado en el navegador.
//
// El sokoban es un juego de pensar: si el niño cierra la pestaña y vuelve,
// no puede perder lo que había colocado. Se guarda la semilla y el nivel
// tal cual.
//
// ponytail: se guarda el estado entero y se valida al leerlo. Si no cuadra
// (un json roto, una versión antigua), se empieza de cero.

import { COLUMNAS, FILAS } from '../components/puzzles/cajas/logic';

const CLAVE = 'edutika:cajas';

const esNumero = (v) => typeof v === 'number' && Number.isFinite(v);

// El nivel guardado tiene que tener la forma que espera el juego: una
// rejilla con las mismas dimensiones, un jugador dentro y la cuenta de la
// puerta (sin ella no se puede pasar al otro cuarto).
export function nivelValido(nivel) {
  if (!nivel || typeof nivel !== 'object') return false;
  if (!Array.isArray(nivel.celdas) || nivel.celdas.length !== FILAS) return false;
  if (!nivel.celdas.every((fila) => Array.isArray(fila) && fila.length === COLUMNAS)) return false;
  // Cada casilla tiene que ser un objeto con su tipo: si no, el juego se
  // rompe al mover al jugador.
  if (!nivel.celdas.every((fila) => fila.every((celda) => celda && typeof celda.tipo === 'string'))) {
    return false;
  }
  if (!nivel.jugador || !esNumero(nivel.jugador.f) || !esNumero(nivel.jugador.c)) return false;
  if (nivel.jugador.f < 0 || nivel.jugador.f >= FILAS) return false;
  if (nivel.jugador.c < 0 || nivel.jugador.c >= COLUMNAS) return false;
  if (!nivel.puerta || !esNumero(nivel.puerta.resultado) || typeof nivel.puerta.texto !== 'string') {
    return false;
  }
  return true;
}

export function cargarCajas() {
  try {
    const texto = localStorage.getItem(CLAVE);
    if (!texto) return null;
    const datos = JSON.parse(texto);
    if (!datos || !esNumero(datos.semilla) || !nivelValido(datos.nivel)) return null;
    return datos;
  } catch (e) {
    return null;
  }
}

export function guardarCajas(semilla, nivel) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ semilla, nivel }));
  } catch (e) {
    // Sin localStorage el nivel no se guarda, pero se puede jugar igual.
  }
}
