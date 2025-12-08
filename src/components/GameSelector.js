import React from 'react';
import styled from 'styled-components';
import ActivityCard from './ActivityCard';
import { 
  FaGamepad, FaRocket, FaArrowLeft, FaFrog, FaRegCircle, 
  FaMeteor, FaDragon, FaCar, FaBrain, FaBook, FaPalette, FaFlask, FaGlobe 
} from 'react-icons/fa';

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
      case 'mixed_math':
        return { title: 'Matemáticas Mixtas', action: 'calculando' };
      case 'english':
        return { title: 'Aprende Inglés', action: 'traduciendo' };
      default:
        return { title: 'Selecciona un Juego', action: 'jugando' };
    }
  };

  const info = getCategoryInfo();

  // Define all available games
  const allGames = [
    // Math Games (available for add/sub/mult/div)
    {
      id: 'memory',
      icon: <FaGamepad />,
      title: "Memorama Matemático",
      description: `Encuentra las parejas de operaciones y resultados ${info.action}.`,
      color: "#4CAF50",
      categories: ['addition', 'subtraction', 'multiplication', 'division']
    },
    {
      id: 'space',
      icon: <FaRocket />,
      title: "Defensor Espacial",
      description: `Destruye asteroides resolviendo operaciones ${info.action}.`,
      color: "#FF5722",
      categories: ['addition', 'subtraction', 'multiplication', 'division']
    },
    {
      id: 'frog',
      icon: <FaFrog />,
      title: "El Salto de la Rana",
      description: `Ayuda a la rana a cruzar el estanque ${info.action}.`,
      color: "#8BC34A",
      categories: ['addition', 'subtraction', 'multiplication', 'division']
    },
    {
      id: 'bubbles',
      icon: <FaRegCircle />,
      title: "Pop de Burbujas",
      description: `Explota las burbujas correctas mientras estás ${info.action}.`,
      color: "#00BCD4",
      categories: ['addition', 'subtraction', 'multiplication', 'division']
    },
    {
      id: 'mathlander',
      icon: <FaRocket />,
      title: "Math Lander",
      description: `Aterriza en la respuesta correcta ${info.action}.`,
      color: "#FFFFFF",
      categories: ['addition', 'subtraction', 'multiplication', 'division']
    },
    {
      id: 'mathsteroids',
      icon: <FaMeteor />,
      title: "Mathsteroids",
      description: `Destruye asteroides con la respuesta correcta ${info.action}.`,
      color: "#9C27B0",
      categories: ['addition', 'subtraction', 'multiplication', 'division']
    },
    {
      id: 'monsterfeeder',
      icon: <FaDragon />,
      title: "Alimenta al Monstruo",
      description: `Arrastra la comida correcta ${info.action}.`,
      color: "#9B59B6",
      categories: ['addition', 'subtraction', 'multiplication', 'division']
    },
    {
      id: 'carracing',
      icon: <FaCar />,
      title: "Carrera de Coches",
      description: `¡Acelera respondiendo correctamente ${info.action}!`,
      color: "#E74C3C",
      categories: ['addition', 'subtraction', 'multiplication', 'division']
    },
    
    // Knowledge Games
    {
      id: 'knowledgetower',
      icon: <FaBrain />,
      title: "Torre del Saber",
      description: "Construye la torre más alta respondiendo preguntas de cultura general.",
      color: "#2196F3",
      categories: ['knowledge']
    },

    // Vocabulary Games
    {
      id: 'accenthunter',
      icon: <FaBook />,
      title: "Cazador de Acentos",
      description: "Identifica diptongos e hiatos explotando globos.",
      color: "#795548",
      categories: ['vocabulary']
    },

    // Shape Games
    {
      id: 'shapegoalkeeper',
      icon: <FaPalette />,
      title: "Portero de Formas",
      description: "Detén las formas y colores correctos en la portería.",
      color: "#E91E63",
      categories: ['shapes']
    },

    // Mixed Math Games
    {
      id: 'kitchen',
      icon: <FaFlask />,
      title: "La Cocina",
      description: "Prepara el antídoto mezclando ingredientes con fracciones y decimales.",
      color: "#607D8B",
      categories: ['mixed_math']
    },

    // English Games
    {
      id: 'dragontragon',
      icon: <FaDragon />,
      title: "Dragón Tragón",
      description: "Cóme las palabras correctas para formar la frase en inglés.",
      color: "#E67E22",
      categories: ['english']
    }
  ];

  // Filter games based on category
  const games = allGames.filter(game => game.categories.includes(category));

  return (
    <SelectorContainer>
      <Header>
        <BackButton onClick={onBack}>
          <FaArrowLeft /> Volver
        </BackButton>
        <Title>{info.title}</Title>
        <div style={{ width: 100 }} />
      </Header>
      
      <Grid>
        {games.map(game => (
          <ActivityCard
            key={game.id}
            icon={game.icon}
            title={game.title}
            description={game.description}
            color={game.color}
            onClick={() => onNavigate(game.id, category)}
          />
        ))}
      </Grid>
    </SelectorContainer>
  );
};

export default GameSelector;
