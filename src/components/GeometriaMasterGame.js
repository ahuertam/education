import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaTrophy } from 'react-icons/fa';
import FlappyBonusLevel from './FlappyBonusLevel';
import { buildGeometriaMasterChannel1 } from './data/geometriaMasterChannel1';
import { formatRankDate, loadGameRanking, recordGameRun, updateGameBestStreak } from '../utils/rankings';

const GameContainer = styled.div`
  min-height: 100vh;
  background: radial-gradient(circle at 20% 10%, #e7f5ff 0%, #d0ebff 40%, #b197fc 100%);
  position: relative;
  overflow: hidden;
  color: #0b1b2b;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 5;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

const HeaderInner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Button = styled.button`
  background: rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #0b1b2b;
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;

  &:active {
    transform: scale(0.98);
  }
`;

const Stats = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const Pill = styled.div`
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 8px 12px;
  border-radius: 999px;
  font-weight: 900;
`;

const Content = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 18px 16px 40px 16px;
`;

const Panel = styled.div`
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.12);
`;

const Title = styled.h1`
  margin: 0 0 8px 0;
  font-size: 2rem;
`;

const SubTitle = styled.p`
  margin: 0;
  opacity: 0.9;
  line-height: 1.35;
`;

const TwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-top: 14px;

  @media (min-width: 920px) {
    grid-template-columns: 1.15fr 0.85fr;
  }
`;

const ExerciseCard = styled(Panel)`
  padding: 18px;
`;

const ExerciseTitle = styled.h2`
  margin: 0 0 10px 0;
  font-size: 1.3rem;
`;

const Prompt = styled.p`
  margin: 0 0 14px 0;
  font-size: 1.05rem;
  line-height: 1.35;
`;

const AnswerRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const Input = styled.input`
  flex: 1;
  min-width: 220px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.18);
  font-size: 1.05rem;
`;

const UnitTag = styled.div`
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: rgba(0, 0, 0, 0.04);
  font-weight: 900;
  white-space: nowrap;
`;

const PrimaryButton = styled(Button)`
  background: #4dabf7;
  border-color: rgba(0, 0, 0, 0.12);
  color: #04223a;
`;

const SecondaryButton = styled(Button)`
  background: rgba(0, 0, 0, 0.06);
`;

const Feedback = styled.div`
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: ${p => (p.$type === 'ok' ? 'rgba(46, 204, 113, 0.18)' : 'rgba(231, 76, 60, 0.16)')};
`;

const Choices = styled.div`
  display: grid;
  gap: 10px;
`;

const ChoiceButton = styled.button`
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 14px;
  padding: 12px 14px;
  cursor: pointer;
  text-align: left;
  font-weight: 900;
  color: #0b1b2b;
  outline: none;

  &[data-selected='true'] {
    background: rgba(77, 171, 247, 0.22);
    border-color: rgba(77, 171, 247, 0.65);
  }

  &:active {
    transform: scale(0.99);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  box-sizing: border-box;
`;

const OverlayPanel = styled(Panel)`
  width: min(980px, 96vw);
`;

const RankingBox = styled(Panel)`
  padding: 16px;
`;

const RankingTitle = styled.h3`
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RankList = styled.div`
  display: grid;
  gap: 8px;
`;

const RankRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.04);
`;

const RankScore = styled.div`
  font-weight: 900;
`;

const RankDate = styled.div`
  opacity: 0.75;
  font-size: 0.92rem;
`;

function buildNumberMaskVariants(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return [];
  const variants = new Set();
  const add = (s) => {
    if (!s) return;
    variants.add(s);
    variants.add(s.replace('.', ','));
  };
  add(String(v));
  add(String(Math.round(v)));
  add(v.toFixed(1));
  add(v.toFixed(2));
  add(v.toFixed(3));
  return Array.from(variants).sort((a, b) => b.length - a.length);
}

function maskAnswerInText(text, answer, unit) {
  if (!text) return '';
  let out = String(text);
  const variants = buildNumberMaskVariants(answer);
  for (const v of variants) out = out.split(v).join('▢▢▢');
  if (unit) out = out.split(String(unit)).join(String(unit));
  return out;
}

function getResultText(ex) {
  if (!ex) return '';
  if (ex.kind === 'number') return `${ex.answer}${ex.unit ? ` ${ex.unit}` : ''}`;
  if (ex.kind === 'choice') return Array.isArray(ex.options) ? String(ex.options[ex.correctIndex] ?? '') : '';
  return '';
}

function normalizeNumberInput(raw) {
  if (typeof raw !== 'string') return '';
  const cleaned = raw.replace(/\s+/g, '').replace(',', '.');
  const m = cleaned.match(/[-+]?\d+(?:\.\d+)?/);
  return m ? m[0] : '';
}

function isCorrectNumber(value, answer, tol) {
  const v = Number(value);
  if (!Number.isFinite(v)) return false;
  const t = Number.isFinite(tol) ? tol : 0;
  const effectiveTol = t === 0 ? 0.0001 : t;
  return Math.abs(v - answer) <= effectiveTol;
}

const GeometriaMasterGame = ({ onBack }) => {
  const gameKey = 'geometriaMaster';
  const [runSeed, setRunSeed] = useState(() => `${Date.now()}-${Math.random()}`);
  const exercises = useMemo(() => buildGeometriaMasterChannel1(runSeed, { count: 24 }), [runSeed]);

  const [phase, setPhase] = useState('menu');
  const [idx, setIdx] = useState(0);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [input, setInput] = useState('');
  const [choiceIdx, setChoiceIdx] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [ranking, setRanking] = useState(() => loadGameRanking(gameKey));
  const bestStreakThisRunRef = useRef(0);
  const runRecordedRef = useRef(false);
  const revealPenaltyRef = useRef(new Set());
  const [bonusMeta, setBonusMeta] = useState(null);
  const [lastBaseAward, setLastBaseAward] = useState(0);

  const ex = exercises[idx] || null;

  const resetRun = useCallback(() => {
    setRunSeed(`${Date.now()}-${Math.random()}`);
    setPhase('question');
    setIdx(0);
    setPoints(0);
    setStreak(0);
    setLives(3);
    setInput('');
    setChoiceIdx(null);
    setFeedback(null);
    setWrongAttempts(0);
    setBonusMeta(null);
    setLastBaseAward(0);
    bestStreakThisRunRef.current = 0;
    runRecordedRef.current = false;
    revealPenaltyRef.current = new Set();
  }, [setRunSeed]);

  useEffect(() => {
    if (streak > bestStreakThisRunRef.current) bestStreakThisRunRef.current = streak;
    if (streak > ranking.bestStreak) {
      const updated = updateGameBestStreak(gameKey, streak);
      setRanking(updated);
    }
  }, [gameKey, ranking.bestStreak, streak]);

  useEffect(() => {
    if (phase !== 'finished') return;
    if (runRecordedRef.current) return;
    runRecordedRef.current = true;
    const updated = recordGameRun(gameKey, { score: points, bestStreak: bestStreakThisRunRef.current });
    setRanking(updated);
  }, [gameKey, phase, points]);

  const computeBaseAward = useCallback(() => {
    const base = 100;
    const streakBonus = Math.min(60, streak * 10);
    const penalty = wrongAttempts * 15;
    return Math.max(20, base + streakBonus - penalty);
  }, [streak, wrongAttempts]);

  const submit = useCallback(() => {
    if (!ex) return;

    let ok = false;
    const rawNumber = ex.kind === 'number' ? normalizeNumberInput(input) : null;
    const numValue = rawNumber != null ? Number(rawNumber) : null;
    if (ex.kind === 'number') {
      ok = isCorrectNumber(rawNumber, ex.answer, ex.tolerance);
    } else if (ex.kind === 'choice') {
      ok = Number.isInteger(choiceIdx) && choiceIdx === ex.correctIndex;
    }

    if (!ok) {
      const resultText = getResultText(ex);
      const explanationMasked = ex.kind === 'number'
        ? maskAnswerInText(ex.explanation, ex.answer, ex.unit)
        : (ex.explanation ? String(ex.explanation).split(resultText).join('▢▢▢') : '');

      let hint = null;
      if (ex.kind === 'number' && Number.isFinite(numValue) && ex?.meta?.topic) {
        const a = Number(ex.answer);
        const tol = Number.isFinite(ex.tolerance) ? ex.tolerance : 0;
        const near = (x, y, extra = 1) => Math.abs(x - y) <= Math.max(0.0001, tol * extra);

        if (ex.meta.topic === 'circle' && ex.meta.subtype === 'area') {
          if (ex.meta.given === 'diameter' && near(numValue, a * 4, 4)) {
            hint = 'Parece que has usado el diámetro como si fuera el radio. Primero r = d/2 y luego A = π·r².';
          }
        }

        if (ex.meta.topic === 'circle' && ex.meta.subtype === 'circumference') {
          if (ex.meta.given === 'radius' && near(numValue, a / 2, 1)) {
            hint = 'Te falta el “2”: con radio se usa L = 2·π·r.';
          }
          if (ex.meta.given === 'diameter' && near(numValue, a * 2, 2)) {
            hint = 'Con diámetro se usa L = π·d (no 2·π·d).';
          }
        }

        if (ex.meta.topic === 'triangle' && ex.meta.subtype === 'area') {
          if (near(numValue, a * 2, 2)) {
            hint = 'Has calculado base·altura pero falta dividir entre 2: A = (b·h)/2.';
          }
        }

        if (ex.meta.topic === 'parallelogram' && ex.meta.subtype === 'area') {
          if (near(numValue, a / 2, 1)) {
            hint = 'En romboide no se divide entre 2: A = base·altura.';
          }
        }

        if (ex.meta.topic === 'annulus' && ex.meta.subtype === 'area') {
          const R = Number(ex.meta.R);
          const r = Number(ex.meta.r);
          if (Number.isFinite(R) && Number.isFinite(r)) {
            const outer = Math.round(3.14 * R * R * 100) / 100;
            const inner = Math.round(3.14 * r * r * 100) / 100;
            if (near(numValue, outer, 3)) {
              hint = 'Has calculado el círculo exterior pero falta restar el interior: A = π·R² − π·r².';
            } else if (near(numValue, inner, 3)) {
              hint = 'Has calculado el círculo interior. En una corona circular debes hacer círculo grande menos círculo pequeño.';
            }
          }
        }

        if (ex.meta.topic === 'composite' && ex.meta.subtype === 'subtractRectangles') {
          hint = 'Recuerda: área libre = área total − áreas ocupadas.';
        }
      }

      setFeedback({
        type: 'bad',
        message: ex.kind === 'choice'
          ? 'No es correcto. Revisa el planteamiento y vuelve a intentarlo.'
          : (hint || 'No coincide. Comprueba fórmula, unidades y el valor de π (3,14).'),
        concept: ex.concept,
        explanation: explanationMasked,
        resultText,
        exerciseId: ex.id,
        revealed: false,
      });
      setStreak(0);
      setWrongAttempts(a => a + 1);
      setLives(v => {
        const next = v - 1;
        if (next <= 0) setPhase('finished');
        return next;
      });
      return;
    }

    const baseAward = computeBaseAward();
    setLastBaseAward(baseAward);
    setPoints(p => p + baseAward);
    setFeedback({ type: 'ok', message: `¡Correcto! +${baseAward} puntos. Ahora, nivel bonus.`, explanation: ex.explanation });
    setStreak(s => s + 1);
    setBonusMeta(null);
    setPhase('flappy');
  }, [choiceIdx, computeBaseAward, ex, input]);

  const revealResult = useCallback(() => {
    setFeedback(prev => {
      if (!prev || prev.type !== 'bad') return prev;
      if (prev.revealed) return prev;
      return { ...prev, revealed: true };
    });
    setPoints(p => {
      const exId = feedback?.exerciseId;
      if (!exId) return p;
      if (revealPenaltyRef.current.has(exId)) return p;
      revealPenaltyRef.current.add(exId);
      return Math.max(0, p - 25);
    });
  }, [feedback?.exerciseId]);

  const continueAfterBonus = useCallback(() => {
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    setInput('');
    setChoiceIdx(null);
    setFeedback(null);
    setWrongAttempts(0);
    setBonusMeta(null);
    setLastBaseAward(0);
    if (nextIdx >= exercises.length) {
      setPhase('finished');
    } else {
      setPhase('question');
    }
  }, [exercises.length, idx]);

  const handleBonusFinish = useCallback((meta) => {
    setBonusMeta(meta);
    if (meta?.bonus) setPoints(p => p + meta.bonus);
    setPhase('between');
  }, []);

  const handleSkipBonus = useCallback(() => {
    setBonusMeta({ score: 0, completed: false, bonus: 0, skipped: true });
    setPhase('between');
  }, []);

  const progressText = ex ? `${idx + 1}/${exercises.length}` : `0/${exercises.length}`;

  return (
    <GameContainer>
      <Header>
        <HeaderInner>
          <Button type="button" onClick={onBack}>
            <FaArrowLeft /> Volver
          </Button>
          <Stats>
            <Pill>Canal 1</Pill>
            <Pill>Ejercicio {progressText}</Pill>
            <Pill>Puntos: {points}</Pill>
            <Pill>Racha: {streak}</Pill>
            <Pill>Vidas: {lives}</Pill>
          </Stats>
        </HeaderInner>
      </Header>

      <Content>
        {phase === 'menu' && (
          <Panel>
            <Title>Geometría Master</Title>
            <SubTitle>
              Resuelve ejercicios del Canal 1 (áreas, perímetros y circunferencias). Cada acierto desbloquea un nivel bonus tipo Flappy para sumar puntos extra.
            </SubTitle>
            <TwoCols>
              <Panel>
                <SubTitle>
                  Reglas rápidas:
                </SubTitle>
                <SubTitle>
                  - Respuesta numérica: acepta coma o punto decimal.
                </SubTitle>
                <SubTitle>
                  - En ejercicios de circunferencia/círculo: usa π = 3,14 cuando lo indique.
                </SubTitle>
                <SubTitle>
                  - Fallar resta 1 vida. Con 0 vidas, termina la partida.
                </SubTitle>
                <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <PrimaryButton type="button" onClick={resetRun}>Empezar</PrimaryButton>
                  <SecondaryButton type="button" onClick={() => { setRanking(loadGameRanking(gameKey)); }}>Actualizar ranking</SecondaryButton>
                </div>
              </Panel>
              <RankingBox>
                <RankingTitle><FaTrophy /> Ranking</RankingTitle>
                <SubTitle>Mejor racha histórica: {ranking.bestStreak}</SubTitle>
                <div style={{ height: 10 }} />
                <RankList>
                  {(ranking.top || []).length === 0 && (
                    <RankRow>
                      <RankScore>Aún no hay partidas registradas</RankScore>
                      <RankDate />
                    </RankRow>
                  )}
                  {(ranking.top || []).map((r, i) => (
                    <RankRow key={`${r.at}-${i}`}>
                      <RankScore>#{i + 1} — {r.score} pts</RankScore>
                      <RankDate>{formatRankDate(r.at)}</RankDate>
                    </RankRow>
                  ))}
                </RankList>
              </RankingBox>
            </TwoCols>
          </Panel>
        )}

        {phase === 'question' && ex && (
          <ExerciseCard>
            <ExerciseTitle>Canal 1 · Ejercicio {idx + 1}</ExerciseTitle>
            <Prompt>{ex.prompt}</Prompt>

            {ex.kind === 'number' ? (
              <>
                <AnswerRow>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe solo el número"
                    inputMode="decimal"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submit();
                    }}
                  />
                  {ex.unit && <UnitTag>{ex.unit}</UnitTag>}
                  <PrimaryButton type="button" onClick={submit}>Comprobar</PrimaryButton>
                </AnswerRow>
                {ex.unit && <SubTitle style={{ marginTop: 10 }}>Unidad: {ex.unit} (no hace falta escribirla)</SubTitle>}
              </>
            ) : (
              <>
                <Choices>
                  {ex.options.map((opt, i) => (
                    <ChoiceButton
                      key={`${ex.id}-${i}`}
                      type="button"
                      data-selected={choiceIdx === i}
                      onClick={() => setChoiceIdx(i)}
                    >
                      {opt}
                    </ChoiceButton>
                  ))}
                </Choices>
                <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <PrimaryButton type="button" onClick={submit}>Comprobar</PrimaryButton>
                </div>
              </>
            )}

            {feedback && (
              <Feedback $type={feedback.type}>
                <div style={{ fontWeight: 900 }}>{feedback.message}</div>
                {feedback.type === 'bad' && feedback.concept && (
                  <div style={{ marginTop: 8, opacity: 0.95 }}>
                    <span style={{ fontWeight: 900 }}>Concepto clave:</span> {feedback.concept}
                  </div>
                )}
                {feedback.explanation && <div style={{ marginTop: 6, opacity: 0.9 }}>{feedback.explanation}</div>}
                {feedback.type === 'bad' && feedback.resultText && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {!feedback.revealed ? (
                      <>
                        <SecondaryButton type="button" onClick={revealResult}>Revelar resultado (-25 pts)</SecondaryButton>
                      </>
                    ) : (
                      <div style={{ fontWeight: 900 }}>Resultado: {feedback.resultText}</div>
                    )}
                  </div>
                )}
              </Feedback>
            )}
          </ExerciseCard>
        )}

        {phase === 'finished' && (
          <Panel>
            <Title>Partida terminada</Title>
            <SubTitle>Puntos: {points} · Mejor racha de esta partida: {bestStreakThisRunRef.current}</SubTitle>
            <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <PrimaryButton type="button" onClick={resetRun}>Jugar otra vez</PrimaryButton>
              <SecondaryButton type="button" onClick={onBack}>Volver</SecondaryButton>
            </div>
            <div style={{ height: 16 }} />
            <RankingBox>
              <RankingTitle><FaTrophy /> Ranking</RankingTitle>
              <SubTitle>Mejor racha histórica: {ranking.bestStreak}</SubTitle>
              <div style={{ height: 10 }} />
              <RankList>
                {(ranking.top || []).length === 0 && (
                  <RankRow>
                    <RankScore>Aún no hay partidas registradas</RankScore>
                    <RankDate />
                  </RankRow>
                )}
                {(ranking.top || []).map((r, i) => (
                  <RankRow key={`${r.at}-${i}`}>
                    <RankScore>#{i + 1} — {r.score} pts</RankScore>
                    <RankDate>{formatRankDate(r.at)}</RankDate>
                  </RankRow>
                ))}
              </RankList>
            </RankingBox>
          </Panel>
        )}
      </Content>

      {phase === 'flappy' && (
        <Overlay>
          <OverlayPanel>
            <FlappyBonusLevel onFinish={handleBonusFinish} onSkip={handleSkipBonus} />
          </OverlayPanel>
        </Overlay>
      )}

      {phase === 'between' && (
        <Overlay>
          <OverlayPanel>
            <Title>Resultado del bonus</Title>
            <SubTitle>
              Puntos del ejercicio: +{lastBaseAward}{bonusMeta?.bonus ? ` · Bonus: +${bonusMeta.bonus}` : ''}{bonusMeta?.completed ? ' · ¡Nivel completado!' : ''}{bonusMeta?.skipped ? ' · Bonus saltado' : ''}
            </SubTitle>
            <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <PrimaryButton type="button" onClick={continueAfterBonus}>Siguiente</PrimaryButton>
              <SecondaryButton type="button" onClick={() => setPhase('finished')}>Terminar</SecondaryButton>
            </div>
          </OverlayPanel>
        </Overlay>
      )}
    </GameContainer>
  );
};

export default GeometriaMasterGame;
