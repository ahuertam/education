import { createRng, rngInt, rngPick } from './prng';

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
  const poolW = rngInt(rng, 180, 320);
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

  const hazardsList = [];
  const doors = [];
  const buttons = [];
  const crates = [];

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
    if (tryPlace(toRect(p), occupancy.platforms, 10)) platforms.push(p);
  }

  const mainDoor = { id: 'door_main', x: gateX, y: gateY - 10, w: 84, h: 98, open: false };
  if (tryPlace(toRect(mainDoor), occupancy.doors, 14)) doors.push(mainDoor);

  if (cfg.extraDoor) {
    const door2 = { id: 'door_side', x: gateX + 180, y: gateY - 10, w: 84, h: 98, open: false };
    if (tryPlace(toRect(door2), occupancy.doors, 14)) doors.push(door2);
  }

  const ensureButtonForDoor = (door, idx) => {
    const btnW = 70;
    const btnH = 14;
    for (let i = 0; i < 16; i += 1) {
      const x = rngInt(rng, 360, gateX - 460);
      const prevOccPlatforms = occupancy.platforms.length;
      const prevOccButtons = occupancy.buttons.length;
      const prevOccCrates = occupancy.crates.length;
      const prevPlatforms = platforms.length;
      const prevButtons = buttons.length;
      const prevCrates = crates.length;

      const shelfMode = rng() < 0.55;
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

        let okPlatforms = tryPlace(toRect(shelf), occupancy.platforms, 10);
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
      return;
    }
  };

  for (let i = 0; i < doors.length; i += 1) {
    ensureButtonForDoor(doors[i], i);
  }

  const width = Math.max(2400, Math.floor(gateX + 900));
  platforms.unshift({ id: 'ground', x: width / 2, y: groundY, w: width, h: groundH, kind: 'solid' });

  const exits = {
    fire: { x: width - 260, y: gateY - 40, w: 56, h: 86 },
    water: { x: width - 180, y: gateY - 40, w: 56, h: 86 }
  };

  return {
    seed,
    difficulty,
    size: { width, height },
    spawns,
    platforms,
    hazards: hazardsList,
    doors,
    buttons,
    crates,
    exits
  };
}
