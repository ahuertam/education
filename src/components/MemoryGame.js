import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaRedo } from 'react-icons/fa';

const GameContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  color: white;
`;

const Button = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  perspective: 1000px;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Card = styled.div`
  aspect-ratio: 1;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  transform: ${props => props.flipped ? 'rotateY(180deg)' : 'rotateY(0)'};
  cursor: pointer;
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
`;

const CardFront = styled(CardFace)`
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
  transform: rotateY(0);
`;

const CardBack = styled(CardFace)`
  background: white;
  color: #333;
  transform: rotateY(180deg);
  border: 4px solid #a777e3;
`;

const MemoryGame = ({ onBack, level = 1, operation = 'multiplication' }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);

  const generateCards = (currentLevel, currentOperation) => {
    const pairsCount = currentLevel + 2; // Level 1: 3 pairs, Level 2: 4 pairs, etc.
    const newCards = [];
    
    for (let i = 0; i < pairsCount; i++) {
      let problem, result;
      
      // Generate problem based on operation
      switch(currentOperation) {
        case 'addition':
          const a1 = Math.floor(Math.random() * (10 * currentLevel)) + 1;
          const b1 = Math.floor(Math.random() * (10 * currentLevel)) + 1;
          problem = `${a1} + ${b1}`;
          result = a1 + b1;
          break;
        case 'subtraction':
          const a2 = Math.floor(Math.random() * (10 * currentLevel)) + currentLevel + 5;
          const b2 = Math.floor(Math.random() * a2); // Ensure positive result
          problem = `${a2} - ${b2}`;
          result = a2 - b2;
          break;
        case 'division':
          const b3 = Math.floor(Math.random() * (5 * currentLevel)) + 2;
          const a3 = b3 * (Math.floor(Math.random() * 10) + 1); // Ensure clean division
          problem = `${a3} ÷ ${b3}`;
          result = a3 / b3;
          break;
        case 'multiplication':
        default:
          const a4 = Math.floor(Math.random() * (currentLevel + 2)) + 2;
          const b4 = Math.floor(Math.random() * 9) + 2;
          problem = `${a4} × ${b4}`;
          result = a4 * b4;
          break;
      }

      const id = i;
      newCards.push({
        id: `p-${id}`,
        content: problem,
        type: 'problem',
        pairId: id,
        isFlipped: false,
        isMatched: false
      });
      newCards.push({
        id: `r-${id}`,
        content: result.toString(),
        type: 'result',
        pairId: id,
        isFlipped: false,
        isMatched: false
      });
    }
    
    return newCards.sort(() => Math.random() - 0.5);
  };

  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);

  const startGame = (selectedLevel) => {
    setCurrentLevel(selectedLevel);
    const deck = generateCards(selectedLevel, operation);
    setCards(deck);
    setFlipped([]);
    setSolved([]);
    setGameStarted(true);
  };

  const handleClick = (id) => {
    if (disabled || flipped.includes(id) || solved.includes(id)) return;

    if (flipped.length === 0) {
      setFlipped([id]);
      return;
    }

    setFlipped([flipped[0], id]);
    setDisabled(true);

    const firstCard = cards.find(c => c.id === flipped[0]);
    const secondCard = cards.find(c => c.id === id);

    if (firstCard.pairId === secondCard.pairId) {
      setSolved([...solved, firstCard.id, secondCard.id]);
      setFlipped([]);
      setDisabled(false);
    } else {
      setTimeout(() => {
        setFlipped([]);
        setDisabled(false);
      }, 1000);
    }
  };

  return (
    <GameContainer>
      <Header>
        <Button onClick={onBack}>
          <FaArrowLeft /> Salir
        </Button>
        <h2>Memorama - {operation === 'addition' ? 'Sumas' : operation === 'subtraction' ? 'Restas' : operation === 'division' ? 'Divisiones' : 'Multiplicaciones'}</h2>
        {gameStarted && (
          <Button onClick={() => startGame(currentLevel)}>
            <FaRedo /> Reiniciar
          </Button>
        )}
      </Header>

      {!gameStarted ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', marginTop: '4rem' }}>
          <h1 style={{ color: 'white', fontSize: '3rem' }}>Selecciona la Dificultad</h1>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Button onClick={() => startGame(1)} style={{ fontSize: '1.5rem', padding: '1.5rem 3rem', background: '#4CAF50' }}>
              Fácil
            </Button>
            <Button onClick={() => startGame(2)} style={{ fontSize: '1.5rem', padding: '1.5rem 3rem', background: '#FF9800' }}>
              Medio
            </Button>
            <Button onClick={() => startGame(3)} style={{ fontSize: '1.5rem', padding: '1.5rem 3rem', background: '#F44336' }}>
              Difícil
            </Button>
          </div>
        </div>
      ) : (
        <Grid>
          {cards.map(card => (
            <Card 
              key={card.id} 
              flipped={flipped.includes(card.id) || solved.includes(card.id)}
              onClick={() => handleClick(card.id)}
            >
              <CardFront>?</CardFront>
              <CardBack>{card.content}</CardBack>
            </Card>
          ))}
        </Grid>
      )}
    </GameContainer>
  );
};

export default MemoryGame;
