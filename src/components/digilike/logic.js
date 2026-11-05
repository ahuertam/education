// Lógica pura de Digilike: generación del mapa, las preguntas y las stats.
// No toca React ni la red, así que se puede testear con el PRNG con semilla.

import { FaBolt, FaCrown, FaCube, FaSpa } from 'react-icons/fa';
import { createRng, rngInt, rngPick } from '../puzzles/firewater/prng';
import { DIGI_LEVEL_ES } from './data';

export const mapLevelLabel = (raw) => {
  const s = String(raw ?? '').trim();
  if (!s) return 'Desconocido';
  const key = s.toLowerCase();
  return DIGI_LEVEL_ES[key] || s;
};

export const levelTier = (level) => {
  const l = String(level ?? '').toLowerCase();
  if (l.includes('digi-huevo') || l.includes('digi huevo') || l.includes('digitama')) return 0;
  if (l.includes('etapa bebé') || l.includes('bebe') || l.includes('baby') || l.includes('in-training') || l.includes('in training')) return 0;
  if (l.includes('cuerpo infantil') || l.includes('child') || l.includes('rookie')) return 1;
  if (l.includes('cuerpo maduro') || l.includes('adult') || l.includes('champion')) return 2;
  if (l.includes('cuerpo perfecto') || l.includes('perfect')) return 3;
  if (l.includes('cuerpo supremo') || l.includes('ultimate') || l.includes('mega')) return 4;
  return 2;
};

export const buildStats = ({ tier, floor, isBoss, rng }) => {
  const base = 18 + tier * 8 + Math.floor(floor * 2.2);
  const hp = base + rngInt(rng, 10, 18) + (isBoss ? 16 : 0);
  const atk = 6 + tier * 2 + rngInt(rng, 0, 3) + (isBoss ? 2 : 0);
  const def = 4 + tier * 2 + rngInt(rng, 0, 3) + (isBoss ? 2 : 0);
  return { hp, atk, def };
};

export const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

export const shuffle = (rng, list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = rngInt(rng, 0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const makeQuestion = ({ rng, floor }) => {
  const difficulty = clamp(1 + Math.floor(floor / 2), 1, 5);
  const kind = rng() < 0.28 ? 'multiple_choice' : 'numeric_input';
  const op = rngPick(rng, ['+', '−', '×', '÷', 'mix']);

  const small = 4 + difficulty * 2;
  const mid = 10 + difficulty * 6;
  const a = rngInt(rng, small, mid);
  const b = rngInt(rng, small, mid);
  const c = rngInt(rng, 2, 12 + difficulty * 4);

  const buildExpr = () => {
    if (difficulty <= 2) {
      const sym = op === 'mix' ? rngPick(rng, ['+', '−', '×']) : op;
      if (sym === '+') return { expr: `${a} + ${b}`, answer: a + b };
      if (sym === '−') {
        const big = Math.max(a, b);
        const smallN = Math.min(a, b);
        return { expr: `${big} − ${smallN}`, answer: big - smallN };
      }
      const m = rngInt(rng, 2, 9);
      return { expr: `${a} × ${m}`, answer: a * m };
    }

    if (difficulty === 3) {
      const left = rngInt(rng, 2, 12);
      const right = rngInt(rng, 2, 12);
      const sym = rngPick(rng, ['+', '−', '×']);
      if (sym === '+') return { expr: `${a} + ${left} + ${right}`, answer: a + left + right };
      if (sym === '−') return { expr: `${a + left} − ${right}`, answer: a + left - right };
      return { expr: `(${left} × ${right}) + ${c}`, answer: left * right + c };
    }

    if (difficulty === 4) {
      const left = rngInt(rng, 3, 14);
      const right = rngInt(rng, 2, 11);
      const mult = left * right;
      const sym = rngPick(rng, ['+', '−']);
      if (sym === '+') return { expr: `${mult} + ${c}`, answer: mult + c };
      return { expr: `${mult} − ${c}`, answer: mult - c };
    }

    const left = rngInt(rng, 12, 24);
    const right = rngInt(rng, 3, 12);
    const sym = rngPick(rng, ['+', '−', '×', '÷']);
    if (sym === '×') return { expr: `${left} × ${right} + ${c}`, answer: left * right + c };
    if (sym === '÷') {
      const d = rngInt(rng, 2, 9);
      const n = d * rngInt(rng, 3, 12);
      return { expr: `${n} ÷ ${d} + ${c}`, answer: n / d + c };
    }
    if (sym === '+') return { expr: `(${left} + ${right}) × 2`, answer: (left + right) * 2 };
    return { expr: `(${left} − ${right}) × 3`, answer: (left - right) * 3 };
  };

  const base = buildExpr();
  const heal = 4 + difficulty * 2;
  const hit = 8 + difficulty * 3;

  if (kind === 'numeric_input') {
    return {
      id: `${floor}-${difficulty}-${Math.floor(rng() * 1e9)}`,
      type: 'numeric_input',
      difficulty,
      prompt: `Resuelve el portal: ${base.expr}`,
      answer: base.answer,
      heal,
      hit,
    };
  }

  const deltas = shuffle(rng, [rngInt(rng, 1, 3), rngInt(rng, 4, 8), rngInt(rng, 9, 14)]);
  const optionsRaw = [base.answer, base.answer + deltas[0], base.answer - deltas[1], base.answer + deltas[2]];
  const uniq = [];
  for (const x of optionsRaw) {
    if (!Number.isFinite(x)) continue;
    if (uniq.includes(x)) continue;
    uniq.push(x);
  }
  while (uniq.length < 4) {
    uniq.push(base.answer + rngInt(rng, 2, 12) * (rng() < 0.5 ? 1 : -1));
  }
  const options = shuffle(rng, uniq.slice(0, 4));
  const correctIndex = options.indexOf(base.answer);

  return {
    id: `${floor}-${difficulty}-${Math.floor(rng() * 1e9)}`,
    type: 'multiple_choice',
    difficulty,
    prompt: `El portal pide: ${base.expr}`,
    options,
    correctIndex,
    answer: base.answer,
    heal,
    hit,
  };
};

export const nodeLabel = (kind) => {
  if (kind === 'start') return { title: 'Nodo inicial', icon: <FaSpa />, tone: 'map' };
  if (kind === 'rest') return { title: 'Descanso', icon: <FaSpa />, tone: 'map' };
  if (kind === 'loot') return { title: 'Botín', icon: <FaCube />, tone: 'loot' };
  if (kind === 'boss') return { title: 'Jefe final', icon: <FaCrown />, tone: 'action' };
  return { title: 'Encuentro', icon: <FaBolt />, tone: 'action' };
};

export const generateMap = ({ seed }) => {
  const rng = createRng(seed);
  const floorsCount = 6;
  const nodesPerFloor = 3;
  const startId = '0-1';
  const startIndex = 1;

  const nodes = [];
  const byId = {};

  for (let f = 0; f < floorsCount; f += 1) {
    for (let i = 0; i < nodesPerFloor; i += 1) {
      const id = `${f}-${i}`;
      let kind = 'combat';
      if (f === 0 && i === 1) kind = 'start';
      else if (f === floorsCount - 1 && i === 1) kind = 'boss';
      else {
        const r = rng();
        if (r < 0.22) kind = 'rest';
        else if (r < 0.42) kind = 'loot';
        else kind = 'combat';
      }
      const node = { id, floor: f, index: i, kind, edges: [], cleared: false };
      nodes.push(node);
      byId[id] = node;
    }
  }

  for (let f = 0; f < floorsCount - 1; f += 1) {
    for (let i = 0; i < nodesPerFloor; i += 1) {
      if (f === 0 && i !== startIndex) continue;
      const from = byId[`${f}-${i}`];
      const nextA = clamp(i + rngInt(rng, -1, 1), 0, nodesPerFloor - 1);
      const nextB = clamp(i + rngInt(rng, 0, 2), 0, nodesPerFloor - 1);
      const targets = [...new Set([nextA, nextB])];
      for (const t of targets) {
        const toId = `${f + 1}-${t}`;
        if (!from.edges.includes(toId)) from.edges.push(toId);
      }
    }
  }

  for (let f = 0; f < floorsCount - 1; f += 1) {
    for (let t = 0; t < nodesPerFloor; t += 1) {
      const toId = `${f + 1}-${t}`;
      let hasIncoming = false;
      for (let i = 0; i < nodesPerFloor; i += 1) {
        if (f === 0 && i !== startIndex) continue;
        const from = byId[`${f}-${i}`];
        if (from.edges.includes(toId)) {
          hasIncoming = true;
          break;
        }
      }
      if (hasIncoming) continue;
      const fromIndex = f === 0 ? startIndex : clamp(t + rngInt(rng, -1, 1), 0, nodesPerFloor - 1);
      const from = byId[`${f}-${fromIndex}`];
      if (!from.edges.includes(toId)) from.edges.push(toId);
    }
  }

  return { seed, floorsCount, nodesPerFloor, nodes, byId, startId };
};
