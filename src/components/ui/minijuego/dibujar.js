// El dibujo del minijuego.
//
// Separado de MiniJuego.js para poder comprobarlo con un contexto falso: en
// jsdom no hay canvas de verdad, pero sí se puede mirar qué se pinta.
//
// ponytail: solo dibuja. Ni estado ni tiempo: eso vive en logic.js.

import { REGLAS } from './logic';

const JUGADOR = { atrapa: '🧺', esquiva: '🚀', golpea: '☝️' };

export function dibujar(ctx, estado) {
  const regla = REGLAS[estado.variante];

  ctx.clearRect(0, 0, estado.ancho, estado.alto);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  estado.entidades.forEach((e) => {
    const emoji = e.tipo === 'bien' ? regla.bien.emoji : regla.mal.emoji;
    ctx.font = `${e.r * 2}px serif`;
    ctx.fillText(emoji, e.x, e.y);
  });

  if (estado.variante !== 'golpea') {
    ctx.font = `${estado.jugador.r * 2}px serif`;
    ctx.globalAlpha = estado.invulnerable > 0 ? 0.4 : 1;
    ctx.fillText(JUGADOR[estado.variante], estado.jugador.x, estado.jugador.y);
    ctx.globalAlpha = 1;
  }
}
