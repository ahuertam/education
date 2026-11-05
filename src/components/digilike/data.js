// Datos del juego Digilike: colores, starters, sagas y traducción de niveles.
// Estaban en el mismo fichero que el componente; aquí solo los datos.

export const COLORS = {
  sky1: '#e0f2f7',
  sky2: '#ffffff',
  glass: 'rgba(255, 255, 255, 0.7)',
  glass2: 'rgba(255, 255, 255, 0.55)',
  stroke: 'rgba(255, 255, 255, 0.65)',
  ink: '#005870',
  muted: 'rgba(0, 88, 112, 0.72)',
  primary: '#ff9800',
  primaryDeep: '#f57c00',
  good: '#2e7d32',
  bad: '#c62828',
  blueSoft: 'rgba(0, 130, 170, 0.14)',
  orangeSoft: 'rgba(255, 152, 0, 0.16)',
  violetSoft: 'rgba(167, 139, 250, 0.18)',
};

export const STARTERS = ['Agumon', 'Gabumon', 'Patamon', 'Gomamon', 'Tentomon', 'Gatomon'];
export const FALLBACK_IMG = `${process.env.PUBLIC_URL}/moster2.png`;

export const ADVENTURE_SAGAS = [
  {
    id: 'devimon',
    title: 'Saga de Devimon',
    blurb: 'Isla File. Ruedas negras y un enemigo que quiere apagar la luz del Digimundo.',
    bossFetchName: 'Devimon',
    bossLabel: 'Devimon',
  },
  {
    id: 'etemon',
    title: 'Saga de Etemon',
    blurb: 'Continente Server. Emblemas, etiquetas y una estrella del rock demasiado peligrosa.',
    bossFetchName: 'Etemon',
    bossLabel: 'Etemon',
  },
  {
    id: 'myotismon',
    title: 'Saga de Myotismon (Vamdemon)',
    blurb: 'La sombra cruza al Mundo Humano. El Digivice vibra cuando el miedo se acerca.',
    bossFetchName: 'Myotismon',
    bossLabel: 'Vamdemon',
  },
  {
    id: 'darkmasters',
    title: 'Saga de los Amos oscuros',
    blurb: 'Un tablero de guerra en el Digimundo. La última línea de defensa está a punto de romperse.',
    bossFetchName: 'Piedmon',
    bossLabel: 'Piedmon',
  },
  {
    id: 'apocalymon',
    title: 'Saga de Apocalymon',
    blurb: 'El final de la aventura: los datos del dolor se condensan en un enemigo imposible.',
    bossFetchName: 'Apocalymon',
    bossLabel: 'Apocalymon',
  },
];

export const DIGI_LEVEL_ES = {
  digitama: 'Digi-Huevo',
  'digi-tama': 'Digi-Huevo',
  'digi egg': 'Digi-Huevo',
  'digi-huevo': 'Digi-Huevo',

  'baby i': 'Etapa Bebé',
  'baby ii': 'Etapa Bebé',
  'baby i & ii': 'Etapa Bebé',
  baby: 'Etapa Bebé',
  'in-training': 'Etapa Bebé',
  'in training': 'Etapa Bebé',
  training: 'Etapa Bebé',

  child: 'Cuerpo Infantil',
  rookie: 'Cuerpo Infantil',
  'cuerpo infantil': 'Cuerpo Infantil',

  adult: 'Cuerpo Maduro',
  champion: 'Cuerpo Maduro',
  'cuerpo maduro': 'Cuerpo Maduro',

  perfect: 'Cuerpo Perfecto',
  ultimate: 'Cuerpo Supremo',
  mega: 'Cuerpo Supremo',
  'cuerpo perfecto': 'Cuerpo Perfecto',
  'cuerpo supremo': 'Cuerpo Supremo',
};
