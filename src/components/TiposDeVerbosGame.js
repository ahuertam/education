import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaArrowLeft, FaRedo } from 'react-icons/fa';
import { verbTypeLabels, verbTypeRules, verbTypesQuestions } from './data/verbTypesQuestions';

const floatIn = keyframes`
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const GameContainer = styled.div`
  min-height: 100vh;
  background: radial-gradient(circle at 20% 10%, rgba(255,255,255,0.18), transparent 40%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.14), transparent 45%),
              linear-gradient(180deg, #0B1220 0%, #1F2A44 50%, #0B1220 100%);
  color: #ffffff;
  padding: 2rem;
  box-sizing: border-box;
`;

const Header = styled.header`
  max-width: 1000px;
  margin: 0 auto 1.5rem auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1rem;
  transition: transform 0.15s ease, background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.22);
    transform: translateY(-1px);
  }
`;

const HeaderStats = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const StatPill = styled.div`
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  font-weight: 700;
  letter-spacing: 0.2px;
`;

const Layout = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1.25rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 22px;
  padding: 1.25rem;
  box-shadow: 0 18px 35px rgba(0,0,0,0.35);
`;

const Title = styled.h1`
  font-size: 2rem;
  margin: 0 0 0.75rem 0;
  text-shadow: 0 10px 25px rgba(0,0,0,0.35);
`;

const Subtitle = styled.p`
  margin: 0 0 1.25rem 0;
  opacity: 0.9;
  line-height: 1.35;
`;

const ModeRow = styled.div`
  display: flex;
  gap: 0.9rem;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

const PrimaryButton = styled.button`
  background: linear-gradient(90deg, #22C55E 0%, #16A34A 100%);
  border: none;
  color: #06220f;
  padding: 0.95rem 1.1rem;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 900;
  font-size: 1.05rem;
  box-shadow: 0 12px 25px rgba(34, 197, 94, 0.25);
  transition: transform 0.15s ease, filter 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.03);
  }
`;

const SecondaryButton = styled.button`
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.95rem 1.1rem;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 800;
  font-size: 1.05rem;
  transition: transform 0.15s ease, background 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.16);
  }
`;

const VerbCard = styled.div`
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 22px;
  padding: 1.5rem;
  text-align: center;
  animation: ${floatIn} 220ms ease-out both;
`;

const VerbLabel = styled.div`
  font-size: 0.95rem;
  opacity: 0.85;
  letter-spacing: 0.4px;
`;

const VerbWord = styled.div`
  font-size: 3rem;
  font-weight: 950;
  margin-top: 0.4rem;
  letter-spacing: 0.5px;
  text-shadow: 0 12px 24px rgba(0,0,0,0.35);
`;

const Choices = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.9rem;
  margin-top: 1.25rem;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const ChoiceButton = styled.button`
  border: none;
  cursor: pointer;
  padding: 1rem 1.1rem;
  border-radius: 18px;
  font-size: 1.2rem;
  font-weight: 950;
  color: ${p => (p.$tone === 'regular' ? '#052013' : p.$tone === 'irregular' ? '#1E0A2F' : '#2A1402')};
  background: ${p =>
    p.$tone === 'regular'
      ? 'linear-gradient(90deg, #86EFAC 0%, #22C55E 100%)'
      : p.$tone === 'irregular'
        ? 'linear-gradient(90deg, #C4B5FD 0%, #8B5CF6 100%)'
        : 'linear-gradient(90deg, #FDBA74 0%, #F97316 100%)'};
  box-shadow: 0 12px 25px rgba(0,0,0,0.25);
  transition: transform 0.12s ease, filter 0.12s ease, opacity 0.12s ease;

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.03);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
    transform: none;
  }
`;

const Feedback = styled.div`
  margin-top: 1rem;
  border-radius: 18px;
  padding: 1rem;
  border: 1px solid ${p => (p.$ok ? 'rgba(34,197,94,0.35)' : 'rgba(248,113,113,0.4)')};
  background: ${p => (p.$ok ? 'rgba(34,197,94,0.10)' : 'rgba(248,113,113,0.10)')};
  animation: ${floatIn} 220ms ease-out both;
`;

const FeedbackTitle = styled.div`
  font-weight: 950;
  font-size: 1.1rem;
  margin-bottom: 0.35rem;
`;

const FeedbackText = styled.div`
  opacity: 0.95;
  line-height: 1.35;
`;

const FeedbackActions = styled.div`
  margin-top: 0.85rem;
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
`;

const TipBlock = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const TipTitle = styled.div`
  font-weight: 950;
  font-size: 1.1rem;
`;

const RuleCard = styled.div`
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 16px;
  padding: 0.9rem 1rem;
  line-height: 1.35;
`;

const RuleHeader = styled.div`
  font-weight: 950;
  margin-bottom: 0.25rem;
`;

const Small = styled.div`
  opacity: 0.85;
  font-size: 0.95rem;
  line-height: 1.35;
`;

const EndStats = styled.div`
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const MistakeList = styled.div`
  display: grid;
  gap: 0.5rem;
`;

const MistakeItem = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  padding: 0.75rem 0.9rem;
  line-height: 1.25;
`;

const verbTypes = ['regular', 'irregular', 'defectivo'];

function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatPct(n, d) {
  if (!d) return '0%';
  return `${Math.round((n / d) * 100)}%`;
}

export default function TiposDeVerbosGame({ onBack }) {
  const [screen, setScreen] = useState('menu');
  const [mode, setMode] = useState('quick');
  const [deck, setDeck] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [mistakes, setMistakes] = useState({});
  const [feedback, setFeedback] = useState(null);
  const lockedRef = useRef(false);

  const total = deck.length;
  const current = deck[index] || null;

  const progressText = useMemo(() => {
    if (!total) return '0/0';
    return `${Math.min(index + 1, total)}/${total}`;
  }, [index, total]);

  const livesText = useMemo(() => {
    if (mode !== 'quick') return '∞';
    return String(lives);
  }, [lives, mode]);

  const topMistakes = useMemo(() => {
    const entries = Object.entries(mistakes)
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    return entries.map(({ key, count }) => {
      const [chosen, correct] = key.split('->');
      return {
        chosen,
        correct,
        count
      };
    });
  }, [mistakes]);

  const startGame = selectedMode => {
    const base = shuffleArray(verbTypesQuestions);
    const roundSize = selectedMode === 'quick' ? 12 : 20;
    const nextDeck = base.slice(0, Math.min(roundSize, base.length));
    setMode(selectedMode);
    setDeck(nextDeck);
    setIndex(0);
    setScore(0);
    setStreak(0);
    setLives(selectedMode === 'quick' ? 3 : 999);
    setCorrectCount(0);
    setWrongCount(0);
    setMistakes({});
    setFeedback(null);
    lockedRef.current = false;
    setScreen('play');
  };

  const finishGame = () => {
    setScreen('end');
  };

  const nextQuestion = () => {
    setFeedback(null);
    lockedRef.current = false;
    const isOut = mode === 'quick' && lives <= 0;
    const isDone = index + 1 >= total;
    if (isOut || isDone) {
      finishGame();
      return;
    }
    setIndex(i => i + 1);
  };

  const registerMistake = useCallback((chosen, correct) => {
    const key = `${chosen}->${correct}`;
    setMistakes(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + 1
    }));
  }, []);

  const answer = useCallback(chosenType => {
    if (screen !== 'play') return;
    if (!current) return;
    if (feedback) return;
    if (lockedRef.current) return;
    lockedRef.current = true;

    const isCorrect = chosenType === current.type;
    const correctType = current.type;

    if (isCorrect) {
      setCorrectCount(c => c + 1);
      setScore(s => s + 10 + Math.min(streak, 10) * 2);
      setStreak(s => s + 1);
    } else {
      setWrongCount(c => c + 1);
      setStreak(0);
      registerMistake(chosenType, correctType);
      if (mode === 'quick') {
        setLives(v => Math.max(0, v - 1));
      }
    }

    const title = isCorrect
      ? `Correcto: ${current.verb} es ${verbTypeLabels[correctType]}`
      : `Casi: ${current.verb} es ${verbTypeLabels[correctType]}`;

    setFeedback({
      isCorrect,
      chosenType,
      correctType,
      title,
      rule: verbTypeRules[correctType],
      explanation: current.explanation,
      example: current.example
    });
  }, [current, feedback, mode, registerMistake, screen, streak]);

  useEffect(() => {
    const onKeyDown = e => {
      if (screen !== 'play') return;
      if (feedback) return;
      if (e.key === '1') answer('regular');
      if (e.key === '2') answer('irregular');
      if (e.key === '3') answer('defectivo');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [answer, feedback, screen]);

  return (
    <GameContainer>
      <Header>
        <BackButton onClick={onBack}>
          <FaArrowLeft /> Volver
        </BackButton>
        {screen === 'play' ? (
          <HeaderStats>
            <StatPill>Ronda: {progressText}</StatPill>
            <StatPill>Puntos: {score}</StatPill>
            <StatPill>Racha: {streak}</StatPill>
            <StatPill>Vidas: {livesText}</StatPill>
          </HeaderStats>
        ) : (
          <div style={{ width: 1 }} />
        )}
      </Header>

      {screen === 'menu' ? (
        <Layout>
          <Panel>
            <Title>Tipos de verbos</Title>
            <Subtitle>
              Clasifica cada verbo como <b>regular</b>, <b>irregular</b> o <b>defectivo</b>. Si fallas, verás una
              explicación corta con la norma y un ejemplo.
            </Subtitle>
            <Small>Atajos: 1 Regular · 2 Irregular · 3 Defectivo</Small>
            <ModeRow>
              <PrimaryButton onClick={() => startGame('quick')}>Modo Rápido (12)</PrimaryButton>
              <SecondaryButton onClick={() => startGame('train')}>Modo Entrenamiento (20)</SecondaryButton>
            </ModeRow>
          </Panel>

          <Panel>
            <TipBlock>
              <TipTitle>Normas rápidas</TipTitle>
              <RuleCard>
                <RuleHeader>Regular</RuleHeader>
                <Small>{verbTypeRules.regular}</Small>
              </RuleCard>
              <RuleCard>
                <RuleHeader>Irregular</RuleHeader>
                <Small>{verbTypeRules.irregular}</Small>
              </RuleCard>
              <RuleCard>
                <RuleHeader>Defectivo</RuleHeader>
                <Small>{verbTypeRules.defectivo}</Small>
              </RuleCard>
              <Small>
                Pista: los defectivos suelen ser meteorológicos o impersonales (llueve, nevó, relampaguea…) y no se usan
                normalmente como “yo ___”.
              </Small>
            </TipBlock>
          </Panel>
        </Layout>
      ) : null}

      {screen === 'play' ? (
        <Layout>
          <Panel>
            <VerbCard>
              <VerbLabel>Clasifica este verbo</VerbLabel>
              <VerbWord>{current ? current.verb : '—'}</VerbWord>
            </VerbCard>

            <Choices>
              {verbTypes.map(t => (
                <ChoiceButton
                  key={t}
                  type="button"
                  $tone={t}
                  disabled={!current || !!feedback}
                  onClick={() => answer(t)}
                >
                  {verbTypeLabels[t]}
                </ChoiceButton>
              ))}
            </Choices>

            {feedback ? (
              <Feedback $ok={feedback.isCorrect}>
                <FeedbackTitle>{feedback.title}</FeedbackTitle>
                <FeedbackText>
                  <div>
                    <b>Norma:</b> {feedback.rule}
                  </div>
                  <div style={{ marginTop: '0.35rem' }}>
                    <b>Por qué:</b> {feedback.explanation}
                  </div>
                  <div style={{ marginTop: '0.35rem' }}>
                    <b>Ejemplo:</b> {feedback.example}
                  </div>
                  {!feedback.isCorrect ? (
                    <div style={{ marginTop: '0.35rem' }}>
                      <b>Tu respuesta:</b> {verbTypeLabels[feedback.chosenType]}
                    </div>
                  ) : null}
                </FeedbackText>
                <FeedbackActions>
                  <PrimaryButton type="button" onClick={nextQuestion}>
                    Siguiente
                  </PrimaryButton>
                  <SecondaryButton type="button" onClick={() => startGame(mode)}>
                    <FaRedo /> Reiniciar
                  </SecondaryButton>
                </FeedbackActions>
              </Feedback>
            ) : null}
          </Panel>

          <Panel>
            <TipBlock>
              <TipTitle>Guía para decidir</TipTitle>
              <RuleCard>
                <RuleHeader>¿Regular?</RuleHeader>
                <Small>
                  Si al conjugar no hay cambios especiales en la raíz y sigue el patrón del modelo (-ar/-er/-ir), suele ser
                  regular.
                </Small>
              </RuleCard>
              <RuleCard>
                <RuleHeader>¿Irregular?</RuleHeader>
                <Small>
                  Busca cambios como e→ie (tienes), o→ue (puedo), yo en -go (tengo, salgo), cambios ortográficos (conozco) o
                  pretéritos especiales (hice, puse, dije).
                </Small>
              </RuleCard>
              <RuleCard>
                <RuleHeader>¿Defectivo?</RuleHeader>
                <Small>
                  Si normalmente solo se usa en 3.ª persona o no tiene todas las formas (“llueve”, “nieva”…), es defectivo.
                </Small>
              </RuleCard>
              <Small>
                Objetivo: no memorizar etiquetas, sino reconocer la pista de la conjugación.
              </Small>
            </TipBlock>
          </Panel>
        </Layout>
      ) : null}

      {screen === 'end' ? (
        <Layout>
          <Panel>
            <Title>Resumen</Title>
            <Subtitle>
              Aciertos: <b>{correctCount}</b> · Fallos: <b>{wrongCount}</b> · Precisión: <b>{formatPct(correctCount, correctCount + wrongCount)}</b> · Puntos: <b>{score}</b>
            </Subtitle>
            <ModeRow>
              <PrimaryButton onClick={() => startGame(mode)}>Jugar otra vez</PrimaryButton>
              <SecondaryButton onClick={() => setScreen('menu')}>Cambiar modo</SecondaryButton>
            </ModeRow>

            {topMistakes.length ? (
              <EndStats>
                <TipTitle>Confusiones típicas</TipTitle>
                <MistakeList>
                  {topMistakes.map(m => (
                    <MistakeItem key={`${m.chosen}-${m.correct}`}>
                      {m.count}× marcaste <b>{verbTypeLabels[m.chosen]}</b> cuando era <b>{verbTypeLabels[m.correct]}</b>
                    </MistakeItem>
                  ))}
                </MistakeList>
              </EndStats>
            ) : (
              <EndStats>
                <TipTitle>Confusiones típicas</TipTitle>
                <Small>Sin fallos en esta ronda. Prueba el otro modo para ver más variedad.</Small>
              </EndStats>
            )}
          </Panel>

          <Panel>
            <TipBlock>
              <TipTitle>Normas rápidas</TipTitle>
              <RuleCard>
                <RuleHeader>Regular</RuleHeader>
                <Small>{verbTypeRules.regular}</Small>
              </RuleCard>
              <RuleCard>
                <RuleHeader>Irregular</RuleHeader>
                <Small>{verbTypeRules.irregular}</Small>
              </RuleCard>
              <RuleCard>
                <RuleHeader>Defectivo</RuleHeader>
                <Small>{verbTypeRules.defectivo}</Small>
              </RuleCard>
            </TipBlock>
          </Panel>
        </Layout>
      ) : null}
    </GameContainer>
  );
}
