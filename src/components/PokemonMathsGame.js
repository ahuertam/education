import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { FaArrowLeft, FaBolt, FaCheckCircle, FaCrown, FaRedo, FaSkullCrossbones, FaTrophy } from 'react-icons/fa';
import { formatRankDate, loadGameRanking, recordGameRun, updateGameBestStreak } from '../utils/rankings';

const COLORS = {
  bg1: '#090B17',
  bg2: '#101A3A',
  panel: 'rgba(255, 255, 255, 0.08)',
  panel2: 'rgba(255, 255, 255, 0.12)',
  stroke: 'rgba(255, 255, 255, 0.14)',
  ink: 'rgba(255, 255, 255, 0.92)',
  muted: 'rgba(255, 255, 255, 0.72)',
  good: '#22C55E',
  bad: '#EF4444',
  gold: '#FBBF24',
  cyan: '#22D3EE',
  pink: '#FB7185',
};

const Page = styled.div`
  min-height: 100vh;
  padding: 1.6rem 1.2rem 3rem;
  color: ${COLORS.ink};
  background:
    radial-gradient(1000px 720px at 10% 10%, rgba(34, 211, 238, 0.16), transparent 60%),
    radial-gradient(900px 650px at 90% 15%, rgba(251, 191, 36, 0.14), transparent 55%),
    radial-gradient(800px 600px at 80% 85%, rgba(251, 113, 133, 0.12), transparent 55%),
    linear-gradient(160deg, ${COLORS.bg1}, ${COLORS.bg2});
`;

const TopBar = styled.div`
  max-width: 1160px;
  margin: 0 auto 1.1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackButton = styled.button`
  border: 2px solid ${COLORS.stroke};
  background: rgba(255, 255, 255, 0.08);
  color: ${COLORS.ink};
  padding: 0.7rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-weight: 900;
  backdrop-filter: blur(6px);
  transition: transform 120ms ease, background 120ms ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.12);
  }
`;

const TitleWrap = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.7rem;
  letter-spacing: 0.2px;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
`;

const OpPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  border: 2px solid ${COLORS.stroke};
  background: rgba(255, 255, 255, 0.08);
  color: ${COLORS.muted};
  font-weight: 1000;
`;

const Shell = styled.div`
  max-width: 1160px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${COLORS.panel};
  border: 2px solid ${COLORS.stroke};
  border-radius: 24px;
  padding: 1.1rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 0.9rem;
`;

const CardH2 = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  letter-spacing: 0.2px;
`;

const Sub = styled.div`
  color: ${COLORS.muted};
  font-weight: 800;
`;

const Row = styled.div`
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
  align-items: center;
`;

const PrimaryButton = styled.button`
  border: none;
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.92), rgba(251, 191, 36, 0.92));
  color: rgba(10, 15, 30, 0.92);
  padding: 0.9rem 1rem;
  border-radius: 18px;
  cursor: pointer;
  font-weight: 1000;
  letter-spacing: 0.2px;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  transition: transform 120ms ease, filter 120ms ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.03);
  }
`;

const SubtleButton = styled.button`
  border: 2px solid ${COLORS.stroke};
  background: rgba(255, 255, 255, 0.06);
  color: ${COLORS.ink};
  padding: 0.7rem 0.85rem;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  transition: transform 120ms ease, background 120ms ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Prompt = styled.div`
  padding: 1rem;
  border-radius: 18px;
  border: 2px solid ${COLORS.stroke};
  background: rgba(0, 0, 0, 0.18);
  line-height: 1.25;
  display: grid;
  gap: 0.55rem;
`;

const PromptLine = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 1000;
  color: ${COLORS.ink};
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: rgba(34, 211, 238, 0.14);
  border: 2px solid rgba(34, 211, 238, 0.26);
`;

const Small = styled.span`
  color: ${COLORS.muted};
  font-weight: 800;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
  margin-top: 0.9rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const MetaPill = styled.div`
  border: 2px solid ${COLORS.stroke};
  background: rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  padding: 0.7rem 0.85rem;
  display: grid;
  gap: 0.15rem;
`;

const MetaLabel = styled.div`
  color: ${COLORS.muted};
  font-weight: 900;
  font-size: 0.85rem;
  letter-spacing: 0.2px;
  text-transform: uppercase;
`;

const MetaValue = styled.div`
  font-weight: 1000;
  display: flex;
  gap: 0.55rem;
  align-items: center;
`;

const CardsStage = styled.div`
  margin-top: 1rem;
  border-radius: 22px;
  border: 2px solid ${COLORS.stroke};
  background: rgba(255, 255, 255, 0.06);
  padding: 1rem;
  overflow: hidden;
`;

const stagePulse = keyframes`
  0% { transform: scale(1); filter: brightness(1); }
  35% { transform: scale(1.015); filter: brightness(1.12); }
  100% { transform: scale(1); filter: brightness(1); }
`;

const addMergeLeft = keyframes`
  0% { transform: translateX(0) rotate(-1deg); }
  35% { transform: translateX(34px) rotate(0deg); }
  65% { transform: translateX(34px) rotate(0deg) scale(1.05); }
  100% { transform: translateX(0) rotate(-1deg); }
`;

const addMergeRight = keyframes`
  0% { transform: translateX(0) rotate(1deg); }
  35% { transform: translateX(-34px) rotate(0deg); }
  65% { transform: translateX(-34px) rotate(0deg) scale(1.05); }
  100% { transform: translateX(0) rotate(1deg); }
`;

const subtractZap = keyframes`
  0% { transform: translateX(0) rotate(0deg); opacity: 1; }
  30% { transform: translateX(0) rotate(0deg); opacity: 1; }
  55% { transform: translateX(0) rotate(0deg); opacity: 0.15; }
  85% { transform: translateX(0) rotate(0deg); opacity: 1; }
  100% { transform: translateX(0) rotate(0deg); opacity: 1; }
`;

const shake = keyframes`
  0% { transform: translateX(0); }
  15% { transform: translateX(-5px); }
  30% { transform: translateX(5px); }
  45% { transform: translateX(-4px); }
  60% { transform: translateX(4px); }
  75% { transform: translateX(-3px); }
  90% { transform: translateX(3px); }
  100% { transform: translateX(0); }
`;

const multiplyPop = keyframes`
  0% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 0 rgba(34, 211, 238, 0)); }
  25% { transform: translateY(-6px) scale(1.08); filter: drop-shadow(0 12px 20px rgba(34, 211, 238, 0.35)); }
  55% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 0 rgba(34, 211, 238, 0)); }
  70% { transform: translateY(-6px) scale(1.06); filter: drop-shadow(0 10px 18px rgba(251, 191, 36, 0.3)); }
  100% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 0 rgba(34, 211, 238, 0)); }
`;

const divideOrbit = keyframes`
  0% { transform: rotate(0deg) scale(1); }
  40% { transform: rotate(5deg) scale(1.03); }
  70% { transform: rotate(-4deg) scale(1.01); }
  100% { transform: rotate(0deg) scale(1); }
`;

const CardsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 780px) {
    grid-template-columns: 1fr;
  }
`;

const CardSlot = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  text-align: left;
  cursor: pointer;
`;

const CardFrame = styled.div`
  position: relative;
  border-radius: 18px;
  border: 2px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.16);
  overflow: hidden;
  padding: 0.8rem;
  display: grid;
  grid-template-columns: 132px 1fr;
  gap: 0.9rem;
  align-items: center;
  transition: transform 140ms ease, filter 140ms ease;

  ${props => props.$pulse && css`animation: ${stagePulse} 900ms ease both;`}
  ${props => props.$anim && css`animation: ${props.$anim} 900ms ease both;`}

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.05);
  }

  @media (max-width: 780px) {
    grid-template-columns: 120px 1fr;
  }
`;

const CardImage = styled.img`
  width: 132px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35);
`;

const CardInfo = styled.div`
  display: grid;
  gap: 0.35rem;
  min-width: 0;
`;

const CardName = styled.div`
  font-size: 1.1rem;
  font-weight: 1000;
  letter-spacing: 0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardHint = styled.div`
  color: ${COLORS.muted};
  font-weight: 850;
  font-size: 0.95rem;
  line-height: 1.2;
`;

const HintTag = styled.div`
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  border: 2px solid rgba(251, 191, 36, 0.35);
  background: rgba(251, 191, 36, 0.14);
  color: rgba(255, 255, 255, 0.92);
  font-weight: 1000;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  width: fit-content;
  max-width: 100%;
  white-space: normal;
  line-height: 1.15;
`;

const AnswerRow = styled.div`
  margin-top: 0.9rem;
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  align-items: center;
`;

const AnswerInput = styled.input`
  flex: 1;
  min-width: 220px;
  border: 2px solid ${COLORS.stroke};
  background: rgba(255, 255, 255, 0.06);
  color: ${COLORS.ink};
  padding: 0.85rem 0.9rem;
  border-radius: 16px;
  font-weight: 1000;
  font-size: 1.05rem;
  outline: none;

  &:focus {
    border-color: rgba(34, 211, 238, 0.5);
    box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.18);
  }
`;

const Feedback = styled.div`
  margin-top: 0.85rem;
  padding: 0.85rem 0.9rem;
  border-radius: 18px;
  border: 2px solid ${props => props.$good ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'};
  background: ${props => props.$good ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)'};
  font-weight: 950;
  display: grid;
  gap: 0.3rem;
`;

const RankingBox = styled.div`
  margin-top: 0.9rem;
  border-radius: 18px;
  border: 2px solid ${COLORS.stroke};
  background: rgba(255, 255, 255, 0.06);
  padding: 0.85rem;
  display: grid;
  gap: 0.6rem;
`;

const RankRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  border-radius: 14px;
  padding: 0.55rem 0.65rem;
  background: rgba(0, 0, 0, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const OverlayBg = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  display: grid;
  place-items: center;
  padding: 1.2rem;
  z-index: 40;
`;

const ZoomPanel = styled.div`
  width: min(520px, 92vw);
  border-radius: 22px;
  border: 2px solid rgba(255, 255, 255, 0.16);
  background: rgba(10, 12, 24, 0.94);
  padding: 1rem;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.6);
  display: grid;
  gap: 0.8rem;
`;

const ZoomImg = styled.img`
  width: 100%;
  height: auto;
  border-radius: 18px;
`;

const Disclaimer = styled.div`
  color: ${COLORS.muted};
  font-weight: 750;
  font-size: 0.9rem;
  line-height: 1.25;
`;

const normalizeOp = (operation) => {
  if (operation === 'addition' || operation === 'subtraction' || operation === 'multiplication' || operation === 'division') {
    return operation;
  }
  return 'addition';
};

const OP_LABEL = {
  addition: 'Sumar',
  subtraction: 'Restar',
  multiplication: 'Multiplicar',
  division: 'Dividir',
};

const OP_SYMBOL = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
};

const API_URL = 'https://api.pokemontcg.io/v2/cards';
const CACHE_KEY = 'pokemonmaths_cards_v1';

const safeParse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const loadCachedCards = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = safeParse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!Array.isArray(parsed.cards)) return null;
    if (typeof parsed.at !== 'number') return null;
    if (Date.now() - parsed.at > 1000 * 60 * 60 * 18) return null;
    return parsed.cards;
  } catch {
    return null;
  }
};

const saveCachedCards = (cards) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), cards }));
  } catch {
    return;
  }
};

const parseIntStrict = (value) => {
  const n = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isFinite(n) ? n : null;
};

const firstNumericAttack = (card) => {
  const attacks = Array.isArray(card?.attacks) ? card.attacks : [];
  for (const a of attacks) {
    const m = String(a?.damage ?? '').match(/(\d+)/);
    const dmg = m ? Number.parseInt(m[1], 10) : null;
    if (Number.isFinite(dmg) && dmg > 0) {
      const cost = Array.isArray(a?.cost) ? a.cost : [];
      return { name: a?.name || 'Ataque', damage: dmg, costCount: cost.length };
    }
  }
  return null;
};

const retreatCount = (card) => {
  const n = Number(card?.convertedRetreatCost);
  if (Number.isFinite(n)) return Math.max(0, n);
  const rc = Array.isArray(card?.retreatCost) ? card.retreatCost : [];
  return rc.length;
};

const usableCard = (card) => {
  const hp = parseIntStrict(card?.hp);
  if (!Number.isFinite(hp) || hp <= 0) return false;
  const img = card?.images?.small && card?.images?.large;
  if (!img) return false;
  const r = retreatCount(card);
  if (!Number.isFinite(r)) return false;
  return true;
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildCardsPool = (rawCards) => {
  const pool = [];
  for (const c of rawCards || []) {
    if (!usableCard(c)) continue;
    pool.push({
      id: c.id,
      name: c.name,
      images: c.images,
      hp: parseIntStrict(c.hp),
      retreat: retreatCount(c),
      attacks: Array.isArray(c.attacks) ? c.attacks : [],
      firstAttack: firstNumericAttack(c),
    });
  }
  return pool.filter(x => x.hp && x.images?.small && x.images?.large);
};

const fetchPokemonCards = async ({ pageSize, page } = {}) => {
  const url = new URL(API_URL);
  url.searchParams.set('q', 'supertype:pokemon hp:[30 TO 350]');
  url.searchParams.set('pageSize', String(pageSize ?? 60));
  url.searchParams.set('page', String(page ?? 1));
  url.searchParams.set('select', 'id,name,images,hp,attacks,convertedRetreatCost,retreatCost');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const cards = Array.isArray(json?.data) ? json.data : [];
  return cards;
};

const buildHint = (template) => {
  const tags = [];
  if (template?.needsHp) tags.push('PS');
  if (template?.needsRetreat) tags.push('Retirada');
  if (template?.needsAttackDamage) tags.push('Daño');
  if (template?.needsAttackCost) tags.push('Energías');
  if (!tags.length) tags.push('Datos');
  return tags.join(' · ');
};

const makeKey = ({ op, templateId, cardA, cardB, extra }) => {
  const ids = [cardA.id, cardB.id].sort().join('|');
  const e = extra ? `|${extra}` : '';
  return `${op}|${templateId}|${ids}${e}`;
};

const generateQuestion = ({ op, cards, usedKeys, maxTries = 260 }) => {
  const pool = cards.filter(Boolean);
  if (pool.length < 4) return null;

  const templates = {
    addition: [
      {
        id: 'hp_plus_hp',
        needsHp: true,
        build: (a, b) => ({
          answer: a.hp + b.hp,
          lines: [
            { badge: 'Misión', text: `Suma los PS (HP) de ${a.name} y ${b.name}.` },
            { badge: 'Cuenta', text: `PS(${a.name}) ${OP_SYMBOL.addition} PS(${b.name}) = ?` },
          ],
          anim: 'add',
        }),
      },
      {
        id: 'hp_plus_damage',
        needsHp: true,
        needsAttackDamage: true,
        build: (a, b) => {
          const atkB = b.firstAttack;
          if (!atkB) return null;
          return {
            answer: a.hp + atkB.damage,
            lines: [
              { badge: 'Misión', text: `Suma los PS (HP) de ${a.name} y el daño del ataque “${atkB.name}” de ${b.name}.` },
              { badge: 'Cuenta', text: `PS(${a.name}) ${OP_SYMBOL.addition} Daño(${b.name}) = ?` },
            ],
            anim: 'add',
            zoomFocus: { aHint: 'Busca PS (HP)', bHint: `Busca daño: ${atkB.name}` },
            extra: `atk:${atkB.name}`,
          };
        },
      },
      {
        id: 'retreat_plus_damage',
        needsRetreat: true,
        needsAttackDamage: true,
        build: (a, b) => {
          const atkB = b.firstAttack;
          if (!atkB) return null;
          return {
            answer: a.retreat + atkB.damage,
            lines: [
              { badge: 'Misión', text: `Suma el coste de retirada de ${a.name} y el daño del ataque “${atkB.name}” de ${b.name}.` },
              { badge: 'Cuenta', text: `Retirada(${a.name}) ${OP_SYMBOL.addition} Daño(${b.name}) = ?` },
            ],
            anim: 'add',
            zoomFocus: { aHint: 'Cuenta energías de retirada', bHint: `Busca daño: ${atkB.name}` },
            extra: `atk:${atkB.name}`,
          };
        },
      },
    ],
    subtraction: [
      {
        id: 'hp_minus_hp',
        needsHp: true,
        build: (a, b) => {
          const big = a.hp >= b.hp ? a : b;
          const small = big === a ? b : a;
          return {
            answer: big.hp - small.hp,
            lines: [
              { badge: 'Misión', text: `Resta los PS (HP) de ${small.name} a los de ${big.name}.` },
              { badge: 'Cuenta', text: `PS(${big.name}) ${OP_SYMBOL.subtraction} PS(${small.name}) = ?` },
            ],
            anim: 'sub',
            extra: `order:${big.id}`,
          };
        },
      },
      {
        id: 'hp_minus_damage',
        needsHp: true,
        needsAttackDamage: true,
        build: (a, b) => {
          const atkB = b.firstAttack;
          if (!atkB) return null;
          if (a.hp - atkB.damage < 0) return null;
          return {
            answer: a.hp - atkB.damage,
            lines: [
              { badge: 'Misión', text: `Resta el daño del ataque “${atkB.name}” de ${b.name} a los PS (HP) de ${a.name}.` },
              { badge: 'Cuenta', text: `PS(${a.name}) ${OP_SYMBOL.subtraction} Daño(${b.name}) = ?` },
            ],
            anim: 'sub',
            zoomFocus: { aHint: 'Busca PS (HP)', bHint: `Busca daño: ${atkB.name}` },
            extra: `atk:${atkB.name}`,
          };
        },
      },
      {
        id: 'hp_minus_retreat',
        needsHp: true,
        needsRetreat: true,
        build: (a, b) => {
          if (a.hp - b.retreat < 0) return null;
          return {
            answer: a.hp - b.retreat,
            lines: [
              { badge: 'Misión', text: `Resta el coste de retirada de ${b.name} a los PS (HP) de ${a.name}.` },
              { badge: 'Cuenta', text: `PS(${a.name}) ${OP_SYMBOL.subtraction} Retirada(${b.name}) = ?` },
            ],
            anim: 'sub',
          };
        },
      },
    ],
    multiplication: [
      {
        id: 'hp_times_retreat',
        needsHp: true,
        needsRetreat: true,
        build: (a, b) => {
          if (b.retreat <= 0) return null;
          const ans = a.hp * b.retreat;
          if (ans > 2000) return null;
          return {
            answer: ans,
            lines: [
              { badge: 'Misión', text: `Multiplica los PS (HP) de ${a.name} por el coste de retirada de ${b.name}.` },
              { badge: 'Cuenta', text: `PS(${a.name}) ${OP_SYMBOL.multiplication} Retirada(${b.name}) = ?` },
            ],
            anim: 'mul',
          };
        },
      },
      {
        id: 'retreat_times_attack_cost',
        needsRetreat: true,
        needsAttackCost: true,
        build: (a, b) => {
          const atkB = b.firstAttack;
          if (!atkB) return null;
          if (!Number.isFinite(atkB.costCount) || atkB.costCount <= 0) return null;
          return {
            answer: a.retreat * atkB.costCount,
            lines: [
              { badge: 'Misión', text: `Multiplica el coste de retirada de ${a.name} por las energías necesarias del ataque “${atkB.name}” de ${b.name}.` },
              { badge: 'Cuenta', text: `Retirada(${a.name}) ${OP_SYMBOL.multiplication} Energías(${b.name}) = ?` },
            ],
            anim: 'mul',
            zoomFocus: { aHint: 'Cuenta energías de retirada', bHint: `Cuenta energías: ${atkB.name}` },
            extra: `atk:${atkB.name}`,
          };
        },
      },
      {
        id: 'damage_times_retreat',
        needsAttackDamage: true,
        needsRetreat: true,
        build: (a, b) => {
          const atkA = a.firstAttack;
          if (!atkA) return null;
          if (b.retreat <= 0) return null;
          const ans = atkA.damage * b.retreat;
          if (ans > 1200) return null;
          return {
            answer: ans,
            lines: [
              { badge: 'Misión', text: `Multiplica el daño del ataque “${atkA.name}” de ${a.name} por el coste de retirada de ${b.name}.` },
              { badge: 'Cuenta', text: `Daño(${a.name}) ${OP_SYMBOL.multiplication} Retirada(${b.name}) = ?` },
            ],
            anim: 'mul',
            zoomFocus: { aHint: `Busca daño: ${atkA.name}`, bHint: 'Cuenta energías de retirada' },
            extra: `atk:${atkA.name}`,
          };
        },
      },
    ],
    division: [
      {
        id: 'hp_div_retreat',
        needsHp: true,
        needsRetreat: true,
        build: (a, b) => {
          if (b.retreat <= 0) return null;
          if (a.hp % b.retreat !== 0) return null;
          return {
            answer: a.hp / b.retreat,
            lines: [
              { badge: 'Misión', text: `Divide los PS (HP) de ${a.name} entre el coste de retirada de ${b.name}.` },
              { badge: 'Cuenta', text: `PS(${a.name}) ${OP_SYMBOL.division} Retirada(${b.name}) = ?` },
            ],
            anim: 'div',
          };
        },
      },
      {
        id: 'damage_div_attack_cost',
        needsAttackDamage: true,
        needsAttackCost: true,
        build: (a, b) => {
          const atkA = a.firstAttack;
          if (!atkA) return null;
          const atkB = b.firstAttack;
          if (!atkB) return null;
          if (!Number.isFinite(atkB.costCount) || atkB.costCount <= 0) return null;
          if (atkA.damage % atkB.costCount !== 0) return null;
          return {
            answer: atkA.damage / atkB.costCount,
            lines: [
              { badge: 'Misión', text: `Divide el daño del ataque “${atkA.name}” de ${a.name} entre las energías necesarias del ataque “${atkB.name}” de ${b.name}.` },
              { badge: 'Cuenta', text: `Daño(${a.name}) ${OP_SYMBOL.division} Energías(${b.name}) = ?` },
            ],
            anim: 'div',
            zoomFocus: { aHint: `Busca daño: ${atkA.name}`, bHint: `Cuenta energías: ${atkB.name}` },
            extra: `atkA:${atkA.name}|atkB:${atkB.name}`,
          };
        },
      },
      {
        id: 'hp_div_attack_cost',
        needsHp: true,
        needsAttackCost: true,
        build: (a, b) => {
          const atkB = b.firstAttack;
          if (!atkB) return null;
          if (!Number.isFinite(atkB.costCount) || atkB.costCount <= 0) return null;
          if (a.hp % atkB.costCount !== 0) return null;
          return {
            answer: a.hp / atkB.costCount,
            lines: [
              { badge: 'Misión', text: `Divide los PS (HP) de ${a.name} entre las energías necesarias del ataque “${atkB.name}” de ${b.name}.` },
              { badge: 'Cuenta', text: `PS(${a.name}) ${OP_SYMBOL.division} Energías(${b.name}) = ?` },
            ],
            anim: 'div',
            zoomFocus: { aHint: 'Busca PS (HP)', bHint: `Cuenta energías: ${atkB.name}` },
            extra: `atk:${atkB.name}`,
          };
        },
      },
    ],
  };

  const list = templates[op] || templates.addition;
  const order = shuffle(list);

  for (let i = 0; i < maxTries; i++) {
    const a = pick(pool);
    let b = pick(pool);
    if (a.id === b.id) continue;
    if (b.id === a.id) continue;
    const tpl = order[i % order.length];
    const built = tpl.build(a, b);
    if (!built) continue;
    const key = makeKey({ op, templateId: tpl.id, cardA: a, cardB: b, extra: built.extra });
    if (usedKeys.has(key)) continue;
    const hint = buildHint(tpl);

    return {
      key,
      op,
      templateId: tpl.id,
      cardA: a,
      cardB: b,
      answer: built.answer,
      lines: built.lines,
      hint,
      anim: built.anim,
      zoomFocus: built.zoomFocus,
    };
  }

  return null;
};

const operationToGameKey = (op) => `pokemonmaths_${op}`;

const PokemonMathsGame = ({ onBack, operation }) => {
  const op = normalizeOp(operation);
  const gameKey = operationToGameKey(op);
  const [phase, setPhase] = useState('menu');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [cards, setCards] = useState([]);
  const cardsRef = useRef([]);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [animStage, setAnimStage] = useState(null);
  const animTimerRef = useRef(null);

  const [round, setRound] = useState(0);
  const totalRounds = 10;
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const wrong = Math.max(0, attempts - correct);
  const [ranking, setRanking] = useState(() => loadGameRanking(gameKey));
  const bestStreakThisRunRef = useRef(0);
  const usedKeysRef = useRef(new Set());

  const [zoomCard, setZoomCard] = useState(null);

  const clearAnimTimer = useCallback(() => {
    if (animTimerRef.current) {
      clearTimeout(animTimerRef.current);
      animTimerRef.current = null;
    }
  }, []);

  const stopZoom = useCallback(() => setZoomCard(null), []);

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  useEffect(() => () => clearAnimTimer(), [clearAnimTimer]);

  useEffect(() => {
    if (streak > bestStreakThisRunRef.current) bestStreakThisRunRef.current = streak;
    if (streak > (ranking?.bestStreak ?? 0)) {
      setRanking(updateGameBestStreak(gameKey, streak));
    }
  }, [gameKey, ranking?.bestStreak, streak]);

  const resetRun = useCallback(() => {
    setRound(0);
    setPoints(0);
    setStreak(0);
    setCorrect(0);
    setAttempts(0);
    setAnswer('');
    setFeedback(null);
    setQuestion(null);
    setAnimStage(null);
    usedKeysRef.current = new Set();
    bestStreakThisRunRef.current = 0;
    clearAnimTimer();
  }, [clearAnimTimer]);

  const ensureCards = useCallback(async () => {
    if (cardsRef.current.length) return cardsRef.current;
    setLoading(true);
    setLoadError(null);
    try {
      const cached = loadCachedCards();
      if (cached) {
        const pool = buildCardsPool(cached);
        if (pool.length >= 20) {
          setCards(pool);
          setLoading(false);
          return pool;
        }
      }

      const page = 1 + Math.floor(Math.random() * 30);
      const raw = await fetchPokemonCards({ pageSize: 80, page });
      saveCachedCards(raw);
      const pool = buildCardsPool(raw);
      if (pool.length < 18) throw new Error('pool_too_small');
      setCards(pool);
      setLoading(false);
      return pool;
    } catch (e) {
      setLoading(false);
      setLoadError('No se han podido cargar cartas Pokémon ahora mismo. Prueba otra vez.');
      throw e;
    }
  }, []);

  const drawQuestion = useCallback((pool) => {
    const q = generateQuestion({ op, cards: pool, usedKeys: usedKeysRef.current });
    if (!q) return null;
    usedKeysRef.current.add(q.key);
    setQuestion(q);
    setAnswer('');
    setFeedback(null);
    setAnimStage(null);
    clearAnimTimer();
    return q;
  }, [clearAnimTimer, op]);

  const start = useCallback(async () => {
    resetRun();
    setPhase('playing');
    try {
      const pool = await ensureCards();
      const q = drawQuestion(pool);
      if (!q) {
        setLoadError('No he podido generar una pregunta válida. Prueba de nuevo.');
        setPhase('menu');
      }
    } catch {
      setPhase('menu');
    }
  }, [drawQuestion, ensureCards, resetRun]);

  const finish = useCallback(() => {
    if (attempts > 0 || points > 0) {
      setRanking(recordGameRun(gameKey, { score: points, bestStreak: bestStreakThisRunRef.current }));
    }
    setPhase('result');
  }, [attempts, gameKey, points]);

  const next = useCallback(async () => {
    const nextRound = round + 1;
    setRound(nextRound);
    if (nextRound >= totalRounds) {
      finish();
      return;
    }
    const pool = cards.length ? cards : await ensureCards();
    const q = drawQuestion(pool);
    if (!q) finish();
  }, [cards, drawQuestion, ensureCards, finish, round]);

  const submit = useCallback(() => {
    if (!question) return;
    const given = Number.parseInt(String(answer ?? '').trim(), 10);
    if (!Number.isFinite(given)) {
      setFeedback({ good: false, title: 'Escribe un número', detail: 'Pista: usa solo dígitos (0-9).' });
      return;
    }

    setAttempts(x => x + 1);
    if (given === question.answer) {
      setCorrect(x => x + 1);
      setPoints(x => x + 10 + Math.min(10, streak * 2));
      setStreak(s => s + 1);
      setFeedback({ good: true, title: '¡Correcto!', detail: `Respuesta: ${question.answer}` });
      setAnimStage(question.anim || 'add');
      clearAnimTimer();
      animTimerRef.current = setTimeout(() => {
        setAnimStage(null);
        next();
      }, 1100);
      return;
    }

    setStreak(0);
    setPoints(x => Math.max(0, x - 3));
    setFeedback({ good: false, title: 'Casi…', detail: `La correcta era ${question.answer}.` });
  }, [answer, clearAnimTimer, next, question, streak]);

  const restart = useCallback(() => {
    if (phase === 'playing' && (attempts > 0 || points > 0)) {
      setRanking(recordGameRun(gameKey, { score: points, bestStreak: bestStreakThisRunRef.current }));
    }
    setPhase('menu');
    resetRun();
  }, [attempts, gameKey, phase, points, resetRun]);

  const onExit = useCallback(() => {
    if (phase === 'playing' && (attempts > 0 || points > 0)) {
      setRanking(recordGameRun(gameKey, { score: points, bestStreak: bestStreakThisRunRef.current }));
    }
    onBack();
  }, [attempts, gameKey, onBack, phase, points]);

  const stageAnimProps = useMemo(() => {
    const a = question?.cardA;
    const b = question?.cardB;
    if (!a || !b) return { aAnim: null, bAnim: null };

    if (animStage === 'add') return { aAnim: addMergeLeft, bAnim: addMergeRight };
    if (animStage === 'sub') return { aAnim: shake, bAnim: subtractZap };
    if (animStage === 'mul') return { aAnim: multiplyPop, bAnim: multiplyPop };
    if (animStage === 'div') return { aAnim: divideOrbit, bAnim: divideOrbit };
    return { aAnim: null, bAnim: null };
  }, [animStage, question?.cardA, question?.cardB]);

  const renderRanking = useCallback(() => {
    const top = ranking?.top || [];
    if (!top.length && !(ranking?.bestStreak > 0)) return null;
    return (
      <RankingBox>
        <Row style={{ justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 1000, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaTrophy color={COLORS.gold} /> Ranking local
          </div>
          <div style={{ color: COLORS.muted, fontWeight: 900 }}>
            Mejor racha: {ranking?.bestStreak ?? 0}
          </div>
        </Row>
        {top.map((x, idx) => (
          <RankRow key={`${x.at}-${idx}`}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 950 }}>
              {idx === 0 ? <FaCrown color={COLORS.gold} /> : <span style={{ width: 18, textAlign: 'center' }}>{idx + 1}</span>}
              <span>{x.score} pts</span>
            </div>
            <div style={{ color: COLORS.muted, fontWeight: 850 }}>{formatRankDate(x.at)}</div>
          </RankRow>
        ))}
      </RankingBox>
    );
  }, [ranking?.bestStreak, ranking?.top]);

  const hintA = question?.zoomFocus?.aHint || (question?.hint ? `Busca: ${question.hint}` : 'Toca para ampliar');
  const hintB = question?.zoomFocus?.bHint || (question?.hint ? `Busca: ${question.hint}` : 'Toca para ampliar');

  return (
    <Page>
      <TopBar>
        <BackButton onClick={onExit}>
          <FaArrowLeft /> Volver
        </BackButton>
        <TitleWrap>
          <FaBolt color={COLORS.cyan} />
          <Title>PokemonMaths</Title>
          <OpPill>
            <FaBolt color={COLORS.gold} /> {OP_LABEL[op] || 'Sumar'}
          </OpPill>
        </TitleWrap>
        <div style={{ width: 160, display: 'flex', justifyContent: 'flex-end' }}>
          {phase === 'playing' ? (
            <SubtleButton onClick={restart}>
              <FaRedo /> Reiniciar
            </SubtleButton>
          ) : null}
        </div>
      </TopBar>

      <Shell>
        <Card>
          <CardTitle>
            <CardH2>Reto</CardH2>
            <Sub>{phase === 'playing' ? `Ronda ${round + 1}/${totalRounds}` : 'Cartas + mates'}</Sub>
          </CardTitle>

          {phase === 'menu' ? (
            <>
              <Prompt>
                <PromptLine>
                  <Badge>Cómo jugar</Badge>
                  <span>Mira los números en las cartas Pokémon y resuelve la operación.</span>
                </PromptLine>
                <PromptLine>
                  <Small>Consejo:</Small>
                  <span>toca una carta para ampliarla y poder leer sus datos.</span>
                </PromptLine>
              </Prompt>

              <MetaGrid>
                <MetaPill>
                  <MetaLabel>Puntos</MetaLabel>
                  <MetaValue>+10 por acierto + bonus por racha</MetaValue>
                </MetaPill>
                <MetaPill>
                  <MetaLabel>Evita repetir</MetaLabel>
                  <MetaValue>Las preguntas no se repiten en esta partida</MetaValue>
                </MetaPill>
                <MetaPill>
                  <MetaLabel>Ranking</MetaLabel>
                  <MetaValue>Se guarda en este dispositivo</MetaValue>
                </MetaPill>
              </MetaGrid>

              {loadError ? (
                <Feedback $good={false}>
                  <div style={{ display: 'inline-flex', gap: '0.55rem', alignItems: 'center' }}>
                    <FaSkullCrossbones /> {loadError}
                  </div>
                </Feedback>
              ) : null}

              <AnswerRow>
                <PrimaryButton onClick={start} disabled={loading}>
                  <FaBolt /> {loading ? 'Cargando cartas…' : 'Empezar'}
                </PrimaryButton>
              </AnswerRow>

              {renderRanking()}
            </>
          ) : null}

          {phase === 'playing' ? (
            <>
              <Prompt>
                {(question?.lines || []).map((l, idx) => (
                  <PromptLine key={idx}>
                    <Badge>{l.badge}</Badge>
                    <span>{l.text}</span>
                  </PromptLine>
                ))}
                <PromptLine>
                  <Small>Tip:</Small>
                  <span>toca cada carta para ampliarla.</span>
                </PromptLine>
              </Prompt>

              <CardsStage>
                <CardsRow>
                  <CardSlot onClick={() => setZoomCard(question?.cardA)} disabled={!question?.cardA}>
                    <CardFrame
                      $pulse={Boolean(animStage)}
                      $anim={stageAnimProps.aAnim}
                    >
                      {question?.cardA?.images?.small ? <CardImage src={question.cardA.images.small} alt={question.cardA.name} /> : null}
                      <CardInfo>
                        <HintTag>
                          <FaBolt color={COLORS.gold} /> {hintA}
                        </HintTag>
                        <CardName>{question?.cardA?.name}</CardName>
                        <CardHint>Toca para ampliar</CardHint>
                      </CardInfo>
                    </CardFrame>
                  </CardSlot>

                  <CardSlot onClick={() => setZoomCard(question?.cardB)} disabled={!question?.cardB}>
                    <CardFrame
                      $pulse={Boolean(animStage)}
                      $anim={stageAnimProps.bAnim}
                    >
                      {question?.cardB?.images?.small ? <CardImage src={question.cardB.images.small} alt={question.cardB.name} /> : null}
                      <CardInfo>
                        <HintTag>
                          <FaBolt color={COLORS.pink} /> {hintB}
                        </HintTag>
                        <CardName>{question?.cardB?.name}</CardName>
                        <CardHint>Toca para ampliar</CardHint>
                      </CardInfo>
                    </CardFrame>
                  </CardSlot>
                </CardsRow>
              </CardsStage>

              <AnswerRow>
                <AnswerInput
                  value={answer}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submit();
                  }}
                  placeholder="Escribe tu respuesta…"
                  aria-label="Respuesta"
                />
                <PrimaryButton onClick={submit}>
                  <FaCheckCircle /> Comprobar
                </PrimaryButton>
                <SubtleButton
                  onClick={() => {
                    setFeedback({ good: false, title: 'Pista', detail: `La operación es ${OP_SYMBOL[op]} y siempre da un número entero.` });
                  }}
                >
                  <FaBolt /> Pista
                </SubtleButton>
              </AnswerRow>

              {feedback ? (
                <Feedback $good={feedback.good}>
                  <div style={{ display: 'inline-flex', gap: '0.55rem', alignItems: 'center' }}>
                    {feedback.good ? <FaCheckCircle /> : <FaSkullCrossbones />}
                    <span>{feedback.title}</span>
                  </div>
                  <div style={{ color: COLORS.muted, fontWeight: 850 }}>{feedback.detail}</div>
                </Feedback>
              ) : null}
            </>
          ) : null}

          {phase === 'result' ? (
            <>
              <Prompt>
                <PromptLine>
                  <Badge>Fin</Badge>
                  <span>¡Partida terminada!</span>
                </PromptLine>
                <PromptLine>
                  <Small>Resultado:</Small>
                  <span>{correct}/{totalRounds} aciertos · {wrong} fallos · {points} puntos</span>
                </PromptLine>
                <PromptLine>
                  <Small>Mejor racha:</Small>
                  <span>{bestStreakThisRunRef.current}</span>
                </PromptLine>
              </Prompt>

              <AnswerRow>
                <PrimaryButton onClick={start}>
                  <FaRedo /> Jugar otra vez
                </PrimaryButton>
                <SubtleButton onClick={restart}>
                  <FaBolt /> Volver al menú
                </SubtleButton>
              </AnswerRow>

              {renderRanking()}
            </>
          ) : null}
        </Card>

        <Card>
          <CardTitle>
            <CardH2>Marcador</CardH2>
            <Sub>{OP_LABEL[op] || 'Sumar'}</Sub>
          </CardTitle>

          <MetaGrid>
            <MetaPill>
              <MetaLabel>Puntos</MetaLabel>
              <MetaValue>{points}</MetaValue>
            </MetaPill>
            <MetaPill>
              <MetaLabel>Racha</MetaLabel>
              <MetaValue>{streak}</MetaValue>
            </MetaPill>
            <MetaPill>
              <MetaLabel>Aciertos</MetaLabel>
              <MetaValue>{correct}</MetaValue>
            </MetaPill>
            <MetaPill>
              <MetaLabel>Fallos</MetaLabel>
              <MetaValue>{wrong}</MetaValue>
            </MetaPill>
          </MetaGrid>

          <RankingBox>
            <Row style={{ justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 1000 }}>Sin repetir</div>
              <div style={{ color: COLORS.muted, fontWeight: 850 }}>{usedKeysRef.current.size} preguntas únicas</div>
            </Row>
            <Disclaimer>
              Cartas vía API pública de Pokémon TCG (pokemontcg.io). Si no hay conexión, este juego puede fallar al cargar.
            </Disclaimer>
          </RankingBox>

          {renderRanking()}
        </Card>
      </Shell>

      {zoomCard ? (
        <OverlayBg onClick={stopZoom} role="dialog" aria-modal="true">
          <ZoomPanel onClick={(e) => e.stopPropagation()}>
            <Row style={{ justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 1000 }}>{zoomCard.name}</div>
              <SubtleButton onClick={stopZoom}>
                <FaArrowLeft /> Cerrar
              </SubtleButton>
            </Row>
            {zoomCard?.images?.large ? <ZoomImg src={zoomCard.images.large} alt={zoomCard.name} /> : null}
            <Disclaimer>Busca los datos en la carta (PS/ataques/retirada) y vuelve a responder.</Disclaimer>
          </ZoomPanel>
        </OverlayBg>
      ) : null}
    </Page>
  );
};

export default PokemonMathsGame;
