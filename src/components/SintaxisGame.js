import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaCheck, FaLightbulb, FaPlay, FaProjectDiagram, FaRedo, FaTimes } from 'react-icons/fa';
import { sintaxisSentences } from './data/sintaxisSentences';
import { formatRankDate, loadGameRanking, recordGameRun, updateGameBestStreak } from '../utils/rankings';

const COLORS = {
  verb: '#FDE047',
  subject: '#FCA5A5',
  predicate: '#C4B5FD',
  cd: '#93C5FD',
  ci: '#6EE7B7',
  ink: '#0F172A'
};

const GameContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #0EA5E9 0%, #E0F2FE 100%);
  font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.85);
  border: 3px solid rgba(14, 165, 233, 0.9);
  color: rgba(14, 165, 233, 1);
  padding: 0.6rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 800;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transition: transform 0.15s ease, background 0.15s ease;

  &:hover {
    background: white;
    transform: translateY(-1px);
  }
`;

const Title = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: white;
  font-weight: 900;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.25);
  font-size: 1.3rem;
`;

const Hud = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Pill = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.8);
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  font-weight: 900;
  color: ${COLORS.ink};
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  white-space: nowrap;
`;

const Main = styled.main`
  width: 100%;
  max-width: 1250px;
  margin: 0 auto;
  padding: 1.25rem 1rem 2.5rem;
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
`;

const MainGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1rem;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  width: 100%;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 26px;
  padding: 1.5rem;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.18);
  border: 5px solid rgba(14, 165, 233, 0.25);
`;

const SideCard = styled.div`
  width: 100%;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 22px;
  padding: 1.1rem 1.1rem 1.2rem;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.18);
  border: 4px solid rgba(14, 165, 233, 0.2);
`;

const SideTitle = styled.h3`
  margin: 0 0 0.6rem;
  color: ${COLORS.ink};
  font-size: 1.25rem;
`;

const SideLine = styled.div`
  color: rgba(15, 23, 42, 0.78);
  font-weight: 900;
  margin-bottom: 0.75rem;
`;

const RankList = styled.div`
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
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.04);
  border: 2px solid rgba(15, 23, 42, 0.06);
`;

const RankLeft = styled.div`
  display: inline-flex;
  gap: 0.6rem;
  align-items: baseline;
  font-weight: 1000;
  color: ${COLORS.ink};
`;

const RankMeta = styled.div`
  color: rgba(15, 23, 42, 0.6);
  font-weight: 900;
  font-size: 0.95rem;
  white-space: nowrap;
`;

const PanelTitle = styled.h2`
  margin: 0 0 1rem;
  color: ${COLORS.ink};
  font-size: 2rem;
`;

const PanelSubtitle = styled.p`
  margin: 0 0 1.25rem;
  color: rgba(15, 23, 42, 0.75);
  font-weight: 700;
  line-height: 1.35;
`;

const LegendGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  margin: 1rem 0 1.25rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(15, 23, 42, 0.04);
  border-radius: 16px;
  padding: 0.75rem 0.9rem;
  border: 2px solid rgba(15, 23, 42, 0.06);
`;

const Swatch = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 6px;
  background: ${props => props.$bg};
  border: 2px solid rgba(15, 23, 42, 0.15);
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1.25rem;
`;

const Button = styled.button`
  background: ${props => props.$variant === 'primary' ? '#0EA5E9' : 'rgba(15, 23, 42, 0.08)'};
  color: ${props => props.$variant === 'primary' ? 'white' : COLORS.ink};
  border: ${props => props.$variant === 'primary' ? '3px solid rgba(255,255,255,0.7)' : '3px solid rgba(15, 23, 42, 0.12)'};
  padding: 0.9rem 1.2rem;
  border-radius: 18px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 900;
  font-size: 1.05rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.14);
  transition: transform 0.15s ease, filter 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.02);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const PlayLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
`;

const StepBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  background: rgba(14, 165, 233, 0.08);
  padding: 0.9rem 1rem;
  border-radius: 18px;
  border: 2px solid rgba(14, 165, 233, 0.16);
`;

const StepTitle = styled.div`
  font-weight: 900;
  color: ${COLORS.ink};
  font-size: 1.15rem;
`;

const StepHint = styled.div`
  color: rgba(15, 23, 42, 0.75);
  font-weight: 800;
  line-height: 1.25;
`;

const SentenceArea = styled.div`
  background: rgba(15, 23, 42, 0.04);
  border-radius: 20px;
  padding: 1.25rem;
  border: 2px solid rgba(15, 23, 42, 0.06);
`;

const TokensWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.45rem;
  align-items: center;
`;

const TokenButton = styled.button`
  border: 2px solid rgba(15, 23, 42, 0.12);
  background: ${props => props.$bg || 'white'};
  color: ${COLORS.ink};
  border-radius: 14px;
  padding: ${props => props.$punct ? '0.15rem 0.35rem' : '0.35rem 0.55rem'};
  font-weight: 900;
  cursor: ${props => props.$disabled ? 'default' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.7 : 1};
  box-shadow: ${props => props.$disabled ? 'none' : '0 8px 14px rgba(0,0,0,0.08)'};
  transition: transform 0.12s ease, filter 0.12s ease;
  margin-left: ${props => props.$punct ? '-0.35rem' : '0'};

  &:hover {
    ${props => props.$disabled ? '' : 'transform: translateY(-1px); filter: brightness(1.02);'}
  }
`;

const Feedback = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: 18px;
  border: 2px solid ${props => props.$type === 'ok' ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)'};
  background: ${props => props.$type === 'ok' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)'};
  color: ${COLORS.ink};
  font-weight: 800;
  line-height: 1.3;
`;

const MiniActions = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const Toggle = styled.button`
  background: ${props => props.$active ? 'rgba(15, 23, 42, 0.12)' : 'rgba(15, 23, 42, 0.06)'};
  border: 2px solid rgba(15, 23, 42, 0.12);
  color: ${COLORS.ink};
  padding: 0.55rem 0.8rem;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 900;
`;

const getShuffledIndices = (n) => {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const uniqueSorted = (arr) => Array.from(new Set(arr)).sort((a, b) => a - b);
const sameSet = (a, b) => {
  const aa = uniqueSorted(a);
  const bb = uniqueSorted(b);
  if (aa.length !== bb.length) return false;
  for (let i = 0; i < aa.length; i++) {
    if (aa[i] !== bb[i]) return false;
  }
  return true;
};

const isPunctuation = (t) => /^[.,;:!?¡¿]$/.test(t);

const STEP_ORDER = ['verb', 'subject', 'cd', 'ci', 'summary'];

const getStepTitle = (step) => {
  switch (step) {
    case 'verb':
      return { title: 'Paso 1: Encuentra el VERBO', hint: 'Busca la palabra que dice la acción.' };
    case 'subject':
      return { title: 'Paso 2: Busca el SUJETO', hint: '¿Quién hace la acción? Debe concordar con el verbo.' };
    case 'cd':
      return { title: 'Paso 3: Localiza el CD', hint: 'Pregunta al verbo: ¿qué? / ¿a quién? Prueba con LO/LA/LOS/LAS.' };
    case 'ci':
      return { title: 'Paso 4: Localiza el CI', hint: '¿A quién? / ¿para quién? Prueba con LE/LES. Suele ir con A/PARA.' };
    case 'summary':
      return { title: 'Resumen', hint: 'Sujeto + Predicado + Complementos.' };
    default:
      return { title: '', hint: '' };
  }
};

const getPredicateIndices = (tokens, subjectIdx) => {
  const subjSet = new Set(subjectIdx);
  const out = [];
  for (let i = 0; i < tokens.length; i++) {
    if (isPunctuation(tokens[i])) continue;
    if (!subjSet.has(i)) out.push(i);
  }
  return out;
};

const SintaxisGame = ({ onBack }) => {
  const gameKey = 'sintaxis';
  const order = useMemo(() => getShuffledIndices(sintaxisSentences.length), []);
  const [phase, setPhase] = useState('menu');
  const [round, setRound] = useState(0);
  const [step, setStep] = useState('verb');
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [ranking, setRanking] = useState(() => loadGameRanking(gameKey));
  const bestStreakThisRunRef = useRef(0);
  const runRecordedRef = useRef(false);
  const [mistakesThisSentence, setMistakesThisSentence] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selections, setSelections] = useState({ verb: [], subject: [], cd: [], ci: [] });
  const [noneFlags, setNoneFlags] = useState({ cd: false, ci: false });
  const [showTip, setShowTip] = useState(false);

  const sentence = useMemo(() => {
    if (round >= order.length) return null;
    return sintaxisSentences[order[round]];
  }, [order, round]);

  const resetSentenceState = useCallback(() => {
    setStep('verb');
    setMistakesThisSentence(0);
    setFeedback(null);
    setSelections({ verb: [], subject: [], cd: [], ci: [] });
    setNoneFlags({ cd: false, ci: false });
    setShowTip(false);
  }, []);

  const start = useCallback(() => {
    setPhase('playing');
    setRound(0);
    setPoints(0);
    setStreak(0);
    bestStreakThisRunRef.current = 0;
    runRecordedRef.current = false;
    resetSentenceState();
  }, [resetSentenceState]);

  const restart = useCallback(() => {
    setPhase('menu');
    setRound(0);
    setPoints(0);
    setStreak(0);
    bestStreakThisRunRef.current = 0;
    runRecordedRef.current = false;
    resetSentenceState();
  }, [resetSentenceState]);

  const toggleToken = useCallback((idx) => {
    if (!sentence) return;
    const token = sentence.tokens[idx];
    if (isPunctuation(token)) return;
    if (step === 'summary') return;
    if (step === 'cd' && noneFlags.cd) return;
    if (step === 'ci' && noneFlags.ci) return;
    if (!['verb', 'subject', 'cd', 'ci'].includes(step)) return;

    setSelections(prev => {
      const existing = prev[step];
      const has = existing.includes(idx);
      const next = has ? existing.filter(i => i !== idx) : [...existing, idx];
      return { ...prev, [step]: next };
    });
  }, [noneFlags.cd, noneFlags.ci, sentence, step]);

  const setNoComplement = useCallback((key) => {
    setNoneFlags(prev => {
      const next = { ...prev, [key]: !prev[key] };
      return next;
    });
    setSelections(prev => ({ ...prev, [key]: [] }));
  }, []);

  const checkStep = useCallback(() => {
    if (!sentence) return;

    const expected = sentence[step] || [];
    const selected = selections[step] || [];
    let ok = false;

    if (step === 'cd') {
      if (sentence.cd.length === 0) ok = noneFlags.cd && selected.length === 0;
      else ok = !noneFlags.cd && sameSet(selected, sentence.cd);
    } else if (step === 'ci') {
      if (sentence.ci.length === 0) ok = noneFlags.ci && selected.length === 0;
      else ok = !noneFlags.ci && sameSet(selected, sentence.ci);
    } else if (step === 'verb' || step === 'subject') {
      ok = sameSet(selected, expected);
    } else {
      ok = true;
    }

    if (ok) {
      setFeedback({ type: 'ok', message: '¡Bien! Sigue con el siguiente paso.' });
      setPoints(p => p + 10);
      setShowTip(false);

      const nextIndex = STEP_ORDER.indexOf(step) + 1;
      const nextStep = STEP_ORDER[nextIndex] || 'summary';
      if (nextStep === 'summary') {
        const nextStreak = mistakesThisSentence === 0 ? streak + 1 : 0;
        const bonus = mistakesThisSentence === 0 ? Math.min(40, nextStreak * 5) : 0;
        setPoints(p => p + 20 + bonus);
        setStreak(nextStreak);
      }
      setStep(nextStep);
      setFeedback(prev => nextStep === 'summary' ? { type: 'ok', message: mistakesThisSentence === 0 ? '¡Frase perfecta! Bonus por racha.' : '¡Frase completada!' } : prev);
    } else {
      setMistakesThisSentence(m => m + 1);
      setStreak(0);
      setPoints(p => Math.max(0, p - 2));
      setFeedback({ type: 'bad', message: 'No encaja. Revisa el truco del paso y vuelve a intentarlo.' });
    }
  }, [mistakesThisSentence, noneFlags.cd, noneFlags.ci, selections, sentence, step, streak]);

  const nextSentence = useCallback(() => {
    const nextRound = round + 1;
    if (nextRound >= order.length) {
      setPhase('finished');
      return;
    }
    setRound(nextRound);
    resetSentenceState();
  }, [order.length, resetSentenceState, round]);

  useEffect(() => {
    if (streak > bestStreakThisRunRef.current) bestStreakThisRunRef.current = streak;
    if (streak > (ranking?.bestStreak ?? 0)) {
      setRanking(updateGameBestStreak(gameKey, streak));
    }
  }, [gameKey, ranking?.bestStreak, streak]);

  useEffect(() => {
    if (phase !== 'finished') return;
    if (runRecordedRef.current) return;
    runRecordedRef.current = true;
    setRanking(recordGameRun(gameKey, { score: points, bestStreak: bestStreakThisRunRef.current }));
  }, [gameKey, phase, points]);

  const reveal = useCallback(() => {
    if (!sentence) return;
    if (!['verb', 'subject', 'cd', 'ci'].includes(step)) return;
    if (step === 'cd' && sentence.cd.length === 0) setNoneFlags(prev => ({ ...prev, cd: true }));
    if (step === 'ci' && sentence.ci.length === 0) setNoneFlags(prev => ({ ...prev, ci: true }));
    setSelections(prev => ({ ...prev, [step]: sentence[step] }));
    setFeedback({ type: 'ok', message: 'Solución marcada. Intenta entender por qué.' });
  }, [sentence, step]);

  const getTokenBg = useCallback((idx) => {
    if (!sentence) return 'white';
    const token = sentence.tokens[idx];
    if (isPunctuation(token)) return 'transparent';

    const selectedColor = () => {
      if (step === 'verb' && selections.verb.includes(idx)) return COLORS.verb;
      if (step === 'subject' && selections.subject.includes(idx)) return COLORS.subject;
      if (step === 'cd' && selections.cd.includes(idx)) return COLORS.cd;
      if (step === 'ci' && selections.ci.includes(idx)) return COLORS.ci;
      return 'white';
    };

    if (step !== 'summary') return selectedColor();

    const verbSet = new Set(sentence.verb);
    const subjSet = new Set(sentence.subject);
    const cdSet = new Set(sentence.cd);
    const ciSet = new Set(sentence.ci);
    const predicateSet = new Set(getPredicateIndices(sentence.tokens, sentence.subject));

    if (verbSet.has(idx)) return COLORS.verb;
    if (subjSet.has(idx)) return COLORS.subject;
    if (cdSet.has(idx)) return COLORS.cd;
    if (ciSet.has(idx)) return COLORS.ci;
    if (predicateSet.has(idx)) return 'rgba(196, 181, 253, 0.55)';
    return 'white';
  }, [sentence, selections.cd, selections.ci, selections.subject, selections.verb, step]);

  const disabledToken = useCallback((idx) => {
    if (!sentence) return true;
    if (step === 'summary') return true;
    const t = sentence.tokens[idx];
    if (isPunctuation(t)) return true;
    if (step === 'cd' && noneFlags.cd) return true;
    if (step === 'ci' && noneFlags.ci) return true;
    return false;
  }, [noneFlags.cd, noneFlags.ci, sentence, step]);

  const stepInfo = getStepTitle(step);

  return (
    <GameContainer>
      <Header>
        <BackButton onClick={onBack}>
          <FaArrowLeft /> Volver
        </BackButton>
        <Title>
          <FaProjectDiagram /> Sintaxis
        </Title>
        <Hud>
          <Pill>Puntos: {points}</Pill>
          <Pill>Racha: {streak}</Pill>
        </Hud>
      </Header>

      <Main>
        <MainGrid>
          <div>
            {phase === 'menu' && (
              <Panel>
                <PanelTitle>Detective Sintáctico</PanelTitle>
                <PanelSubtitle>
                  Analiza oraciones encontrando VERBO, SUJETO, PREDICADO y los complementos (CD y CI).
                  Hay {sintaxisSentences.length} frases distintas para que no se repitan.
                </PanelSubtitle>

                <LegendGrid>
                  <LegendItem><Swatch $bg={COLORS.verb} /> VERBO (núcleo del predicado)</LegendItem>
                  <LegendItem><Swatch $bg={COLORS.subject} /> SUJETO (quién hace la acción)</LegendItem>
                  <LegendItem><Swatch $bg={COLORS.predicate} /> PREDICADO (lo que se dice del sujeto)</LegendItem>
                  <LegendItem><Swatch $bg={COLORS.cd} /> CD (¿qué? / ¿a quién? → LO/LA/LOS/LAS)</LegendItem>
                  <LegendItem><Swatch $bg={COLORS.ci} /> CI (¿a quién? / ¿para quién? → LE/LES)</LegendItem>
                </LegendGrid>

                <Actions>
                  <Button $variant="primary" onClick={start}>
                    <FaPlay /> Empezar
                  </Button>
                  <Button onClick={() => setShowTip(s => !s)}>
                    <FaLightbulb /> Recordatorio
                  </Button>
                </Actions>

                {showTip && (
                  <Feedback $type="ok" style={{ marginTop: '1rem' }}>
                    <FaLightbulb />
                    <div>
                      Primero busca el VERBO, luego el SUJETO, y todo lo demás es el PREDICADO. Para CD pregunta ¿qué? y prueba con LO/LA. Para CI pregunta ¿a quién? y prueba con LE/LES.
                    </div>
                  </Feedback>
                )}
              </Panel>
            )}

            {phase === 'playing' && sentence && (
              <Panel>
                <PlayLayout>
                  <StepBar>
                    <div>
                      <StepTitle>{stepInfo.title}</StepTitle>
                      <StepHint>{stepInfo.hint}</StepHint>
                    </div>
                    <MiniActions>
                      {(step === 'cd' || step === 'ci') && (
                        <Toggle
                          $active={noneFlags[step]}
                          onClick={() => setNoComplement(step)}
                        >
                          {noneFlags[step] ? 'Marcado: no hay' : 'No hay'}
                        </Toggle>
                      )}
                      <Button onClick={() => setShowTip(s => !s)}>
                        <FaLightbulb /> Pista
                      </Button>
                      <Button $variant="primary" onClick={checkStep} disabled={step === 'summary'}>
                        <FaCheck /> Comprobar
                      </Button>
                    </MiniActions>
                  </StepBar>

                  {showTip && (
                    <Feedback $type="ok">
                      <FaLightbulb />
                      <div>
                        {step === 'verb' && 'El verbo suele ser una palabra que cambia (leo/lees/lee). Es el núcleo del predicado.'}
                        {step === 'subject' && 'El sujeto responde a “¿quién?” y concuerda con el verbo (número y persona).'}
                        {step === 'cd' && 'Si puedes decir “LO/LA/LOS/LAS” (lo veo / la leo), seguramente es CD.'}
                        {step === 'ci' && 'Si puedes decir “LE/LES” (le doy / les cuento), seguramente es CI. Suele ir con A o PARA.'}
                        {step === 'summary' && 'El predicado es todo lo que no es sujeto (normalmente incluye el verbo y sus complementos).'}
                      </div>
                    </Feedback>
                  )}

                  <SentenceArea>
                    <TokensWrap>
                      {sentence.tokens.map((t, i) => (
                        <TokenButton
                          key={`${sentence.id}-${i}-${t}`}
                          type="button"
                          $punct={isPunctuation(t)}
                          $bg={getTokenBg(i)}
                          $disabled={disabledToken(i)}
                          onClick={() => {
                            if (!disabledToken(i)) toggleToken(i);
                          }}
                        >
                          {t}
                        </TokenButton>
                      ))}
                    </TokensWrap>
                  </SentenceArea>

                  {feedback && (
                    <Feedback $type={feedback.type}>
                      {feedback.type === 'ok' ? <FaCheck /> : <FaTimes />}
                      <div>{feedback.message}</div>
                      <div style={{ marginLeft: 'auto' }} />
                      {feedback.type === 'bad' && mistakesThisSentence >= 2 && (
                        <Button onClick={reveal}>
                          <FaLightbulb /> Ver solución
                        </Button>
                      )}
                    </Feedback>
                  )}

                  {step === 'summary' && (
                    <>
                      <LegendGrid>
                        <LegendItem><Swatch $bg={COLORS.subject} /> Sujeto</LegendItem>
                        <LegendItem><Swatch $bg={COLORS.predicate} /> Predicado</LegendItem>
                        <LegendItem><Swatch $bg={COLORS.verb} /> Verbo</LegendItem>
                        <LegendItem><Swatch $bg={COLORS.cd} /> CD</LegendItem>
                        <LegendItem><Swatch $bg={COLORS.ci} /> CI</LegendItem>
                      </LegendGrid>
                      <Actions>
                        <Button $variant="primary" onClick={nextSentence}>
                          <FaPlay /> Siguiente frase
                        </Button>
                      </Actions>
                    </>
                  )}
                </PlayLayout>
              </Panel>
            )}

            {phase === 'finished' && (
              <Panel>
                <PanelTitle>¡Fin del reto!</PanelTitle>
                <PanelSubtitle>
                  Has completado {sintaxisSentences.length} oraciones distintas. Puntuación final: {points}.
                </PanelSubtitle>
                <Actions>
                  <Button $variant="primary" onClick={start}>
                    <FaRedo /> Jugar otra vez
                  </Button>
                  <Button onClick={restart}>
                    <FaProjectDiagram /> Menú
                  </Button>
                </Actions>
              </Panel>
            )}
          </div>

          <SideCard>
            <SideTitle>Ranking</SideTitle>
            <SideLine>Mejor racha (este PC): {ranking.bestStreak}</SideLine>
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
          </SideCard>
        </MainGrid>
      </Main>
    </GameContainer>
  );
};

export default SintaxisGame;
