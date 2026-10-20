import { pickMonster, pickBossMonster } from '../data/monsters';

function randomBg(options) {
  return options[Math.floor(Math.random() * options.length)];
}

export function generateFloor(floor, totalFloors) {
  const rooms = [];
  const isFinal = floor >= totalFloors;

  // First room
  rooms.push({
    type: 'empty',
    bg: floor === 1 ? 'entrance' : 'corridor',
    id: `${floor}-0`,
  });

  // Middle rooms: 2–4 filler rooms with random encounters
  const middleCount = 2 + Math.min(floor - 1, 3);
  let hasTreasure = false;

  for (let i = 0; i < middleCount; i++) {
    const roll = Math.random();

    if (roll < 0.38) {
      rooms.push({
        type: 'monster',
        bg: randomBg(['battle', 'lair']),
        monster: pickMonster(floor),
        id: `${floor}-mid-${i}`,
      });
    } else if (roll < 0.48 && !hasTreasure) {
      hasTreasure = true;
      rooms.push({ type: 'treasure', bg: 'treasure', id: `${floor}-t-${i}` });
    } else {
      rooms.push({
        type: 'empty',
        bg: randomBg(['corridor', 'room', 'tjunction']),
        id: `${floor}-e-${i}`,
      });
    }
  }

  // Boss room (always has a monster)
  rooms.push({
    type: 'monster',
    bg: isFinal ? 'bossdoor' : 'battle',
    monster: pickBossMonster(floor, totalFloors),
    isBoss: true,
    id: `${floor}-boss`,
  });

  // Stairs room (or victory marker if final floor)
  rooms.push({
    type: 'stairs',
    bg: 'deeppit',
    id: `${floor}-stairs`,
  });

  return rooms;
}
