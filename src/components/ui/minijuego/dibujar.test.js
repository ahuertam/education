// Tests del dibujo del minijuego.
//
// En jsdom no hay canvas, pero el contexto se puede imitar: aquí se comprueba
// que se pinta lo que toca y que no se rompe.

import { crearJuego, actualizar } from './logic';
import { dibujar } from './dibujar';

const contextoFalso = () => {
  const pintado = [];
  return {
    pintado,
    clearRect: () => {},
    fillText: (texto, x, y) => pintado.push({ texto, x, y }),
    set font(v) {},
    set textAlign(v) {},
    set textBaseline(v) {},
    set globalAlpha(v) {},
  };
};

describe('el dibujo del minijuego', () => {
  it('pinta las entidades y al jugador', () => {
    const ctx = contextoFalso();
    let juego = crearJuego({ variante: 'atrapa', ancho: 400, alto: 300 });
    juego = actualizar(juego, 1, () => 0.9);
    const antes = ctx.pintado.length;

    dibujar(ctx, juego);

    // Una entidad (la estrella) y el jugador (la cesta).
    expect(ctx.pintado.length - antes).toBe(juego.entidades.length + 1);
    expect(ctx.pintado.map((p) => p.texto)).toContain('⭐');
    expect(ctx.pintado.map((p) => p.texto)).toContain('🧺');
  });

  it('en "golpea" no hay jugador que pintar', () => {
    const ctx = contextoFalso();
    let juego = crearJuego({ variante: 'golpea', ancho: 400, alto: 300 });
    juego = actualizar(juego, 1, () => 0.9);

    dibujar(ctx, juego);

    expect(ctx.pintado.map((p) => p.texto)).not.toContain('☝️');
    expect(ctx.pintado.length).toBe(juego.entidades.length);
  });

  it('pinta la bomba en su sitio', () => {
    const ctx = contextoFalso();
    let juego = crearJuego({ variante: 'atrapa', ancho: 400, alto: 300 });
    juego = actualizar(juego, 1, () => 0.1);
    const bomba = juego.entidades[0];

    dibujar(ctx, juego);

    const pintada = ctx.pintado.find((p) => p.texto === '💣');
    expect(pintada).toBeTruthy();
    expect(pintada.x).toBeCloseTo(bomba.x);
    expect(pintada.y).toBeCloseTo(bomba.y);
  });
});
