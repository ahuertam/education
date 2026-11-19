// Las pegatinas del álbum y los logros.
//
// ADI (Adibou) no tenía colección: el premio era el minijuego en sí. Aquí el
// minijuego de 20 segundos es el regalo y la pegatina es el progreso: cada vez
// que el niño lo consigue bien, cae una pegatina nueva en su álbum.
//
// El arte son emojis: no hay ficheros que cargar ni que mantener, y se ven
// igual en cualquier navegador. Si algún día se cambian por dibujos, solo hay
// que tocar este fichero.

export const TEMAS = {
  animales: { nombre: 'Animales', color: '#2e9e5b' },
  dinosaurios: { nombre: 'Dinosaurios', color: '#8b4513' },
  espacio: { nombre: 'Espacio', color: '#4a80c8' },
  universo: { nombre: 'Universo', color: '#b45309' },
};

export const PEGATINAS = [
  // Animales
  { id: 'elefante', emoji: '🐘', nombre: 'Elefante', tema: 'animales' },
  { id: 'leon', emoji: '🦁', nombre: 'León', tema: 'animales' },
  { id: 'panda', emoji: '🐼', nombre: 'Panda', tema: 'animales' },
  { id: 'rana', emoji: '🐸', nombre: 'Rana', tema: 'animales' },
  { id: 'buho', emoji: '🦉', nombre: 'Búho', tema: 'animales' },
  { id: 'abeja', emoji: '🐝', nombre: 'Abeja', tema: 'animales' },
  { id: 'mariposa', emoji: '🦋', nombre: 'Mariposa', tema: 'animales' },
  { id: 'delfin', emoji: '🐬', nombre: 'Delfín', tema: 'animales' },
  { id: 'zorro', emoji: '🦊', nombre: 'Zorro', tema: 'animales' },
  { id: 'oso', emoji: '🐻', nombre: 'Oso', tema: 'animales' },
  { id: 'camaleon', emoji: '🦎', nombre: 'Camaleón', tema: 'animales' },
  { id: 'tortuga', emoji: '🐢', nombre: 'Tortuga', tema: 'animales' },
  { id: 'cocodrilo', emoji: '🐊', nombre: 'Cocodrilo', tema: 'animales' },
  { id: 'pinguino', emoji: '🐧', nombre: 'Pingüino', tema: 'animales' },
  { id: 'ballena', emoji: '🐳', nombre: 'Ballena', tema: 'animales' },
  { id: 'pulpo', emoji: '🐙', nombre: 'Pulpo', tema: 'animales' },
  { id: 'pez', emoji: '🐠', nombre: 'Pez', tema: 'animales' },
  { id: 'cangrejo', emoji: '🦀', nombre: 'Cangrejo', tema: 'animales' },
  { id: 'caballo', emoji: '🐴', nombre: 'Caballo', tema: 'animales' },
  { id: 'vaca', emoji: '🐮', nombre: 'Vaca', tema: 'animales' },
  { id: 'cerdo', emoji: '🐷', nombre: 'Cerdo', tema: 'animales' },
  { id: 'gato', emoji: '🐱', nombre: 'Gato', tema: 'animales' },
  { id: 'perro', emoji: '🐶', nombre: 'Perro', tema: 'animales' },
  { id: 'raton', emoji: '🐭', nombre: 'Ratón', tema: 'animales' },

  // Dinosaurios
  { id: 'trex', emoji: '🦖', nombre: 'T-Rex', tema: 'dinosaurios' },
  { id: 'brontosaurio', emoji: '🦕', nombre: 'Brontosaurio', tema: 'dinosaurios' },
  { id: 'dragon', emoji: '🐲', nombre: 'Dragón', tema: 'dinosaurios' },
  { id: 'pterodactilo', emoji: '🦅', nombre: 'Pterodáctilo', tema: 'dinosaurios' },
  { id: 'hueso', emoji: '🦴', nombre: 'Hueso', tema: 'dinosaurios' },
  { id: 'huevo', emoji: '🥚', nombre: 'Huevo', tema: 'dinosaurios' },
  { id: 'volcan', emoji: '🌋', nombre: 'Volcán', tema: 'dinosaurios' },

  // Espacio
  { id: 'cohete', emoji: '🚀', nombre: 'Cohete', tema: 'espacio' },
  { id: 'ovni', emoji: '🛸', nombre: 'OVNI', tema: 'espacio' },
  { id: 'planeta', emoji: '🪐', nombre: 'Planeta', tema: 'espacio' },
  { id: 'luna', emoji: '🌙', nombre: 'Luna', tema: 'espacio' },
  { id: 'estrella', emoji: '⭐', nombre: 'Estrella', tema: 'espacio' },
  { id: 'cometa', emoji: '☄️', nombre: 'Cometa', tema: 'espacio' },
  { id: 'nave', emoji: '🛰️', nombre: 'Nave', tema: 'espacio' },

  // Universo
  { id: 'arcoiris', emoji: '🌈', nombre: 'Arcoíris', tema: 'universo' },
  { id: 'girasol', emoji: '🌻', nombre: 'Girasol', tema: 'universo' },
  { id: 'seta', emoji: '🍄', nombre: 'Seta', tema: 'universo' },
  { id: 'globo', emoji: '🎈', nombre: 'Globo', tema: 'universo' },
  { id: 'guitarra', emoji: '🎸', nombre: 'Guitarra', tema: 'universo' },
  { id: 'abanico', emoji: '🪭', nombre: 'Abanico', tema: 'universo' },
  { id: 'pastel', emoji: '🍰', nombre: 'Pastel', tema: 'universo' },
  { id: 'trofeo', emoji: '🏆', nombre: 'Trofeo', tema: 'universo' },
];

// Los logros: cosas que se desbloquean según lo que lleva jugado el niño.
export const LOGROS = [
  {
    id: 'primera-partida',
    emoji: '🎉',
    nombre: 'Primera partida',
    descripcion: 'Has terminado tu primer juego.',
    cumple: (e) => e.partidas >= 1,
  },
  {
    id: 'diez-partidas',
    emoji: '🏅',
    nombre: 'Diez partidas',
    descripcion: 'Has terminado diez juegos.',
    cumple: (e) => e.partidas >= 10,
  },
  {
    id: 'veinticinco-partidas',
    emoji: '🎖️',
    nombre: 'Veinticinco partidas',
    descripcion: 'Has terminado veinticinco juegos.',
    cumple: (e) => e.partidas >= 25,
  },
  {
    id: 'tres-estrellas',
    emoji: '⭐',
    nombre: 'Maestro del minijuego',
    descripcion: 'Has sacado tres estrellas tres veces.',
    cumple: (e) => e.estrellasPerfectas >= 3,
  },
  {
    id: 'album-completo',
    emoji: '🏆',
    nombre: 'Álbum completo',
    descripcion: 'Has conseguido todas las pegatinas.',
    cumple: (e) => e.pegatinas.length >= PEGATINAS.length,
  },
];

// Cuántas estrellas hacen falta para que caiga una pegatina.
export const ESTRELLAS_PARA_PEGATINA = 3;
