// Word pools by difficulty level (1–5).
// Levels 1–2: no tildes. Level 3+: tildes and ñ introduced.

export const wordsByDifficulty = {
  es: {
    1: ['sol', 'mar', 'pan', 'luz', 'paz', 'rey', 'pez', 'sal', 'fin', 'gas',
        'ley', 'oro', 'voz', 'gol', 'col', 'son', 'don', 'tan', 'van', 'ven',
        'ron', 'pon', 'can', 'ran', 'fan', 'rol', 'gel', 'gen', 'red', 'mes'],
    2: ['casa', 'luna', 'mesa', 'gato', 'lobo', 'roca', 'nube', 'lago', 'rana', 'toro',
        'vaca', 'nota', 'sopa', 'cama', 'mapa', 'ropa', 'tela', 'vida', 'zona', 'arma',
        'dedo', 'goma', 'nido', 'reto', 'saco', 'tema', 'polo', 'piso', 'tipo', 'modo',
        'pelo', 'pino', 'libro', 'verde', 'campo', 'fuego', 'hielo', 'torre', 'tigre', 'zorro'],
    3: ['escudo', 'bosque', 'piedra', 'puerta', 'camino', 'espada', 'flecha', 'sombra',
        'trueno', 'brillo', 'llamas', 'dragón', 'jardín', 'corazón', 'nación', 'misión',
        'visión', 'camión', 'rincón', 'balcón', 'botón', 'ratón', 'melón', 'jamón',
        'linterna', 'mazmorra', 'armadura', 'forestal', 'aventura', 'corredor'],
    4: ['castillo', 'monstruo', 'hechizo', 'guerrero', 'tesoro', 'fantasma', 'gigante',
        'caballero', 'laberinto', 'desierto', 'montaña', 'océano', 'princesa', 'ejercicio',
        'problema', 'sencillo', 'escalera', 'guarida', 'maldición', 'espíritu'],
    5: ['monstruoso', 'exploración', 'fortaleza', 'hechicero', 'invencible', 'caballeros',
        'legendario', 'encantado', 'todopoderoso', 'laberintos', 'mazmorroso', 'aventurero',
        'conjuración', 'ametrallador', 'invulnerabilidad', 'desintegración', 'extraordinario',
        'hipnotizador', 'vulnerabilidad', 'sobrecargado', 'desafiante', 'apabullante',
        'incandescente', 'indestructible', 'sobrenatural', 'transfiguración', 'abisal',
        'cefalopodo', 'quimera', 'simulacro'],
  },
  en: {
    1: ['cat', 'dog', 'sun', 'run', 'big', 'red', 'hot', 'cup', 'top', 'map',
        'key', 'box', 'hat', 'pen', 'leg', 'arm', 'eye', 'sky', 'day', 'way',
        'bat', 'fog', 'gem', 'ice', 'jam', 'orb', 'pit', 'rat', 'web', 'axe'],
    2: ['house', 'green', 'cloud', 'stone', 'water', 'light', 'flame', 'frost',
        'night', 'brave', 'sword', 'magic', 'horse', 'tower', 'arrow', 'cloak',
        'tiger', 'eagle', 'snake', 'storm', 'rogue', 'quest', 'blade', 'spell',
        'vault', 'chest', 'river', 'golem', 'torch', 'curse'],
    3: ['castle', 'dragon', 'battle', 'shield', 'goblin', 'forest', 'shadow', 'potion',
        'wizard', 'archer', 'knight', 'dungeon', 'lantern', 'ancient', 'crystal',
        'blazing', 'frozen', 'goblets', 'cavern', 'warrior', 'monster', 'phantom'],
    4: ['treasure', 'skeleton', 'enchanted', 'fortress', 'guardian', 'champion',
        'darkness', 'mystical', 'labyrinth', 'sorcerer', 'dungeons', 'thunders',
        'barbarian', 'legendary', 'celestial', 'warlord', 'betrayal', 'uprising'],
    5: ['adventure', 'dangerous', 'mysterious', 'invincible', 'enchantment',
        'exploration', 'adventurer', 'monstrous', 'battleground', 'dragonslayer'],
  },
};

// Difficulty setting → starting word level
const BASE_LEVEL = { easy: 1, normal: 2, hard: 3 };

export function getWordDifficultyLevel(difficulty, floor) {
  const base = BASE_LEVEL[difficulty] ?? 2;
  const floorBonus = Math.floor((floor - 1) / 2);
  return Math.min(5, base + floorBonus);
}

export function getWord(difficulty, language, floor, usedWords = new Set()) {
  const level = getWordDifficultyLevel(difficulty, floor);
  const lang = wordsByDifficulty[language] ?? wordsByDifficulty.es;
  const pool = lang[level] ?? lang[1];
  const available = pool.filter(w => !usedWords.has(w));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
