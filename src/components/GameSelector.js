import styled from 'styled-components';
import ActivityCard from './ActivityCard';
import { 
  FaGamepad, FaRocket, FaArrowLeft, FaFrog, FaRegCircle, 
  FaMeteor, FaDragon, FaCar, FaBrain, FaBook, FaPalette, FaFlask, FaGlobe, FaShieldAlt, FaTh, FaMapMarkedAlt, FaClock, FaProjectDiagram, FaHourglassHalf, FaBolt
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
    {
      id: 'pokemonmaths',
      icon: <FaBolt />,
      title: "PokemonMaths",
      description: `Usa cartas Pokémon para resolver operaciones ${info.action}. Sin repetir preguntas y con ranking local.`,
      color: "#FBBF24",
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
    {
      id: 'spainrivers',
      icon: <FaMapMarkedAlt />,
      title: "Ríos de España (Mapa)",
      description: "Localiza 8 ríos principales en el mapa con clic/tap. Incluye modo Rápido y modo Orden.",
      color: "#1D4ED8",
      categories: ['knowledge']
    },
    {
      id: 'ylahora',
      icon: <FaClock />,
      title: "¿Y la hora?",
      description: "Aprende a leer la hora y a sumar/restar 15, 30 y 60 minutos con un reloj grande y rondas rápidas.",
      color: "#F59E0B",
      categories: ['knowledge']
    },
    {
      id: 'inmnunodefender',
      icon: <FaShieldAlt />,
      title: "InmnunoDefender",
      description: "Sé un glóbulo blanco y elimina virus y bacterias. Entre oleadas, responde preguntas pisando la respuesta correcta.",
      color: "#1abc9c",
      categories: ['knowledge']
    },
    {
      id: 'sudokumath',
      icon: <FaTh />,
      title: "Sudoku Math",
      description: "Puzzle tipo sudoku: usa cada número una sola vez y completa los huecos para que las operaciones sean correctas.",
      color: "#16A085",
      categories: ['advanced']
    },
    {
      id: 'tsubasa',
      icon: <FaGamepad />,
      title: "RPG Fútbol (Turnos)",
      description: "Estilo retro: elige Regate/Pase/Tiro y resuelve retos matemáticos para subir la probabilidad de éxito.",
      color: "#1D4ED8",
      categories: ['advanced']
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
    {
      id: 'sintaxis',
      icon: <FaProjectDiagram />,
      title: "Sintaxis",
      description: "Detective sintáctico: encuentra verbo, sujeto, predicado y complementos (CD y CI) en oraciones variadas.",
      color: "#0EA5E9",
      categories: ['vocabulary']
    },
    {
      id: 'tiemposverbales',
      icon: <FaHourglassHalf />,
      title: "Tiempos Verbales",
      description: "Reto rápido: elige la forma verbal correcta. Al acertar, se abre un mini “portal” motivador.",
      color: "#FBBF24",
      categories: ['vocabulary']
    },
    {
      id: 'tiposverbos',
      icon: <FaBook />,
      title: "Tipos de Verbos",
      description: "Clasifica verbos en regulares, irregulares y defectivos. Si fallas, verás la norma y un ejemplo.",
      color: "#34D399",
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
    {
      id: 'geometriaMaster',
      icon: <FaProjectDiagram />,
      title: "Geometría Master",
      description: "Ejercicios de geometría (Canal 1) + bonus tipo Flappy por cada acierto.",
      color: "#845EF7",
      categories: ['geometria']
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
    {
      id: 'hanoikitchen',
      icon: <FaFlask />,
      title: "Hanoi Kitchen",
      description: "Resuelve el puzzle tipo Torre de Hanoi con gancho y vierte la cantidad exacta al caldero.",
      color: "#16A085",
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
    },

    {
      id: 'firewaterpuzzles',
      icon: <FaGlobe />,
      title: "Fuego & Agua (Procedural)",
      description: "Clon tipo Fireboy & Watergirl: coop local, puertas, botones y niveles por semilla.",
      color: "#2D9CDB",
      categories: ['puzzles']
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
        <BrandMini
          src={`${process.env.PUBLIC_URL}/logo2.png`}
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
