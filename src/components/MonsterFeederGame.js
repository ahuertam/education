import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';
import {
  generateProblem as makeProblem,
  SMALL_PROFILE,
} from '../utils/problemGenerator';

// La hoja public/moster2.png mide 361×300: cuatro columnas y tres filas de
// celdas de 90,25 × 100 px, con fondo transparente.
//
//   fila 0 → el monstruo: idle, open, happy, sad
//   fila 1 → manzana, plátano, galleta, galleta
//   fila 2 → donut, helado, donut, pizza
//
// La celda se recorta a su tamaño natural y luego se amplía 1,5× por CSS, que
// es lo que la deja con el tamaño que tenía en pantalla (135 × 150).
const CELDA_W = 90.25;
const CELDA_H = 100;
const ESCALA = 1.5;

// Las seis comidas que se usan, en orden de lectura de la hoja. Se saltan la
// segunda galleta y el donut azul para que las seis sean distintas.
export const COMIDAS = [
  { col: 0, row: 1 }, // manzana
  { col: 1, row: 1 }, // plátano
  { col: 2, row: 1 }, // galleta
  { col: 0, row: 2 }, // donut
  { col: 1, row: 2 }, // helado
  { col: 3, row: 2 }, // pizza
];

export { CELDA_W, CELDA_H };

const GameContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
`;

const Header = styled.header`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  z-index: 10;
  pointer-events: none;
`;

const Button = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid #FF6B6B;
  color: #FF6B6B;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  pointer-events: auto;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  
  &:hover {
    background: #FF6B6B;
    color: white;
    transform: scale(1.05);
  }
`;

const Score = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: #FF6B6B;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  border: 3px solid #FF6B6B;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
`;

const ProblemDisplay = styled.div`
  position: absolute;
  top: 6%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 3rem;
  font-weight: bold;
  color: #4A90E2;
  background: white;
  padding: 1rem 2rem;
  border-radius: 20px;
  border: 4px solid #4A90E2;
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
  z-index: 5;
`;

const MonsterContainer = styled.div`
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 300px;
  z-index: 4;
`;

const MonsterSprite = styled.img`
  position: absolute;
  bottom: 24px;
  left: 50%;
  width: ${CELDA_W}px;
  height: ${CELDA_H}px;
  object-fit: none;
  object-position: ${props => {
    const col = {
      idle: 0,
      open: 1,
      happy: 2,
      sad: 3
    }[props.$state] || 0;
    return `${-col * CELDA_W}px 0px`;
  }};
  transform: translateX(-50%) scale(${ESCALA});
  transform-origin: center bottom;
  image-rendering: auto;
`;

const FoodContainer = styled.div`
  position: absolute;
  bottom: 42%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  padding: 0 2rem;
  z-index: 3;
`;

const FoodSpriteWrapper = styled.div`
  --celda-w: clamp(92px, 13vw, 135px);
  --celda-h: calc(var(--celda-w) * ${(CELDA_H / CELDA_W).toFixed(4)});
  width: var(--celda-w);
  height: var(--celda-h);
  cursor: ${props => props.$isDragging ? 'grabbing' : 'grab'};
  user-select: none;
  transition: transform 0.2s, opacity 0.2s;
  touch-action: none;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.3));
  position: relative;
  opacity: ${props => props.$isDragging ? 0.5 : 1};

  &:hover {
    transform: scale(1.15) rotate(5deg);
  }

  &:active {
    transform: scale(0.95);
  }
`;

// La comida se recorta con la misma hoja que el monstruo, pero como fondo
// escalado: así la casilla se dibuja al tamaño que toque en cada pantalla y
// las seis caben siempre en una fila.
const FoodSprite = styled.div`
  --celda-w: clamp(92px, 13vw, 135px);
  --celda-h: calc(var(--celda-w) * ${(CELDA_H / CELDA_W).toFixed(4)});
  width: var(--celda-w);
  height: var(--celda-h);
  background-image: url(${process.env.PUBLIC_URL}/moster2.png);
  background-repeat: no-repeat;
  background-size: calc(var(--celda-w) * 4) calc(var(--celda-h) * 3);
  background-position: ${props => {
    const comida = COMIDAS[props.$foodType % COMIDAS.length];
    return `calc(var(--celda-w) * ${-comida.col}) calc(var(--celda-h) * ${-comida.row})`;
  }};
  pointer-events: none;
`;

const FoodNumber = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border: 3px solid #333;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const Feedback = styled.div`
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%) scale(${props => props.$show ? 1 : 0});
  font-size: 4rem;
  font-weight: bold;
  color: ${props => props.$isCorrect ? '#2ECC71' : '#E74C3C'};
  text-shadow: 0 4px 8px rgba(0,0,0,0.3);
  z-index: 20;
  transition: transform 0.3s ease;
  pointer-events: none;
`;

const MenuOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.98);
  padding: 2rem;
  border-radius: 30px;
  text-align: center;
  z-index: 25;
  box-shadow: 0 15px 30px rgba(0,0,0,0.3);
  border: 5px solid #9B59B6;
`;

const StartButton = styled(Button)`
  font-size: 1.5rem;
  padding: 1rem 2rem;
  margin-top: 1rem;
  background: #9B59B6;
  color: white;
  border-color: #7D3C98;
  
  &:hover {
    background: #7D3C98;
  }
`;

const MonsterFeederGame = ({ onBack, operation = 'multiplication', multiplicationConfig = null }) => {
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('menu'); // menu, playing
  const [currentProblem, setCurrentProblem] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [monsterState, setMonsterState] = useState('idle'); // idle, open, happy, sad
  const [feedback, setFeedback] = useState({ show: false, isCorrect: false });
  const [draggingId, setDraggingId] = useState(null);

  const generateProblem = useCallback(() => {
    const { a, b, answer, operator } = makeProblem({
      operation,
      profile: SMALL_PROFILE,
      multiplicationConfig,
    });

    return {
      text: `${a} ${operator} ${b}`,
      answer
    };
  }, [operation, multiplicationConfig]);

  const generateFoodItems = useCallback((problem) => {
    const items = [];
    const answers = new Set([problem.answer]);
    
    // Generate 5 wrong answers.
    // The spread scales with the answer: with tables up to 20 and 3-digit
    // multiplicands the answer can be ~20000, so a fixed ±5 window can never
    // produce a distinct value and the loop never terminates.
    const spread = Math.max(5, Math.round(problem.answer * 0.1));
    let attempts = 0;
    while (answers.size < 6 && attempts < 100) {
      attempts++;
      const wrong = problem.answer + Math.floor(Math.random() * spread * 2) - spread;
      if (wrong >= 0 && wrong !== problem.answer) {
        answers.add(wrong);
      }
    }

    const answersArray = Array.from(answers).sort(() => Math.random() - 0.5);
    answersArray.forEach((num, idx) => {
      items.push({
        id: idx,
        number: num,
        foodType: idx, // Use idx to determine sprite
        isCorrect: num === problem.answer
      });
    });

    return items;
  }, []);

  const startGame = () => {
    const problem = generateProblem();
    setCurrentProblem(problem);
    setFoodItems(generateFoodItems(problem));
    setScore(0);
    setGameState('playing');
    setMonsterState('idle');
  };

  const handleDragStart = (e, item) => {
    setDraggingId(item.id);
    setMonsterState('open');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', item.id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setTimeout(() => setMonsterState('idle'), 300);
  };

  // Resuelve la respuesta: acierta, falla y programa la siguiente ronda. Lo
  // usan tanto el arrastre con ratón como el de dedo, que antes tenían la
  // lógica duplicada y podían divergir.
  const resolveAnswer = useCallback((item) => {
    if (!item) return;

    if (item.isCorrect) {
      setMonsterState('happy');
      setFeedback({ show: true, isCorrect: true });
      setScore(s => s + 10);

      setTimeout(() => {
        setFeedback({ show: false, isCorrect: false });
        setMonsterState('idle');
        const newProblem = generateProblem();
        setCurrentProblem(newProblem);
        setFoodItems(generateFoodItems(newProblem));
      }, 1500);
    } else {
      setMonsterState('sad');
      setFeedback({ show: true, isCorrect: false });
      setScore(s => Math.max(0, s - 2));

      setTimeout(() => {
        setFeedback({ show: false, isCorrect: false });
        setMonsterState('idle');
      }, 1500);
    }

    setDraggingId(null);
  }, [generateProblem, generateFoodItems]);

  const handleDrop = (e) => {
    e.preventDefault();
    resolveAnswer(foodItems.find(f => f.id === draggingId));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Touch support
  const handleTouchStart = (e, item) => {
    setDraggingId(item.id);
    setMonsterState('open');
  };

  const handleTouchEnd = (e, item) => {
    if (!item) {
      setDraggingId(null);
      setMonsterState('idle');
      return;
    }
    resolveAnswer(item);
  };

  return (
    <GameContainer>
      <Header>
        <Button onClick={onBack}><FaArrowLeft /> Salir</Button>
        <Score>⭐ {score}</Score>
      </Header>

      {gameState === 'menu' && (
        <MenuOverlay>
          <h1 style={{ color: '#9B59B6', marginBottom: '1rem', fontSize: '2.5rem' }}>🍽️ Alimenta al Monstruo</h1>
          <p style={{ fontSize: '1.2rem', color: '#555' }}>Arrastra la comida correcta a la boca del monstruo</p>
          {operation === 'multiplication' && multiplicationConfig && multiplicationConfig.tables && multiplicationConfig.tables.length > 0 && (
            <p style={{ fontSize: '0.9rem', color: '#777', marginTop: '0.5rem' }}>
              Tablas: {multiplicationConfig.tables.join(', ')} ·{' '}
              {multiplicationConfig.digitMode === 1 ? '1 cifra' :
               multiplicationConfig.digitMode === 2 ? '2 cifras' : '3 cifras'}
            </p>
          )}
          <StartButton onClick={startGame}>¡Jugar!</StartButton>
        </MenuOverlay>
      )}

      {gameState === 'playing' && currentProblem && (
        <>
          <ProblemDisplay>{currentProblem.text} = ?</ProblemDisplay>

          <MonsterContainer
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <MonsterSprite 
              src={`${process.env.PUBLIC_URL}/moster2.png`}
              $state={monsterState}
              alt="Monster"
            />
          </MonsterContainer>

          <FoodContainer>
            {foodItems.map(item => (
              <FoodSpriteWrapper
                key={item.id}
                $isDragging={draggingId === item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(e, item)}
                onTouchEnd={(e) => handleTouchEnd(e, item)}
              >
                <FoodSprite
                  $foodType={item.foodType}
                  aria-hidden="true"
                />
                <FoodNumber>{item.number}</FoodNumber>
              </FoodSpriteWrapper>
            ))}
          </FoodContainer>

          <Feedback $show={feedback.show} $isCorrect={feedback.isCorrect}>
            {feedback.show ? (feedback.isCorrect ? '¡Correcto! 😋' : '¡Ups! 😢') : ''}
          </Feedback>
        </>
      )}
    </GameContainer>
  );
};

export default MonsterFeederGame;
