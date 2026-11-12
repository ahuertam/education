// Hojas de sprites de la mazmorra.
//
// El heroe y los monstruos ya vienen recortados con alfa real (scripts/
// recortar-sprites.mjs): antes el runtime los recortaba por color y el panel
// gris de los carteles se colaba en los sprites (manchas dentro de las
// figuras y una linea blanca vertical en el heroe). Ahora el recorte solo
// se aplica a las imagenes que todavia no traen alfa.

const PUBLIC_URL = process.env.PUBLIC_URL;

export const HERO_SPRITE = {
  src: `${PUBLIC_URL}/games/mazmorra/heroe.webp`,
  sheetW: 1192,
  sheetH: 478,
  frameW: 149,
  frameH: 239,
  // La figura del heroe mide 120x186 dentro de la celda (el resto es el
  // margen y el hueco que dejan las espadas de los frames de ataque).
  figureW: 120,
  idleFrames: 8,
  attackFrames: 8,
  idleRowY: 0,
  attackRowY: 239,
};

export const MONSTERS_SPRITE = {
  src: `${PUBLIC_URL}/games/mazmorra/monsters.webp`,
  sheetW: 1268,
  sheetH: 832,
};

export const DUNGEON_SPRITE = {
  src: `${PUBLIC_URL}/games/mazmorra/mazmorra1.webp`,
  sheetW: 1268,
  sheetH: 832,
  cellW: 422,
  cellH: 277,
  labelH: 52, // px cropped from the top of each cell (removes the text label)
};

// Maps background keys to a 3×3 grid cell in mazmorra1.png.
export const DUNGEON_GRID = {
  entrance: [0, 0], corridor: [1, 0], room:     [2, 0],
  tjunction:[0, 1], lair:     [1, 1], treasure: [2, 1],
  battle:   [0, 2], deeppit:  [1, 2], bossdoor: [2, 2],
};
