function rectsOverlap(a, b) {
  return (
    Math.abs(a.x - b.x) * 2 < (a.w + b.w) &&
    Math.abs(a.y - b.y) * 2 < (a.h + b.h)
  );
}

function rectsOverlapWithPadding(a, b, padding) {
  return (
    Math.abs(a.x - b.x) * 2 < a.w + b.w + padding * 2 &&
    Math.abs(a.y - b.y) * 2 < a.h + b.h + padding * 2
  );
}

export function validateLevel(level) {
  const reasons = [];

  if (!level?.size?.width || !level?.size?.height) reasons.push('missing_size');
  if (!level?.spawns?.fire || !level?.spawns?.water) reasons.push('missing_spawns');
  if (!Array.isArray(level?.platforms) || level.platforms.length === 0) reasons.push('missing_platforms');
  if (!Array.isArray(level?.doors)) reasons.push('missing_doors');
  if (!Array.isArray(level?.buttons)) reasons.push('missing_buttons');
  if (!Array.isArray(level?.crates)) reasons.push('missing_crates');
  if (!level?.exits?.fire || !level?.exits?.water) reasons.push('missing_exits');

  if (reasons.length > 0) return { ok: false, reasons };

  const doorIds = new Set(level.doors.map(d => d.id));
  const buttonDoorIds = new Set(level.buttons.map(b => b.doorId));

  for (const doorId of doorIds) {
    if (!buttonDoorIds.has(doorId)) reasons.push(`door_without_button:${doorId}`);
  }

  for (const hz of level.hazards) {
    const needsBridge = hz.needsBridge !== false;
    if (!needsBridge) continue;
    const bridge = level.platforms.find(p => {
      const isBridge = String(p.id || '').startsWith('bridge_');
      if (!isBridge) return false;
      const overlapX = Math.abs(p.x - hz.x) * 2 < p.w + hz.w;
      return overlapX && p.y < hz.y;
    });
    if (!bridge) reasons.push(`hazard_without_bridge:${hz.id}`);
  }

  const spawnRects = [
    { x: level.spawns.fire.x, y: level.spawns.fire.y, w: 40, h: 60 },
    { x: level.spawns.water.x, y: level.spawns.water.y, w: 40, h: 60 }
  ];
  for (const hz of level.hazards) {
    for (const s of spawnRects) {
      if (rectsOverlap({ x: hz.x, y: hz.y, w: hz.w, h: hz.h }, s)) reasons.push(`hazard_on_spawn:${hz.id}`);
    }
  }

  const exitRects = [
    { x: level.exits.fire.x, y: level.exits.fire.y, w: level.exits.fire.w, h: level.exits.fire.h },
    { x: level.exits.water.x, y: level.exits.water.y, w: level.exits.water.w, h: level.exits.water.h }
  ];
  for (const hz of level.hazards) {
    for (const ex of exitRects) {
      if (rectsOverlap({ x: hz.x, y: hz.y, w: hz.w, h: hz.h }, ex)) reasons.push(`hazard_on_exit:${hz.id}`);
    }
  }

  const hazardRects = level.hazards.map(hz => ({ id: hz.id, rect: { x: hz.x, y: hz.y, w: hz.w, h: hz.h } }));
  const buttonRects = level.buttons.map(b => ({ id: b.id, rect: { x: b.x, y: b.y, w: b.w, h: b.h } }));
  const doorRects = level.doors.map(d => ({ id: d.id, rect: { x: d.x, y: d.y, w: d.w, h: d.h } }));
  const crateRects = level.crates.map(c => ({ id: c.id, rect: { x: c.x, y: c.y, w: c.w, h: c.h } }));

  for (const hz of hazardRects) {
    for (const b of buttonRects) {
      if (rectsOverlapWithPadding(hz.rect, b.rect, 10)) reasons.push(`hazard_overlaps_button:${hz.id}:${b.id}`);
    }
    for (const d of doorRects) {
      if (rectsOverlapWithPadding(hz.rect, d.rect, 10)) reasons.push(`hazard_overlaps_door:${hz.id}:${d.id}`);
    }
    for (const c of crateRects) {
      if (rectsOverlapWithPadding(hz.rect, c.rect, 10)) reasons.push(`hazard_overlaps_crate:${hz.id}:${c.id}`);
    }
  }

  if (level.crates.length < level.doors.length) reasons.push('not_enough_crates');

  return { ok: reasons.length === 0, reasons };
}
