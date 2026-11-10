import { createRng, rngInt, rngPick } from './prng';
import { analyzeReachability } from './reachability';
import { validateLevel } from './solvability';

function difficultyConfig(difficulty) {
  if (difficulty === 'hard') {
    return { hazards: [3, 5], chunkCount: [3, 5], extraDoor: true, allowAcid: true, movingPlatforms: [1, 2] };
  }
  if (difficulty === 'medium') {
    return { hazards: [2, 4], chunkCount: [2, 4], extraDoor: true, allowAcid: false, movingPlatforms: [0, 1] };
  }
  return { hazards: [1, 3], chunkCount: [2, 3], extraDoor: false, allowAcid: false, movingPlatforms: [0, 1] };
}

function rectsOverlap(a, b, padding = 0) {
  return (
    Math.abs(a.x - b.x) * 2 < a.w + b.w + padding * 2 &&
    Math.abs(a.y - b.y) * 2 < a.h + b.h + padding * 2
  );
}

function pickRange(rng, [min, max]) {
  return rngInt(rng, min, max);
}

function groundTop(groundY, groundH) {
  return groundY - groundH / 2;
}

function safeButtonY({ groundY, groundH, buttonH }) {
  return groundTop(groundY, groundH) + buttonH / 2 - 2;
}

function safeHazardY({ groundY, groundH, hazardH }) {
  return groundTop(groundY, groundH) - hazardH / 2 + 6;
}

function toRect(centerRect) {
  return { x: centerRect.x, y: centerRect.y, w: centerRect.w, h: centerRect.h };
}

function makeId(prefix, idx) {
  return `${prefix}_${idx}`;
}

function tryPlace(rect, taken, padding = 10) {
  for (const t of taken) {
    if (rectsOverlap(rect, t, padding)) return false;
  }
  taken.push(rect);
  return true;
}

function hazardElementFor(rng, allowAcid) {
  const base = ['lava', 'water'];
  if (allowAcid && rng() < 0.25) return 'acid';
  return rngPick(rng, base);
}

function buildChunkPoolBridge({
  rng,
  cursor,
  groundY,
  groundH,
  idx,
  difficulty,
  allowAcid,
  occupancy
}) {
  const hazardH = 22;
  const bridgeH = 20;
  // El charco tiene que caber en un salto: el personaje avanza 229 px por
  // encima y con 320 de charco no se podia pasar y el nivel se quedaba sin
  // salida.
  const poolW = rngInt(rng, 110, 185);
  const padLeft = rngInt(rng, 120, 220);
  const poolX = cursor + padLeft + poolW / 2;
  const element = hazardElementFor(rng, allowAcid);

  const hazard = {
    id: makeId('hz', idx),
    x: poolX,
    y: safeHazardY({ groundY, groundH, hazardH }),
    w: poolW,
    h: hazardH,
    element,
    needsBridge: true
  };

  const bridge = {
    id: makeId('bridge', idx),
    x: poolX,
    y: groundTop(groundY, groundH) - rngInt(rng, 90, 180),
    w: poolW + rngInt(rng, 90, 160),
    h: bridgeH,
    kind: 'solid'
  };

  const placedHazard = tryPlace(toRect(hazard), occupancy.hazards, 28);
  const placedBridge = tryPlace(toRect(bridge), occupancy.platforms, 10);

  if (!placedHazard || !placedBridge) {
    return { ok: false };
  }

  const doors = [];
  const buttons = [];
  const crates = [];

  const lockChance = difficulty !== 'easy' ? 0.6 : 0.35;
  if (rng() < lockChance) {
    const doorW = rngInt(rng, 64, 110);
    const doorH = rngInt(rng, 56, 86);
    const door = {
      id: makeId('door_bridge', idx),
      x: poolX + rngInt(rng, -Math.floor(poolW / 4), Math.floor(poolW / 4)),
      y: bridge.y - (bridgeH / 2 + doorH / 2),
      w: doorW,
      h: doorH,
      open: false
    };

    if (tryPlace(toRect(door), occupancy.doors, 12)) {
      doors.push(door);

      const btnW = 70;
      const btnH = 14;
      const safeMinX = cursor + 60;
      const safeMaxX = cursor + padLeft - 100;
      if (safeMaxX <= safeMinX) {
        occupancy.doors.pop();
        doors.pop();
        return {
          ok: true,
          w: padLeft + poolW + rngInt(rng, 240, 360),
          platforms: [bridge],
          hazards: [hazard],
          doors: [],
          buttons: [],
          crates: []
        };
      }
      const btn = {
        id: makeId('btn_bridge', idx),
        x: rngInt(rng, safeMinX, safeMaxX),
        y: safeButtonY({ groundY, groundH, buttonH: btnH }),
        w: btnW,
        h: btnH,
        doorId: door.id
      };

      if (tryPlace(toRect(btn), occupancy.buttons, 18)) {
        const crate = {
          id: makeId('crate_bridge', idx),
          x: btn.x - 120,
          y: groundTop(groundY, groundH) - 140,
          w: 46,
          h: 46
        };
        if (tryPlace(toRect(crate), occupancy.crates, 12)) {
          buttons.push(btn);
          crates.push(crate);
        } else {
          occupancy.buttons.pop();
          occupancy.doors.pop();
          doors.pop();
        }
      } else {
        occupancy.doors.pop();
        doors.pop();
      }
    }
  }

  const w = padLeft + poolW + rngInt(rng, 240, 360);

  return {
    ok: true,
    w,
    platforms: [bridge],
    hazards: [hazard],
    doors,
    buttons,
    crates
  };
}

function buildChunkCrateLedge({ rng, cursor, groundY, groundH, idx, occupancy }) {
  const platforms = [];
  const hazards = [];
  const doors = [];
  const buttons = [];
  const crates = [];

  const btnW = 70;
  const btnH = 14;
  const ledgeW = rngInt(rng, 160, 220);
  const rise = rngInt(rng, 240, 420);
  const ledge = {
    id: makeId('ledge', idx),
    x: cursor + 360,
    y: groundTop(groundY, groundH) - rise,
    w: ledgeW,
    h: 20,
    kind: 'solid'
  };

  const stepCount = Math.max(3, Math.min(5, Math.round(rise / 95)));
  const steps = [];
  for (let i = 0; i < stepCount; i += 1) {
    steps.push({
      id: makeId('step', `${idx}_${i}`),
      x: cursor + 190 + i * 90,
      y: groundTop(groundY, groundH) - 80 - i * 85,
      w: 130,
      h: 20,
      kind: 'solid'
    });
  }

  const door = {
    id: makeId('door_gate', idx),
    x: cursor + 520,
    y: groundTop(groundY, groundH) - rngInt(rng, 140, 220),
    w: rngInt(rng, 70, 110),
    h: rngInt(rng, 90, 110),
    open: false
  };

  const btn = {
    id: makeId('btn_ledge', idx),
    x: ledge.x,
    y: ledge.y - (20 / 2 + btnH / 2),
    w: btnW,
    h: btnH,
    doorId: door.id
  };

  const crateA = {
    id: makeId('crate_a', idx),
    x: cursor + 150,
    y: groundTop(groundY, groundH) - 140,
    w: 46,
    h: 46
  };

  const crateB = {
    id: makeId('crate_b', idx),
    x: cursor + 200,
    y: groundTop(groundY, groundH) - 140,
    w: 46,
    h: 46
  };

  let ok = true;
  for (const s of steps) ok = ok && tryPlace(toRect(s), occupancy.platforms, 8);
  ok =
    ok &&
    tryPlace(toRect(ledge), occupancy.platforms, 8) &&
    tryPlace(toRect(door), occupancy.doors, 14) &&
    tryPlace(toRect(btn), occupancy.buttons, 14) &&
    tryPlace(toRect(crateA), occupancy.crates, 12) &&
    tryPlace(toRect(crateB), occupancy.crates, 12);

  if (!ok) return { ok: false };

  platforms.push(...steps, ledge);
  doors.push(door);
  buttons.push(btn);
  crates.push(crateA, crateB);

  return {
    ok: true,
    w: 760,
    platforms,
    hazards,
    doors,
    buttons,
    crates
  };
}

function buildChunkMovingGap({ rng, cursor, groundY, groundH, idx, allowAcid, occupancy }) {
  const platforms = [];
  const hazards = [];
  const doors = [];
  const buttons = [];
  const crates = [];

  const startDeck = {
    id: makeId('deck_left', idx),
    x: cursor + 220,
    y: groundTop(groundY, groundH) - rngInt(rng, 220, 420),
    w: 280,
    h: 20,
    kind: 'solid'
  };
  const endDeck = {
    id: makeId('deck_right', idx),
    x: cursor + 680,
    y: startDeck.y + rngInt(rng, -120, 120),
    w: 260,
    h: 20,
    kind: 'solid'
  };

  const axis = rng() < 0.55 ? 'x' : 'y';
  const moving = {
    id: makeId('moving', idx),
    x: cursor + 460,
    y: Math.min(startDeck.y, endDeck.y) - rngInt(rng, 70, 120),
    w: 170,
    h: 18,
    kind: 'moving',
    axis
  };
  if (axis === 'x') {
    moving.vx = rng() < 0.5 ? 120 : -120;
    moving.rangeX = rngInt(rng, 140, 220);
  } else {
    moving.vy = rng() < 0.5 ? 120 : -120;
    moving.rangeY = rngInt(rng, 120, 220);
  }

  const ok =
    tryPlace(toRect(startDeck), occupancy.platforms, 10) &&
    tryPlace(toRect(endDeck), occupancy.platforms, 10) &&
    tryPlace(toRect(moving), occupancy.platforms, 10);

  if (!ok) return { ok: false };

  platforms.push(startDeck, endDeck, moving);

  if (allowAcid && rng() < 0.5) {
    const hazardH = 22;
    const poolW = 320;
    const hazard = {
      id: makeId('hz_gap', idx),
      x: cursor + 470,
      y: safeHazardY({ groundY, groundH, hazardH }),
      w: poolW,
      h: hazardH,
      element: 'acid',
      needsBridge: false
    };
    if (tryPlace(toRect(hazard), occupancy.hazards, 24)) hazards.push(hazard);
  }

  return {
    ok: true,
    w: 940,
    platforms,
    hazards,
    doors,
    buttons,
    crates
  };
}

export function generateLevel({ seed, difficulty }) {
  const rng = createRng(`${seed}::${difficulty}`);
  const cfg = difficultyConfig(difficulty);

  const height = 900;

  const groundY = height - 40;
  const groundH = 40;

  const occupancy = {
    platforms: [],
    hazards: [],
    buttons: [],
    doors: [],
    crates: []
  };

  const platforms = [];

  const spawns = {
    fire: { x: 120, y: groundY - 120 },
    water: { x: 200, y: groundY - 120 }
  };

  // Zona que ocupan los dos personajes al aparecer (unos 40×60 cada uno).
  // Nada puede colocarse encima: si el nivel nace con una escalera o una
  // plataforma encima del jugador, no se puede ni empezar, y el validador
  // tiraba el nivel entero por eso.
  const zonaSpawn = { x: 90, y: groundY - 170, w: 140, h: 100 };

  const hazardsList = [];
  const doors = [];
  const buttons = [];
  const crates = [];
  const collectibles = [];
  const levers = [];
  const mirrors = [];
  const laserEmitters = [];
  const laserSensors = [];

  const chunkCount = pickRange(rng, cfg.chunkCount);
  const desiredHazards = pickRange(rng, cfg.hazards);

  let cursor = 420;
  let chunkIdx = 0;
  let hazardIdx = 0;
  let movingUsed = 0;
  const movingBudget = pickRange(rng, cfg.movingPlatforms);

  const chunkOrder = [];
  const baseTemplates = ['poolBridge', 'crateLedge'];
  if (movingBudget > 0) baseTemplates.push('movingGap');

  for (let i = 0; i < chunkCount; i += 1) {
    if (movingUsed < movingBudget && rng() < 0.4) {
      chunkOrder.push('movingGap');
      movingUsed += 1;
      continue;
    }
    chunkOrder.push(rngPick(rng, baseTemplates));
  }

  for (const kind of chunkOrder) {
    let built = { ok: false };
    const attempts = 6;
    for (let a = 0; a < attempts && !built.ok; a += 1) {
      if (kind === 'poolBridge' && hazardIdx < desiredHazards) {
        built = buildChunkPoolBridge({
          rng,
          cursor,
          groundY,
          groundH,
          idx: hazardIdx,
          difficulty,
          allowAcid: cfg.allowAcid,
          occupancy
        });
      } else if (kind === 'movingGap') {
        built = buildChunkMovingGap({
          rng,
          cursor,
          groundY,
          groundH,
          idx: chunkIdx,
          allowAcid: cfg.allowAcid,
          occupancy
        });
      } else {
        built = buildChunkCrateLedge({ rng, cursor, groundY, groundH, idx: chunkIdx, occupancy });
      }

      if (!built.ok) cursor += rngInt(rng, 40, 80);
    }

    if (!built.ok) continue;

    platforms.push(...built.platforms);
    hazardsList.push(...built.hazards);
    doors.push(...built.doors);
    buttons.push(...built.buttons);
    crates.push(...built.crates);

    if (kind === 'poolBridge' && built.ok) hazardIdx += 1;
    cursor += built.w + rngInt(rng, 120, 200);
    chunkIdx += 1;
  }

  const gateRise = rngInt(rng, 380, 560);
  const gateY = groundTop(groundY, groundH) - gateRise;
  const gateX = cursor + 240;

  const stairCount = Math.max(5, Math.min(8, Math.round(gateRise / 85)));
  const endPlatforms = [];
  for (let i = 0; i < stairCount; i += 1) {
    const t = (i + 1) / (stairCount + 1);
    endPlatforms.push({
      id: `stair_${i + 1}`,
      x: gateX - 440 + (i + 1) * 90,
      y: groundTop(groundY, groundH) - Math.round(gateRise * t),
      w: 170,
      h: 20,
      kind: 'solid'
    });
  }
  endPlatforms.push({ id: 'gate_path', x: gateX + 260, y: gateY, w: 720, h: 20, kind: 'solid' });

  if (rng() < 0.65) {
    const rangeY = Math.max(110, Math.min(260, Math.round(gateRise / 2)));
    endPlatforms.push({
      id: 'lift_end',
      x: gateX - 260,
      y: groundTop(groundY, groundH) - Math.round(gateRise * 0.55),
      w: 160,
      h: 18,
      kind: 'moving',
      axis: 'y',
      vy: rng() < 0.5 ? 120 : -120,
      rangeY
    });
    endPlatforms.push({
      id: 'lift_end_mid',
      x: gateX - 360,
      y: groundTop(groundY, groundH) - Math.round(gateRise * 0.35),
      w: 160,
      h: 20,
      kind: 'solid'
    });
  }
  for (const p of endPlatforms) {
    // La pasarela del final es imprescindible: es el suelo de las salidas.
    // Si tryPlace la rechaza por una plataforma que se cruza, se coloca
    // igual y las salidas se quedan sobre ella.
    if (p.id === 'gate_path') {
      occupancy.platforms.push(toRect(p));
      platforms.push(p);
      continue;
    }
    // Las escaleras de la puerta son el unico camino a la salida: si alguna
    // no se coloca, la salida se queda sin suelo y el nivel no se puede
    // terminar.
    if (p.id.startsWith('stair_') || tryPlace(toRect(p), occupancy.platforms, 10)) {
      occupancy.platforms.push(toRect(p));
      platforms.push(p);
    }
  }

  // Una puerta no puede caer encima de una plataforma (la pasarela del final
  // es el camino a la salida y una puerta encima lo tapa) ni encima de los
  // personajes.
  const sitioLibrePara = (rect) => {
    if (rectsOverlap(rect, zonaSpawn, 8)) return false;
    for (const p of occupancy.platforms) if (rectsOverlap(rect, p, 14)) return false;
    for (const d of occupancy.doors) if (rectsOverlap(rect, d, 14)) return false;
    return true;
  };

  const mainDoor = { id: 'door_main', x: gateX, y: gateY - 10, w: 84, h: 98, open: false, activation: 'button' };
  if (sitioLibrePara(toRect(mainDoor))) {
    tryPlace(toRect(mainDoor), occupancy.doors, 14);
    doors.push(mainDoor);
  }

  if (cfg.extraDoor) {
    const door2 = { id: 'door_side', x: gateX + 180, y: gateY - 10, w: 84, h: 98, open: false, activation: 'button' };
    if (sitioLibrePara(toRect(door2))) {
      tryPlace(toRect(door2), occupancy.doors, 14);
      doors.push(door2);
    }
  }

  const ensureButtonForDoor = (door, idx) => {
    const btnW = 70;
    const btnH = 14;
    // El botón no puede estar ni encima de los personajes ni pegado a la
    // puerta, y las escaleras que suben hasta elshelf se colocan a su
    // izquierda: por eso el botón empieza en 460 y no antes (una escalera
    // en 215 caia justo encima del jugador de agua).
    const minX = 460;
    const maxX = gateX - 460;
    const rango = Math.max(0, maxX - minX);
    for (let i = 0; i < 40; i += 1) {
      // La x se va rotando en vez de sortearla siempre del mismo rango: si
      // no, los 40 intentos caian en los mismos huecos ocupados.
      const x = minX + (rango > 0 ? (i * 137) % rango : 0);
      const prevOccPlatforms = occupancy.platforms.length;
      const prevOccButtons = occupancy.buttons.length;
      const prevOccCrates = occupancy.crates.length;
      const prevPlatforms = platforms.length;
      const prevButtons = buttons.length;
      const prevCrates = crates.length;

      const shelfMode = rng() < 0.55 && rango > 0;
      let buttonY = safeButtonY({ groundY, groundH, buttonH: btnH });
      const extraPlatforms = [];

      if (shelfMode) {
        const rise = rngInt(rng, 200, 460);
        const shelf = { id: `btn_shelf_${door.id}_${idx}_${i}`, x, y: groundTop(groundY, groundH) - rise, w: 190, h: 20, kind: 'solid' };
        const stepCount = Math.max(2, Math.min(5, Math.round(rise / 105)));
        const steps = [];
        for (let s = 0; s < stepCount; s += 1) {
          const tt = (s + 1) / (stepCount + 1);
          steps.push({
            id: `btn_step_${door.id}_${idx}_${i}_${s}`,
            x: x - 240 + (s + 1) * 95,
            y: groundTop(groundY, groundH) - Math.round(rise * tt),
            w: 150,
            h: 20,
            kind: 'solid'
          });
        }

        // Ni el shelf ni sus escaleras pueden pisar la zona de aparicion.
        const pisaSpawn = [shelf, ...steps].some((p) => rectsOverlap(toRect(p), zonaSpawn, 8));
        let okPlatforms = !pisaSpawn && tryPlace(toRect(shelf), occupancy.platforms, 10);
        for (const st of steps) okPlatforms = okPlatforms && tryPlace(toRect(st), occupancy.platforms, 10);
        if (!okPlatforms) {
          occupancy.platforms.length = prevOccPlatforms;
          continue;
        }

        extraPlatforms.push(...steps, shelf);
        buttonY = shelf.y - shelf.h / 2 + btnH / 2 - 2;
      }

      const btn = { id: `btn_${door.id}_${idx}_${i}`, x, y: buttonY, w: btnW, h: btnH, doorId: door.id };
      const overlapsHazard = hazardsList.some(hz => rectsOverlap(toRect(btn), toRect(hz), 18));
      if (overlapsHazard || !tryPlace(toRect(btn), occupancy.buttons, 18)) {
        occupancy.platforms.length = prevOccPlatforms;
        occupancy.buttons.length = prevOccButtons;
        continue;
      }

      let cratePlaced = false;
      for (let cTry = 0; cTry < 10 && !cratePlaced; cTry += 1) {
        const crate = {
          id: `crate_${door.id}_${idx}_${i}_${cTry}`,
          x: btn.x - rngInt(rng, 90, 150),
          y: groundTop(groundY, groundH) - 140,
          w: 46,
          h: 46
        };
        const crateOverlapsHazard = hazardsList.some(hz => rectsOverlap(toRect(crate), toRect(hz), 14));
        if (crateOverlapsHazard) continue;
        if (tryPlace(toRect(crate), occupancy.crates, 12)) {
          crates.push(crate);
          cratePlaced = true;
        }
      }

      if (!cratePlaced) {
        occupancy.platforms.length = prevOccPlatforms;
        occupancy.buttons.length = prevOccButtons;
        occupancy.crates.length = prevOccCrates;
        platforms.length = prevPlatforms;
        buttons.length = prevButtons;
        crates.length = prevCrates;
        continue;
      }

      platforms.push(...extraPlatforms);
      buttons.push(btn);
      return true;
    }
    return false;
  };

  for (let i = 0; i < doors.length; i += 1) {
    // Si no se encuentra sitio para el boton, la puerta se quita: una puerta
    // sin boton deja el nivel sin poder terminar, y es mejor que no exista.
    if (!ensureButtonForDoor(doors[i], i)) {
      doors.splice(i, 1);
      i -= 1;
    }
  }

  const width = Math.max(gateX + 700, 2400);
  platforms.unshift({ id: 'ground', x: width / 2, y: groundY, w: width, h: groundH, kind: 'solid' });

  const topY = Math.max(140, groundTop(groundY, groundH) - 620);
  const midY = Math.max(220, groundTop(groundY, groundH) - 360);
  const laneYs = [midY, topY];

  let segId = 0;
  for (const laneY of laneYs) {
    let x = 260;
    const maxX = width - 720;
    while (x < maxX) {
      const segW = rngInt(rng, 260, 540);
      const gap = rngInt(rng, 120, 220);
      const wSeg = Math.min(segW, maxX - x);
      const material = rng() < 0.28 ? 'ice' : 'stone';
      const p = { id: `lane_${segId}`, x: x + wSeg / 2, y: laneY, w: wSeg, h: 20, kind: 'solid', material };
      if (tryPlace(toRect(p), occupancy.platforms, 10)) platforms.push(p);

      if (rng() < 0.25) {
        const lift = {
          id: `lift_${segId}`,
          x: x + wSeg + Math.floor(gap / 2),
          y: laneY + 120,
          w: 160,
          h: 18,
          kind: 'moving',
          axis: 'y',
          vy: rng() < 0.5 ? 120 : -120,
          rangeY: rngInt(rng, 140, 260)
        };
        if (tryPlace(toRect(lift), occupancy.platforms, 14)) platforms.push(lift);
      }

      if (rng() < 0.22) {
        // Una escalera de SUBIDA desde el suelo hasta la calle. Antes estas
        // escaleras bajaban desde la calle, y como la calle esta a 360 px del
        // suelo (y el salto llega a 122) no habia forma de subirse: la calle
        // y las gemas que estaban en ella eran inalcanzables.
        const rise = groundTop(groundY, groundH) - laneY;
        const stepCount = Math.max(3, Math.min(7, Math.round(rise / 85)));
        for (let i = 0; i < stepCount; i += 1) {
          const t = (i + 1) / (stepCount + 1);
          const stair = {
            id: `stair_extra_${segId}_${i}`,
            x: x + 80 + (i + 1) * 95,
            y: groundTop(groundY, groundH) - Math.round(rise * t),
            w: 150,
            h: 20,
            kind: 'solid'
          };
          // Se colocan siempre: son la subida a la calle y sin ella la calle
          // no se puede alcanzar.
          occupancy.platforms.push(toRect(stair));
          platforms.push(stair);
        }
      }

      x += wSeg + gap;
      segId += 1;
    }
  }

  const roomBands = [
    { floor: groundTop(groundY, groundH), ceiling: midY - 130 },
    { floor: midY, ceiling: topY - 120 }
  ];
  for (let i = 0; i < roomBands.length; i += 1) {
    const band = roomBands[i];
    let x = 420;
    while (x < width - 420) {
      const roomW = rngInt(rng, 320, 560);
      const wallW = 26;
      const leftWall = {
        id: `room_left_${i}_${x}`,
        x,
        y: (band.floor + band.ceiling) / 2,
        w: wallW,
        h: Math.max(140, band.floor - band.ceiling),
        kind: 'solid',
        material: 'stone'
      };
      const ceiling = {
        id: `room_ceiling_${i}_${x}`,
        x: x + roomW / 2,
        y: band.ceiling,
        w: roomW,
        h: 20,
        kind: 'solid',
        material: 'stone'
      };
      if (tryPlace(toRect(leftWall), occupancy.platforms, 8)) platforms.push(leftWall);
      if (tryPlace(toRect(ceiling), occupancy.platforms, 8)) platforms.push(ceiling);
      x += roomW + rngInt(rng, 160, 260);
    }
  }

  const leverDoor = {
    id: 'door_lever',
    x: Math.max(920, gateX - 720),
    y: midY - 42,
    w: 84,
    h: 98,
    open: false,
    activation: 'lever'
  };
  if (tryPlace(toRect(leverDoor), occupancy.doors, 12)) {
    const lever = {
      id: 'lever_mid',
      x: leverDoor.x - 260,
      y: topY - 14,
      w: 40,
      h: 28,
      doorId: leverDoor.id
    };
    const leverShelf = {
      id: 'lever_shelf',
      x: lever.x,
      y: topY,
      w: 180,
      h: 20,
      kind: 'solid',
      material: 'stone'
    };
    if (tryPlace(toRect(leverShelf), occupancy.platforms, 8) && tryPlace(toRect(lever), occupancy.buttons, 8)) {
      doors.push(leverDoor);
      platforms.push(leverShelf);
      levers.push(lever);
    } else {
      occupancy.doors.pop();
    }
  }

  const laserDoor = {
    id: 'door_laser',
    x: Math.max(1180, gateX - 420),
    y: topY - 42,
    w: 84,
    h: 98,
    open: false,
    activation: 'laser'
  };
  if (tryPlace(toRect(laserDoor), occupancy.doors, 12)) {
    const emitter = {
      id: 'laser_emit_0',
      x: Math.max(520, gateX - 1120),
      y: topY - 70,
      direction: 'right'
    };
    // El rayo sale hacia la derecha y tiene que rebotar hacia abajo para
    // llegar al sensor, que esta justo debajo del espejo. Con el espejo en
    // '/' el rayo subia y el sensor no se activaba nunca: la puerta del
    // laser no abria nunca y el nivel no se podia terminar.
    const mirrorA = {
      id: 'mirror_a',
      x: emitter.x + 260,
      y: topY - 70,
      orientation: '\\'
    };
    // Este segundo espejo es decorativo: esta fuera del recorrido del rayo
    // para no cortarlo.
    const mirrorB = {
      id: 'mirror_b',
      x: emitter.x + 520,
      y: midY - 110,
      orientation: '\\'
    };
    // Los estantes van por debajo de las calles: a la misma altura chocaban
    // con ellas y el laser no se generaba nunca (estaba muerto).
    const mirrorShelf = {
      id: 'mirror_shelf',
      x: emitter.x + 200,
      y: topY - 40,
      w: 220,
      h: 20,
      kind: 'solid',
      material: 'stone'
    };
    // El sensor va justo debajo del espejo, en la misma x, que es por donde
    // baja el rayo.
    // El estante del sensor va a ras de suelo, que siempre esta libre.
    const sensorShelf = {
      id: 'sensor_shelf',
      x: mirrorA.x - 100,
      y: groundTop(groundY, groundH) - 30,
      w: 200,
      h: 20,
      kind: 'solid',
      material: 'stone'
    };
    // El sensor va en la misma x que el espejo, que es por donde baja el
    // rayo, y encima de su estante.
    const sensor = {
      id: 'laser_sensor_0',
      x: mirrorA.x,
      y: groundTop(groundY, groundH) - 52,
      w: 40,
      h: 44,
      doorId: laserDoor.id
    };
    const dMirrorShelf = tryPlace(toRect(mirrorShelf), occupancy.platforms, 8);
    const dSensorShelf = tryPlace(toRect(sensorShelf), occupancy.platforms, 8);
    const dMirrorA = tryPlace({ x: mirrorA.x, y: mirrorA.y, w: 36, h: 36 }, occupancy.buttons, 8);
    const dMirrorB = tryPlace({ x: mirrorB.x, y: mirrorB.y, w: 36, h: 36 }, occupancy.buttons, 8);
    const dSensor = tryPlace(toRect(sensor), occupancy.buttons, 8);
    if (dMirrorShelf && dSensorShelf && dMirrorA && dMirrorB && dSensor) {
      doors.push(laserDoor);
      platforms.push(mirrorShelf, sensorShelf);
      laserEmitters.push(emitter);
      mirrors.push(mirrorA, mirrorB);
      laserSensors.push(sensor);
    } else {
      occupancy.doors.pop();
    }
  }

  // La salida tiene que quedar encima de la pasarela del final (gate_path),
  // no flotando al final del mapa: antes se colocaba a una distancia fija
  // del ancho del nivel, y si el ancho no llegaba la salida se quedaba en el
  // aire, sin suelo debajo.
  // La pasarela va centrada en gateX + 260 y mide 720 de ancho: su borde
  // derecho está en gateX + 620.
  const finPasarela = gateX + 260 + 360;
  const exits = {
    fire: { x: finPasarela - 210, y: gateY - 40, w: 56, h: 86 },
    water: { x: finPasarela - 120, y: gateY - 40, w: 56, h: 86 }
  };

  const gemCount = difficulty === 'hard' ? rngInt(rng, 10, 16) : difficulty === 'medium' ? rngInt(rng, 8, 12) : rngInt(rng, 6, 10);
  for (let i = 0; i < gemCount; i += 1) {
    const owner = i % 2 === 0 ? 'fire' : 'water';
    const laneY = rngPick(rng, [groundTop(groundY, groundH) - 40, midY - 30, topY - 30]);
    const x = rngInt(rng, 320, width - 520);
    const gem = { id: `gem_${owner}_${i}`, x, y: laneY, w: 18, h: 18, owner, kind: 'gem' };
    const overlapsHazard = hazardsList.some(hz => rectsOverlap(toRect(gem), toRect(hz), 16));
    // Una gema dentro de un muro no se puede coger: el nivel no se termina
    // nunca. Las calles (lanes) ya estan colocadas en esas alturas, asi que
    // hay que comprobarlo.
    const overlapsSolid = platforms.some(p => rectsOverlap(toRect(gem), toRect(p), 6));
    // Ni dentro de una puerta (la del laser, por ejemplo), ni encima de un
    // boton o una caja.
    const overlapsDoor = doors.some(d => rectsOverlap(toRect(gem), toRect(d), 6));
    const overlapsButton = buttons.some(b => rectsOverlap(toRect(gem), toRect(b), 4));
    const overlapsCrate = crates.some(c => rectsOverlap(toRect(gem), toRect(c), 4));
    // Y una gema encima de la salida estorba: el personaje llega y no la
    // puede coger.
    const overlapsExit = [exits.fire, exits.water].some(ex => rectsOverlap(toRect(gem), toRect(ex), 10));
    if (overlapsHazard || overlapsSolid || overlapsDoor || overlapsButton || overlapsCrate || overlapsExit) continue;
    collectibles.push(gem);
  }

  const nivel = {
    seed,
    difficulty,
    size: { width, height },
    spawns,
    platforms,
    hazards: hazardsList,
    doors,
    buttons,
    crates,
    levers,
    mirrors,
    laserEmitters,
    laserSensors,
    collectibles,
    exits
  };

  // Las gemas que no se pueden coger sobran: el nivel no se puede terminar
  // y el niño no tiene forma de saber por que. El analisis de
  // alcanzabilidad dice cuales son.
  const inalcanzables = new Set(
    analyzeReachability(nivel)
      .filter((p) => p.startsWith('gema_inalcanzable:'))
      .map((p) => p.split(':')[1])
  );
  if (inalcanzables.size) {
    nivel.collectibles = nivel.collectibles.filter((g) => !inalcanzables.has(g.id));
  }

  return nivel;
}

/**
 * Genera un nivel que se pueda completar.
 *
 * Un nivel puede salir invalido (una salida que no se alcanza, una puerta sin
 * boton). En vez de enseñar un cartel rojo al nino, se prueban varias semillas
 * hasta que sale uno jugable.
 */
export function generateValidLevel({ seed, difficulty, intentos = 12 }) {
  const base = String(seed || 'nivel');
  let ultimo = null;
  let ultimoMotivo = '';

  for (let intento = 0; intento < intentos; intento++) {
    const semilla = intento === 0 ? base : `${base}~${intento}`;
    const nivel = generateLevel({ seed: semilla, difficulty });
    ultimo = nivel;
    const validacion = validateLevel(nivel);
    if (validacion.ok) return nivel;
    ultimoMotivo = validacion.reasons.join(', ');
  }

  // Si ninguno sale bien, se devuelve el ultimo: el juego lo dira en
  // pantalla y el nino puede pedir otro nivel.
  return { ...ultimo, avisos: ultimoMotivo };
}
