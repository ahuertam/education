import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';

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
  top: 15%;
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
  width: 135px;
  height: 150px;
  object-fit: none;
  object-position: ${props => {
    // Image is 548x455, 4 columns x 3 rows
    // Each sprite: ~137px wide x ~152px tall
    // Crop more from right and bottom
    const col = {
      idle: 0,
      open: 1,
      happy: 2,
      sad: 3
    }[props.$state] || 0;
    return `${-col * 137}px 0px`;
  }};
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
`;

const FoodContainer = styled.div`
  position: absolute;
  bottom: 50%;
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
  width: 135px;
  height: 145px;
  cursor: ${props => props.$isDragging ? 'grabbing' : 'grab'};
  user-select: none;
  transition: transform 0.2s, opacity 0.2s;
  touch-action: none;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.3));
  position: relative;
  opacity: ${props => props.$isDragging ? 0.5 : 1};
  overflow: hidden;
  
  &:hover {
    transform: scale(1.15) rotate(5deg);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const FoodSprite = styled.img`
  width: 100%;
  height: 100%;
  object-fit: none;
  object-position: ${props => {
    // Image is 548x455, 4 columns x 3 rows
    // Each sprite: ~137px wide x ~152px tall
    // Row 1 (y=-152): apple, banana, cookie, cookie2
    // Row 2 (y=-304): donut, ice cream, donut2, pizza
    // Adjust to crop a bit from top and bottom
    const positions = [
      '0px -156px',       // apple
      '-137px -156px',    // banana
      '-274px -156px',    // cookie
      '0px -308px',       // donut
      '-137px -308px',    // ice cream
      '-274px -308px',    // donut2
      '-411px -308px',    // pizza
      '-411px -156px'     // cookie2
    ];
    return positions[props.$foodType % positions.length];
  }};
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
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
  transform: translate(-50%, -50%) scale(${props => props.show ? 1 : 0});
  font-size: 4rem;
  font-weight: bold;
  color: ${props => props.isCorrect ? '#2ECC71' : '#E74C3C'};
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

const MonsterFeederGame = ({ onBack, operation = 'multiplication' }) => {
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('menu'); // menu, playing
  const [currentProblem, setCurrentProblem] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [monsterState, setMonsterState] = useState('idle'); // idle, open, happy, sad
  const [feedback, setFeedback] = useState({ show: false, isCorrect: false });
  const [draggingId, setDraggingId] = useState(null);

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

  const generateFoodItems = useCallback((problem) => {
    const items = [];
    const answers = new Set([problem.answer]);
    
    // Generate 5 wrong answers
    while(answers.size < 6) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrong = problem.answer + offset;
      if (wrong >= 0 && wrong !== problem.answer && wrong <= 100) {
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

  const handleDrop = (e) => {
    e.preventDefault();
    const item = foodItems.find(f => f.id === draggingId);
    
    if (!item) return;

    if (item.isCorrect) {
      // Correct answer
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
      // Wrong answer
      setMonsterState('sad');
      setFeedback({ show: true, isCorrect: false });
      setScore(s => Math.max(0, s - 2));
      
      setTimeout(() => {
        setFeedback({ show: false, isCorrect: false });
        setMonsterState('idle');
      }, 1500);
    }

    setDraggingId(null);
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

    // Trigger drop logic
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
                  src={`${process.env.PUBLIC_URL}/moster2.png`}
                  $foodType={item.foodType}
                  alt="Food"
                />
                <FoodNumber>{item.number}</FoodNumber>
              </FoodSpriteWrapper>
            ))}
          </FoodContainer>

          <Feedback show={feedback.show} isCorrect={feedback.isCorrect}>
            {feedback.isCorrect ? '¡Correcto! 😋' : '¡Ups! 😢'}
          </Feedback>
        </>
      )}
    </GameContainer>
  );
};

export default MonsterFeederGame;
