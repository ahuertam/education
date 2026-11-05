import styled from 'styled-components';
import ActivityCard from './ActivityCard';
import { FaArrowLeft } from 'react-icons/fa';
import { gamesByCategory, gameDescription } from '../config/games';

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
  gap: 1rem;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.14);
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
    background: rgba(255, 255, 255, 0.22);
    transform: translateX(-5px);
  }
`;

const Title = styled.h2`
  flex: 1;
  text-align: center;
  font-size: 2.5rem;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);

  @media (max-width: 768px) {
    flex: 0 0 100%;
    text-align: left;
    font-size: 2rem;
  }
`;

const BrandMini = styled.img`
  height: 54px;
  width: auto;
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.25));

  @media (max-width: 768px) {
    height: 46px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const GameSelector = ({ onNavigate, onBack, category }) => {
  const getCategoryInfo = () => {
    switch(category) {
      case 'addition':
        return { title: 'Juegos de Sumar', action: 'sumando' };
      case 'subtraction':
        return { title: 'Juegos de Restar', action: 'restando' };
      case 'multiplication':
        return { title: 'Juegos de Multiplicar', action: 'multiplicando' };
      case 'division':
        return { title: 'Juegos de Dividir', action: 'dividiendo' };
      case 'knowledge':
        return { title: 'Conocimientos Generales', action: 'aprendiendo' };
      case 'vocabulary':
        return { title: 'Vocabulario', action: 'leyendo' };
      case 'shapes':
        return { title: 'Colores y Formas', action: 'observando' };
      case 'geometria':
        return { title: 'Geometría', action: 'midiendo' };
      case 'mixed_math':
        return { title: 'Matemáticas Mixtas', action: 'calculando' };
      case 'english':
        return { title: 'Aprende Inglés', action: 'traduciendo' };
      case 'advanced':
        return { title: 'Avanzado', action: 'desafiando' };
      case 'puzzles':
        return { title: 'Puzzles', action: 'resolviendo' };
      default:
        return { title: 'Selecciona un Juego', action: 'jugando' };
    }
  };

  const info = getCategoryInfo();

  // Define all available games
  // Filter games based on category
  const games = gamesByCategory(category);

  return (
    <SelectorContainer>
      <Header>
        <BackButton onClick={onBack}>
          <FaArrowLeft /> Volver
        </BackButton>
        <Title>{info.title}</Title>
        <BrandMini
          src={`${process.env.PUBLIC_URL}/logo22.png`}
          alt="Mascota de Edutika"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </Header>
      
      <Grid>
        {games.map(game => (
          <ActivityCard
            key={game.id}
            icon={<game.icon />}
            title={game.title}
            description={gameDescription(game, info.action)}
            color={game.color}
            onClick={() => onNavigate(game.id, category)}
          />
        ))}
      </Grid>
    </SelectorContainer>
  );
};

export default GameSelector;
