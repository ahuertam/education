// Sprite-sheet coordinates for uiElements.png (1268×832).
// Adjust the values below using the browser DevTools / an image editor.
// Hero idle/walk row and attack row are sized in pixels per frame.

const PUBLIC_URL = process.env.PUBLIC_URL;

export const HERO_SPRITE = {
  src: `${PUBLIC_URL}/games/mazmorra/uiElements.png`,
  sheetW: 1268,
  sheetH: 832,
  frameW: 158,
  frameH: 270,
  idleFrames: 8,
  attackFrames: 8,
  idleRowY: 0,
  attackRowY: 278,
};

export const MONSTERS_SPRITE = {
  src: `${PUBLIC_URL}/games/mazmorra/monsters.png`,
  sheetW: 1268,
  sheetH: 832,
};

export const DUNGEON_SPRITE = {
  src: `${PUBLIC_URL}/games/mazmorra/mazmorra1.png`,
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
