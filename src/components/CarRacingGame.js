import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaArrowLeft, FaCar } from 'react-icons/fa';

const drive = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
  100% { transform: translateY(0px); }
`;

const GameContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #2C3E50 0%, #34495E 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Arial', sans-serif;
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
  border: 3px solid #E74C3C;
  color: #E74C3C;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  pointer-events: auto;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
  
  &:hover {
    background: #E74C3C;
    color: white;
    transform: scale(1.05);
  }
`;

const Score = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  background: rgba(231, 76, 60, 0.9);
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  border: 3px solid white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
`;

const RaceTrack = styled.div`
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 800px;
  height: 300px;
  background: #7F8C8D;
  border: 5px solid #2C3E50;
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
  overflow: hidden;
`;

const TrackLine = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background: repeating-linear-gradient(
    90deg,
    white 0px,
    white 30px,
    transparent 30px,
    transparent 50px
  );
  transform: translateY(-50%);
`;

const FinishLine = styled.div`
  position: absolute;
  right: 20px;
  top: 0;
  bottom: 0;
  width: 30px;
  background: repeating-linear-gradient(
    45deg,
    #000,
    #000 10px,
    #fff 10px,
    #fff 20px
  );
  box-shadow: -2px 0 10px rgba(0,0,0,0.3);
`;

const Car = styled.div.attrs(props => ({
  style: {
    left: `${props.$position}%`,
  }
}))`
  position: absolute;
  top: ${props => props.$lane === 'top' ? '20%' : '60%'};
  font-size: 3rem;
  transition: left 0.5s ease, top 0.3s ease;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
  display: inline-block;
  transform: translateY(-50%) scaleX(-1);
`;

const ProblemContainer = styled.div`
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  border: 4px solid #3498DB;
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
`;

const Problem = styled.h2`
  font-size: 2.5rem;
  color: #2C3E50;
  margin-bottom: 1.5rem;
`;

const AnswerButton = styled.button`
  background: ${props => props.disabled ? '#95A5A6' : '#3498DB'};
  color: white;
  border: none;
  padding: 1rem 2rem;
  margin: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 15px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  box-shadow: 0 6px 12px rgba(0,0,0,0.2);
  transition: all 0.2s;
  min-width: 120px;
  
  &:hover:not(:disabled) {
    background: #2980B9;
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const Feedback = styled.div`
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%) scale(${props => props.show ? 1 : 0});
  font-size: 3rem;
  font-weight: bold;
  color: ${props => props.isCorrect ? '#2ECC71' : '#E74C3C'};
  background: white;
  padding: 1rem 2rem;
  border-radius: 20px;
  border: 5px solid ${props => props.isCorrect ? '#2ECC71' : '#E74C3C'};
  z-index: 20;
  transition: transform 0.3s ease;
  pointer-events: none;
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
`;

const MenuOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.98);
  padding: 3rem;
  border-radius: 30px;
  text-align: center;
  z-index: 25;
  box-shadow: 0 15px 30px rgba(0,0,0,0.4);
  border: 5px solid #E74C3C;
  min-width: 400px;
`;

const StartButton = styled(Button)`
  font-size: 1.5rem;
  padding: 1rem 2rem;
  margin-top: 1rem;
  background: #E74C3C;
  color: white;
  border-color: #C0392B;
  
  &:hover {
    background: #C0392B;
  }
`;

const WinMessage = styled.div`
  font-size: 2rem;
  color: ${props => props.playerWon ? '#2ECC71' : '#E74C3C'};
  margin-bottom: 1rem;
  font-weight: bold;
`;

const CarRacingGame = ({ onBack, operation = 'multiplication' }) => {
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('menu'); // menu, playing, finished
  const [currentProblem, setCurrentProblem] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [opponentPosition, setOpponentPosition] = useState(0);
  const [feedback, setFeedback] = useState({ show: false, isCorrect: false });
  const [answerLocked, setAnswerLocked] = useState(false);
  const [winner, setWinner] = useState(null);
  
  const opponentInterval = useRef(null);

  const generateProblem = useCallback(() => {
    let a, b, answer, operator;
    const min = 1, max = 9;

    switch(operation) {
      case 'addition':
        a = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * 20) + 1;
        answer = a + b;
        operator = '+';
        break;
      case 'subtraction':
        a = Math.floor(Math.random() * 20) + 5;
        b = Math.floor(Math.random() * a);
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
      text: `${a} ${operator} ${b}`,
      answer
    };
  }, [operation]);

  const generateAnswers = useCallback((problem) => {
    const choices = new Set([problem.answer]);
    
    while(choices.size < 3) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrong = problem.answer + offset;
      if (wrong >= 0 && wrong !== problem.answer) {
        choices.add(wrong);
      }
    }

    return Array.from(choices).sort(() => Math.random() - 0.5);
  }, []);

  const startGame = () => {
    const problem = generateProblem();
    setCurrentProblem(problem);
    setAnswers(generateAnswers(problem));
    setScore(0);
    setPlayerPosition(0);
    setOpponentPosition(0);
    setGameState('playing');
    setWinner(null);
    
    // Start opponent movement
    opponentInterval.current = setInterval(() => {
      setOpponentPosition(prev => {
        const newPos = Math.min(prev + Math.random() * 3, 85);
        if (newPos >= 85) {
          clearInterval(opponentInterval.current);
          setGameState('finished');
          setWinner('opponent');
        }
        return newPos;
      });
    }, 1000);
  };

  const handleAnswer = (selectedAnswer) => {
    if (answerLocked) return;
    
    setAnswerLocked(true);
    const isCorrect = selectedAnswer === currentProblem.answer;
    
    setFeedback({ show: true, isCorrect });
    
    if (isCorrect) {
      setScore(s => s + 10);
      setPlayerPosition(prev => {
        const newPos = Math.min(prev + 15, 85);
        if (newPos >= 85) {
          clearInterval(opponentInterval.current);
          setGameState('finished');
          setWinner('player');
        }
        return newPos;
      });
    } else {
      setScore(s => Math.max(0, s - 3));
    }
    
    setTimeout(() => {
      setFeedback({ show: false, isCorrect: false });
      setAnswerLocked(false);
      if (gameState === 'playing') {
        const newProblem = generateProblem();
        setCurrentProblem(newProblem);
        setAnswers(generateAnswers(newProblem));
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (opponentInterval.current) {
        clearInterval(opponentInterval.current);
      }
    };
  }, []);

  return (
    <GameContainer>
      <Header>
        <Button onClick={onBack}><FaArrowLeft /> Salir</Button>
        <Score>🏆 {score}</Score>
      </Header>

      {gameState === 'menu' && (
        <MenuOverlay>
          <h1 style={{ color: '#E74C3C', marginBottom: '1rem', fontSize: '2.5rem' }}>🏎️ Carrera de Coches</h1>
          <p style={{ fontSize: '1.2rem', color: '#555' }}>¡Responde correctamente para avanzar!</p>
          <StartButton onClick={startGame}>¡Comenzar Carrera!</StartButton>
        </MenuOverlay>
      )}

      {gameState === 'finished' && (
        <MenuOverlay>
          <WinMessage playerWon={winner === 'player'}>
            {winner === 'player' ? '¡Ganaste! 🏆' : 'Perdiste 😢'}
          </WinMessage>
          <p style={{ fontSize: '1.3rem', margin: '1rem 0' }}>Puntuación: {score}</p>
          <StartButton onClick={startGame}>Nueva Carrera</StartButton>
        </MenuOverlay>
      )}

      {(gameState === 'playing' || gameState === 'finished') && (
        <RaceTrack>
          <TrackLine />
          <FinishLine />
          <Car $position={playerPosition} $lane="bottom">🏎️</Car>
          <Car $position={opponentPosition} $lane="top">🚗</Car>
        </RaceTrack>
      )}

      {gameState === 'playing' && currentProblem && (
        <ProblemContainer>
          <Problem>{currentProblem.text} = ?</Problem>
          <div>
            {answers.map((answer, idx) => (
              <AnswerButton
                key={idx}
                onClick={() => handleAnswer(answer)}
                disabled={answerLocked}
              >
                {answer}
              </AnswerButton>
            ))}
          </div>
        </ProblemContainer>
      )}

      <Feedback show={feedback.show} isCorrect={feedback.isCorrect}>
        {feedback.isCorrect ? '¡Correcto! 🚀' : '¡Ups! 🐌'}
      </Feedback>
    </GameContainer>
  );
};

export default CarRacingGame;
