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

const MemoryGame = ({ onBack }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);

  const initializeGame = () => {
    const multiplications = [
      { q: '2 x 3', a: '6' },
      { q: '4 x 2', a: '8' },
      { q: '3 x 3', a: '9' },
      { q: '5 x 2', a: '10' },
      { q: '2 x 2', a: '4' },
      { q: '3 x 4', a: '12' },
    ];

    const deck = [];
    multiplications.forEach((item, index) => {
      deck.push({ id: index * 2, content: item.q, type: 'q', pairId: index });
      deck.push({ id: index * 2 + 1, content: item.a, type: 'a', pairId: index });
    });

    // Shuffle
    deck.sort(() => Math.random() - 0.5);
    setCards(deck);
    setFlipped([]);
    setSolved([]);
  };

  useEffect(() => {
    initializeGame();
  }, []);

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
        <h2>Memorama</h2>
        <Button onClick={initializeGame}>
          <FaRedo /> Reiniciar
        </Button>
      </Header>

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
    </GameContainer>
  );
};

export default MemoryGame;
