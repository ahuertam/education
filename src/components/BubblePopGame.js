import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';

const floatAnimation = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const popAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.8; }
  100% { transform: scale(0); opacity: 0; }
`;

const GameContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #006994 0%, #003366 100%);
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
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  pointer-events: auto;
  backdrop-filter: blur(5px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Score = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

const ProblemContainer = styled.div`
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 3.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 10px rgba(255,255,255,0.5);
  z-index: 5;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem 3rem;
  border-radius: 50px;
  backdrop-filter: blur(5px);
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

const Bubble = styled.div`
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.2) 20%, rgba(255, 255, 255, 0.1) 60%, rgba(255, 255, 255, 0.4) 100%);
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  left: ${props => props.left}%;
  bottom: ${props => props.bottom}%;
  transition: transform 0.1s;
  
  &::after {
    content: '';
    position: absolute;
    top: 15%;
    left: 20%;
    width: 15px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8);
    transform: rotate(-45deg);
  }

  &:hover {
    transform: scale(1.1);
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.3) 20%, rgba(255, 255, 255, 0.2) 60%, rgba(255, 255, 255, 0.5) 100%);
  }
`;

const BubbleNumber = styled.span`
  font-size: 2rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
`;

const PopEffect = styled.div`
  position: absolute;
  left: ${props => props.left}%;
  bottom: ${props => props.bottom}%;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
  transform: translate(-10px, 10px);
  animation: ${popAnimation} 0.3s ease-out forwards;
  pointer-events: none;
`;

const DifficultyMenu = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  z-index: 20;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  border: 4px solid #00BCD4;
`;

const DifficultyButton = styled.button`
  display: block;
  width: 100%;
  margin: 1rem 0;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border: none;
  border-radius: 15px;
  color: white;
  cursor: pointer;
  background: ${props => props.color || '#2196F3'};
  transition: transform 0.2s;
  font-weight: bold;

  &:hover {
    transform: scale(1.05);
  }
`;

const BubblePopGame = ({ onBack, operation = 'multiplication' }) => {
  const [score, setScore] = useState(0);
  const [gamePhase, setGamePhase] = useState('menu');
  const [difficulty, setDifficulty] = useState('easy');
  const [currentProblem, setCurrentProblem] = useState(null);
  const [bubbles, setBubbles] = useState([]);
  const [pops, setPops] = useState([]);
  
  const gameLoopRef = useRef();
  const popSound = useRef(new Audio(`${process.env.PUBLIC_URL}/beep.mp3`)); // Using beep as placeholder
  const errorSound = useRef(new Audio(`${process.env.PUBLIC_URL}/beep.mp3`));

  useEffect(() => {
    popSound.current.volume = 0.4;
    popSound.current.playbackRate = 2.0; // Higher pitch for pop
    
    errorSound.current.volume = 0.3;
    errorSound.current.playbackRate = 0.5; // Lower pitch for error
  }, []);

  const generateProblem = () => {
    let a, b, answer, operator;
    let min, max;

    switch(difficulty) {
      case 'hard':
        min = 10; max = 20;
        if (operation === 'addition' || operation === 'subtraction') { min = 20; max = 100; }
        break;
      case 'medium':
        min = 5; max = 12;
        if (operation === 'addition' || operation === 'subtraction') { min = 10; max = 50; }
        break;
      case 'easy':
      default:
        min = 1; max = 9;
        if (operation === 'addition' || operation === 'subtraction') { min = 1; max = 20; }
        break;
    }

    switch(operation) {
      case 'addition':
        a = Math.floor(Math.random() * (max - min + 1)) + min;
        b = Math.floor(Math.random() * (max - min + 1)) + min;
        answer = a + b;
        operator = '+';
        break;
      case 'subtraction':
        a = Math.floor(Math.random() * (max - min + 1)) + min;
        b = Math.floor(Math.random() * (a - min + 1)) + min;
        answer = a - b;
        operator = '-';
        break;
      case 'division':
        b = Math.floor(Math.random() * (max - min + 1)) + min;
        answer = Math.floor(Math.random() * (max - min + 1)) + min;
        a = b * answer;
        operator = '÷';
        break;
      case 'multiplication':
      default:
        a = Math.floor(Math.random() * (max - min + 1)) + min;
        b = Math.floor(Math.random() * (max - min + 1)) + min;
        answer = a * b;
        operator = '×';
        break;
    }

    return {
      operation: `${a} ${operator} ${b}`,
      answer
    };
  };

  const spawnBubble = (problem) => {
    const isCorrect = Math.random() > 0.6; // 40% chance of correct answer
    let number;
    
    if (isCorrect) {
      number = problem.answer;
    } else {
      const range = difficulty === 'easy' ? 5 : 10;
      number = problem.answer + Math.floor(Math.random() * (range * 2)) - range;
      if (number < 0 || number === problem.answer) number = problem.answer + 1;
    }

    return {
      id: Date.now() + Math.random(),
      number,
      left: Math.random() * 90 + 5,
      bottom: -10,
      speed: difficulty === 'easy' ? 0.2 : (difficulty === 'medium' ? 0.4 : 0.6) + Math.random() * 0.2,
      wobbleOffset: Math.random() * 100
    };
  };

  const startGame = () => {
    setScore(0);
    setGamePhase('playing');
    const problem = generateProblem();
    setCurrentProblem(problem);
    setBubbles([]);
    setPops([]);
  };

  const handleDifficultySelect = (diff) => {
    setDifficulty(diff);
    startGame();
  };

  useEffect(() => {
    if (gamePhase !== 'playing') return;

    const loop = setInterval(() => {
      setBubbles(prev => {
        // Spawn new bubbles
        if (prev.length < 8 && Math.random() < 0.05) {
          return [...prev, spawnBubble(currentProblem)];
        }

        // Move existing bubbles
        return prev
          .map(b => ({
            ...b,
            bottom: b.bottom + b.speed,
            left: b.left + Math.sin((b.bottom + b.wobbleOffset) * 0.05) * 0.2
          }))
          .filter(b => b.bottom < 110); // Remove bubbles that go off screen
      });
    }, 16);

    gameLoopRef.current = loop;
    return () => clearInterval(loop);
  }, [gamePhase, currentProblem, difficulty]);

  const handleBubbleClick = (bubble) => {
    if (bubble.number === currentProblem.answer) {
      // Correct
      popSound.current.currentTime = 0;
      popSound.current.play().catch(e => {});
      setScore(s => s + 10);
      
      // Show pop effect
      setPops(prev => [...prev, { id: Date.now(), left: bubble.left, bottom: bubble.bottom }]);
      setTimeout(() => setPops(prev => prev.slice(1)), 500);

      // Remove bubble
      setBubbles(prev => prev.filter(b => b.id !== bubble.id));

      // Generate new problem occasionally
      if (Math.random() > 0.5) {
        setCurrentProblem(generateProblem());
      }
    } else {
      // Incorrect
      errorSound.current.currentTime = 0;
      errorSound.current.play().catch(e => {});
      setScore(s => Math.max(0, s - 5));
    }
  };

  return (
    <GameContainer>
      <Header>
        <Button onClick={onBack}><FaArrowLeft /> Salir</Button>
        <Score>Puntos: {score}</Score>
      </Header>

      {gamePhase === 'menu' && (
        <DifficultyMenu>
          <h2 style={{ color: '#0097A7' }}>🎈 Pop de Burbujas</h2>
          <p>Explota las burbujas con la respuesta correcta</p>
          <DifficultyButton color="#4CAF50" onClick={() => handleDifficultySelect('easy')}>
            Fácil
          </DifficultyButton>
          <DifficultyButton color="#FF9800" onClick={() => handleDifficultySelect('medium')}>
            Medio
          </DifficultyButton>
          <DifficultyButton color="#F44336" onClick={() => handleDifficultySelect('hard')}>
            Difícil
          </DifficultyButton>
        </DifficultyMenu>
      )}

      {gamePhase === 'playing' && currentProblem && (
        <>
          <ProblemContainer>
            {currentProblem.operation} = ?
          </ProblemContainer>

          {bubbles.map(bubble => (
            <Bubble 
              key={bubble.id}
              left={bubble.left}
              bottom={bubble.bottom}
              onClick={() => handleBubbleClick(bubble)}
            >
              <BubbleNumber>{bubble.number}</BubbleNumber>
            </Bubble>
          ))}

          {pops.map(pop => (
            <PopEffect key={pop.id} left={pop.left} bottom={pop.bottom} />
          ))}
        </>
      )}
    </GameContainer>
  );
};

export default BubblePopGame;
