import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaClock } from 'react-icons/fa';

const Container = styled.div`
  min-height: 100vh;
  padding: 1.75rem;
  max-width: 1100px;
  margin: 0 auto;
  color: white;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.8rem 1.25rem;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.05rem;
  backdrop-filter: blur(6px);

  &:hover {
    background: rgba(255, 255, 255, 0.28);
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2.2rem;
  font-weight: 900;
  text-align: center;
  flex: 1;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 22px;
  padding: 1.25rem;
  backdrop-filter: blur(10px);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 920px) {
    grid-template-columns: 1.1fr 0.9fr;
    gap: 1.25rem;
    align-items: start;
  }
`;

const BigText = styled.div`
  font-size: 1.35rem;
  font-weight: 900;
  line-height: 1.15;
`;

const SubText = styled.div`
  margin-top: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 700;
  line-height: 1.3;
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

const SelectRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;

  @media (min-width: 720px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const SelectButton = styled.button`
  width: 100%;
  text-align: left;
  padding: 1rem 1.05rem;
  border-radius: 18px;
  cursor: pointer;
  border: 2px solid ${p => (p.$active ? 'rgba(59,130,246,0.95)' : 'rgba(255,255,255,0.18)')};
  background: ${p => (p.$active ? 'rgba(59,130,246,0.22)' : 'rgba(255,255,255,0.10)')};
  color: white;
  transition: transform 120ms ease, background 120ms ease, border 120ms ease;

  &:hover {
    transform: translateY(-1px);
    background: ${p => (p.$active ? 'rgba(59,130,246,0.26)' : 'rgba(255,255,255,0.14)')};
  }
`;

const PrimaryButton = styled.button`
  background: rgba(34, 197, 94, 0.95);
  border: none;
  color: #06210f;
  font-weight: 900;
  padding: 0.9rem 1.2rem;
  border-radius: 14px;
  cursor: pointer;
  font-size: 1.1rem;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: white;
  font-weight: 900;
  padding: 0.9rem 1.15rem;
  border-radius: 14px;
  cursor: pointer;
  font-size: 1.05rem;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin-top: 1rem;

  @media (min-width: 720px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`;

const OptionButton = styled.button`
  border-radius: 16px;
  border: 2px solid ${p => (p.$tone === 'good' ? 'rgba(34,197,94,0.9)' : p.$tone === 'bad' ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.18)')};
  background: ${p => (p.$tone === 'good' ? 'rgba(34,197,94,0.20)' : p.$tone === 'bad' ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.10)')};
  color: white;
  padding: 0.95rem 0.85rem;
  cursor: pointer;
  text-align: center;
  font-weight: 950;
  font-size: 1.2rem;

  &:hover {
    background: ${p => (p.$tone ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.14)')};
  }

  &:disabled {
    opacity: 0.75;
    cursor: default;
  }
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

const Badge = styled.div`
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  font-weight: 900;
`;

const Hint = styled.div`
  margin-top: 0.9rem;
  padding: 0.9rem 1rem;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.92);
  font-weight: 800;
  line-height: 1.35;
`;

function formatTime({ hour, minute }) {
  const mm = String(minute).padStart(2, '0');
  return `${hour}:${mm}`;
}

function toCycleMinutes({ hour, minute }) {
  const h = hour === 12 ? 0 : hour;
  return h * 60 + minute;
}

function fromCycleMinutes(total) {
  const normalized = ((total % 720) + 720) % 720;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  const hour = h === 0 ? 12 : h;
  return { hour, minute: m };
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildOptions({ correct, base, deltaMinutes, kind }) {
  const correctText = formatTime(correct);
  const options = new Set([correctText]);

  const baseTotal = toCycleMinutes(base);
  const correctTotal = toCycleMinutes(correct);

  const commonMistakes = [];
  if (kind === 'read') {
    commonMistakes.push(
      fromCycleMinutes(baseTotal + 15),
      fromCycleMinutes(baseTotal - 15),
      fromCycleMinutes(baseTotal + 30),
      fromCycleMinutes(baseTotal + 60)
    );
  } else {
    commonMistakes.push(
      fromCycleMinutes(baseTotal + Math.abs(deltaMinutes)),
      fromCycleMinutes(baseTotal - Math.abs(deltaMinutes)),
      fromCycleMinutes(correctTotal + 15),
      fromCycleMinutes(correctTotal - 15),
      fromCycleMinutes(correctTotal + 60)
    );
  }

  const pool = shuffle(commonMistakes)
    .map(formatTime)
    .filter(t => t !== correctText);

  for (const t of pool) {
    options.add(t);
    if (options.size >= 3) break;
  }

  const minutes = [0, 15, 30, 45];
  while (options.size < 3) {
    const hour = pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const minute = pick(minutes);
    options.add(formatTime({ hour, minute }));
  }

  return shuffle([...options]);
}

function describeDelta(deltaMinutes) {
  const abs = Math.abs(deltaMinutes);
  const sign = deltaMinutes >= 0 ? '+' : '−';
  if (abs === 15) return `${sign}15 min (1 cuarto)`;
  if (abs === 30) return `${sign}30 min (media hora)`;
  return `${sign}60 min (1 hora)`;
}

function deltaHint(deltaMinutes) {
  const abs = Math.abs(deltaMinutes);
  if (abs === 15) return '15 minutos = 1 cuarto (mueves la manecilla grande 3 números).';
  if (abs === 30) return '30 minutos = media hora (mueves la manecilla grande 6 números).';
  return '60 minutos = 1 hora (la manecilla grande vuelve arriba y la pequeña avanza 1).';
}

function buildQuestion({ mode, step, op }) {
  const minute = pick([0, 15, 30, 45]);
  const hour = pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const base = { hour, minute };

  if (mode === 'read') {
    const correct = base;
    const options = buildOptions({ correct, base, deltaMinutes: 0, kind: 'read' });
    return {
      kind: 'read',
      base,
      correct,
      options,
      prompt: '¿Qué hora es?',
      hint: 'Mira la manecilla larga (minutos) y luego la corta (hora).'
    };
  }

  const stepMinutes = step === 'mix' ? pick([15, 30, 60]) : step;
  const signed =
    op === 'add'
      ? stepMinutes
      : op === 'sub'
        ? -stepMinutes
        : pick([stepMinutes, -stepMinutes]);

  const correct = fromCycleMinutes(toCycleMinutes(base) + signed);
  const options = buildOptions({ correct, base, deltaMinutes: signed, kind: 'calc' });
  const dir = signed >= 0 ? 'dentro de' : 'hace';
  const abs = Math.abs(signed);

  return {
    kind: 'calc',
    base,
    correct,
    options,
    deltaMinutes: signed,
    prompt: `Si son las ${formatTime(base)}, ¿qué hora será ${dir} ${abs} minutos?`,
    hint: deltaHint(signed)
  };
}

function AnalogClock({ time, showNumbers = false }) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 130;
  const minuteAngle = (time.minute / 60) * 360 - 90;
  const hourAngle = ((time.hour % 12) / 12) * 360 + (time.minute / 60) * 30 - 90;

  const toPoint = (angleDeg, r) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r };
  };

  const minuteEnd = toPoint(minuteAngle, radius);
  const hourEnd = toPoint(hourAngle, radius * 0.66);

  const ticks = [];
  for (let i = 0; i < 12; i++) {
    const a = i * 30 - 90;
    const outer = toPoint(a, radius);
    const inner = toPoint(a, radius - 14);
    ticks.push({ outer, inner, key: i });
  }

  const numbers = [];
  if (showNumbers) {
    for (let i = 1; i <= 12; i++) {
      const a = i * 30 - 90;
      const p = toPoint(a, radius - 38);
      numbers.push({ value: i, x: p.x, y: p.y, key: `n-${i}` });
    }
  }

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <svg width="100%" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Reloj marcando ${formatTime(time)}`} style={{ maxWidth: 360 }}>
        <defs>
          <filter id="clockHandShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="rgba(15,23,42,0.45)" />
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={radius + 14} fill="rgba(255,255,255,0.14)" />
        <circle cx={cx} cy={cy} r={radius + 4} fill="#ffffff" stroke="#334155" strokeWidth="4" />
        {ticks.map(t => (
          <line
            key={t.key}
            x1={t.inner.x}
            y1={t.inner.y}
            x2={t.outer.x}
            y2={t.outer.y}
            stroke="#334155"
            strokeWidth="4"
            strokeLinecap="round"
          />
        ))}
        {numbers.map(n => (
          <text
            key={n.key}
            x={n.x}
            y={n.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="18"
            fontWeight="900"
            fill="#0f172a"
            stroke="rgba(255,255,255,0.92)"
            strokeWidth="4"
            paintOrder="stroke"
          >
            {n.value}
          </text>
        ))}
        <g filter="url(#clockHandShadow)">
          <line x1={cx} y1={cy} x2={hourEnd.x} y2={hourEnd.y} stroke="rgba(255,255,255,0.92)" strokeWidth="14" strokeLinecap="round" />
          <line x1={cx} y1={cy} x2={hourEnd.x} y2={hourEnd.y} stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />
          <line x1={cx} y1={cy} x2={minuteEnd.x} y2={minuteEnd.y} stroke="rgba(255,255,255,0.92)" strokeWidth="12" strokeLinecap="round" />
          <line x1={cx} y1={cy} x2={minuteEnd.x} y2={minuteEnd.y} stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="9" fill="#0f172a" />
          <circle cx={cx} cy={cy} r="4" fill="#ffffff" opacity="0.92" />
        </g>
      </svg>
    </div>
  );
}

export default function YLaHoraGame({ onBack }) {
  const [phase, setPhase] = useState('menu');
  const [mode, setMode] = useState('read');
  const [step, setStep] = useState('mix');
  const [op, setOp] = useState('both');
  const [questionCount, setQuestionCount] = useState(10);
  const [showNumbers, setShowNumbers] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState([]);

  const current = questions[index];

  const start = () => {
    const steps = step === 'mix' ? 'mix' : Number(step);
    const newQuestions = [];
    for (let i = 0; i < questionCount; i++) {
      newQuestions.push(buildQuestion({ mode, step: steps, op }));
    }
    setQuestions(newQuestions);
    setIndex(0);
    setResult(null);
    setPoints(0);
    setStreak(0);
    setAnswers([]);
    setPhase('playing');
  };

  const choose = (optionText) => {
    if (!current || result) return;
    const correctText = formatTime(current.correct);
    const isCorrect = optionText === correctText;
    const nextStreak = isCorrect ? streak + 1 : 0;
    const earned = isCorrect ? 10 + Math.min(10, nextStreak * 2) : 0;

    setStreak(nextStreak);
    setPoints(p => p + earned);
    setResult({ chosen: optionText, correct: correctText, isCorrect, earned });
    setAnswers(prev => [
      ...prev,
      {
        kind: current.kind,
        prompt: current.prompt,
        base: current.base,
        deltaMinutes: current.deltaMinutes ?? null,
        chosen: optionText,
        correct: correctText,
        isCorrect
      }
    ]);
  };

  const next = () => {
    const nextIndex = index + 1;
    if (nextIndex >= questions.length) {
      setPhase('finished');
      return;
    }
    setIndex(nextIndex);
    setResult(null);
  };

  const summary = useMemo(() => {
    const correct = answers.filter(a => a.isCorrect).length;
    const incorrect = answers.length - correct;
    const pct = answers.length ? Math.round((correct / answers.length) * 100) : 0;
    return { correct, incorrect, pct };
  }, [answers]);

  const mistakes = useMemo(() => answers.filter(a => !a.isCorrect), [answers]);
  const helpNumbersLabel = showNumbers ? 'Ayuda: ocultar números' : 'Ayuda: mostrar números';

  return (
    <Container>
      <TopBar>
        <BackButton onClick={onBack}>
          <FaArrowLeft /> Volver
        </BackButton>
        <Title>¿Y la hora?</Title>
        <div style={{ width: 130, textAlign: 'right', fontWeight: 900 }}>
          {phase === 'playing' ? `${index + 1}/${questions.length}` : ''}
        </div>
      </TopBar>

      {phase === 'menu' && (
        <Grid>
          <Card>
            <BigText>Aprende horas y minutos jugando</BigText>
            <SubText>Rondas rápidas con reloj grande. Lee la hora y practica +/− 15, 30 y 60 minutos.</SubText>

            <div style={{ marginTop: '1rem', fontWeight: 900, opacity: 0.92 }}>Elige un reto</div>
            <SelectRow style={{ marginTop: 10 }}>
              <SelectButton $active={mode === 'read'} onClick={() => setMode('read')}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <FaClock />
                  <div>
                    <div style={{ fontWeight: 950, fontSize: '1.15rem' }}>Leer la hora</div>
                    <div style={{ opacity: 0.9, fontWeight: 800 }}>0, :15, :30, :45</div>
                  </div>
                </div>
              </SelectButton>
              <SelectButton $active={mode === 'calc'} onClick={() => setMode('calc')}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <FaClock />
                  <div>
                    <div style={{ fontWeight: 950, fontSize: '1.15rem' }}>Sumar y restar</div>
                    <div style={{ opacity: 0.9, fontWeight: 800 }}>15, 30 y 60 minutos</div>
                  </div>
                </div>
              </SelectButton>
            </SelectRow>

            {mode === 'calc' && (
              <>
                <div style={{ marginTop: '1rem', fontWeight: 900, opacity: 0.92 }}>Minutos</div>
                <SelectRow style={{ marginTop: 10 }}>
                  <SelectButton $active={step === 'mix'} onClick={() => setStep('mix')}>
                    <div style={{ fontWeight: 950, fontSize: '1.1rem' }}>Mixto</div>
                    <div style={{ opacity: 0.9, fontWeight: 800 }}>15 / 30 / 60</div>
                  </SelectButton>
                  <SelectButton $active={step === 15} onClick={() => setStep(15)}>
                    <div style={{ fontWeight: 950, fontSize: '1.1rem' }}>Solo 15</div>
                    <div style={{ opacity: 0.9, fontWeight: 800 }}>un cuarto</div>
                  </SelectButton>
                  <SelectButton $active={step === 30} onClick={() => setStep(30)}>
                    <div style={{ fontWeight: 950, fontSize: '1.1rem' }}>Solo 30</div>
                    <div style={{ opacity: 0.9, fontWeight: 800 }}>media hora</div>
                  </SelectButton>
                  <SelectButton $active={step === 60} onClick={() => setStep(60)}>
                    <div style={{ fontWeight: 950, fontSize: '1.1rem' }}>Solo 60</div>
                    <div style={{ opacity: 0.9, fontWeight: 800 }}>una hora</div>
                  </SelectButton>
                </SelectRow>

                <div style={{ marginTop: '1rem', fontWeight: 900, opacity: 0.92 }}>Operación</div>
                <SelectRow style={{ marginTop: 10 }}>
                  <SelectButton $active={op === 'both'} onClick={() => setOp('both')}>
                    <div style={{ fontWeight: 950, fontSize: '1.1rem' }}>Sumar y restar</div>
                    <div style={{ opacity: 0.9, fontWeight: 800 }}>mezclado</div>
                  </SelectButton>
                  <SelectButton $active={op === 'add'} onClick={() => setOp('add')}>
                    <div style={{ fontWeight: 950, fontSize: '1.1rem' }}>Solo sumar</div>
                    <div style={{ opacity: 0.9, fontWeight: 800 }}>dentro de…</div>
                  </SelectButton>
                  <SelectButton $active={op === 'sub'} onClick={() => setOp('sub')}>
                    <div style={{ fontWeight: 950, fontSize: '1.1rem' }}>Solo restar</div>
                    <div style={{ opacity: 0.9, fontWeight: 800 }}>hace…</div>
                  </SelectButton>
                </SelectRow>
              </>
            )}

            <div style={{ marginTop: '1rem', fontWeight: 900, opacity: 0.92 }}>Preguntas</div>
            <SelectRow style={{ marginTop: 10 }}>
              <SelectButton $active={questionCount === 6} onClick={() => setQuestionCount(6)}>
                <div style={{ fontWeight: 950, fontSize: '1.1rem' }}>6</div>
                <div style={{ opacity: 0.9, fontWeight: 800 }}>muy rápido</div>
              </SelectButton>
              <SelectButton $active={questionCount === 10} onClick={() => setQuestionCount(10)}>
                <div style={{ fontWeight: 950, fontSize: '1.1rem' }}>10</div>
                <div style={{ opacity: 0.9, fontWeight: 800 }}>recomendado</div>
              </SelectButton>
              <SelectButton $active={questionCount === 15} onClick={() => setQuestionCount(15)}>
                <div style={{ fontWeight: 950, fontSize: '1.1rem' }}>15</div>
                <div style={{ opacity: 0.9, fontWeight: 800 }}>reto</div>
              </SelectButton>
            </SelectRow>

            <ControlsRow>
              <PrimaryButton onClick={start}>Empezar</PrimaryButton>
              <SecondaryButton
                onClick={() => {
                  setMode(m => (m === 'read' ? 'calc' : 'read'));
                }}
              >
                Cambiar reto
              </SecondaryButton>
            </ControlsRow>

            <Hint>
              <div style={{ fontWeight: 950, marginBottom: 6 }}>Reglas</div>
              <div>1) Mira el reloj.</div>
              <div>2) Elige la hora correcta.</div>
              <div>3) Ganas puntos y racha.</div>
            </Hint>
          </Card>

          <Card>
            <BigText>Vista previa</BigText>
            <SubText>Este reloj es el que usarás para jugar.</SubText>
            <div style={{ marginTop: 12 }}>
              <AnalogClock time={{ hour: 3, minute: 15 }} showNumbers={showNumbers} />
            </div>
            <ControlsRow>
              <SecondaryButton onClick={() => setShowNumbers(s => !s)}>{helpNumbersLabel}</SecondaryButton>
            </ControlsRow>
            <BadgeRow>
              <Badge>15 min = 1 cuarto</Badge>
              <Badge>30 min = media</Badge>
              <Badge>60 min = 1 hora</Badge>
            </BadgeRow>
          </Card>
        </Grid>
      )}

      {phase === 'playing' && current && (
        <Grid>
          <Card>
            <AnalogClock time={current.base} showNumbers={showNumbers} />
            <BadgeRow>
              <Badge>⭐ Puntos: {points}</Badge>
              <Badge>🔥 Racha: {streak}</Badge>
            </BadgeRow>
            <ControlsRow>
              <SecondaryButton onClick={() => setShowNumbers(s => !s)}>{helpNumbersLabel}</SecondaryButton>
            </ControlsRow>
          </Card>

          <Card>
            <BigText>{current.prompt}</BigText>
            {current.kind === 'calc' && (
              <SubText>
                Cambio: <span style={{ fontWeight: 950 }}>{describeDelta(current.deltaMinutes)}</span>
              </SubText>
            )}
            <OptionsGrid>
              {current.options.map((opt) => {
                const tone =
                  result && opt === result.correct
                    ? 'good'
                    : result && opt === result.chosen && result.chosen !== result.correct
                      ? 'bad'
                      : null;
                return (
                  <OptionButton
                    key={opt}
                    onClick={() => choose(opt)}
                    disabled={!!result}
                    $tone={tone}
                    aria-label={`Elegir ${opt}`}
                  >
                    {opt}
                  </OptionButton>
                );
              })}
            </OptionsGrid>

            {!result && <Hint>{current.hint}</Hint>}

            {result && (
              <Hint style={{ borderColor: result.isCorrect ? 'rgba(34,197,94,0.55)' : 'rgba(239,68,68,0.5)' }}>
                {result.isCorrect ? (
                  <div style={{ fontWeight: 950 }}>¡Bien! +{result.earned} puntos</div>
                ) : (
                  <div>
                    <div style={{ fontWeight: 950 }}>Casi.</div>
                    <div>
                      La respuesta correcta era <span style={{ fontWeight: 950 }}>{result.correct}</span>.
                    </div>
                  </div>
                )}
                {current.kind === 'calc' && (
                  <div style={{ marginTop: 8, opacity: 0.95 }}>
                    {formatTime(current.base)} {current.deltaMinutes >= 0 ? '+' : '−'} {Math.abs(current.deltaMinutes)} min →{' '}
                    <span style={{ fontWeight: 950 }}>{result.correct}</span>
                  </div>
                )}
                {current.kind === 'calc' && <div style={{ marginTop: 6, opacity: 0.95 }}>{deltaHint(current.deltaMinutes)}</div>}
              </Hint>
            )}

            <ControlsRow>
              <PrimaryButton onClick={next} disabled={!result}>
                {index + 1 >= questions.length ? 'Ver resultados' : 'Siguiente'}
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
          </Card>
        </Grid>
      )}

      {phase === 'finished' && (
        <Grid>
          <Card>
            <BigText>Resultados</BigText>
            <SubText>
              Aciertos: <span style={{ fontWeight: 950 }}>{summary.correct}</span> | Fallos:{' '}
              <span style={{ fontWeight: 950 }}>{summary.incorrect}</span> | Porcentaje:{' '}
              <span style={{ fontWeight: 950 }}>{summary.pct}%</span>
            </SubText>
            <BadgeRow>
              <Badge>⭐ Puntos: {points}</Badge>
              <Badge>🎯 Dominado: {summary.pct >= 70 ? 'Sí' : 'Aún no'}</Badge>
            </BadgeRow>

            {mistakes.length > 0 ? (
              <Hint>
                <div style={{ fontWeight: 950, marginBottom: 8 }}>Para repasar</div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {mistakes.slice(0, 6).map((m, i) => (
                    <div key={`${m.correct}-${i}`}>
                      {i + 1}. Elegiste <span style={{ fontWeight: 950 }}>{m.chosen}</span> y era{' '}
                      <span style={{ fontWeight: 950 }}>{m.correct}</span>.
                    </div>
                  ))}
                </div>
              </Hint>
            ) : (
              <Hint style={{ borderColor: 'rgba(34,197,94,0.55)' }}>
                <div style={{ fontWeight: 950 }}>¡Perfecto! Has acertado todas.</div>
              </Hint>
            )}

            <ControlsRow>
              <PrimaryButton onClick={start}>Jugar otra vez</PrimaryButton>
              <SecondaryButton
                onClick={() => {
                  setPhase('menu');
                  setResult(null);
                }}
              >
                Cambiar reto
              </SecondaryButton>
            </ControlsRow>
          </Card>
          <Card>
            <BigText>Consejo rápido</BigText>
            <SubText>Los “cuartos” son saltos de 15 minutos.</SubText>
            <div style={{ marginTop: 12 }}>
              <AnalogClock time={{ hour: 7, minute: 45 }} showNumbers={showNumbers} />
            </div>
            <ControlsRow>
              <SecondaryButton onClick={() => setShowNumbers(s => !s)}>{helpNumbersLabel}</SecondaryButton>
            </ControlsRow>
            <BadgeRow>
              <Badge>+15 = 1 salto</Badge>
              <Badge>+30 = 2 saltos</Badge>
              <Badge>+60 = vuelta completa</Badge>
            </BadgeRow>
          </Card>
        </Grid>
      )}
    </Container>
  );
}
