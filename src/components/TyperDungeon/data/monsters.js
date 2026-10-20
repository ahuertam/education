// Monsters definition with sprite coordinates in monsters.png (1268×832).
// Coordinates are estimates — adjust x/y/w/h in the browser with DevTools.
// scale = displayW / w (aspect ratio is preserved).

export const MONSTERS = {
  goblin: {
    key: 'goblin',
    name: { es: 'Goblin', en: 'Goblin' },
    // Lesser — top-left of monsters.png
    x: 10, y: 45, w: 169, h: 199,
    displayW: 160, tier: 1, hp: 3, damage: 1,
  },
  slime: {
    key: 'slime',
    name: { es: 'Moho gelatinoso', en: 'Slime Mold' },
    x: 205, y: 65, w: 169, h: 179,
    displayW: 160, tier: 1, hp: 2, damage: 1,
  },
  skeleton: {
    key: 'skeleton',
    name: { es: 'Esqueleto', en: 'Skeleton' },
    x: 385, y: 40, w: 189, h: 199,
    displayW: 170, tier: 1, hp: 4, damage: 1,
  },
  gnoll: {
    key: 'gnoll',
    name: { es: 'Gnoll', en: 'Gnoll' },
    // Intermediate — top-right of monsters.png
    x: 648, y: 40, w: 179, h: 214,
    displayW: 180, tier: 2, hp: 5, damage: 1,
  },
  gazer: {
    key: 'gazer',
    name: { es: 'Gazer', en: 'Gazer' },
    x: 838, y: 55, w: 194, h: 199,
    displayW: 180, tier: 2, hp: 5, damage: 2,
  },
  ogre: {
    key: 'ogre',
    name: { es: 'Ogro', en: 'Ogre' },
    x: 1055, y: 40, w: 179, h: 214,
    displayW: 185, tier: 2, hp: 6, damage: 2,
  },
  minotaur: {
    key: 'minotaur',
    name: { es: 'Minotauro', en: 'Minotaur' },
    // Greater — middle section
    x: 5, y: 335, w: 194, h: 244,
    displayW: 210, tier: 3, hp: 8, damage: 2,
  },
  medusa: {
    key: 'medusa',
    name: { es: 'Medusa', en: 'Medusa' },
    x: 210, y: 335, w: 184, h: 244,
    displayW: 200, tier: 3, hp: 7, damage: 2,
  },
  beholder: {
    key: 'beholder',
    name: { es: 'Contemplador', en: 'Beholder' },
    x: 415, y: 340, w: 189, h: 239,
    displayW: 200, tier: 3, hp: 9, damage: 3,
  },
  lich: {
    key: 'lich',
    name: { es: 'Lich', en: 'Lich' },
    // Elite — bottom section
    x: 5, y: 590, w: 134, h: 229,
    displayW: 180, tier: 4, hp: 12, damage: 3,
  },
  ettin: {
    key: 'ettin',
    name: { es: 'Ettin', en: 'Ettin' },
    x: 330, y: 570, w: 269, h: 249,
    displayW: 240, tier: 4, hp: 14, damage: 3,
  },
  dragon: {
    key: 'dragon',
    name: { es: 'Dragón Rojo', en: 'Red Dragon' },
    // Elite boss — right side of the sheet (large)
    x: 648, y: 340, w: 574, h: 464,
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
  const pool = getMonstersByTier(tier);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickBossMonster(floor, totalFloors) {
  if (floor >= totalFloors) return MONSTERS.dragon;
  const tier = BOSS_TIER_BY_FLOOR[Math.min(floor, 9)] ?? 2;
  const pool = getMonstersByTier(tier);
  return pool[Math.floor(Math.random() * pool.length)];
}