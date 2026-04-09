import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';

const GameContainer = styled.div`
  min-height: 100vh;
  background: radial-gradient(circle at 30% 20%, #0b1b2d 0%, #040813 55%, #02040a 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
`;

const FXLayer = styled.div`
  position: absolute;
  inset: -20%;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(circle at 18% 24%, rgba(0, 255, 209, 0.20) 0%, rgba(0, 255, 209, 0) 55%),
    radial-gradient(circle at 78% 72%, rgba(255, 0, 140, 0.18) 0%, rgba(255, 0, 140, 0) 58%),
    radial-gradient(circle at 55% 15%, rgba(255, 230, 0, 0.10) 0%, rgba(255, 230, 0, 0) 50%);
  animation: drift 10s ease-in-out infinite alternate;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.06) 0px, rgba(255, 255, 255, 0.06) 1px, rgba(255, 255, 255, 0) 1px, rgba(255, 255, 255, 0) 38px),
      repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 1px, rgba(255, 255, 255, 0) 1px, rgba(255, 255, 255, 0) 42px);
    opacity: 0.28;
    transform: translate3d(0, 0, 0);
    animation: gridmove 22s linear infinite;
    mix-blend-mode: overlay;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0) 60%),
      radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0) 62%);
    opacity: 0.22;
    filter: blur(1px);
  }

  @keyframes drift {
    0% { transform: translate3d(-1%, -1%, 0) scale(1); }
    100% { transform: translate3d(1.2%, 1%, 0) scale(1.02); }
  }

  @keyframes gridmove {
    0% { background-position: 0 0, 0 0; }
    100% { background-position: 0 420px, 420px 0; }
  }
`;

const Header = styled.header`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  pointer-events: none;
  box-sizing: border-box;
`;

const Button = styled.button`
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fff;
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
  backdrop-filter: blur(6px);
`;

const Title = styled.div`
  font-weight: 900;
  letter-spacing: 0.5px;
  pointer-events: none;
`;

const Layout = styled.div`
  min-height: 100vh;
  padding: 76px 16px 18px;
  display: grid;
  grid-template-columns: 1fr minmax(320px, 520px);
  gap: 18px;
  align-items: start;
  max-width: 1100px;
  margin: 0 auto;
  box-sizing: border-box;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 18px;
  padding: 16px;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
`;

const PanelTitle = styled.div`
  font-weight: 900;
  font-size: 1.1rem;
  margin-bottom: 10px;
`;

const ModeRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
`;

const ModeButton = styled.button`
  flex: 1;
  height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: ${p => (p.$active ? 'rgba(0, 255, 209, 0.18)' : 'rgba(255, 255, 255, 0.08)')};
  color: #fff;
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.08s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const Help = styled.div`
  opacity: 0.9;
  font-size: 0.95rem;
  line-height: 1.35;
  margin-bottom: 14px;
`;

const NumbersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
  gap: 10px;
`;

const NumberTile = styled.button`
  height: 54px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: ${p => (p.$selected ? 'rgba(0, 255, 209, 0.16)' : 'rgba(255, 255, 255, 0.10)')};
  color: #fff;
  font-weight: 900;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.08s ease;
  box-shadow: ${p => (p.$selected ? '0 0 18px rgba(0, 255, 209, 0.20)' : 'none')};

  &:active {
    transform: scale(0.98);
  }
`;

const EquationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EquationRow = styled.div`
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

const Token = styled.div`
  font-weight: 900;
  font-size: 1.35rem;
  opacity: 0.95;
`;

const Blank = styled.button`
  width: 62px;
  height: 52px;
  border-radius: 14px;
  border: 2px solid ${p => (p.$active ? 'rgba(0,255,209,0.75)' : 'rgba(255,255,255,0.18)')};
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-weight: 900;
  font-size: 1.25rem;
  cursor: pointer;
  transition: transform 0.08s ease;
  box-shadow: ${p => (p.$active ? '0 0 14px rgba(0, 255, 209, 0.16)' : 'none')};

  &:active {
    transform: scale(0.98);
  }
`;

const FooterRow = styled.div`
  margin-top: 14px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const SmallButton = styled(Button)`
  padding: 10px 12px;
`;

const Status = styled.div`
  margin-top: 12px;
  font-weight: 800;
  opacity: 0.95;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
  padding: 18px;
  box-sizing: border-box;
`;

const Modal = styled.div`
  width: min(560px, 96vw);
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.16);
  padding: 18px;
  box-sizing: border-box;
`;

const ModalTitle = styled.div`
  font-weight: 950;
  font-size: 1.6rem;
  margin-bottom: 8px;
`;

const ModalText = styled.div`
  opacity: 0.9;
  line-height: 1.35;
  margin-bottom: 14px;
`;

function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function evalOp(a, op, b) {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      return b === 0 ? null : a / b;
    default:
      return null;
  }
}

function isCloseInt(n) {
  if (n === null || Number.isNaN(n)) return false;
  const r = Math.round(n);
  return Math.abs(n - r) < 1e-9;
}

const EASY_TEMPLATES = [
  {
    id: 't1',
    pool: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    equations: [
      { kind: 'simple2', a: 'A', op: '+', b: 'B', res: 17 },
      { kind: 'simple2', a: 'C', op: '×', b: 'D', res: 24 },
      { kind: 'simple2', a: 'E', op: '-', b: 'F', res: 1 },
      { kind: 'simple2', a: 'G', op: '+', b: 'H', res: 13 },
      { kind: 'simple2', a: 'I', op: '-', b: 'J', res: 6 },
      { kind: 'simple2', a: 'K', op: '+', b: 'L', res: 10 }
    ],
    solution: { A: 12, B: 5, C: 8, D: 3, E: 7, F: 6, G: 11, H: 2, I: 10, J: 4, K: 9, L: 1 }
  },
  {
    id: 't2',
    pool: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    equations: [
      { kind: 'simple2', a: 'A', op: '÷', b: 'B', res: 4 },
      { kind: 'simple2', a: 'C', op: '+', b: 'D', res: 15 },
      { kind: 'simple2', a: 'E', op: '×', b: 'F', res: 20 },
      { kind: 'simple2', a: 'G', op: '-', b: 'H', res: 3 },
      { kind: 'simple2', a: 'I', op: '+', b: 'J', res: 13 },
      { kind: 'simple2', a: 'K', op: '×', b: 'L', res: 7 }
    ],
    solution: { A: 12, B: 3, C: 11, D: 4, E: 10, F: 2, G: 9, H: 6, I: 8, J: 5, K: 7, L: 1 }
  }
];

const LETTERS = 'ABCDEFGHIJKL'.split('');

const HARD_TEMPLATES = [
  {
    id: 'h1',
    pool: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    equations: [
      { kind: 'paren3', a: 'A', op1: '+', b: 'B', op2: '×', c: 'C', res: 44 },
      { kind: 'paren3', a: 'D', op1: '×', b: 'E', op2: '-', c: 'F', res: 65 },
      { kind: 'paren3', a: 'G', op1: '+', b: 'H', op2: '÷', c: 'I', res: 6 },
      { kind: 'paren3', a: 'J', op1: '-', b: 'K', op2: '×', c: 'L', res: 45 }
    ],
    solution: { A: 10, B: 1, C: 4, D: 9, E: 8, F: 7, G: 12, H: 6, I: 3, J: 11, K: 2, L: 5 }
  }
];

function buildPuzzle(difficulty) {
  const templates = difficulty === 'hard' ? HARD_TEMPLATES : EASY_TEMPLATES;
  const template = templates[Math.floor(Math.random() * templates.length)];
  const pool = shuffle(template.pool);
  const eqs = template.equations;
  const slots = {};
  for (const k of LETTERS) slots[k] = null;
  return {
    templateId: template.id,
    difficulty,
    pool,
    equations: eqs,
    slots,
    createdAt: Date.now()
  };
}

const SudokuMathGame = ({ onBack }) => {
  const [difficulty, setDifficulty] = useState('easy');
  const [puzzle, setPuzzle] = useState(() => buildPuzzle('easy'));
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [status, setStatus] = useState(null);
  const [showWin, setShowWin] = useState(false);
  const [timeStart, setTimeStart] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const correctSoundRef = useRef(new Audio(`${process.env.PUBLIC_URL}/beep.mp3`));
  const wrongSoundRef = useRef(new Audio(`${process.env.PUBLIC_URL}/beep.mp3`));
  const placeSoundRef = useRef(new Audio(`${process.env.PUBLIC_URL}/beep.mp3`));
  const bgmRef = useRef(new Audio(`${process.env.PUBLIC_URL}/lab1.mp3`));
  const audioRef = useRef({ unlocked: false });

  const poolAvailable = useMemo(() => {
    const used = new Set(Object.values(puzzle.slots).filter(v => v !== null));
    return puzzle.pool.filter(n => !used.has(n));
  }, [puzzle.pool, puzzle.slots]);

  const unlockAudio = () => {
    if (audioRef.current.unlocked) return;
    audioRef.current.unlocked = true;
    const bgm = bgmRef.current;
    bgm.play().catch(() => {});
  };

  useEffect(() => {
    const bgm = bgmRef.current;
    bgm.loop = true;
    bgm.volume = 0.22;
    bgm.playbackRate = 1;

    correctSoundRef.current.volume = 0.12;
    correctSoundRef.current.playbackRate = 1.1;
    wrongSoundRef.current.volume = 0.12;
    wrongSoundRef.current.playbackRate = 0.7;
    placeSoundRef.current.volume = 0.06;
    placeSoundRef.current.playbackRate = 1.6;

    const handler = () => unlockAudio();
    window.addEventListener('pointerdown', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });

    return () => {
      bgm.pause();
      bgm.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - timeStart), 250);
    return () => clearInterval(id);
  }, [timeStart]);

  const resetPuzzle = (nextDifficulty) => {
    const diff = nextDifficulty || difficulty;
    setPuzzle(buildPuzzle(diff));
    setSelectedNumber(null);
    setStatus(null);
    setShowWin(false);
    setTimeStart(Date.now());
    setElapsed(0);
  };

  const clearSlot = (slot) => {
    unlockAudio();
    setPuzzle(prev => ({ ...prev, slots: { ...prev.slots, [slot]: null } }));
    placeSoundRef.current.currentTime = 0;
    placeSoundRef.current.play().catch(() => {});
  };

  const placeNumber = (slot) => {
    unlockAudio();
    if (selectedNumber === null) {
      if (puzzle.slots[slot] !== null) clearSlot(slot);
      return;
    }
    if (!poolAvailable.includes(selectedNumber) && puzzle.slots[slot] !== selectedNumber) return;
    setPuzzle(prev => ({ ...prev, slots: { ...prev.slots, [slot]: selectedNumber } }));
    setSelectedNumber(null);
    placeSoundRef.current.currentTime = 0;
    placeSoundRef.current.play().catch(() => {});
  };

  const validate = () => {
    unlockAudio();
    const slotKeys = Object.keys(puzzle.slots);
    for (const k of slotKeys) {
      if (puzzle.slots[k] === null || typeof puzzle.slots[k] !== 'number') {
        setStatus('Faltan huecos por rellenar.');
        wrongSoundRef.current.currentTime = 0;
        wrongSoundRef.current.play().catch(() => {});
        return;
      }
    }

    const used = new Set();
    for (const k of slotKeys) {
      const v = puzzle.slots[k];
      if (used.has(v)) {
        setStatus('Hay números repetidos. Cada número solo se puede usar una vez.');
        wrongSoundRef.current.currentTime = 0;
        wrongSoundRef.current.play().catch(() => {});
        return;
      }
      used.add(v);
    }

    for (const eq of puzzle.equations) {
      let out = null;
      if (eq.kind === 'simple2') {
        const a = puzzle.slots[eq.a];
        const b = puzzle.slots[eq.b];
        out = evalOp(a, eq.op, b);
      } else if (eq.kind === 'paren3') {
        const a = puzzle.slots[eq.a];
        const b = puzzle.slots[eq.b];
        const c = puzzle.slots[eq.c];
        const left = evalOp(a, eq.op1, b);
        out = left === null ? null : evalOp(left, eq.op2, c);
      }
      if (out === null || !isCloseInt(out) || Math.round(out) !== eq.res) {
        setStatus('Alguna operación no cuadra. Revisa los huecos.');
        wrongSoundRef.current.currentTime = 0;
        wrongSoundRef.current.play().catch(() => {});
        return;
      }
    }

    setStatus(null);
    correctSoundRef.current.currentTime = 0;
    correctSoundRef.current.play().catch(() => {});
    setShowWin(true);
  };

  return (
    <GameContainer>
      <FXLayer />
      <Header>
        <Button onClick={onBack}><FaArrowLeft /> Salir</Button>
        <Title>Sudoku Math</Title>
        <div style={{ width: 120, pointerEvents: 'none' }} />
      </Header>

      <Layout>
        <Panel>
          <PanelTitle>Números</PanelTitle>
          <ModeRow>
            <ModeButton
              $active={difficulty === 'easy'}
              onClick={() => {
                unlockAudio();
                setDifficulty('easy');
                resetPuzzle('easy');
              }}
            >
              Fácil
            </ModeButton>
            <ModeButton
              $active={difficulty === 'hard'}
              onClick={() => {
                unlockAudio();
                setDifficulty('hard');
                resetPuzzle('hard');
              }}
            >
              Difícil
            </ModeButton>
          </ModeRow>
          <Help>
            Selecciona un número y tócala/clic en un hueco para ponerlo.
            Cada número solo se puede usar una vez.
          </Help>
          <NumbersGrid>
            {poolAvailable.map(n => (
              <NumberTile
                key={n}
                $selected={selectedNumber === n}
                onClick={() => {
                  unlockAudio();
                  setSelectedNumber(prev => (prev === n ? null : n));
                }}
              >
                {n}
              </NumberTile>
            ))}
          </NumbersGrid>
          <FooterRow>
            <SmallButton onClick={validate}>Comprobar</SmallButton>
            <SmallButton onClick={() => resetPuzzle()}>Nuevo</SmallButton>
            <SmallButton onClick={() => {
              unlockAudio();
              setSelectedNumber(null);
              setStatus(null);
            }}>Cancelar selección</SmallButton>
          </FooterRow>
          <Status>
            Modo: {difficulty === 'hard' ? 'Difícil (paréntesis)' : 'Fácil'} · Tiempo: {Math.floor(elapsed / 1000)}s{status ? ` · ${status}` : ''}
          </Status>
        </Panel>

        <Panel>
          <PanelTitle>Operaciones</PanelTitle>
          <Help>
            Completa los huecos para que todas las operaciones sean correctas.
          </Help>
          <EquationList>
            {puzzle.equations.map((eq, idx) => (
              <EquationRow key={`${puzzle.createdAt}_${idx}`}>
                {eq.kind === 'simple2' ? (
                  <>
                    <Blank $active={selectedNumber !== null} onClick={() => placeNumber(eq.a)}>
                      {puzzle.slots[eq.a] ?? ''}
                    </Blank>
                    <Token>{eq.op}</Token>
                    <Blank $active={selectedNumber !== null} onClick={() => placeNumber(eq.b)}>
                      {puzzle.slots[eq.b] ?? ''}
                    </Blank>
                    <Token>=</Token>
                    <Token>{eq.res}</Token>
                  </>
                ) : (
                  <>
                    <Token>(</Token>
                    <Blank $active={selectedNumber !== null} onClick={() => placeNumber(eq.a)}>
                      {puzzle.slots[eq.a] ?? ''}
                    </Blank>
                    <Token>{eq.op1}</Token>
                    <Blank $active={selectedNumber !== null} onClick={() => placeNumber(eq.b)}>
                      {puzzle.slots[eq.b] ?? ''}
                    </Blank>
                    <Token>)</Token>
                    <Token>{eq.op2}</Token>
                    <Blank $active={selectedNumber !== null} onClick={() => placeNumber(eq.c)}>
                      {puzzle.slots[eq.c] ?? ''}
                    </Blank>
                    <Token>=</Token>
                    <Token>{eq.res}</Token>
                  </>
                )}
              </EquationRow>
            ))}
          </EquationList>
          <Help style={{ marginTop: 14 }}>
            Si te equivocas, toca/clic en un hueco con número (sin selección) para devolverlo a la lista.
          </Help>
        </Panel>
      </Layout>

      {showWin && (
        <Overlay>
          <Modal>
            <ModalTitle>¡Perfecto!</ModalTitle>
            <ModalText>
              Has completado el Sudoku Math en {Math.floor(elapsed / 1000)} segundos.
            </ModalText>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button onClick={() => resetPuzzle()}>Nuevo puzzle</Button>
              <Button onClick={() => { unlockAudio(); setShowWin(false); }}>Seguir viendo</Button>
            </div>
          </Modal>
        </Overlay>
      )}
    </GameContainer>
  );
};

export default SudokuMathGame;
