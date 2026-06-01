import { useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaArrowLeft, FaBolt, FaCrown, FaCube, FaSkullCrossbones, FaSpa, FaSyringe } from 'react-icons/fa';
import { createRng, rngInt, rngPick } from './puzzles/firewater/prng';

const COLORS = {
  sky1: '#e0f2f7',
  sky2: '#ffffff',
  glass: 'rgba(255, 255, 255, 0.7)',
  glass2: 'rgba(255, 255, 255, 0.55)',
  stroke: 'rgba(255, 255, 255, 0.65)',
  ink: '#005870',
  muted: 'rgba(0, 88, 112, 0.72)',
  primary: '#ff9800',
  primaryDeep: '#f57c00',
  good: '#2e7d32',
  bad: '#c62828',
  blueSoft: 'rgba(0, 130, 170, 0.14)',
  orangeSoft: 'rgba(255, 152, 0, 0.16)',
  violetSoft: 'rgba(167, 139, 250, 0.18)',
};

const STARTERS = ['Agumon', 'Gabumon', 'Patamon', 'Gomamon', 'Tentomon', 'Gatomon'];
const FALLBACK_IMG = `${process.env.PUBLIC_URL}/moster2.png`;

const ADVENTURE_SAGAS = [
  {
    id: 'devimon',
    title: 'Saga de Devimon',
    blurb: 'Isla File. Ruedas negras y un enemigo que quiere apagar la luz del Digimundo.',
    bossFetchName: 'Devimon',
    bossLabel: 'Devimon',
  },
  {
    id: 'etemon',
    title: 'Saga de Etemon',
    blurb: 'Continente Server. Emblemas, etiquetas y una estrella del rock demasiado peligrosa.',
    bossFetchName: 'Etemon',
    bossLabel: 'Etemon',
  },
  {
    id: 'myotismon',
    title: 'Saga de Myotismon (Vamdemon)',
    blurb: 'La sombra cruza al Mundo Humano. El Digivice vibra cuando el miedo se acerca.',
    bossFetchName: 'Myotismon',
    bossLabel: 'Vamdemon',
  },
  {
    id: 'darkmasters',
    title: 'Saga de los Amos oscuros',
    blurb: 'Un tablero de guerra en el Digimundo. La última línea de defensa está a punto de romperse.',
    bossFetchName: 'Piedmon',
    bossLabel: 'Piedmon',
  },
  {
    id: 'apocalymon',
    title: 'Saga de Apocalymon',
    blurb: 'El final de la aventura: los datos del dolor se condensan en un enemigo imposible.',
    bossFetchName: 'Apocalymon',
    bossLabel: 'Apocalymon',
  },
];

const DIGI_LEVEL_ES = {
  digitama: 'Digi-Huevo',
  'digi-tama': 'Digi-Huevo',
  'digi egg': 'Digi-Huevo',
  'digi-huevo': 'Digi-Huevo',

  'baby i': 'Etapa Bebé',
  'baby ii': 'Etapa Bebé',
  'baby i & ii': 'Etapa Bebé',
  baby: 'Etapa Bebé',
  'in-training': 'Etapa Bebé',
  'in training': 'Etapa Bebé',
  training: 'Etapa Bebé',

  child: 'Cuerpo Infantil',
  rookie: 'Cuerpo Infantil',
  'cuerpo infantil': 'Cuerpo Infantil',

  adult: 'Cuerpo Maduro',
  champion: 'Cuerpo Maduro',
  'cuerpo maduro': 'Cuerpo Maduro',

  perfect: 'Cuerpo Perfecto',
  ultimate: 'Cuerpo Supremo',
  mega: 'Cuerpo Supremo',
  'cuerpo perfecto': 'Cuerpo Perfecto',
  'cuerpo supremo': 'Cuerpo Supremo',
};

const Page = styled.div`
  min-height: 100vh;
  padding: 1.4rem 1.1rem 3rem;
  color: ${COLORS.ink};
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  background:
    radial-gradient(900px 520px at 20% 30%, rgba(0, 130, 170, 0.18), transparent 60%),
    radial-gradient(850px 540px at 85% 25%, rgba(255, 152, 0, 0.18), transparent 62%),
    linear-gradient(180deg, ${COLORS.sky1} 0%, ${COLORS.sky2} 72%);

  @media (max-width: 980px) {
    padding: 1.1rem 0.95rem 2.4rem;
  }

  @media (max-width: 540px) {
    padding: 1rem 0.8rem 2rem;
  }
`;

const Frame = styled.div`
  max-width: 1180px;
  margin: 0 auto;
`;

const TopBar = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const BrandLogo = styled.img`
  height: 57px;
  width: auto;
  filter: drop-shadow(0 16px 26px rgba(0, 88, 112, 0.22));
  flex: 0 0 auto;
  justify-self: center;
  grid-column: 2;

  @media (max-width: 520px) {
    height: 48px;
  }
`;

const BackButton = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.75);
  background: ${COLORS.glass};
  color: ${COLORS.ink};
  padding: 0.7rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-weight: 1000;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;
  justify-self: start;
  grid-column: 1;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.82);
    border-color: rgba(255, 255, 255, 0.9);
  }
`;

const Shell = styled.div`
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  gap: 1rem;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const ColumnStack = styled.div`
  display: grid;
  gap: 1rem;
  align-content: start;
  align-items: stretch;
`;

const MapShell = styled.div`
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  gap: 1rem;
  align-items: start;
  grid-template-areas:
    'node profile'
    'map map'
    'status status';

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'node'
      'map'
      'profile'
      'status';
  }
`;

const MapAreaNode = styled(ColumnStack)`
  grid-area: node;
`;

const MapAreaProfile = styled(ColumnStack)`
  grid-area: profile;
`;

const MapAreaMap = styled(ColumnStack)`
  grid-area: map;
`;

const MapAreaStatus = styled(ColumnStack)`
  grid-area: status;
`;

const Card = styled.div`
  background: ${COLORS.glass};
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 26px;
  padding: 1.1rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 24px 70px rgba(0, 88, 112, 0.14);
  overflow: hidden;
  position: relative;

  @media (max-width: 980px) {
    border-radius: 22px;
    padding: 1rem;
  }

  @media (max-width: 540px) {
    border-radius: 20px;
    padding: 0.9rem;
  }
`;

const CardTitle = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 0.9rem;

  @media (max-width: 540px) {
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 0.45rem 0.8rem;
  }
`;

const H2 = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  letter-spacing: 0.2px;
  font-weight: 900;
`;

const Sub = styled.div`
  color: ${COLORS.muted};
  font-weight: 800;
`;

const PillRow = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

const Pill = styled.div`
  border: 1px solid rgba(0, 88, 112, 0.16);
  background: rgba(255, 255, 255, 0.62);
  border-radius: 999px;
  padding: 0.45rem 0.7rem;
  font-weight: 1000;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: ${COLORS.muted};
`;

const BarWrap = styled.div`
  display: grid;
  gap: 0.55rem;
  margin-top: 0.95rem;
`;

const EnergyBar = styled.div`
  height: 14px;
  border-radius: 999px;
  border: 1px solid rgba(0, 88, 112, 0.16);
  background: rgba(255, 255, 255, 0.55);
  overflow: hidden;
`;

const EnergyFill = styled.div`
  height: 100%;
  width: ${({ $pct }) => `${$pct}%`};
  background: ${({ $pct }) => ($pct >= 55 ? `linear-gradient(90deg, ${COLORS.good}, rgba(0, 130, 170, 0.9))` : $pct >= 25 ? `linear-gradient(90deg, ${COLORS.primary}, rgba(0, 130, 170, 0.85))` : `linear-gradient(90deg, ${COLORS.bad}, ${COLORS.primaryDeep})`)};
  transition: width 180ms ease;
`;

const Hint = styled.div`
  color: ${COLORS.muted};
  font-weight: 850;
  line-height: 1.3;
`;

const PrimaryButton = styled.button`
  border: none;
  background: ${COLORS.primary};
  color: #ffffff;
  padding: 0.95rem 1rem;
  border-radius: 18px;
  cursor: pointer;
  font-weight: 900;
  letter-spacing: 0.2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  transition: transform 120ms ease, filter 120ms ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(0.98);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }
`;

const SubtleButton = styled.button`
  border: 1px solid rgba(0, 88, 112, 0.18);
  background: rgba(255, 255, 255, 0.62);
  color: ${COLORS.ink};
  padding: 0.75rem 0.9rem;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.78);
    border-color: rgba(0, 88, 112, 0.26);
  }
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;

const StarterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;

const DigiCard = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.62);
  border-radius: 18px;
  padding: 0.75rem;
  cursor: pointer;
  color: ${COLORS.ink};
  display: grid;
  gap: 0.55rem;
  text-align: left;
  transition: transform 130ms ease, background 130ms ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.8);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

const DigiImg = styled.img`
  width: 100%;
  height: 126px;
  object-fit: contain;
  filter: drop-shadow(0 14px 22px rgba(0, 0, 0, 0.45));
`;

const DigiName = styled.div`
  font-weight: 1100;
  letter-spacing: 0.2px;
`;

const DigiMeta = styled.div`
  color: ${COLORS.muted};
  font-weight: 900;
  font-size: 0.9rem;
`;

const MapWrap = styled.div`
  display: grid;
  gap: 0.85rem;
`;

const FloorsCanvas = styled.div`
  position: relative;
  overflow: auto;
  padding: 0.7rem 0.2rem 0.9rem;
  scroll-behavior: smooth;
`;

const FloorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $floors }) => $floors}, minmax(160px, 1fr));
  gap: 1.7rem;
  padding: 0.35rem 0.6rem 0.5rem;
  position: relative;
  z-index: 2;
`;

const FloorCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.15rem;
  min-width: 160px;
`;

const FloorTitle = styled.div`
  font-weight: 1000;
  color: ${COLORS.muted};
  font-size: 0.85rem;
  letter-spacing: 0.2px;
  text-transform: uppercase;
`;

const IconBadge = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  background: ${({ $tone }) => ($tone === 'action' ? COLORS.orangeSoft : $tone === 'map' ? COLORS.blueSoft : $tone === 'loot' ? COLORS.violetSoft : COLORS.blueSoft)};
  color: ${COLORS.ink};
  border: 1px solid rgba(0, 88, 112, 0.12);
`;

const NodeButton = styled.button`
  border: none;
  background: transparent;
  padding: 0.2rem 0.35rem;
  cursor: ${({ $state }) => ($state === 'available' ? 'pointer' : 'default')};
  display: grid;
  place-items: center;
  gap: 0.55rem;
  text-align: center;
  color: ${COLORS.ink};
  transition: transform 120ms ease, filter 120ms ease;
  opacity: ${({ $state }) => ($state === 'locked' ? 0.55 : 1)};

  &:hover {
    transform: ${({ $state }) => ($state === 'available' ? 'translateY(-1px)' : 'none')};
    filter: ${({ $state }) => ($state === 'available' ? 'brightness(1.03)' : 'none')};
  }
`;

const NodeCircle = styled.div`
  width: 62px;
  height: 62px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.78);
  border: 2px solid ${({ $state }) => ($state === 'current' ? 'rgba(0, 130, 170, 0.55)' : $state === 'available' ? 'rgba(255, 152, 0, 0.7)' : $state === 'cleared' ? 'rgba(46, 125, 50, 0.45)' : 'rgba(0, 88, 112, 0.16)')};
  box-shadow: 0 18px 46px rgba(0, 88, 112, 0.14);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform 130ms ease, box-shadow 130ms ease;

  ${NodeButton}:hover & {
    transform: ${({ $state }) => ($state === 'available' ? 'scale(1.03)' : 'none')};
    box-shadow: ${({ $state }) => ($state === 'available' ? '0 22px 56px rgba(0, 88, 112, 0.18)' : '0 18px 46px rgba(0, 88, 112, 0.14)')};
  }
`;

const NodeTitle = styled.div`
  font-weight: 900;
  display: grid;
  gap: 0.1rem;
`;

const NodeSub = styled.div`
  color: ${COLORS.muted};
  font-weight: 800;
  font-size: 0.85rem;
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 88, 112, 0.28);
  display: grid;
  place-items: center;
  z-index: 20;
  padding: 1rem;
`;

const Modal = styled.div`
  width: min(680px, 100%);
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 26px;
  box-shadow: 0 30px 110px rgba(0, 88, 112, 0.22);
  padding: 1.1rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: ${fadeIn} 160ms ease both;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.8rem;
`;

const ModalTitle = styled.div`
  font-weight: 1200;
  letter-spacing: 0.2px;
  font-size: 1.2rem;
`;

const Prompt = styled.div`
  border: 1px solid rgba(0, 88, 112, 0.16);
  background: rgba(255, 255, 255, 0.68);
  border-radius: 20px;
  padding: 0.95rem;
  line-height: 1.25;
  display: grid;
  gap: 0.6rem;
`;

const Input = styled.input`
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(0, 88, 112, 0.18);
  background: rgba(255, 255, 255, 0.76);
  padding: 0.9rem 0.9rem;
  color: ${COLORS.ink};
  font-weight: 1000;
  font-size: 1.05rem;
  outline: none;
`;

const ChoiceButton = styled.button`
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(0, 88, 112, 0.18);
  background: rgba(255, 255, 255, 0.76);
  padding: 0.85rem 0.85rem;
  color: ${COLORS.ink};
  cursor: pointer;
  font-weight: 1000;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  transition: transform 120ms ease, background 120ms ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.9);
  }
`;

const Feedback = styled.div`
  font-weight: 1000;
  padding: 0.75rem 0.85rem;
  border-radius: 16px;
  border: 1px solid ${({ $tone }) => ($tone === 'good' ? 'rgba(46, 125, 50, 0.35)' : 'rgba(198, 40, 40, 0.35)')};
  background: ${({ $tone }) => ($tone === 'good' ? 'rgba(46, 125, 50, 0.10)' : 'rgba(198, 40, 40, 0.10)')};
  color: ${COLORS.ink};
`;

const BattleGrid = styled.div`
  display: grid;
  gap: 0.85rem;
`;

const FighterRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;

  @media (max-width: 580px) {
    grid-template-columns: 1fr;
  }
`;

const FighterCard = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.62);
  border-radius: 22px;
  padding: 0.9rem;
  display: grid;
  gap: 0.55rem;
`;

const FighterTop = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: center;
`;

const FighterAvatar = styled.img`
  width: 82px;
  height: 82px;
  object-fit: contain;
  filter: drop-shadow(0 14px 22px rgba(0, 88, 112, 0.14));
`;

const FighterName = styled.div`
  font-weight: 1200;
  letter-spacing: 0.2px;
`;

const FighterMeta = styled.div`
  color: ${COLORS.muted};
  font-weight: 900;
  font-size: 0.9rem;
`;

const SmallBar = styled.div`
  height: 12px;
  border-radius: 999px;
  border: 1px solid rgba(0, 88, 112, 0.16);
  background: rgba(255, 255, 255, 0.55);
  overflow: hidden;
`;

const SmallFill = styled.div`
  height: 100%;
  width: ${({ $pct }) => `${$pct}%`};
  background: ${({ $pct }) => ($pct >= 55 ? `linear-gradient(90deg, ${COLORS.good}, rgba(0, 130, 170, 0.9))` : $pct >= 25 ? `linear-gradient(90deg, ${COLORS.primary}, rgba(0, 130, 170, 0.85))` : `linear-gradient(90deg, ${COLORS.bad}, ${COLORS.primaryDeep})`)};
  transition: width 180ms ease;
`;

const Log = styled.div`
  border: 1px solid rgba(0, 88, 112, 0.16);
  background: rgba(255, 255, 255, 0.62);
  border-radius: 22px;
  padding: 0.85rem;
  color: ${COLORS.muted};
  font-weight: 850;
  line-height: 1.35;
  max-height: 220px;
  overflow: auto;
  display: grid;
  gap: 0.35rem;
`;

const mapLevelLabel = (raw) => {
  const s = String(raw ?? '').trim();
  if (!s) return 'Desconocido';
  const key = s.toLowerCase();
  return DIGI_LEVEL_ES[key] || s;
};

const levelTier = (level) => {
  const l = String(level ?? '').toLowerCase();
  if (l.includes('digi-huevo') || l.includes('digi huevo') || l.includes('digitama')) return 0;
  if (l.includes('etapa bebé') || l.includes('bebe') || l.includes('baby') || l.includes('in-training') || l.includes('in training')) return 0;
  if (l.includes('cuerpo infantil') || l.includes('child') || l.includes('rookie')) return 1;
  if (l.includes('cuerpo maduro') || l.includes('adult') || l.includes('champion')) return 2;
  if (l.includes('cuerpo perfecto') || l.includes('perfect')) return 3;
  if (l.includes('cuerpo supremo') || l.includes('ultimate') || l.includes('mega')) return 4;
  return 2;
};

const buildStats = ({ tier, floor, isBoss, rng }) => {
  const base = 18 + tier * 8 + Math.floor(floor * 2.2);
  const hp = base + rngInt(rng, 10, 18) + (isBoss ? 16 : 0);
  const atk = 6 + tier * 2 + rngInt(rng, 0, 3) + (isBoss ? 2 : 0);
  const def = 4 + tier * 2 + rngInt(rng, 0, 3) + (isBoss ? 2 : 0);
  return { hp, atk, def };
};

const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

const shuffle = (rng, list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = rngInt(rng, 0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const makeQuestion = ({ rng, floor }) => {
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

const nodeLabel = (kind) => {
  if (kind === 'start') return { title: 'Nodo inicial', icon: <FaSpa />, tone: 'map' };
  if (kind === 'rest') return { title: 'Descanso', icon: <FaSpa />, tone: 'map' };
  if (kind === 'loot') return { title: 'Botín', icon: <FaCube />, tone: 'loot' };
  if (kind === 'boss') return { title: 'Jefe final', icon: <FaCrown />, tone: 'action' };
  return { title: 'Encuentro', icon: <FaBolt />, tone: 'action' };
};

const generateMap = ({ seed }) => {
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

const digimonCache = new Map();

const fetchDigimon = async (name) => {
  if (digimonCache.has(name)) return digimonCache.get(name);

  const tryDigiApi = async () => {
    const res = await fetch(`https://digi-api.com/api/v1/digimon/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const img = json?.images?.[0]?.href || json?.images?.[0]?.image || null;
    const level = json?.levels?.[0]?.level || null;
    const id = json?.id || null;
    return { source: 'digi-api', id, name: json?.name || name, img, level };
  };

  const tryVercel = async () => {
    const res = await fetch(`https://digimon-api.vercel.app/api/digimon/name/${encodeURIComponent(name.toLowerCase())}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const item = Array.isArray(json) ? json[0] : json;
    if (!item) throw new Error('Empty');
    return { source: 'vercel', id: item?.name || name, name: item?.name || name, img: item?.img || null, level: item?.level || null };
  };

  try {
    const data = await tryDigiApi();
    const normalized = { ...data, img: data.img || FALLBACK_IMG, level: mapLevelLabel(data.level) };
    digimonCache.set(name, normalized);
    return normalized;
  } catch {
    try {
      const data = await tryVercel();
      const normalized = { ...data, img: data.img || FALLBACK_IMG, level: mapLevelLabel(data.level) };
      digimonCache.set(name, normalized);
      return normalized;
    } catch {
      const fallback = { source: 'fallback', id: name, name, img: FALLBACK_IMG, level: 'Desconocido' };
      digimonCache.set(name, fallback);
      return fallback;
    }
  }
};

const DigilikeGame = ({ onBack }) => {
  const [seed, setSeed] = useState(() => String(Math.floor(Math.random() * 1e9)));
  const rngRef = useRef(createRng(seed));
  const floorsRef = useRef(null);
  const [screen, setScreen] = useState('start');
  const [starterPool, setStarterPool] = useState([]);
  const [starterLoading, setStarterLoading] = useState(true);
  const [starterError, setStarterError] = useState(null);
  const [saga, setSaga] = useState(() => ADVENTURE_SAGAS[0]);
  const sagaRef = useRef(saga);

  const [mapState, setMapState] = useState(null);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [energy, setEnergy] = useState({ cur: 100, max: 100 });
  const energyCurRef = useRef(100);
  const [player, setPlayer] = useState(null);
  const [runMeta, setRunMeta] = useState({ floor: 0, cleared: 0, correct: 0, wrong: 0 });

  const [pendingQuestion, setPendingQuestion] = useState(null);
  const [questionAnswer, setQuestionAnswer] = useState('');
  const [questionFeedback, setQuestionFeedback] = useState(null);

  const [lootChoices, setLootChoices] = useState(null);
  const [battle, setBattle] = useState(null);
  const [mapLines, setMapLines] = useState([]);
  const [mapCanvasSize, setMapCanvasSize] = useState({ w: 0, h: 0 });

  const energyPct = useMemo(() => {
    if (!energy?.max) return 0;
    return clamp(Math.round((energy.cur / energy.max) * 100), 0, 100);
  }, [energy]);

  useEffect(() => {
    energyCurRef.current = energy.cur;
  }, [energy.cur]);

  useEffect(() => {
    sagaRef.current = saga;
  }, [saga]);

  useEffect(() => {
    let alive = true;
    setStarterLoading(true);
    setStarterError(null);

    Promise.all(STARTERS.map((n) => fetchDigimon(n)))
      .then((items) => {
        if (!alive) return;
        setStarterPool(items);
        setStarterLoading(false);
      })
      .catch((err) => {
        if (!alive) return;
        setStarterError(String(err?.message || err));
        setStarterLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    rngRef.current = createRng(seed);
  }, [seed]);

  const availableNodes = useMemo(() => {
    if (!mapState || !currentNodeId) return new Set();
    const node = mapState.byId[currentNodeId];
    if (!node) return new Set();
    if (!node.cleared) return new Set();
    return new Set(node.edges);
  }, [mapState, currentNodeId]);

  useEffect(() => {
    if (screen !== 'map') return;
    if (!currentNodeId) return;
    const el = floorsRef.current;
    if (!el) return;
    const target = el.querySelector(`[data-nodeid="${currentNodeId}"]`);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [screen, currentNodeId]);

  useEffect(() => {
    if (screen !== 'map') return;
    if (!mapState) return;
    const el = floorsRef.current;
    if (!el) return;

    const compute = () => {
      const base = el.getBoundingClientRect();
      const anchors = el.querySelectorAll('[data-anchorid]');
      const pos = new Map();

      anchors.forEach((a) => {
        const id = a.getAttribute('data-anchorid');
        if (!id) return;
        const r = a.getBoundingClientRect();
        const x = r.left - base.left + el.scrollLeft + r.width / 2;
        const y = r.top - base.top + el.scrollTop + r.height / 2;
        pos.set(id, { x, y });
      });

      const lines = [];
      for (const n of mapState.nodes) {
        const from = pos.get(n.id);
        if (!from) continue;
        for (const toId of n.edges || []) {
          const to = pos.get(toId);
          if (!to) continue;
          const isChoice = n.id === currentNodeId && availableNodes.has(toId);
          const isUnlocked = mapState.byId?.[toId]?.cleared || availableNodes.has(toId) || mapState.byId?.[n.id]?.cleared;

          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const cpx = from.x + dx * 0.5;
          const cpy = from.y + dy * 0.5 + (Math.abs(dy) < 2 ? -26 : 0);
          const d = `M ${from.x} ${from.y} Q ${cpx} ${cpy} ${to.x} ${to.y}`;

          lines.push({
            d,
            choice: isChoice,
            dashed: !isChoice && !isUnlocked,
          });
        }
      }

      setMapLines(lines);
      setMapCanvasSize({ w: el.scrollWidth, h: el.scrollHeight });
    };

    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        scrollRaf = 0;
        compute();
      });
    };

    const raf = window.requestAnimationFrame(compute);
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', compute);

    return () => {
      window.cancelAnimationFrame(raf);
      if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', compute);
    };
  }, [screen, mapState, currentNodeId, availableNodes]);

  const resetRun = async (pickedStarter, forcedSeed) => {
    const nextSeed = forcedSeed ?? seed;
    setSeed(nextSeed);
    const rng = createRng(nextSeed);
    rngRef.current = rng;

    const map = generateMap({ seed: nextSeed });
    setMapState(map);
    setCurrentNodeId(map.startId);
    setEnergy({ cur: 100, max: 100 });
    setRunMeta({ floor: 0, cleared: 0, correct: 0, wrong: 0 });

    const starter = pickedStarter || (starterPool[0] ? starterPool[0] : await fetchDigimon(STARTERS[0]));
    const tier = levelTier(starter.level);
    const stats = buildStats({ tier, floor: 0, isBoss: false, rng });
    setPlayer({
      digimon: starter,
      hp: stats.hp,
      maxHp: stats.hp,
      atk: stats.atk,
      def: stats.def,
      healUsed: false,
      guard: false,
    });

    setLootChoices(null);
    setPendingQuestion(null);
    setBattle(null);
    setQuestionAnswer('');
    setQuestionFeedback(null);
    setScreen('node');
  };

  const startNewRun = async (pickedStarter) => {
    const nextSeed = String(Math.floor(Math.random() * 1e9));
    const rng = createRng(nextSeed);
    setSaga(ADVENTURE_SAGAS[rngInt(rng, 0, ADVENTURE_SAGAS.length - 1)]);
    await resetRun(pickedStarter, nextSeed);
  };

  const ensureQuestion = (floor) => {
    const rng = rngRef.current;
    const q = makeQuestion({ rng, floor });
    setPendingQuestion(q);
    setQuestionAnswer('');
    setQuestionFeedback(null);
    setScreen('question');
  };

  const applyEnergy = (delta) => {
    setEnergy((prev) => {
      const next = clamp(prev.cur + delta, 0, prev.max);
      return { ...prev, cur: next };
    });
  };

  const markNodeCleared = (nodeId) => {
    setMapState((prev) => {
      if (!prev) return prev;
      const node = prev.byId[nodeId];
      if (!node) return prev;
      if (node.cleared) return prev;
      return { ...prev, byId: { ...prev.byId, [nodeId]: { ...node, cleared: true } } };
    });
  };

  const startNode = () => {
    if (!mapState || !currentNodeId) return;
    const node = mapState.byId[currentNodeId];
    if (!node) return;

    setLootChoices(null);
    setBattle(null);
    setPendingQuestion(null);
    setQuestionFeedback(null);

    if (node.kind === 'start') {
      applyEnergy(12);
      markNodeCleared(node.id);
      setRunMeta((m) => ({ ...m, cleared: m.cleared + 1 }));
      ensureQuestion(node.floor);
      return;
    }

    if (node.kind === 'rest') {
      applyEnergy(16);
      markNodeCleared(node.id);
      setRunMeta((m) => ({ ...m, cleared: m.cleared + 1 }));
      ensureQuestion(node.floor);
      return;
    }

    if (node.kind === 'loot') {
      const rng = rngRef.current;
      const choices = shuffle(rng, [
        { id: 'atk', title: '+ATK', sub: 'Tus ataques pegan más', apply: (p) => ({ ...p, atk: p.atk + 2 }) },
        { id: 'def', title: '+DEF', sub: 'Recibes menos daño', apply: (p) => ({ ...p, def: p.def + 2 }) },
        { id: 'hp', title: '+HP Máx', sub: 'Más aguante en combate', apply: (p) => ({ ...p, maxHp: p.maxHp + 10, hp: p.hp + 10 }) },
      ]).slice(0, 3);
      setLootChoices(choices);
      setScreen('loot');
      return;
    }

    const isBoss = node.kind === 'boss';
    setScreen('battle');
    void (async () => {
      const rng = rngRef.current;
      const sagaBoss = sagaRef.current?.bossFetchName;
      const enemyName = isBoss && sagaBoss
        ? sagaBoss
        : rngPick(rng, [...STARTERS, 'Greymon', 'Kabuterimon', 'Ikkakumon', 'Garurumon', 'Leomon', 'Ogremon']);
      const digimon = await fetchDigimon(enemyName);
      const tier = levelTier(digimon.level);
      const stats = buildStats({ tier, floor: node.floor, isBoss, rng });
      setBattle({
        isBoss,
        enemy: {
          digimon,
          hp: stats.hp,
          maxHp: stats.hp,
          atk: stats.atk + (isBoss ? 2 : 0),
          def: stats.def + (isBoss ? 2 : 0),
          guard: false,
        },
        log: [`Aparece ${digimon.name}${isBoss ? ' (Jefe final)' : ''}.`],
        turn: 'player',
      });
    })();
  };

  useEffect(() => {
    if (screen === 'node') startNode();
  }, [screen]);

  const handlePickNode = (nodeId) => {
    if (!availableNodes.has(nodeId)) return;
    setCurrentNodeId(nodeId);
    setRunMeta((m) => ({ ...m, floor: mapState?.byId?.[nodeId]?.floor ?? m.floor }));
    setScreen('node');
  };

  const finishNode = (floor) => {
    if (energyCurRef.current <= 0) {
      setScreen('end');
      return;
    }
    ensureQuestion(floor);
  };

  const submitQuestion = ({ pickedIndex } = {}) => {
    if (!pendingQuestion) return;
    const raw = pendingQuestion.type === 'multiple_choice' ? pickedIndex : questionAnswer;
    const normalized = pendingQuestion.type === 'multiple_choice' ? raw : String(raw ?? '').trim();
    const isCorrect = pendingQuestion.type === 'multiple_choice'
      ? Number(pickedIndex) === pendingQuestion.correctIndex
      : Number(normalized) === pendingQuestion.answer;

    const delta = isCorrect ? pendingQuestion.heal : -pendingQuestion.hit;
    const nextEnergy = clamp(energyCurRef.current + delta, 0, energy.max);

    if (isCorrect) {
      applyEnergy(pendingQuestion.heal);
      setQuestionFeedback({ tone: 'good', text: `Correcto. +${pendingQuestion.heal} energía.` });
      setRunMeta((m) => ({ ...m, correct: m.correct + 1 }));
    } else {
      applyEnergy(-pendingQuestion.hit);
      setQuestionFeedback({ tone: 'bad', text: `Incorrecto. −${pendingQuestion.hit} energía. Respuesta: ${pendingQuestion.answer}` });
      setRunMeta((m) => ({ ...m, wrong: m.wrong + 1 }));
    }

    window.setTimeout(() => {
      setPendingQuestion(null);
      setQuestionFeedback(null);
      if (nextEnergy <= 0) {
        setScreen('end');
        return;
      }
      setScreen('map');
    }, 700);
  };

  const pickLoot = (choice) => {
    if (!choice) return;
    setPlayer((p) => (p ? choice.apply(p) : p));
    setLootChoices(null);
    markNodeCleared(currentNodeId);
    setRunMeta((m) => ({ ...m, cleared: m.cleared + 1 }));
    const floor = mapState?.byId?.[currentNodeId]?.floor ?? 0;
    finishNode(floor);
  };

  const appendLog = (b, line) => {
    return { ...b, log: [...b.log, line].slice(-24) };
  };

  const applyDamage = ({ target, amount }) => {
    const dmg = Math.max(1, Math.floor(amount));
    if (target === 'enemy') {
      setBattle((b) => {
        if (!b) return b;
        const nextHp = clamp(b.enemy.hp - dmg, 0, b.enemy.maxHp);
        return { ...b, enemy: { ...b.enemy, hp: nextHp } };
      });
      return dmg;
    }
    setPlayer((p) => {
      if (!p) return p;
      const nextHp = clamp(p.hp - dmg, 0, p.maxHp);
      return { ...p, hp: nextHp, guard: false };
    });
    return dmg;
  };

  const resolveEnemyTurn = () => {
    setBattle((b) => {
      if (!b || b.turn !== 'enemy' || !player) return b;
      if (b.enemy.hp <= 0 || player.hp <= 0) return b;

      const rng = rngRef.current;
      const willGuard = !b.enemy.guard && rng() < 0.22;
      if (willGuard) {
        return appendLog({ ...b, enemy: { ...b.enemy, guard: true }, turn: 'player' }, `${b.enemy.digimon.name} se protege.`);
      }

      const raw = b.enemy.atk + rngInt(rng, 0, 3);
      const reduced = raw - Math.floor(player.def * 0.45);
      const guarded = player.guard ? Math.floor(reduced * 0.6) : reduced;
      const dealt = applyDamage({ target: 'player', amount: guarded });
      return appendLog({ ...b, turn: 'player', enemy: { ...b.enemy, guard: false } }, `${b.enemy.digimon.name} ataca y hace ${dealt} de daño.`);
    });
  };

  useEffect(() => {
    if (screen !== 'battle') return;
    if (!battle || !player) return;
    if (battle.turn !== 'enemy') return;
    const t = window.setTimeout(() => resolveEnemyTurn(), 520);
    return () => window.clearTimeout(t);
  }, [battle?.turn, screen]);

  useEffect(() => {
    if (screen !== 'battle') return;
    if (!battle || !player) return;
    const node = mapState?.byId?.[currentNodeId];
    if (!node) return;
    if (battle.enemy.hp <= 0) {
      markNodeCleared(node.id);
      setRunMeta((m) => ({ ...m, cleared: m.cleared + 1 }));
      setBattle((b) => (b ? appendLog(b, 'Victoria.') : b));
      if (node.kind === 'boss') {
        window.setTimeout(() => setScreen('end'), 650);
      } else {
        window.setTimeout(() => finishNode(node.floor), 550);
      }
      return;
    }
    if (player.hp <= 0) {
      setEnergy((prev) => ({ ...prev, cur: 0 }));
      window.setTimeout(() => setScreen('end'), 450);
    }
  }, [battle?.enemy?.hp, player?.hp, screen]);

  const act = (action) => {
    if (screen !== 'battle') return;
    if (!battle || battle.turn !== 'player' || !player) return;

    const rng = rngRef.current;
    if (action === 'guard') {
      setPlayer((p) => (p ? { ...p, guard: true } : p));
      setBattle((b) => (b ? appendLog({ ...b, turn: 'enemy' }, `${player.digimon.name} se protege.`) : b));
      return;
    }

    if (action === 'heal') {
      if (player.healUsed || player.hp >= player.maxHp) return;
      const gain = 10 + rngInt(rng, 0, 6);
      setPlayer((p) => {
        if (!p) return p;
        return { ...p, hp: clamp(p.hp + gain, 0, p.maxHp), healUsed: true, guard: false };
      });
      setBattle((b) => (b ? appendLog({ ...b, turn: 'enemy' }, `${player.digimon.name} usa cura (+${gain} HP).`) : b));
      return;
    }

    const mult = action === 'skill' ? 1.25 : 1.0;
    const raw = Math.floor((player.atk + rngInt(rng, 0, 3)) * mult);
    const reduced = raw - Math.floor(battle.enemy.def * 0.4);
    const guarded = battle.enemy.guard ? Math.floor(reduced * 0.6) : reduced;
    const dealt = applyDamage({ target: 'enemy', amount: guarded });
    setBattle((b) => (b ? appendLog({ ...b, turn: 'enemy', enemy: { ...b.enemy, guard: false } }, `${player.digimon.name} ${action === 'skill' ? 'usa habilidad' : 'ataca'} e inflige ${dealt}.`) : b));
  };

  const mapView = () => {
    if (!mapState) return null;
    const floors = [];
    for (let f = 0; f < mapState.floorsCount; f += 1) {
      const col = [];
      for (let i = 0; i < mapState.nodesPerFloor; i += 1) {
        const node = mapState.byId[`${f}-${i}`];
        const label = nodeLabel(node.kind);
        const state = node.id === currentNodeId ? 'current' : node.cleared ? 'cleared' : availableNodes.has(node.id) ? 'available' : 'locked';
        const baseSub = node.kind === 'combat' ? 'Combate' : node.kind === 'rest' ? 'Recupera energía' : node.kind === 'loot' ? 'Mejora' : node.kind === 'boss' ? 'Combate duro' : 'Inicio';
        const sub = state === 'available' ? (
          <>
            <span style={{ color: COLORS.primaryDeep, fontWeight: 900 }}>Siguiente nodo</span>
            <span> · {baseSub}</span>
          </>
        ) : (
          baseSub
        );
        col.push(
          <NodeButton
            key={node.id}
            data-nodeid={node.id}
            $state={state}
            onClick={() => handlePickNode(node.id)}
            type="button"
          >
            <NodeCircle data-anchorid={node.id} $state={state}>
              <IconBadge $tone={label.tone}>{label.icon}</IconBadge>
            </NodeCircle>
            <NodeTitle>{label.title}</NodeTitle>
            <NodeSub>{sub}</NodeSub>
          </NodeButton>
        );
      }
      floors.push(
        <FloorCol key={f}>
          <FloorTitle>Piso {f + 1}</FloorTitle>
          {col}
        </FloorCol>
      );
    }

    return (
      <MapWrap>
        <Hint>Para avanzar: completa el nodo y responde al portal. Luego elige el siguiente nodo disponible.</Hint>
        <FloorsCanvas ref={floorsRef}>
          <svg
            width={mapCanvasSize.w}
            height={mapCanvasSize.h}
            viewBox={`0 0 ${mapCanvasSize.w} ${mapCanvasSize.h}`}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}
            aria-hidden="true"
          >
            {mapLines.map((l, idx) => (
              <path
                key={`${idx}-${l.d}`}
                d={l.d}
                fill="none"
                stroke={l.choice ? COLORS.primary : 'rgba(0, 130, 170, 0.35)'}
                strokeWidth={l.choice ? 3.25 : 2.35}
                strokeDasharray={l.dashed ? '7 7' : undefined}
                strokeLinecap="round"
              />
            ))}
          </svg>
          <FloorsGrid $floors={mapState.floorsCount}>{floors}</FloorsGrid>
        </FloorsCanvas>
      </MapWrap>
    );
  };

  const nodeCard = () => {
    if (!mapState || !currentNodeId) return null;
    const node = mapState.byId[currentNodeId];
    const label = nodeLabel(node.kind);
    const floor = node.floor;
    return (
      <Card>
        <CardTitle>
          <H2>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
              <IconBadge $tone={label.tone}>{label.icon}</IconBadge>
              {label.title}
            </span>
          </H2>
          <Sub>{saga?.title} · Piso {floor + 1}</Sub>
        </CardTitle>
        <Hint>
          {saga?.blurb ? `${saga.blurb} ` : ''}
          {node.kind === 'start' && 'Recibes un boost inicial de energía. Luego, portal obligatorio.'}
          {node.kind === 'rest' && 'Respira. Recuperas energía. Luego, portal obligatorio.'}
          {node.kind === 'loot' && 'Elige una mejora para tu Digimon. Luego, portal obligatorio.'}
          {node.kind === 'combat' && 'Encuentro: combate simple 1v1. Luego, portal obligatorio.'}
          {node.kind === 'boss' && 'Jefe final de la run. Si ganas, cierras la run.'}
        </Hint>
        <BarWrap>
          <EnergyBar>
            <EnergyFill $pct={energyPct} />
          </EnergyBar>
          <PillRow>
            <Pill><FaBolt /> Energía: {energy.cur}/{energy.max}</Pill>
            <Pill><FaCrown /> Aciertos: {runMeta.correct}</Pill>
            <Pill><FaSkullCrossbones /> Fallos: {runMeta.wrong}</Pill>
          </PillRow>
        </BarWrap>
      </Card>
    );
  };

  const profileCard = () => {
    if (!player) return null;
    const hpPct = clamp(Math.round((player.hp / player.maxHp) * 100), 0, 100);
    const showHeal = screen === 'battle';
    const healStatus = player.healUsed
      ? 'Gastada'
      : player.hp >= player.maxHp
        ? 'Al máximo'
        : battle?.turn !== 'player'
          ? 'En espera'
          : 'Disponible';
    return (
      <Card>
        <CardTitle>
          <H2>Tu Digimon</H2>
          <Sub>{player.digimon.level}</Sub>
        </CardTitle>
        <FighterTop>
          <FighterAvatar src={player.digimon.img} alt={player.digimon.name} />
          <div>
            <FighterName>{player.digimon.name}</FighterName>
            <FighterMeta>ATK {player.atk} · DEF {player.def}</FighterMeta>
          </div>
        </FighterTop>
        <SmallBar>
          <SmallFill $pct={hpPct} />
        </SmallBar>
        <PillRow>
          <Pill><FaBolt /> HP: {player.hp}/{player.maxHp}</Pill>
          {showHeal && <Pill><FaSyringe /> Cura: {healStatus}</Pill>}
        </PillRow>
      </Card>
    );
  };

  return (
    <Page>
      <Frame>
        <TopBar>
          <BackButton onClick={onBack} type="button">
            <FaArrowLeft /> Volver
          </BackButton>
          <BrandLogo src={`${process.env.PUBLIC_URL}/digilikelogo.png`} alt="Digilike" />
          <div aria-hidden="true" />
        </TopBar>

        {screen === 'start' && (
          <Shell>
            <Card>
              <CardTitle>
                <H2>Elige tu Digimon</H2>
                <Sub>{saga?.title}</Sub>
              </CardTitle>
              <Hint>
                {saga?.blurb ? `${saga.blurb} ` : ''}
                El mapa es procedural. Tras cada nodo, un portal de operaciones decide tu energía.
              </Hint>
              {starterLoading && <Hint>Cargando Digimon…</Hint>}
              {starterError && <Feedback $tone="bad">No se pudo cargar la API: {starterError}. Se usarán placeholders.</Feedback>}
              <StarterGrid>
                {(starterPool.length ? starterPool : STARTERS.map((n) => ({ name: n, img: FALLBACK_IMG, level: 'Desconocido', id: n }))).map((d) => (
                  <DigiCard key={d.name} onClick={() => startNewRun(d)} type="button" disabled={starterLoading}>
                    <DigiImg src={d.img || FALLBACK_IMG} alt={d.name} />
                    <DigiName>{d.name}</DigiName>
                    <DigiMeta>{d.level}</DigiMeta>
                  </DigiCard>
                ))}
              </StarterGrid>
            </Card>

            <Card>
              <CardTitle>
                <H2>Cómo se gana</H2>
                <Sub>Reglas rápidas</Sub>
              </CardTitle>
              <Hint>
                - Completa un nodo.<br />
                - Responde el portal correctamente para recuperar energía.<br />
                - Si fallas, pierdes energía. A 0: fin de run.<br />
                - La run termina en el Jefe final del último piso.
              </Hint>
              <BarWrap>
                <PrimaryButton onClick={() => startNewRun(starterPool[0])} type="button" disabled={starterLoading && !starterPool.length}>
                  Empezar run
                </PrimaryButton>
                <SubtleButton
                  onClick={() => {
                    const next = ADVENTURE_SAGAS[Math.floor(Math.random() * ADVENTURE_SAGAS.length)];
                    setSaga(next);
                  }}
                  type="button"
                >
                  Cambiar saga
                </SubtleButton>
              </BarWrap>
            </Card>
          </Shell>
        )}

        {screen !== 'start' && screen === 'map' && (
          <MapShell>
            <MapAreaNode>{nodeCard()}</MapAreaNode>
            <MapAreaProfile>{profileCard()}</MapAreaProfile>
            <MapAreaMap>
              <Card>
                <CardTitle>
                  <H2>Mapa</H2>
                  <Sub>{saga?.title} · Nodos despejados: {runMeta.cleared}</Sub>
                </CardTitle>
                {mapView()}
              </Card>
            </MapAreaMap>
            <MapAreaStatus>
              <Card>
                <CardTitle>
                  <H2>Estado</H2>
                  <Sub>Seed {seed}</Sub>
                </CardTitle>
                <Hint>Energía decide si sobrevives a la run. Los portales son obligatorios.</Hint>
                <Grid2>
                  <SubtleButton onClick={() => startNewRun(player?.digimon)} type="button">
                    Nueva run
                  </SubtleButton>
                  <SubtleButton onClick={() => setScreen('end')} type="button">
                    Abandonar run
                  </SubtleButton>
                </Grid2>
              </Card>
            </MapAreaStatus>
          </MapShell>
        )}

        {screen !== 'start' && screen !== 'map' && (
          <Shell>
            <ColumnStack>
              {nodeCard()}
              {screen === 'end' && (
                <Card>
                  <CardTitle>
                    <H2>Fin de run</H2>
                    <Sub>Seed {seed}</Sub>
                  </CardTitle>
                  <Hint>
                    Aciertos: {runMeta.correct} · Fallos: {runMeta.wrong} · Nodos: {runMeta.cleared}
                  </Hint>
                  <Grid2>
                    <PrimaryButton onClick={() => setScreen('start')} type="button">
                      Volver a inicio
                    </PrimaryButton>
                    <SubtleButton onClick={() => resetRun(player?.digimon)} type="button">
                      Reintentar run
                    </SubtleButton>
                  </Grid2>
                </Card>
              )}
            </ColumnStack>

            <ColumnStack>
              {profileCard()}

              {screen === 'battle' && (
                <Card>
                  <CardTitle>
                    <H2>Combate</H2>
                    <Sub>{battle?.isBoss ? `Jefe final · ${saga?.bossLabel || 'Amenaza'}` : 'Encuentro'}</Sub>
                  </CardTitle>
                  {!battle && <Hint>Preparando combate…</Hint>}
                  {battle && player && (
                    <BattleGrid>
                      <FighterRow>
                        <FighterCard>
                          <FighterTop>
                            <FighterAvatar src={player.digimon.img} alt={player.digimon.name} />
                            <div>
                              <FighterName>{player.digimon.name}</FighterName>
                              <FighterMeta>ATK {player.atk} · DEF {player.def}</FighterMeta>
                            </div>
                          </FighterTop>
                          <SmallBar>
                            <SmallFill $pct={clamp(Math.round((player.hp / player.maxHp) * 100), 0, 100)} />
                          </SmallBar>
                          <PillRow>
                            <Pill>HP {player.hp}/{player.maxHp}</Pill>
                          </PillRow>
                        </FighterCard>

                        <FighterCard>
                          <FighterTop>
                            <FighterAvatar src={battle.enemy.digimon.img} alt={battle.enemy.digimon.name} />
                            <div>
                              <FighterName>{battle.enemy.digimon.name}</FighterName>
                              <FighterMeta>ATK {battle.enemy.atk} · DEF {battle.enemy.def}</FighterMeta>
                            </div>
                          </FighterTop>
                          <SmallBar>
                            <SmallFill $pct={clamp(Math.round((battle.enemy.hp / battle.enemy.maxHp) * 100), 0, 100)} />
                          </SmallBar>
                          <PillRow>
                            <Pill>HP {battle.enemy.hp}/{battle.enemy.maxHp}</Pill>
                          </PillRow>
                        </FighterCard>
                      </FighterRow>

                      <Grid2>
                        <PrimaryButton onClick={() => act('attack')} type="button" disabled={battle.turn !== 'player'}>
                          Atacar
                        </PrimaryButton>
                        <SubtleButton onClick={() => act('skill')} type="button" disabled={battle.turn !== 'player'}>
                          Habilidad
                        </SubtleButton>
                        <SubtleButton onClick={() => act('guard')} type="button" disabled={battle.turn !== 'player'}>
                          Proteger
                        </SubtleButton>
                        <SubtleButton onClick={() => act('heal')} type="button" disabled={battle.turn !== 'player' || player.healUsed || player.hp >= player.maxHp}>
                          Curar
                        </SubtleButton>
                      </Grid2>

                      <Log>
                        {battle.log.map((l, idx) => (
                          <div key={`${idx}-${l}`}>{l}</div>
                        ))}
                      </Log>
                    </BattleGrid>
                  )}
                </Card>
              )}

              {screen === 'loot' && (
                <Card>
                  <CardTitle>
                    <H2>Botín</H2>
                    <Sub>Elige 1 mejora</Sub>
                  </CardTitle>
                  <Grid2>
                    {(lootChoices || []).map((c) => (
                      <SubtleButton key={c.id} onClick={() => pickLoot(c)} type="button">
                        {c.title}
                      </SubtleButton>
                    ))}
                  </Grid2>
                </Card>
              )}
            </ColumnStack>
          </Shell>
        )}

        {screen === 'question' && pendingQuestion && (
          <Overlay>
            <Modal>
              <ModalHeader>
                <ModalTitle>Portal obligatorio · {saga?.title} · Dificultad {pendingQuestion.difficulty}</ModalTitle>
                <Sub>Energía: {energy.cur}/{energy.max}</Sub>
              </ModalHeader>
              <Prompt>
                <div>{pendingQuestion.prompt}</div>
              </Prompt>
              <div style={{ height: '0.75rem' }} />
              {pendingQuestion.type === 'numeric_input' && (
                <Input
                  inputMode="numeric"
                  value={questionAnswer}
                  onChange={(e) => setQuestionAnswer(e.target.value)}
                  placeholder="Escribe el resultado"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitQuestion();
                  }}
                />
              )}
              {pendingQuestion.type === 'multiple_choice' && (
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  {pendingQuestion.options.map((opt, idx) => (
                    <ChoiceButton key={`${pendingQuestion.id}-${opt}`} onClick={() => submitQuestion({ pickedIndex: idx })} type="button">
                      <span>{opt}</span>
                      <span style={{ color: COLORS.muted, fontWeight: 900 }}>Elegir</span>
                    </ChoiceButton>
                  ))}
                </div>
              )}
              <div style={{ height: '0.75rem' }} />
              {questionFeedback && <Feedback $tone={questionFeedback.tone}>{questionFeedback.text}</Feedback>}
              {!questionFeedback && pendingQuestion.type === 'numeric_input' && (
                <Grid2>
                  <PrimaryButton onClick={() => submitQuestion()} type="button" disabled={String(questionAnswer).trim() === ''}>
                    Abrir portal
                  </PrimaryButton>
                </Grid2>
              )}
            </Modal>
          </Overlay>
        )}
      </Frame>
    </Page>
  );
};

export default DigilikeGame;
