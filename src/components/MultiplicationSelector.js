import React from 'react';
import styled from 'styled-components';
import ActivityCard from './ActivityCard';
import { FaGamepad, FaRocket, FaArrowLeft, FaFrog, FaRegCircle } from 'react-icons/fa';

const SelectorContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  margin-bottom: 3rem;
  color: white;
`;

const BackButton = styled.button`
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
    transform: translateX(-5px);
  }
`;

const Title = styled.h2`
  flex: 1;
  text-align: center;
  font-size: 2.5rem;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const MultiplicationSelector = ({ onNavigate, onBack, operation }) => {
  const getOperationInfo = () => {
    switch(operation) {
      case 'addition':
        return { title: 'Juegos de Sumar', action: 'sumando' };
      case 'subtraction':
        return { title: 'Juegos de Restar', action: 'restando' };
      case 'division':
        return { title: 'Juegos de Dividir', action: 'dividiendo' };
      default:
        return { title: 'Juegos de Multiplicar', action: 'multiplicando' };
    }
  };

  const info = getOperationInfo();

  const games = [
    {
      id: 'memory',
      icon: <FaGamepad />,
      title: "Memorama Matemático",
      description: `Encuentra las parejas de operaciones y resultados ${info.action}.`,
      color: "#4CAF50"
    },
    {
      id: 'space',
      icon: <FaRocket />,
      title: "Defensor Espacial",
      description: `Destruye asteroides resolviendo operaciones ${info.action}.`,
      color: "#FF5722"
    },
    {
      id: 'frog',
      icon: <FaFrog />,
      title: "El Salto de la Rana",
      description: `Ayuda a la rana a cruzar el estanque ${info.action}.`,
      color: "#8BC34A"
    },
    {
      id: 'bubbles',
      icon: <FaRegCircle />,
      title: "Pop de Burbujas",
      description: `Explota las burbujas correctas mientras estás ${info.action}.`,
      color: "#00BCD4"
    }
  ];

  return (
    <SelectorContainer>
      <Header>
        <BackButton onClick={onBack}>
          <FaArrowLeft /> Volver
        </BackButton>
        <Title>{info.title}</Title>
        <div style={{ width: 100 }} /> {/* Spacer for centering */}
      </Header>
      
      <Grid>
        {games.map(game => (
          <ActivityCard
            key={game.id}
            icon={game.icon}
            title={game.title}
            description={game.description}
            color={game.color}
            onClick={() => onNavigate(game.id, operation)}
          />
        ))}
      </Grid>
    </SelectorContainer>
  );
};

export default MultiplicationSelector;
