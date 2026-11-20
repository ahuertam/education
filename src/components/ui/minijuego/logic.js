// La lógica del minijuego de premio.
//
// Son 20 segundos de arcade que el niño se gana al terminar una partida. Lo
// que hay aquí es la parte que se puede testear: el estado del juego, los
// puntos, las colisiones y las estrellas. El canvas de MiniJuego.js solo
// dibuja lo que esta lógica decide.
//
// Tres variantes con el mismo motor:
//   atrapa  → caen estrellas y bombas; las coges con la mano.
//   esquiva → caen bombas; sobrevives 20 segundos.
//   golpea  → aparecen dianas que hay que pinchar antes de que se vayan.
//
// ponytail: un solo motor con tres reglas de colisión, no tres juegos. Si
// algún día sale una cuarta variante, se añade a VARIANTES y a su regla.

export const VARIANTES = ['atrapa', 'esquiva', 'golpea'];

export const DURACION = 20; // segundos

// Los puntos que hacen falta para cada estrella, por variante:
// [una estrella, dos estrellas, tres estrellas].
export const UMBRALES = {
  atrapa: [1, 7, 12],
  esquiva: [1, 12, 18],
  golpea: [1, 6, 10],
};

// Qué se dibuja y qué pasa en cada variante.
export const REGLAS = {
  atrapa: {
    nombre: 'Atrapa las estrellas',
    bien: { emoji: '⭐', puntos: 1 },
    mal: { emoji: '💣', puntos: -1 },
    radioJugador: 26,
  },
  esquiva: {
    nombre: 'Esquiva las bombas',
    bien: { emoji: '💎', puntos: 2 },
    mal: { emoji: '💣', puntos: 0 },
    radioJugador: 20,
  },
  golpea: {
    nombre: 'Pincha las dianas',
    bien: { emoji: '🎯', puntos: 1 },
    mal: { emoji: '🦟', puntos: -1 },
    radioJugador: 0,
  },
};

// Cada cuánto aparece algo nuevo, en segundos.
const INTERVALO = { atrapa: 0.42, esquiva: 0.55, golpea: 0.7 };

// La vida que quita un golpe y el tiempo que quedas invulnerable.
const VIDA_POR_GOLPE = 1;
const INVULNERABLE = 1.1;

let contadorId = 0;

export function crearJuego({ variante, ancho, alto, azar }) {
  const regla = REGLAS[variante];
  return {
    variante,
    puntos: 0,
    bonus: 0,
    segundos: 0,
    vidas: 3,
    tiempo: DURACION,
    invulnerable: 0,
    entidades: [],
    proxima: INTERVALO[variante],
    jugador: {
      x: ancho / 2,
      y: alto / 2,
      r: regla.radioJugador,
    },
    ancho,
    alto,
    // El azar entra por parámetro para poder testear: si no, se usa Math.random.
    azar: azar || Math.random,
  };
}

// Las estrellas que se lleva el niño con esos puntos.
export function estrellasDe(puntos, variante) {
  const umbrales = UMBRALES[variante] || UMBRALES.atrapa;
  if (puntos >= umbrales[2]) return 3;
  if (puntos >= umbrales[1]) return 2;
  if (puntos >= umbrales[0]) return 1;
  return 0;
}

// Una variante al azar de las tres.
export function varianteAleatoria(azar = Math.random) {
  const i = Math.floor(azar() * VARIANTES.length) % VARIANTES.length;
  return VARIANTES[i];
}

// El ratón (o el dedo) mueve la mano del niño.
export function moverJugador(estado, x, y) {
  return {
    ...estado,
    jugador: {
      ...estado.jugador,
      x: Math.max(estado.jugador.r, Math.min(estado.ancho - estado.jugador.r, x)),
      y: Math.max(estado.jugador.r, Math.min(estado.alto - estado.jugador.r, y)),
    },
  };
}

// Un toque: solo cuenta en la variante de pinchar.
export function tocar(estado) {
  if (estado.variante !== 'golpea') return estado;

  const { x, y } = estado.jugador;
  const golpeada = estado.entidades.find(
    (e) => e.tipo === 'bien' && Math.hypot(e.x - x, e.y - y) <= e.r + 18
  );

  if (golpeada) {
    return {
      ...estado,
      puntos: estado.puntos + REGLAS.golpea.bien.puntos,
      entidades: estado.entidades.filter((e) => e.id !== golpeada.id),
    };
  }

  const fallo = estado.entidades.find(
    (e) => e.tipo === 'mal' && Math.hypot(e.x - x, e.y - y) <= e.r + 18
  );

  if (fallo) {
    return {
      ...estado,
      puntos: Math.max(0, estado.puntos + REGLAS.golpea.mal.puntos),
      entidades: estado.entidades.filter((e) => e.id !== fallo.id),
    };
  }

  return estado;
}

const toca = (a, b, margen = 0) =>
  Math.hypot(a.x - b.x, a.y - b.y) <= a.r + b.r + margen;

// Un paso del juego. Devuelve un estado nuevo.
export function actualizar(estado, dt, azar = estado.azar) {
  if (estado.tiempo <= 0) return estado;

  const regla = REGLAS[estado.variante];
  let puntos = estado.puntos;
  let bonus = estado.bonus;
  let vidas = estado.vidas;
  let invulnerable = Math.max(0, estado.invulnerable - dt);

  // --- aparecer cosas nuevas ---
  let proxima = estado.proxima - dt;
  let entidades = estado.entidades;
  if (proxima <= 0) {
    proxima = INTERVALO[estado.variante];
    const nueva = crearEntidad(estado, azar);
    entidades = [...entidades, nueva];
  }

  // --- moverlas ---
  entidades = entidades
    .map((e) => ({ ...e, x: e.x + e.vx * dt, y: e.y + e.vy * dt, ttl: e.ttl - dt }))
    .filter((e) => !e.muerta && e.ttl > 0 && e.y < estado.alto + 40 && e.x > -60 && e.x < estado.ancho + 60);

  // --- choques ---
  if (estado.variante !== 'golpea' && invulnerable <= 0) {
    const tocada = entidades.find((e) => toca(e, estado.jugador));
    if (tocada) {
      tocada.muerta = true;
      if (tocada.tipo === 'bien') {
        puntos += regla.bien.puntos;
        bonus += regla.bien.puntos;
      } else {
        puntos = Math.max(0, puntos + regla.mal.puntos);
        vidas -= VIDA_POR_GOLPE;
        invulnerable = INVULNERABLE;
      }
    }
  }

  // En "esquiva" los puntos son los segundos aguantados, más lo que
  // sumen los diamantes. El epsilon evita que 4,999999 se quede en 4.
  const segundos = estado.segundos + dt;
  if (estado.variante === 'esquiva') {
    puntos = Math.floor(segundos + 1e-9) + bonus;
  }

  return {
    ...estado,
    puntos,
    bonus,
    segundos,
    vidas,
    invulnerable,
    entidades: entidades.filter((e) => !e.muerta),
    proxima,
    tiempo: Math.max(0, estado.tiempo - dt),
  };
}

function crearEntidad(estado, azar) {
  contadorId += 1;
  const { variante, ancho, alto } = estado;
  const esMala = azar() < 0.28;

  if (variante === 'golpea') {
    return {
      id: contadorId,
      tipo: esMala ? 'mal' : 'bien',
      x: 40 + azar() * (ancho - 80),
      y: 40 + azar() * (alto - 80),
      vx: 0,
      vy: 0,
      r: 22,
      ttl: 1.6,
      muerta: false,
    };
  }

  return {
    id: contadorId,
    tipo: esMala ? 'mal' : 'bien',
    x: 30 + azar() * (ancho - 60),
    y: -30,
    vx: (azar() - 0.5) * 40,
    vy: 90 + azar() * 90,
    r: 18,
    ttl: 99,
    muerta: false,
  };
}

// La partida se acabó cuando se acaba el tiempo o se acaban las vidas.
export function haTerminado(estado) {
  return estado.tiempo <= 0 || estado.vidas <= 0;
}
