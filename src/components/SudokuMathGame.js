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

// Reproducir un sonido sin que rompa el juego: en algunos navegadores y en
// las pruebas play() no devuelve una promesa, y un fallo de audio no puede
// tumbar una partida.
const sonar = (audio) => {
  try {
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch (e) {
    // sin audio, seguimos
  }
};

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

const LETTERS = 'ABCDEFGHIJKL'.split('');

// Las parejas (fácil) y los tríos (difícil) de letras que forman las
// operaciones. Cada letra sale en una sola operación, así que lo que ata las
// cuentas entre sí es la regla de "cada número se usa una vez".
const PARES = [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H'], ['I', 'J'], ['K', 'L']];
const TRIOS = [['A', 'B', 'C'], ['D', 'E', 'F'], ['G', 'H', 'I'], ['J', 'K', 'L']];

const OPS_SIMPLE = ['+', '-', '×'];
const OPS_IZQ = ['+', '-'];
const OPS_DER = ['+', '-', '×', '÷'];

// El resultado tiene que ser un entero que se pueda escribir en la caja: sin
// negativos y sin decimales, y no más de dos cifras.
const RESULTADO_VALIDO = (n) => n !== null && Number.isInteger(n) && n >= 0 && n <= 99;

// Evalúa una operación de dos y de tres números. En las de tres se evalúa de
// izquierda a derecha, que es como se muestran en pantalla: "( A + B ) × C".
const evaluar = (a, op, b, op2, c) => {
  const izq = evalOp(a, op, b);
  if (izq === null) return null;
  if (op2 === undefined) return izq;
  return evalOp(izq, op2, c);
};

// Arma una partida: reparte 1..12 entre las letras y escribe las operaciones
// con esos mismos números. Así la partida **siempre tiene solución** —la que
// sale de ese reparto— en vez de depender de una plantilla guardada.
export function buildPuzzle(difficulty) {
  const pool = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const solution = {};
  LETTERS.forEach((letra, i) => { solution[letra] = pool[i]; });

  const equations = [];
  if (difficulty === 'hard') {
    for (const [a, b, c] of TRIOS) {
      let elegido = null;
      for (let intento = 0; intento < 40 && !elegido; intento++) {
        const op1 = OPS_IZQ[Math.floor(Math.random() * OPS_IZQ.length)];
        const op2 = OPS_DER[Math.floor(Math.random() * OPS_DER.length)];
        const res = evaluar(solution[a], op1, solution[b], op2, solution[c]);
        if (RESULTADO_VALIDO(res)) elegido = { kind: 'paren3', a, op1, b, op2, c, res };
      }
      // Si ninguna combinación sale limpia (poco probable), la suma siempre
      // sirve: 12 + 12 + 12 es un entero de dos cifras.
      equations.push(
        elegido || { kind: 'paren3', a, op1: '+', b, op2: '+', c, res: solution[a] + solution[b] + solution[c] }
      );
    }
  } else {
    for (const [a, b] of PARES) {
      let elegido = null;
      for (let intento = 0; intento < 40 && !elegido; intento++) {
        const op = OPS_SIMPLE[Math.floor(Math.random() * OPS_SIMPLE.length)];
        const res = evaluar(solution[a], op, solution[b]);
        if (RESULTADO_VALIDO(res)) elegido = { kind: 'simple2', a, op, b, res };
      }
      equations.push(
        elegido || { kind: 'simple2', a, op: '+', b, res: solution[a] + solution[b] }
      );
    }
  }

  const slots = {};
  for (const k of LETTERS) slots[k] = null;
  return {
    templateId: 'generada',
    difficulty,
    pool,
    equations,
    solution,
    slots,
    createdAt: Date.now()
  };
}

// Cuánto vale una operación con lo que hay puesto ahora mismo.
export const valorEcuacion = (eq, slots) => {
  if (eq.kind === 'simple2') return evalOp(slots[eq.a], eq.op, slots[eq.b]);
  const izq = evalOp(slots[eq.a], eq.op1, slots[eq.b]);
  return izq === null ? null : evalOp(izq, eq.op2, slots[eq.c]);
};

// Cómo se escribe una operación con los números que hay puestos ahora mismo.
const describirEcuacion = (eq, slots) => {
  if (eq.kind === 'simple2') return `${slots[eq.a]} ${eq.op} ${slots[eq.b]}`;
  return `(${slots[eq.a]} ${eq.op1} ${slots[eq.b]}) ${eq.op2} ${slots[eq.c]}`;
};

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
    sonar(bgm);
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
    sonar(placeSoundRef.current);
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
    sonar(placeSoundRef.current);
  };

  const validate = () => {
    unlockAudio();
    const slotKeys = Object.keys(puzzle.slots);
    for (const k of slotKeys) {
      if (puzzle.slots[k] === null || typeof puzzle.slots[k] !== 'number') {
        setStatus('Faltan huecos por rellenar.');
        wrongSoundRef.current.currentTime = 0;
        sonar(wrongSoundRef.current);
        return;
      }
    }

    const used = new Set();
    for (const k of slotKeys) {
      const v = puzzle.slots[k];
      if (used.has(v)) {
        setStatus('Hay números repetidos. Cada número solo se puede usar una vez.');
        wrongSoundRef.current.currentTime = 0;
        sonar(wrongSoundRef.current);
        return;
      }
      used.add(v);
    }

    // Se revisa operación por operación y se dice cuál falla y por qué: un
    // "alguna operación no cuadra" deja al niño pensando que la partida es
    // imposible, cuando lo que falla es una casilla concreta.
    for (let i = 0; i < puzzle.equations.length; i++) {
      const eq = puzzle.equations[i];
      const out = valorEcuacion(eq, puzzle.slots);
      if (out === null || !isCloseInt(out) || Math.round(out) !== eq.res) {
        const hecho = describirEcuacion(eq, puzzle.slots);
        const obtenu = out === null || !isCloseInt(out) ? 'no da un número entero' : `da ${Math.round(out)}`;
        setStatus(`La ${i + 1}.ª operación no cuadra: ${hecho} ${obtenu}, y el resultado pone ${eq.res}.`);
        wrongSoundRef.current.currentTime = 0;
        sonar(wrongSoundRef.current);
        return;
      }
    }

    setStatus(null);
    correctSoundRef.current.currentTime = 0;
    sonar(correctSoundRef.current);
    setShowWin(true);
  };

  // La pista rellena una casilla de la primera operación que no cuadra. La
  // partida se genera con su solución, así que el valor siempre es el bueno.
  const darPista = () => {
    unlockAudio();
    const { solution, slots, equations } = puzzle;
    let letra = null;
    for (const eq of equations) {
      const letras = [eq.a, eq.b, eq.c].filter(Boolean);
      const out = valorEcuacion(eq, slots);
      const falla = out === null || !isCloseInt(out) || Math.round(out) !== eq.res;
      if (!falla) continue;
      letra = letras.find((l) => slots[l] === null) || letras[0];
      break;
    }
    if (!letra) {
      // Si todas cuadran, se ayuda con la primera casilla vacía.
      letra = Object.keys(slots).find((k) => slots[k] === null);
    }
    if (!letra) return;
    setPuzzle(prev => ({ ...prev, slots: { ...prev.slots, [letra]: solution[letra] } }));
    setStatus(`Pista: en la casilla ${letra} va el ${solution[letra]}.`);
    placeSoundRef.current.currentTime = 0;
    sonar(placeSoundRef.current);
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
                aria-label={`Número ${n}`}
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
            <SmallButton onClick={darPista}>💡 Pista</SmallButton>
            <SmallButton onClick={() => resetPuzzle()}>Nuevo</SmallButton>
            <SmallButton onClick={() => {
              unlockAudio();
              setSelectedNumber(null);
              setStatus(null);
            }}>Cancelar selección</SmallButton>
          </FooterRow>
          <Status role="status" aria-live="polite">
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
                    <Blank aria-label={`Hueco ${eq.a}`} $active={selectedNumber !== null} onClick={() => placeNumber(eq.a)}>
                      {puzzle.slots[eq.a] ?? ''}
                    </Blank>
                    <Token>{eq.op}</Token>
                    <Blank aria-label={`Hueco ${eq.b}`} $active={selectedNumber !== null} onClick={() => placeNumber(eq.b)}>
                      {puzzle.slots[eq.b] ?? ''}
                    </Blank>
                    <Token>=</Token>
                    <Token>{eq.res}</Token>
                  </>
                ) : (
                  <>
                    <Token>(</Token>
                    <Blank aria-label={`Hueco ${eq.a}`} $active={selectedNumber !== null} onClick={() => placeNumber(eq.a)}>
                      {puzzle.slots[eq.a] ?? ''}
                    </Blank>
                    <Token>{eq.op1}</Token>
                    <Blank aria-label={`Hueco ${eq.b}`} $active={selectedNumber !== null} onClick={() => placeNumber(eq.b)}>
                      {puzzle.slots[eq.b] ?? ''}
                    </Blank>
                    <Token>)</Token>
                    <Token>{eq.op2}</Token>
                    <Blank aria-label={`Hueco ${eq.c}`} $active={selectedNumber !== null} onClick={() => placeNumber(eq.c)}>
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
