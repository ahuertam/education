// Tests de la lógica del minijuego de premio.
//
// Lo que decide si el niño se lleva una pegatina está en este fichero: los
// puntos, las estrellas y cuándo se acaba la partida. El canvas solo dibuja.

import {
  DURACION,
  UMBRALES,
  actualizar,
  crearJuego,
  estrellasDe,
  haTerminado,
  moverJugador,
  tocar,
  varianteAleatoria,
} from './logic';

// Un azar controlado: por encima de 0.28 sale siempre una cosa buena.
const azarBueno = () => 0.9;
// Un azar controlado: por debajo de 0.28 sale siempre una cosa mala.
const azarMalo = () => 0.1;

const jugar = (estado, segundos, azar) => {
  let s = estado;
  const dt = 1 / 60;
  for (let i = 0; i < Math.round(segundos / dt); i += 1) {
    s = actualizar(s, dt, azar);
  }
  return s;
};

describe('el minijuego de premio', () => {
  it('las tres variantes existen y tienen sus umbrales', () => {
    expect(UMBRALES.atrapa).toHaveLength(3);
    expect(UMBRALES.esquiva).toHaveLength(3);
    expect(UMBRALES.golpea).toHaveLength(3);
  });

  it('empieza con 20 segundos y tres vidas', () => {
    const juego = crearJuego({ variante: 'atrapa', ancho: 400, alto: 300 });
    expect(juego.tiempo).toBe(DURACION);
    expect(juego.vidas).toBe(3);
    expect(juego.puntos).toBe(0);
  });

  it('el tiempo baja y la partida se acaba', () => {
    const juego = crearJuego({ variante: 'atrapa', ancho: 400, alto: 300 });
    const pasado = jugar(juego, DURACION + 1, azarBueno);
    expect(pasado.tiempo).toBe(0);
    expect(haTerminado(pasado)).toBe(true);
  });

  it('en "atrapa" coger una estrella suma puntos', () => {
    let juego = crearJuego({ variante: 'atrapa', ancho: 400, alto: 300 });
    // Se pone la mano encima de la primera estrella que cae.
    juego = actualizar(juego, 1, azarBueno);
    const estrella = juego.entidades[0];
    expect(estrella.tipo).toBe('bien');
    juego = moverJugador(juego, estrella.x, estrella.y);
    const puntosAntes = juego.puntos;
    juego = actualizar(juego, 1 / 60, azarBueno);
    expect(juego.puntos).toBeGreaterThan(puntosAntes);
  });

  it('en "atrapa" coger una bomba quita una vida', () => {
    let juego = crearJuego({ variante: 'atrapa', ancho: 400, alto: 300 });
    juego = actualizar(juego, 1, azarMalo);
    const bomba = juego.entidades[0];
    expect(bomba.tipo).toBe('mal');
    juego = moverJugador(juego, bomba.x, bomba.y);
    juego = actualizar(juego, 1 / 60, azarMalo);
    expect(juego.vidas).toBe(2);
  });

  it('en "esquiva" los puntos son los segundos aguantados', () => {
    const juego = crearJuego({ variante: 'esquiva', ancho: 400, alto: 300 });
    const pasado = jugar(juego, 5, azarBueno);
    expect(pasado.puntos).toBe(5);
  });

  it('en "golpea" hay que pinchar, no solo tocar', () => {
    let juego = crearJuego({ variante: 'golpea', ancho: 400, alto: 300 });
    juego = actualizar(juego, 1, azarBueno);
    const diana = juego.entidades[0];
    juego = moverJugador(juego, diana.x, diana.y);
    // Mover el ratón por encima no puntúa: hay que pinchar.
    expect(juego.puntos).toBe(0);
    const punteado = tocar(juego);
    expect(punteado.puntos).toBe(1);
  });

  it('pinchar un mosquito resta puntos', () => {
    let juego = crearJuego({ variante: 'golpea', ancho: 400, alto: 300 });
    juego = actualizar(juego, 1, azarMalo);
    const mosquito = juego.entidades[0];
    juego = moverJugador(juego, mosquito.x, mosquito.y);
    const punteado = tocar(juego);
    expect(punteado.puntos).toBe(0);
  });

  it('las estrellas dependen de los puntos', () => {
    expect(estrellasDe(0, 'atrapa')).toBe(0);
    expect(estrellasDe(UMBRALES.atrapa[0], 'atrapa')).toBe(1);
    expect(estrellasDe(UMBRALES.atrapa[1], 'atrapa')).toBe(2);
    expect(estrellasDe(UMBRALES.atrapa[2], 'atrapa')).toBe(3);
    expect(estrellasDe(999, 'atrapa')).toBe(3);
  });

  it('la variante sale al azar de las tres', () => {
    expect(varianteAleatoria(() => 0)).toBe('atrapa');
    expect(varianteAleatoria(() => 0.5)).toBe('esquiva');
    expect(varianteAleatoria(() => 0.99)).toBe('golpea');
  });
});
