// Sonidos de la mazmorra.
//
// Los ficheros los genera `scripts/generar-sonidos.mjs` (no hay descargas
// ni dependencias: se sintetizan aqui). Aqui solo se reproducen.
//
// Detalle del navegador: el sonido no puede sonar hasta que el niño ha
// pulsado algo (la politica de reproduccion automatica), asi que el ambiente
// se arranca con el primer clic del menu.

const BASE = `${process.env.PUBLIC_URL}/games/mazmorra/sonidos`;

// Volumenes: el ambiente de fondo no puede tapar los efectos.
const VOLUMENES = {
  ambiente: 0.35,
  tecla: 0.16,
  espada: 0.5,
  impacto: 0.55,
  dano: 0.5,
  monstruo: 0.5,
  muerte: 0.55,
  tesoro: 0.5,
  puerta: 0.5,
  victoria: 0.55,
  derrota: 0.5,
};

const cache = new Map();

function cargar(nombre) {
  if (cache.has(nombre)) return cache.get(nombre);
  const audio = new Audio(`${BASE}/${nombre}.m4a`);
  audio.preload = 'auto';
  cache.set(nombre, audio);
  return audio;
}

/**
 * Toca un efecto. No lanza errores si el navegador todavia no ha permitido
 * reproducir (un fallo de sonido no puede tumbar el juego).
 */
export function tocar(nombre, { volumen } = {}) {
  if (typeof Audio === 'undefined') return;
  try {
    const audio = cargar(nombre);
    audio.volume = volumen ?? VOLUMENES[nombre] ?? 0.5;
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch {
    // sin sonido, pero el juego sigue
  }
}

// El clic de teclear es el sonido que mas se repite: con un solo elemento
// de audio se cortaria solo. Un grupo pequeño en rueda lo resuelve.
const grupoTecla = [];
const TAM_GRUPO = 6;
let indiceTecla = 0;

export function tocarTecla() {
  if (typeof Audio === 'undefined') return;
  try {
    if (grupoTecla.length < TAM_GRUPO) {
      const a = new Audio(`${BASE}/tecla.m4a`);
      a.preload = 'auto';
      a.volume = VOLUMENES.tecla;
      grupoTecla.push(a);
    }
    const audio = grupoTecla[indiceTecla % grupoTecla.length];
    indiceTecla += 1;
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch {
    // sin sonido, pero el juego sigue
  }
}

let ambiente = null;

/** Arranca el rumor de la mazmorra (en bucle). Solo uno a la vez. */
export function iniciarAmbiente() {
  if (typeof Audio === 'undefined' || ambiente) return;
  try {
    ambiente = cargar('ambiente');
    ambiente.loop = true;
    ambiente.volume = VOLUMENES.ambiente;
    const p = ambiente.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => { ambiente = null; });
    }
  } catch {
    ambiente = null;
  }
}

export function pararAmbiente() {
  if (!ambiente) return;
  try { ambiente.pause(); } catch { /* da igual */ }
  ambiente.currentTime = 0;
  ambiente = null;
}
