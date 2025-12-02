import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaArrowLeft, FaFrog } from 'react-icons/fa';

const jumpAnimation = keyframes`
  0% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-100px) scale(1.1); }
  100% { transform: translateY(0) scale(1); }
`;

const splashAnimation = keyframes`
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
`;

const GameContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #87CEEB 0%, #E0F7FA 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
`;

const Water = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 40%;
  background: #2196F3;
  opacity: 0.8;
  z-index: 1;
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
  background: white;
  border: none;
  color: #2196F3;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  pointer-events: auto;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0,0,0,0.15);
  }
`;

const Score = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1565C0;
  background: rgba(255, 255, 255, 0.8);
  padding: 0.5rem 1rem;
  border-radius: 20px;
`;

const ProblemContainer = styled.div`
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 4rem;
  font-weight: bold;
  color: #1565C0;
  text-shadow: 2px 2px 0px white;
  z-index: 5;
`;

const jumpToPad = (targetLeft) => keyframes`
  0% { left: 50%; bottom: 30%; transform: scale(1); }
  50% { left: ${(50 + targetLeft) / 2}%; bottom: 60%; transform: scale(1.2); }
  100% { left: ${targetLeft}%; bottom: 20%; transform: scale(1); }
`;

const fallToWater = (targetLeft) => keyframes`
  0% { left: 50%; bottom: 30%; transform: scale(1); }
  50% { left: ${(50 + targetLeft) / 2}%; bottom: 50%; transform: scale(1.1); }
  100% { left: ${targetLeft}%; bottom: 5%; transform: scale(0.8); }
`;

const Rock = styled.div`
  position: absolute;
  bottom: 27%;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 60px;
  background: #795548;
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  box-shadow: inset -10px -5px 20px rgba(0,0,0,0.4);
  z-index: 3;
  
  &::after {
    content: '';
    position: absolute;
    top: 10%;
    left: 20%;
    width: 80%;
    height: 40%;
    background: #8D6E63;
    border-radius: 50%;
    opacity: 0.5;
  }
`;

const Frog = styled.div`
  position: absolute;
  bottom: 30%; /* Adjusted to sit on rock */
  left: 50%;
  transform: translateX(-50%);
  font-size: 4rem;
  color: #4CAF50;
  z-index: 5;
  ${props => props.$jumping && css`
    animation: ${jumpToPad(props.$targetLeft)} 0.5s ease-in-out forwards;
  `}
  ${props => props.$falling && css`
    animation: ${fallToWater(props.$targetLeft)} 0.5s ease-in-out forwards;
  `}
`;

const LilyPadContainer = styled.div`
  position: absolute;
  bottom: 20%;
  width: 100%;
  height: 60px;
  z-index: 2;
`;

const LilyPadWrapper = styled.div`
  position: absolute;
  left: ${props => props.left}%;
  transform: translateX(-50%);
  bottom: 0;
`;

const LilyPad = styled.div`
  width: 120px;
  height: 40px;
  background: #81C784;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.2s;
  box-shadow: 0 5px 0 #388E3C;

  &::after {
    content: '';
    position: absolute;
    top: 5px;
    left: 10px;
    width: 100px;
    height: 30px;
    background: #66BB6A;
    border-radius: 50%;
  }

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
    box-shadow: 0 2px 0 #388E3C;
    top: 3px;
  }
`;

const Number = styled.span`
  position: relative;
  z-index: 2;
  font-size: 2rem;
  font-weight: bold;
  color: #1B5E20;
`;

const Splash = styled.div`
  position: absolute;
  width: 50px;
  height: 50px;
  border: 4px solid white;
  border-radius: 50%;
  left: ${props => props.left}%;
  bottom: 20%;
  animation: ${splashAnimation} 0.5s ease-out forwards;
`;

const DifficultyMenu = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  z-index: 20;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  border: 4px solid #4CAF50;
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

const POSITIONS = [20, 50, 80];

const FrogEye = styled.div`
  position: absolute;
  top: 8px;
  right: 15px;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  z-index: 6;
  
  &::after {
    content: '';
    position: absolute;
    top: 3px;
    right: 3px;
    width: 6px;
    height: 6px;
    background: black;
    border-radius: 50%;
  }
`;

const SplashDroplet = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: ${splashAnimation} 0.5s ease-out forwards;
  
  &:nth-child(1) { left: 0; animation-delay: 0s; transform: translate(-10px, -10px); }
  &:nth-child(2) { left: 20px; animation-delay: 0.1s; transform: translate(0, -20px); }
  &:nth-child(3) { left: 40px; animation-delay: 0s; transform: translate(10px, -10px); }
`;

const EnhancedSplash = ({ left }) => (
  <div style={{ position: 'absolute', left: `${left}%`, bottom: '20%', width: 50, height: 50 }}>
    <Splash left={0} />
    <SplashDroplet />
    <SplashDroplet />
    <SplashDroplet />
  </div>
);

const FrogJumpGame = ({ onBack, operation = 'multiplication' }) => {
  const [score, setScore] = useState(0);
  const [gamePhase, setGamePhase] = useState('menu');
  const [difficulty, setDifficulty] = useState('easy');
  const [currentProblem, setCurrentProblem] = useState(null);
  const [animationState, setAnimationState] = useState('idle'); // idle, jumping, falling
  const [targetLeft, setTargetLeft] = useState(50);
  const [splash, setSplash] = useState(null);
  
  const correctSound = useRef(new Audio(`${process.env.PUBLIC_URL}/beep.mp3`));
  const errorSound = useRef(new Audio(`${process.env.PUBLIC_URL}/beep.mp3`));
  const splashSound = useRef(new Audio(`${process.env.PUBLIC_URL}/splash.mp3`)); // Placeholder

  useEffect(() => {
    errorSound.current.playbackRate = 0.5;
    errorSound.current.volume = 0.3;
    correctSound.current.volume = 0.5;
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

    const options = new Set([answer]);
    while(options.size < 3) {
      const range = difficulty === 'easy' ? 5 : 10;
      const distractor = answer + Math.floor(Math.random() * (range * 2)) - range;
      if (distractor >= 0 && distractor !== answer) options.add(distractor);
    }

    return {
      operation: `${a} ${operator} ${b}`,
      answer,
      options: Array.from(options).sort(() => Math.random() - 0.5)
    };
  };

  const startGame = () => {
    setScore(0);
    setGamePhase('playing');
    setCurrentProblem(generateProblem());
    setAnimationState('idle');
  };

  const handleDifficultySelect = (diff) => {
    setDifficulty(diff);
    startGame();
  };

  const handleAnswer = (selectedAnswer, index) => {
    if (animationState !== 'idle') return;

    const targetPos = POSITIONS[index];
    setTargetLeft(targetPos);

    if (selectedAnswer === currentProblem.answer) {
      // Correct: Jump to pad
      setAnimationState('jumping');
      correctSound.current.currentTime = 0;
      correctSound.current.play().catch(e => {});
      
      setTimeout(() => {
        setScore(s => s + 10);
        setCurrentProblem(generateProblem());
        setAnimationState('idle');
      }, 500);
    } else {
      // Incorrect: Fall to water
      setAnimationState('falling');
      errorSound.current.currentTime = 0;
      errorSound.current.play().catch(e => {});
      
      setTimeout(() => {
        // Splash effect
        setSplash(targetPos);
        setScore(s => Math.max(0, s - 5));
        
        setTimeout(() => {
          setSplash(null);
          setAnimationState('idle');
        }, 500);
      }, 500);
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
          <h2 style={{ color: '#2E7D32' }}>🐸 El Salto de la Rana</h2>
          <p>Ayuda a la rana a cruzar saltando en la respuesta correcta</p>
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



          <Frog 
            $jumping={animationState === 'jumping'} 
            $falling={animationState === 'falling'}
            $targetLeft={targetLeft}
          >
            <FaFrog />
            <FrogEye />
          </Frog>

          <Rock />

          <LilyPadContainer>
            {currentProblem.options.map((opt, index) => (
              <LilyPadWrapper key={index} left={POSITIONS[index]}>
                <LilyPad onClick={() => handleAnswer(opt, index)}>
                  <Number>{opt}</Number>
                </LilyPad>
              </LilyPadWrapper>
            ))}
          </LilyPadContainer>

          {splash !== null && <EnhancedSplash left={splash} />}
        </>
      )}

      <Water />
    </GameContainer>
  );
};

export default FrogJumpGame;
