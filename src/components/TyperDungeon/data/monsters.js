// Monstruos de monsters.png (1268×832).
//
// La hoja es un cartel de concepto: cada figura está sobre un panel gris y
// tiene el nombre escrito debajo. Los rectángulos de abajo se han medido
// sobre la imagen real (el contorno de cada figura), no a ojo: con ellos el
// recorte encuentra el fondo por el borde y el sprite sale limpio, con el
// dibujo pegado al borde y sin restos de panel.
//
// displayW es el ancho en pantalla; la altura sale de la proporción real.

export const MONSTERS = {
  goblin: {
    key: 'goblin',
    name: { es: 'Goblin', en: 'Goblin' },
    // Lesser — top-left of monsters.png
    x: 11, y: 88, w: 128, h: 137,
    displayW: 160, tier: 1, hp: 3, damage: 1,
  },
  slime: {
    key: 'slime',
    name: { es: 'Moho gelatinoso', en: 'Slime Mold' },
    x: 184, y: 131, w: 162, h: 99,
    displayW: 160, tier: 1, hp: 2, damage: 1,
  },
  skeleton: {
    key: 'skeleton',
    name: { es: 'Esqueleto', en: 'Skeleton' },
    x: 370, y: 52, w: 165, h: 175,
    displayW: 170, tier: 1, hp: 4, damage: 1,
  },
  gnoll: {
    key: 'gnoll',
    name: { es: 'Gnoll', en: 'Gnoll' },
    // Intermediate — top-right of monsters.png
    x: 674, y: 46, w: 167, h: 191,
    displayW: 180, tier: 2, hp: 5, damage: 1,
  },
  gazer: {
    key: 'gazer',
    name: { es: 'Gazer', en: 'Gazer' },
    x: 883, y: 54, w: 165, h: 153,
    displayW: 180, tier: 2, hp: 5, damage: 2,
  },
  ogre: {
    key: 'ogre',
    name: { es: 'Ogro', en: 'Ogre' },
    x: 1098, y: 44, w: 159, h: 194,
    displayW: 185, tier: 2, hp: 6, damage: 2,
  },
  minotaur: {
    key: 'minotaur',
    name: { es: 'Minotauro', en: 'Minotaur' },
    // Greater — middle section
    x: 12, y: 321, w: 227, h: 226,
    displayW: 210, tier: 3, hp: 8, damage: 2,
  },
  medusa: {
    key: 'medusa',
    name: { es: 'Medusa', en: 'Medusa' },
    x: 282, y: 330, w: 112, h: 217,
    displayW: 200, tier: 3, hp: 7, damage: 2,
  },
  beholder: {
    key: 'beholder',
    name: { es: 'Contemplador', en: 'Beholder' },
    x: 430, y: 331, w: 201, h: 177,
    displayW: 200, tier: 3, hp: 9, damage: 3,
  },
  lich: {
    key: 'lich',
    name: { es: 'Lich', en: 'Lich' },
    // Elite — bottom section
    x: 56, y: 604, w: 164, h: 222,
    displayW: 180, tier: 4, hp: 12, damage: 3,
  },
  ettin: {
    key: 'ettin',
    name: { es: 'Ettin', en: 'Ettin' },
    x: 457, y: 594, w: 345, h: 234,
    displayW: 240, tier: 4, hp: 14, damage: 3,
  },
  dragon: {
    key: 'dragon',
    name: { es: 'Dragón Rojo', en: 'Red Dragon' },
    // Elite boss — right side of the sheet (large)
    x: 837, y: 351, w: 431, h: 479,
    displayW: 380, tier: 5, hp: 20, damage: 4,
  },
};

export const MONSTERS_LIST = Object.values(MONSTERS);

export function getMonstersByTier(tier) {
  return MONSTERS_LIST.filter(m => m.tier === tier && m.key !== 'dragon');
}

// Resolve a monster's display name for the active language.
export function monsterName(monster, language) {
  if (!monster) return '';
  return monster.name?.[language] ?? monster.name?.es ?? monster.key;
}

// Tier per floor (1-indexed)
const TIER_BY_FLOOR = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 4, 10: 5 };
const BOSS_TIER_BY_FLOOR = { 1: 1, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 4, 8: 4, 9: 4 };

export function pickMonster(floor) {
  const tier = TIER_BY_FLOOR[Math.min(floor, 10)] ?? 1;
  return pickFrom(tier);
}

export function pickBossMonster(floor, totalFloors) {
  if (floor >= totalFloors) return MONSTERS.dragon;
  const tier = BOSS_TIER_BY_FLOOR[Math.min(floor, 9)] ?? 2;
  return pickFrom(tier);
}

// El tier 5 solo contiene al dragón, y getMonstersByTier lo excluye: sin este
// respaldo el piso 10 se quedaba sin monstruo, START_BATTLE devolvía el estado
// sin cambiarlo y la partida se colgaba para siempre en pre_battle.
function pickFrom(tier) {
  const pool = getMonstersByTier(tier);
  if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
  const fallback = getMonstersByTier(4);
  const usable = fallback.length > 0 ? fallback : MONSTERS_LIST;
  return usable[Math.floor(Math.random() * usable.length)];
}