import { useState } from 'react';
import styled from 'styled-components';
import ActivityCard from './ActivityCard';
import { FaArrowLeft } from 'react-icons/fa';
import {
  NIVELES,
  gamesByCategory,
  gamesByCategoryAndLevel,
  gameDescription,
  nivelLabel,
} from '../config/games';

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
  background: rgba(255, 255, 255, 0.18);
  border: none;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  /* Sin backdrop-filter ni "transition: all": con quince tarjetas de fondo,
     difuminar la capa en cada hover y animar cualquier propiedad ralentiza
     el raton. */
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.28);
    transform: translateX(-4px);
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

// Las pastillas de nivel. El filtro va aquí, no en la landing: se elige el
// nivel una vez y el selector recuerda la elección.
const NivelBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.95rem;
`;

const NivelPastilla = styled.button`
  background: ${(props) => (props.activo ? '#ff8a2a' : 'rgba(255, 255, 255, 0.18)')};
  border: none;
  color: white;
  font: inherit;
  font-weight: 700;
  padding: 0.5rem 1.1rem;
  border-radius: 30px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover { background: ${(props) => (props.activo ? '#ff8a2a' : 'rgba(255, 255, 255, 0.3)')}; }
`;

const AvisoNivel = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 1.5rem;
`;

const GameSelector = ({ onNavigate, onBack, category }) => {
  // 'alto' = "hasta 6º" = todos los juegos, que es lo que se veía antes de
  // que existiera el filtro. Lo que venga del navegador se comprueba: si no
  // es un nivel válido, se empieza por el de arriba.
  const [nivel, setNivel] = useState(() => {
    try {
      const guardado = localStorage.getItem('edutika:nivel');
      return NIVELES.some((n) => n.id === guardado) ? guardado : 'alto';
    } catch (e) {
      return 'alto';
    }
  });

  const cambiarNivel = (nuevo) => {
    setNivel(nuevo);
    try {
      localStorage.setItem('edutika:nivel', nuevo);
    } catch (e) {
      // Sin localStorage (modo privado) el filtro solo vive en esta sesión.
    }
  };

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
      case 'fracciones':
        return { title: 'Fracciones', action: 'fraccionando' };
      case 'numeros':
        return { title: 'Números', action: 'contando' };
      case 'algebra':
        return { title: 'Álgebra', action: 'operando con letras' };
      case 'probabilidad':
        return { title: 'Probabilidad', action: 'girando la ruleta' };
      default:
        return { title: 'Selecciona un Juego', action: 'jugando' };
    }
  };

  const info = getCategoryInfo();

  // Los juegos aptos para el nivel elegido. Si la categoría no tiene ninguno
  // (Álgebra en 1º-2º), se enseñan todos y se avisa: mejor eso que una
  // pantalla vacía.
  const aptos = gamesByCategoryAndLevel(category, nivel);
  const sinJuegosDeEseNivel = aptos === null;
  const games = sinJuegosDeEseNivel ? gamesByCategory(category) : aptos;

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

      <NivelBar>
        <span>Nivel:</span>
        {NIVELES.map((n) => (
          <NivelPastilla
            key={n.id}
            type="button"
            activo={n.id === nivel}
            aria-pressed={n.id === nivel}
            onClick={() => cambiarNivel(n.id)}
          >
            Hasta {n.hasta}º
          </NivelPastilla>
        ))}
      </NivelBar>

      {sinJuegosDeEseNivel && (
        <AvisoNivel>
          En esta categoría no hay juegos de {nivelLabel(nivel)}. Te enseñamos todos.
        </AvisoNivel>
      )}

      <Grid>
        {games.map(game => (
          <ActivityCard
            key={game.id}
            icon={<game.icon />}
            title={game.title}
            description={gameDescription(game, info.action)}
            color={game.color}
            nivel={nivelLabel(game.nivel)}
            onClick={() => onNavigate(game.id, category)}
          />
        ))}
      </Grid>
    </SelectorContainer>
  );
};

export default GameSelector;
