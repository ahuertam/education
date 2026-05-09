import React, { useMemo, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { buildRiversQuestionOrder, getRiverNameById, SPAIN_RIVERS } from './data/spainRiversData';
import SpainRiversMap from './rivers/SpainRiversMap';
import {
  BackButton,
  Badge,
  BadgeRow,
  BigPrompt,
  ControlsRow,
  Feedback,
  GameContainer,
  PrimaryButton,
  SecondaryButton,
  SelectButton,
  SelectorRow,
  Shell,
  Small,
  SubText,
  Title,
  TopBar
} from './rivers/SpainRiversStyles';

function buildSummary(answers) {
  const correct = answers.filter(a => a.isCorrect).length;
  const incorrect = answers.length - correct;
  const pct = answers.length ? Math.round((correct / answers.length) * 100) : 0;
  return { correct, incorrect, pct };
}

const SpainRiversLocatorGame = ({ onBack }) => {
  const [phase, setPhase] = useState('menu');
  const [mode, setMode] = useState('quick');
  const [orderType, setOrderType] = useState('northSouth');
  const [questionIds, setQuestionIds] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [result, setResult] = useState(null);

  const currentRiverId = questionIds[index];
  const currentRiverName = currentRiverId ? getRiverNameById(currentRiverId) : '';

  const startGame = () => {
    const order = buildRiversQuestionOrder({ mode, orderType });
    setQuestionIds(order);
    setIndex(0);
    setAnswers([]);
    setStreak(0);
    setPoints(0);
    setResult(null);
    setPhase('playing');
  };

  const next = () => {
    const nextIndex = index + 1;
    if (nextIndex >= questionIds.length) {
      setPhase('finished');
      return;
    }
    setIndex(nextIndex);
    setResult(null);
  };

  const handleSelectRiver = (chosenId) => {
    if (!currentRiverId || result) return;
    const isCorrect = chosenId === currentRiverId;
    const nextStreak = isCorrect ? streak + 1 : 0;
    const earned = isCorrect ? 10 + Math.min(10, nextStreak * 2) : 0;

    setStreak(nextStreak);
    setPoints(p => p + earned);
    setAnswers(prev => [
      ...prev,
      {
        targetId: currentRiverId,
        chosenId,
        isCorrect,
        points: earned
      }
    ]);
    setResult({
      chosenId,
      correctId: currentRiverId,
      isCorrect,
      earned
    });
  };

  const summary = useMemo(() => buildSummary(answers), [answers]);
  const mistakes = useMemo(() => answers.filter(a => !a.isCorrect), [answers]);

  return (
    <GameContainer>
      <TopBar>
        <BackButton onClick={onBack}>
          <FaArrowLeft /> Volver
        </BackButton>
        <Title>🌊 Ríos de España</Title>
        <div style={{ width: 140, textAlign: 'right', color: 'white', fontWeight: 800 }}>
          {phase === 'playing' ? `${index + 1}/${questionIds.length}` : ''}
        </div>
      </TopBar>

      {phase === 'menu' && (
        <Shell>
          <div>
            <BigPrompt>Localiza 8 ríos en el mapa</BigPrompt>
            <SubText>Toca el río correcto cuando te lo pida. Sin arrastrar: solo clic o tap.</SubText>

            <SelectorRow>
              <SelectButton $active={mode === 'quick'} onClick={() => setMode('quick')}>
                <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>⚡ Modo Rápido</div>
                <Small>10 preguntas (mezcla). Ideal para repasar.</Small>
              </SelectButton>
              <SelectButton $active={mode === 'order'} onClick={() => setMode('order')}>
                <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>🧭 Modo Orden</div>
                <Small>8 ríos en un orden fijo para memorizar.</Small>
              </SelectButton>
            </SelectorRow>

            {mode === 'order' && (
              <div style={{ marginTop: 12 }}>
                <div style={{ color: 'white', fontWeight: 900, marginBottom: 8 }}>Elige el orden</div>
                <SelectorRow>
                  <SelectButton $active={orderType === 'northSouth'} onClick={() => setOrderType('northSouth')}>
                    <div style={{ fontWeight: 900, fontSize: '1.05rem' }}>Norte → Sur</div>
                    <Small>Recorrido por posición aproximada.</Small>
                  </SelectButton>
                  <SelectButton $active={orderType === 'basins'} onClick={() => setOrderType('basins')}>
                    <div style={{ fontWeight: 900, fontSize: '1.05rem' }}>Por cuencas</div>
                    <Small>Atlántico primero, luego Mediterráneo.</Small>
                  </SelectButton>
                </SelectorRow>
              </div>
            )}

            <ControlsRow>
              <PrimaryButton onClick={startGame}>Empezar</PrimaryButton>
              <SecondaryButton onClick={() => setMode(m => (m === 'quick' ? 'order' : 'quick'))}>
                Cambiar modo
              </SecondaryButton>
            </ControlsRow>

            <Feedback $tone="neutral" style={{ marginTop: '1.25rem' }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Cómo se juega</div>
              <div>1) Mira el nombre del río.</div>
              <div>2) Tócalo en el mapa.</div>
              <div>3) Verás si es correcto y cuál era.</div>
              <div>4) Pulsa “Siguiente” y continúa.</div>
            </Feedback>
          </div>

          <SpainRiversMap disabled onSelectRiver={() => {}} result={null} currentRiverId={'tajo'} />
        </Shell>
      )}

      {phase === 'playing' && currentRiverId && (
        <Shell>
          <SpainRiversMap
            disabled={false}
            onSelectRiver={handleSelectRiver}
            result={result}
            currentRiverId={currentRiverId}
          />

          <div>
            <BigPrompt>Localiza: {currentRiverName}</BigPrompt>
            <SubText>
              Consejo: arriba está el norte. A la derecha está el Mediterráneo.
            </SubText>

            <BadgeRow>
              <Badge>⭐ Puntos: {points}</Badge>
              <Badge>🔥 Racha: {streak}</Badge>
              <Badge>✅ {summary.correct} | ❌ {summary.incorrect}</Badge>
            </BadgeRow>

            {!result && (
              <Feedback $tone="neutral">
                Toca en el mapa el río que se llama <span style={{ fontWeight: 900 }}>{currentRiverName}</span>.
              </Feedback>
            )}

            {result && (
              <Feedback $tone={result.isCorrect ? 'good' : 'bad'}>
                {result.isCorrect ? (
                  <div style={{ fontWeight: 900 }}>¡Correcto! +{result.earned} puntos</div>
                ) : (
                  <div>
                    <div style={{ fontWeight: 900 }}>Casi.</div>
                    <div>
                      Era <span style={{ fontWeight: 900 }}>{getRiverNameById(result.correctId)}</span>.
                    </div>
                  </div>
                )}
              </Feedback>
            )}

            <ControlsRow>
              <PrimaryButton onClick={next} disabled={!result}>
                {index + 1 >= questionIds.length ? 'Ver resultados' : 'Siguiente'}
              </PrimaryButton>
              <SecondaryButton
                onClick={() => {
                  setPhase('menu');
                  setResult(null);
                }}
              >
                Salir al menú
              </SecondaryButton>
            </ControlsRow>

            <div style={{ marginTop: 14, color: 'rgba(255,255,255,0.92)', fontSize: '0.95rem', lineHeight: 1.35 }}>
              Ríos: {SPAIN_RIVERS.map(r => r.name).join(', ')}.
            </div>
          </div>
        </Shell>
      )}

      {phase === 'finished' && (
        <Shell>
          <div>
            <BigPrompt>Resultados</BigPrompt>
            <SubText>
              Aciertos: <span style={{ fontWeight: 900 }}>{summary.correct}</span> | Fallos:{' '}
              <span style={{ fontWeight: 900 }}>{summary.incorrect}</span> | Porcentaje:{' '}
              <span style={{ fontWeight: 900 }}>{summary.pct}%</span>
            </SubText>

            <BadgeRow>
              <Badge>⭐ Puntos: {points}</Badge>
              <Badge>🎯 Dominado: {summary.pct >= 70 ? 'Sí' : 'Aún no'}</Badge>
            </BadgeRow>

            {mistakes.length > 0 ? (
              <Feedback $tone="neutral">
                <div style={{ fontWeight: 900, marginBottom: 8 }}>Para repasar</div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {mistakes.map((m, i) => (
                    <div key={`${m.targetId}-${i}`}>
                      {i + 1}. Tocaste <span style={{ fontWeight: 900 }}>{getRiverNameById(m.chosenId)}</span> y era{' '}
                      <span style={{ fontWeight: 900 }}>{getRiverNameById(m.targetId)}</span>.
                    </div>
                  ))}
                </div>
              </Feedback>
            ) : (
              <Feedback $tone="good">
                <div style={{ fontWeight: 900 }}>¡Perfecto! Has acertado todas.</div>
              </Feedback>
            )}

            <ControlsRow>
              <PrimaryButton onClick={startGame}>Jugar otra vez</PrimaryButton>
              <SecondaryButton
                onClick={() => {
                  setPhase('menu');
                  setResult(null);
                }}
              >
                Cambiar modo
              </SecondaryButton>
            </ControlsRow>
          </div>

          <SpainRiversMap disabled onSelectRiver={() => {}} result={null} currentRiverId={'tajo'} />
        </Shell>
      )}
    </GameContainer>
  );
};

export default SpainRiversLocatorGame;

