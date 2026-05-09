import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaArrowLeft, FaBolt, FaCheckCircle, FaClock, FaRedo, FaStar } from 'react-icons/fa';
import { TIEMPOS_VERBALES_LEVEL_1 } from './data/tiemposVerbalesLevel1';
import { formatRankDate, loadGameRanking, recordGameRun, updateGameBestStreak } from '../utils/rankings';

const COLORS = {
  bg1: '#0B1020',
  bg2: '#111B3A',
  panel: 'rgba(255, 255, 255, 0.08)',
  panel2: 'rgba(255, 255, 255, 0.12)',
  stroke: 'rgba(255, 255, 255, 0.14)',
  ink: 'rgba(255, 255, 255, 0.92)',
  muted: 'rgba(255, 255, 255, 0.72)',
  good: '#22C55E',
  bad: '#EF4444',
  gold: '#FBBF24',
  cyan: '#22D3EE',
};

const Page = styled.div`
  min-height: 100vh;
  padding: 1.6rem 1.2rem 3rem;
  color: ${COLORS.ink};
  background:
    radial-gradient(1200px 800px at 10% 10%, rgba(34, 211, 238, 0.18), transparent 60%),
    radial-gradient(900px 700px at 90% 20%, rgba(251, 191, 36, 0.14), transparent 55%),
    linear-gradient(160deg, ${COLORS.bg1}, ${COLORS.bg2});
`;

const TopBar = styled.div`
  max-width: 1100px;
  margin: 0 auto 1.2rem;
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

const Shell = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
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

const Pill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  border: 2px solid ${COLORS.stroke};
  background: rgba(255, 255, 255, 0.08);
  color: ${COLORS.muted};
  font-weight: 900;
`;

const Row = styled.div`
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
  align-items: center;
`;

const Toggle = styled.button`
  border: 2px solid ${COLORS.stroke};
  background: ${props => props.$active ? 'rgba(34, 211, 238, 0.18)' : 'rgba(255, 255, 255, 0.06)'};
  color: ${props => props.$active ? COLORS.ink : COLORS.muted};
  padding: 0.55rem 0.8rem;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 900;
  transition: transform 120ms ease, background 120ms ease, filter 120ms ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.02);
  }
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
  gap: 0.5rem;
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

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const OptionButton = styled.button`
  border-radius: 18px;
  padding: 0.95rem 1rem;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  border: 2px solid ${props => {
    if (props.$state === 'correct') return 'rgba(34, 197, 94, 0.65)';
    if (props.$state === 'wrong') return 'rgba(239, 68, 68, 0.65)';
    return COLORS.stroke;
  }};
  background: ${props => {
    if (props.$state === 'correct') return 'rgba(34, 197, 94, 0.12)';
    if (props.$state === 'wrong') return 'rgba(239, 68, 68, 0.10)';
    return 'rgba(255, 255, 255, 0.06)';
  }};
  color: ${COLORS.ink};
  font-weight: 1000;
  text-align: left;
  opacity: ${props => props.$disabled ? 0.55 : 1};
  transition: transform 120ms ease, filter 120ms ease;

  &:hover {
    ${props => props.$disabled ? '' : 'transform: translateY(-1px); filter: brightness(1.03);'}
  }
`;

const Feedback = styled.div`
  margin-top: 0.9rem;
  padding: 0.9rem 1rem;
  border-radius: 18px;
  border: 2px solid ${props => props.$type === 'ok' ? 'rgba(34, 197, 94, 0.55)' : 'rgba(239, 68, 68, 0.55)'};
  background: ${props => props.$type === 'ok' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)'};
  font-weight: 950;
  line-height: 1.25;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const Stat = styled.div`
  border-radius: 18px;
  border: 2px solid ${COLORS.stroke};
  background: rgba(0, 0, 0, 0.18);
  padding: 0.9rem 1rem;
  display: grid;
  gap: 0.25rem;
`;

const StatLabel = styled.div`
  color: ${COLORS.muted};
  font-weight: 900;
`;

const StatValue = styled.div`
  font-size: 1.35rem;
  font-weight: 1100;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
`;

const RankTitle = styled.div`
  margin-top: 1rem;
  font-weight: 1100;
  letter-spacing: 0.2px;
  color: ${COLORS.ink};
`;

const RankLine = styled.div`
  margin-top: 0.4rem;
  color: ${COLORS.muted};
  font-weight: 900;
`;

const RankList = styled.div`
  margin-top: 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
`;

const RankRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 18px;
  border: 2px solid ${COLORS.stroke};
  background: rgba(0, 0, 0, 0.16);
`;

const RankLeft = styled.div`
  display: inline-flex;
  gap: 0.6rem;
  align-items: baseline;
  font-weight: 1100;
  color: ${COLORS.ink};
`;

const RankMeta = styled.div`
  color: ${COLORS.muted};
  font-weight: 900;
  font-size: 0.95rem;
  white-space: nowrap;
`;

const Hint = styled.div`
  margin-top: 0.8rem;
  padding: 0.85rem 1rem;
  border-radius: 18px;
  border: 2px dashed rgba(255, 255, 255, 0.24);
  color: ${COLORS.muted};
  line-height: 1.35;
  font-weight: 800;
`;

const overlayIn = keyframes`
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const rewardSpin = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg) scale(0.98); }
  to { transform: translate(-50%, -50%) rotate(360deg) scale(1.02); }
`;

const starFall = keyframes`
  0% { transform: translate3d(0, -20vh, 0) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: translate3d(0, 120vh, 0) rotate(360deg); opacity: 0; }
`;

const RewardOverlayBg = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 28, 0.66);
  backdrop-filter: blur(10px);
  z-index: 50;
  display: ${props => props.$visible ? 'block' : 'none'};
`;

const RewardPanel = styled.div`
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: min(720px, calc(100vw - 2rem));
  border-radius: 26px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background:
    radial-gradient(1200px 600px at 10% 10%, rgba(34, 211, 238, 0.22), transparent 60%),
    radial-gradient(900px 540px at 90% 20%, rgba(251, 191, 36, 0.18), transparent 55%),
    rgba(255, 255, 255, 0.08);
  box-shadow: 0 30px 120px rgba(0, 0, 0, 0.55);
  padding: 1.2rem;
  animation: ${overlayIn} 180ms ease-out;
  overflow: hidden;
`;

const RewardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.95fr;
  gap: 1rem;

  @media (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`;

const RewardTitle = styled.div`
  font-size: 1.35rem;
  font-weight: 1100;
  display: flex;
  align-items: center;
  gap: 0.7rem;
`;

const RewardSub = styled.div`
  color: ${COLORS.muted};
  font-weight: 900;
  margin-top: 0.25rem;
  line-height: 1.35;
`;

const RewardArena = styled.div`
  border-radius: 22px;
  border: 2px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.22);
  height: 220px;
  position: relative;
  overflow: hidden;
`;

const RewardRing = styled.div`
  position: absolute;
  inset: -120px;
  border-radius: 999px;
  border: 2px dashed rgba(34, 211, 238, 0.22);
  animation: ${rewardSpin} 2.2s linear infinite;
`;

const RewardCenter = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  gap: 0.3rem;
`;

const RewardScore = styled.div`
  font-weight: 1200;
  font-size: 2.1rem;
  letter-spacing: 0.4px;
  text-shadow: 0 12px 30px rgba(0, 0, 0, 0.55);
  color: rgba(255, 255, 255, 0.95);
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
`;

const RewardLabel = styled.div`
  color: ${COLORS.muted};
  font-weight: 950;
`;

const RewardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.9rem;
  flex-wrap: wrap;
`;

const FallingStar = styled.div`
  position: absolute;
  left: ${props => props.$x}%;
  top: -30%;
  font-size: ${props => props.$size}px;
  color: ${props => props.$color};
  opacity: 0;
  animation: ${starFall} ${props => props.$dur}ms linear ${props => props.$delay}ms infinite;
  filter: drop-shadow(0 10px 18px rgba(0,0,0,0.55));
`;

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pickN = (arr, n) => {
  if (arr.length <= n) return arr;
  const idx = shuffle(Array.from({ length: arr.length }, (_, i) => i));
  return idx.slice(0, n).map(i => arr[i]);
};

const PERSONS = [
  { key: 'yo', label: 'yo' },
  { key: 'tu', label: 'tú' },
  { key: 'elElla', label: 'él/ella' },
  { key: 'nosotros', label: 'nosotros/nosotras' },
  { key: 'vosotros', label: 'vosotros/vosotras' },
  { key: 'ellosEllas', label: 'ellos/ellas' },
];

const IMPERATIVE_PERSONS = [
  { key: 'tu', label: 'tú' },
  { key: 'usted', label: 'usted' },
  { key: 'vosotros', label: 'vosotros/vosotras' },
  { key: 'ustedes', label: 'ustedes' },
];

const NO_PERSONAL = [
  { key: 'gerundio', label: 'Gerundio' },
  { key: 'participio', label: 'Participio' },
  { key: 'infinitivoCompuesto', label: 'Infinitivo compuesto' },
  { key: 'gerundioCompuesto', label: 'Gerundio compuesto' },
];

const TENSE_LABELS = {
  indicativo: {
    presente: 'Presente',
    preteritoImperfecto: 'Pretérito imperfecto',
    preteritoPerfectoSimple: 'Pretérito perfecto simple',
    futuroSimple: 'Futuro simple',
    condicionalSimple: 'Condicional simple',
    preteritoPerfectoCompuesto: 'Pretérito perfecto compuesto',
    preteritoPluscuamperfecto: 'Pretérito pluscuamperfecto',
    preteritoAnterior: 'Pretérito anterior',
    futuroCompuesto: 'Futuro compuesto',
    condicionalCompuesto: 'Condicional compuesto',
  },
  subjuntivo: {
    presente: 'Presente',
    preteritoPerfectoCompuesto: 'Pretérito perfecto compuesto',
    preteritoImperfectoRA: 'Pretérito imperfecto (ra)',
    preteritoImperfectoSE: 'Pretérito imperfecto (se)',
    preteritoPluscuamperfectoRA: 'Pretérito pluscuamperfecto (ra)',
    preteritoPluscuamperfectoSE: 'Pretérito pluscuamperfecto (se)',
    futuroSimple: 'Futuro simple',
    futuroCompuesto: 'Futuro compuesto',
  },
  imperativo: {
    imperativo: 'Imperativo',
  },
  noPersonales: {
    noPersonales: 'Formas no personales',
  },
};

const buildItems = (levelData) => {
  const out = [];
  const verbs = levelData?.verbs || {};

  for (const [verb, payload] of Object.entries(verbs)) {
    if (payload.indicativo) {
      for (const [tenseKey, forms] of Object.entries(payload.indicativo)) {
        for (const p of PERSONS) {
          const answer = forms[p.key];
          if (!answer) continue;
          out.push({
            id: `${verb}|indicativo|${tenseKey}|${p.key}`,
            verb,
            moodKey: 'indicativo',
            moodLabel: 'Indicativo',
            tenseKey,
            tenseLabel: TENSE_LABELS.indicativo[tenseKey] || tenseKey,
            personKey: p.key,
            personLabel: p.label,
            answer,
          });
        }
      }
    }

    if (payload.subjuntivo) {
      for (const [tenseKey, forms] of Object.entries(payload.subjuntivo)) {
        for (const p of PERSONS) {
          const answer = forms[p.key];
          if (!answer) continue;
          out.push({
            id: `${verb}|subjuntivo|${tenseKey}|${p.key}`,
            verb,
            moodKey: 'subjuntivo',
            moodLabel: 'Subjuntivo',
            tenseKey,
            tenseLabel: TENSE_LABELS.subjuntivo[tenseKey] || tenseKey,
            personKey: p.key,
            personLabel: p.label,
            answer,
          });
        }
      }
    }

    if (payload.imperativo) {
      for (const p of IMPERATIVE_PERSONS) {
        const answer = payload.imperativo[p.key];
        if (!answer) continue;
        out.push({
          id: `${verb}|imperativo|imperativo|${p.key}`,
          verb,
          moodKey: 'imperativo',
          moodLabel: 'Imperativo',
          tenseKey: 'imperativo',
          tenseLabel: 'Imperativo',
          personKey: p.key,
          personLabel: p.label,
          answer,
        });
      }
    }

    if (payload.noPersonales) {
      for (const f of NO_PERSONAL) {
        const answer = payload.noPersonales[f.key];
        if (!answer) continue;
        out.push({
          id: `${verb}|noPersonales|noPersonales|${f.key}`,
          verb,
          moodKey: 'noPersonales',
          moodLabel: 'Formas no personales',
          tenseKey: 'noPersonales',
          tenseLabel: 'Formas no personales',
          personKey: f.key,
          personLabel: f.label,
          answer,
        });
      }
    }
  }

  return out;
};

const buildPrompt = (item) => {
  if (!item) return null;
  if (item.moodKey === 'noPersonales') {
    return {
      top: `${item.personLabel} de ${item.verb}`,
      middle: null,
      bottom: 'Elige la forma correcta.',
      blankLeft: '',
      blankRight: '',
    };
  }
  if (item.moodKey === 'imperativo') {
    return {
      top: `Imperativo · ${item.personLabel}`,
      middle: `Verbo: ${item.verb}`,
      bottom: 'Elige la forma correcta.',
      blankLeft: '',
      blankRight: '',
    };
  }
  return {
    top: `${item.moodLabel} · ${item.tenseLabel}`,
    middle: `Verbo: ${item.verb}`,
    bottom: `Completa: ${item.personLabel} ____`,
    blankLeft: `${item.personLabel} `,
    blankRight: '',
  };
};

const buildOptions = (item, pool) => {
  const answer = item.answer;
  const candidates = pool
    .filter(x => x.id !== item.id && x.answer !== answer)
    .filter(x => x.moodKey === item.moodKey || Math.random() < 0.35);

  const near = candidates.filter(x => x.verb === item.verb && x.moodKey === item.moodKey);
  const far = candidates.filter(x => x.verb !== item.verb || x.moodKey !== item.moodKey);
  const distractors = pickN([...pickN(near, 8), ...pickN(far, 40)], 3).map(x => x.answer);
  return shuffle([answer, ...distractors]);
};

const RewardOverlay = ({ visible, streak, points, onSkip }) => {
  const [coins, setCoins] = useState(0);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    if (!visible) return;
    const palette = [COLORS.gold, COLORS.cyan, 'rgba(255,255,255,0.9)', 'rgba(34,197,94,0.9)'];
    const n = 22;
    setStars(
      Array.from({ length: n }, (_, i) => ({
        id: i,
        x: Math.round(Math.random() * 1000) / 10,
        size: 14 + Math.floor(Math.random() * 18),
        color: palette[Math.floor(Math.random() * palette.length)],
        dur: 2400 + Math.floor(Math.random() * 1800),
        delay: Math.floor(Math.random() * 900),
      }))
    );
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    setCoins(0);
    let v = 0;
    const iv = setInterval(() => {
      v += 1;
      setCoins(v);
    }, 280);
    const t = setTimeout(() => {
      clearInterval(iv);
    }, 4000);
    return () => {
      clearInterval(iv);
      clearTimeout(t);
    };
  }, [visible]);

  return (
    <RewardOverlayBg $visible={visible} onClick={onSkip}>
      <RewardPanel onClick={(e) => e.stopPropagation()}>
        <RewardGrid>
          <div>
            <RewardTitle>
              <FaCheckCircle color={COLORS.good} /> ¡Perfecto!
            </RewardTitle>
            <RewardSub>
              Abres un portal del tiempo. Mantén la racha para conseguir más energía.
            </RewardSub>
            <RewardActions>
              <SubtleButton onClick={onSkip}>
                <FaBolt /> Continuar
              </SubtleButton>
            </RewardActions>
          </div>
          <RewardArena>
            <RewardRing />
            {stars.map(s => (
              <FallingStar
                key={s.id}
                $x={s.x}
                $size={s.size}
                $color={s.color}
                $dur={s.dur}
                $delay={s.delay}
              >
                <FaStar />
              </FallingStar>
            ))}
            <RewardCenter>
              <RewardScore>
                <FaStar color={COLORS.gold} /> +{coins}
              </RewardScore>
              <RewardLabel>Racha: {streak} · Puntos: {points}</RewardLabel>
            </RewardCenter>
          </RewardArena>
        </RewardGrid>
      </RewardPanel>
    </RewardOverlayBg>
  );
};

const TiemposVerbalesGame = ({ onBack }) => {
  const gameKey = 'tiemposverbales';
  const allItems = useMemo(() => buildItems(TIEMPOS_VERBALES_LEVEL_1), []);
  const itemsById = useMemo(() => {
    const m = new Map();
    for (const it of allItems) m.set(it.id, it);
    return m;
  }, [allItems]);

  const [phase, setPhase] = useState('menu');
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [ranking, setRanking] = useState(() => loadGameRanking(gameKey));
  const bestStreakThisRunRef = useRef(0);

  const [selectedMoods, setSelectedMoods] = useState({
    indicativo: true,
    subjuntivo: true,
    imperativo: true,
    noPersonales: true,
  });

  const [selectedVerbs, setSelectedVerbs] = useState({
    vivir: true,
    comer: true,
    saltar: true,
  });

  const filteredItems = useMemo(() => {
    return allItems.filter(it => selectedMoods[it.moodKey] && selectedVerbs[it.verb]);
  }, [allItems, selectedMoods, selectedVerbs]);

  const [deck, setDeck] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const current = currentId ? itemsById.get(currentId) : null;

  const [options, setOptions] = useState([]);
  const [picked, setPicked] = useState(null);
  const [disabledAnswers, setDisabledAnswers] = useState(() => new Set());
  const [feedback, setFeedback] = useState(null);
  const [rewardVisible, setRewardVisible] = useState(false);
  const rewardTimerRef = useRef(null);

  const resetRound = useCallback(() => {
    setPoints(0);
    setStreak(0);
    setCorrect(0);
    setAttempts(0);
    setPicked(null);
    setFeedback(null);
    setDisabledAnswers(new Set());
    setRewardVisible(false);
    if (rewardTimerRef.current) {
      clearTimeout(rewardTimerRef.current);
      rewardTimerRef.current = null;
    }
  }, []);

  const drawNext = useCallback((nextDeck, pool) => {
    const d = nextDeck.length ? nextDeck : shuffle(pool.map(x => x.id));
    const [id, ...rest] = d;
    const item = itemsById.get(id);
    setDeck(rest);
    setCurrentId(id);
    setPicked(null);
    setFeedback(null);
    setDisabledAnswers(new Set());
    setOptions(buildOptions(item, pool));
  }, [itemsById]);

  const start = useCallback(() => {
    const pool = filteredItems;
    if (!pool.length) return;
    resetRound();
    bestStreakThisRunRef.current = 0;
    setPhase('playing');
    const d = shuffle(pool.map(x => x.id));
    drawNext(d, pool);
  }, [drawNext, filteredItems, resetRound]);

  const restart = useCallback(() => {
    if (phase === 'playing' && (attempts > 0 || points > 0)) {
      setRanking(recordGameRun(gameKey, { score: points, bestStreak: bestStreakThisRunRef.current }));
    }
    setPhase('menu');
    resetRound();
    bestStreakThisRunRef.current = 0;
  }, [attempts, gameKey, phase, points, resetRound]);

  useEffect(() => {
    if (streak > bestStreakThisRunRef.current) bestStreakThisRunRef.current = streak;
    if (streak > (ranking?.bestStreak ?? 0)) {
      setRanking(updateGameBestStreak(gameKey, streak));
    }
  }, [gameKey, ranking?.bestStreak, streak]);

  const skipReward = useCallback(() => {
    if (rewardTimerRef.current) {
      clearTimeout(rewardTimerRef.current);
      rewardTimerRef.current = null;
    }
    setRewardVisible(false);
    drawNext(deck, filteredItems);
  }, [deck, drawNext, filteredItems]);

  useEffect(() => {
    if (!rewardVisible) return;
    rewardTimerRef.current = setTimeout(() => {
      rewardTimerRef.current = null;
      setRewardVisible(false);
      drawNext(deck, filteredItems);
    }, 4000);
    return () => {
      if (rewardTimerRef.current) {
        clearTimeout(rewardTimerRef.current);
        rewardTimerRef.current = null;
      }
    };
  }, [rewardVisible, deck, drawNext, filteredItems]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (!filteredItems.length) {
      setPhase('menu');
      return;
    }
    if (!current || !selectedMoods[current.moodKey] || !selectedVerbs[current.verb]) {
      const d = shuffle(filteredItems.map(x => x.id));
      drawNext(d, filteredItems);
      return;
    }
    setOptions(buildOptions(current, filteredItems));
    setPicked(null);
    setFeedback(null);
    setDisabledAnswers(new Set());
  }, [phase, filteredItems, selectedMoods, selectedVerbs, current, drawNext]);

  const onPick = useCallback((ans) => {
    if (!current || rewardVisible) return;
    if (disabledAnswers.has(ans)) return;
    setAttempts(v => v + 1);
    setPicked(ans);
    if (ans === current.answer) {
      setCorrect(v => v + 1);
      setStreak(prev => {
        const next = prev + 1;
        setPoints(p => p + 10 + Math.min(20, next * 2));
        return next;
      });
      setFeedback({ type: 'ok', text: '¡Correcto! Portal del tiempo activado.' });
      setRewardVisible(true);
      return;
    }
    setStreak(0);
    setFeedback({ type: 'bad', text: `Casi. La respuesta correcta era: ${current.answer}` });
    setDisabledAnswers(prev => {
      const n = new Set(prev);
      n.add(ans);
      return n;
    });
  }, [current, rewardVisible, disabledAnswers]);

  const prompt = useMemo(() => buildPrompt(current), [current]);

  const toggleMood = useCallback((key) => {
    setSelectedMoods(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleVerb = useCallback((key) => {
    setSelectedVerbs(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <Page>
      <RewardOverlay visible={rewardVisible} streak={streak} points={points} onSkip={skipReward} />
      <TopBar>
        <BackButton onClick={onBack}>
          <FaArrowLeft /> Volver
        </BackButton>
        <TitleWrap>
          <FaClock color={COLORS.cyan} />
          <Title>Tiempos Verbales</Title>
        </TitleWrap>
        <div style={{ width: 118 }} />
      </TopBar>

      <Shell>
        <Card>
          <CardTitle>
            <CardH2>Nivel 1</CardH2>
            <Pill>
              <FaStar color={COLORS.gold} /> {filteredItems.length} retos
            </Pill>
          </CardTitle>

          {phase === 'menu' ? (
            <>
              <Prompt>
                <PromptLine>
                  <Badge>
                    <FaBolt /> Misión
                  </Badge>
                  <Small>Completa la forma verbal correcta y encadena rachas.</Small>
                </PromptLine>
                <PromptLine>
                  <Small>Al acertar, se abre un mini “portal” de 4 segundos para motivarte.</Small>
                </PromptLine>
              </Prompt>

              <div style={{ height: 12 }} />
              <Row>
                <Small>Modos:</Small>
                <Toggle $active={selectedMoods.indicativo} onClick={() => toggleMood('indicativo')}>Indicativo</Toggle>
                <Toggle $active={selectedMoods.subjuntivo} onClick={() => toggleMood('subjuntivo')}>Subjuntivo</Toggle>
                <Toggle $active={selectedMoods.imperativo} onClick={() => toggleMood('imperativo')}>Imperativo</Toggle>
                <Toggle $active={selectedMoods.noPersonales} onClick={() => toggleMood('noPersonales')}>No personales</Toggle>
              </Row>

              <div style={{ height: 10 }} />
              <Row>
                <Small>Verbos:</Small>
                <Toggle $active={selectedVerbs.vivir} onClick={() => toggleVerb('vivir')}>vivir</Toggle>
                <Toggle $active={selectedVerbs.comer} onClick={() => toggleVerb('comer')}>comer</Toggle>
                <Toggle $active={selectedVerbs.saltar} onClick={() => toggleVerb('saltar')}>saltar</Toggle>
              </Row>

              <div style={{ height: 16 }} />
              <Row style={{ justifyContent: 'space-between' }}>
                <Hint>
                  Consejo: en imperfecto y pluscuamperfecto de subjuntivo se practican las variantes (ra) y (se) por separado.
                </Hint>
              </Row>
              <div style={{ height: 12 }} />
              <Row style={{ justifyContent: 'flex-end' }}>
                <PrimaryButton onClick={start}>
                  <FaBolt /> Empezar
                </PrimaryButton>
              </Row>
            </>
          ) : (
            <>
              <Prompt>
                <PromptLine>
                  <Badge>{prompt?.top}</Badge>
                </PromptLine>
                {prompt?.middle ? (
                  <PromptLine>
                    <Small>{prompt.middle}</Small>
                  </PromptLine>
                ) : null}
                <PromptLine>
                  <Small>{prompt?.bottom}</Small>
                </PromptLine>
              </Prompt>

              <OptionsGrid>
                {options.map(opt => {
                  const isCorrect = picked && opt === current?.answer;
                  const isWrong = picked === opt && opt !== current?.answer;
                  const isDisabled = rewardVisible || disabledAnswers.has(opt);
                  const state = isCorrect ? 'correct' : isWrong ? 'wrong' : null;
                  return (
                    <OptionButton
                      key={opt}
                      onClick={() => onPick(opt)}
                      $disabled={isDisabled}
                      disabled={isDisabled}
                      $state={state}
                    >
                      {opt}
                    </OptionButton>
                  );
                })}
              </OptionsGrid>

              {feedback ? (
                <Feedback $type={feedback.type}>
                  {feedback.text}
                </Feedback>
              ) : null}
            </>
          )}
        </Card>

        <Card>
          <CardTitle>
            <CardH2>Marcador</CardH2>
            <Pill>
              <FaClock /> Práctica libre
            </Pill>
          </CardTitle>

          <StatGrid>
            <Stat>
              <StatLabel>Puntos</StatLabel>
              <StatValue>
                <FaStar color={COLORS.gold} /> {points}
              </StatValue>
            </Stat>
            <Stat>
              <StatLabel>Racha</StatLabel>
              <StatValue>
                <FaBolt color={COLORS.cyan} /> {streak}
              </StatValue>
            </Stat>
            <Stat>
              <StatLabel>Aciertos</StatLabel>
              <StatValue>
                <FaCheckCircle color={COLORS.good} /> {correct}
              </StatValue>
            </Stat>
            <Stat>
              <StatLabel>Intentos</StatLabel>
              <StatValue>
                {attempts}
              </StatValue>
            </Stat>
          </StatGrid>

          <RankTitle>Ranking</RankTitle>
          <RankLine>Mejor racha (este PC): {ranking.bestStreak}</RankLine>
          <RankList>
            {ranking.top.length ? ranking.top.map((r, idx) => (
              <RankRow key={`${r.at}-${r.score}-${idx}`}>
                <RankLeft>
                  <span>#{idx + 1}</span>
                  <span>{r.score} pts</span>
                </RankLeft>
                <RankMeta>{formatRankDate(r.at)}</RankMeta>
              </RankRow>
            )) : (
              <RankRow>
                <RankLeft>Sin partidas aún</RankLeft>
                <RankMeta />
              </RankRow>
            )}
          </RankList>

          <div style={{ height: 12 }} />
          <Row style={{ justifyContent: 'flex-end' }}>
            <SubtleButton onClick={restart}>
              <FaRedo /> Reiniciar
            </SubtleButton>
          </Row>
        </Card>
      </Shell>
    </Page>
  );
};

export default TiemposVerbalesGame;
