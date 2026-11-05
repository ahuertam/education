// Nombre de cada mazmorra. Antes el piso era un número sin nombre: el niño
// sabía que iba al "piso 3" pero no adónde. En el juego de referencia cada
// mazmorra tiene un nombre propio ("Mazmorra 1 — Sombra de la Mazmorra") y eso
// es lo que hace que la bajada de escaleras signifique algo.

export const DUNGEON_NAMES = [
  'La Cripta del Eco',
  'El Pozo de las Brasas',
  'La Galería de los Susurros',
  'La Antesala de las Sombras',
  'El Gran Salón Perdido',
  'La Cueva de los Espejos',
  'La Escalera Infinita',
  'El Corazón de la Piedra',
  'La Galería de las Sombras',
  'La Puerta del Vacío',
];

// El piso final es el del jefe, con nombre propio.
export const FINAL_DUNGEON = 'La Sombra de la Mazmorra';

// El nombre de la mazmorra del piso (1-indexado).
export function dungeonName(floor, totalFloors) {
  if (totalFloors && floor >= totalFloors) return FINAL_DUNGEON;
  if (!floor || floor < 1) return 'El Umbral';
  const indice = Math.min(floor, DUNGEON_NAMES.length) - 1;
  return DUNGEON_NAMES[indice];
}
