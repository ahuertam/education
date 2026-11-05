// Tests de los datos del Typer Dungeon.
//
// El nombre de la mazmorra y el tiempo por palabra son lo que convierte un
// número de piso en algo con significado, así que se comprueban.

import { DUNGEON_NAMES, FINAL_DUNGEON, dungeonName } from './dungeons';
import { getWordDifficultyLevel, timeLimitForLevel, getWord } from './words';

describe('nombres de mazmorra', () => {
  it('hay un nombre para cada piso que se puede jugar', () => {
    expect(DUNGEON_NAMES.length).toBeGreaterThanOrEqual(10);
  });

  it('ningún nombre está repetido', () => {
    const nombres = DUNGEON_NAMES.map((n) => n.toLowerCase());
    expect(new Set(nombres).size).toBe(nombres.length);
  });

  it('el nombre sale del listado según el piso', () => {
    expect(dungeonName(1)).toBe(DUNGEON_NAMES[0]);
    expect(dungeonName(3)).toBe(DUNGEON_NAMES[2]);
  });

  it('el piso final tiene su propio nombre', () => {
    expect(dungeonName(5, 5)).toBe(FINAL_DUNGEON);
    expect(dungeonName(10, 10)).toBe(FINAL_DUNGEON);
  });

  it('un piso por encima del listado no rompe nada', () => {
    expect(typeof dungeonName(99, 99)).toBe('string');
    expect(dungeonName(99, 99).length).toBeGreaterThan(0);
  });

  it('el piso 0 no tiene nombre de mazmorra', () => {
    expect(dungeonName(0)).toBe('El Umbral');
  });
});

describe('tiempo por palabra', () => {
  it('sin límite base no hay límite', () => {
    expect(timeLimitForLevel(0, 1)).toBe(0);
    expect(timeLimitForLevel(0, 5)).toBe(0);
  });

  it('el nivel 1 recibe el tiempo que eligió el niño', () => {
    expect(timeLimitForLevel(12, 1)).toBe(12);
  });

  it('el tiempo crece con el nivel de la palabra', () => {
    const tiempos = [1, 2, 3, 4, 5].map((n) => timeLimitForLevel(12, n));
    for (let i = 1; i < tiempos.length; i++) {
      expect(tiempos[i]).toBeGreaterThan(tiempos[i - 1]);
    }
  });

  it('las palabras largas del último piso tienen más margen', () => {
    // El nivel 1 son palabras de 3-5 letras y el 5, de unas 15.
    const nivel = getWordDifficultyLevel('normal', 9);
    expect(nivel).toBeGreaterThan(getWordDifficultyLevel('normal', 1));
    expect(timeLimitForLevel(12, nivel)).toBeGreaterThan(timeLimitForLevel(12, 1));
  });

  it('el nivel de palabra sube con el piso', () => {
    expect(getWordDifficultyLevel('normal', 9)).toBeGreaterThan(getWordDifficultyLevel('normal', 1));
  });
});

describe('las palabras del último piso son más largas', () => {
  it('el promedio de letras crece con el nivel', () => {
    const longitudes = [1, 2, 3, 4, 5].map((nivel) => {
      const palabras = [];
      for (let i = 0; i < 40; i++) {
        const palabra = getWord('normal', 'es', nivel * 2, new Set());
        if (palabra) palabras.push(palabra.length);
      }
      return palabras.reduce((s, l) => s + l, 0) / (palabras.length || 1);
    });
    // El último nivel tiene que ser claramente más largo que el primero.
    expect(longitudes[4]).toBeGreaterThan(longitudes[0] + 3);
  });
});
