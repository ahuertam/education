import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';
import { SHAPES, COLORS, WAVES } from './data/shapeGoalkeeperData';

const GameContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #87CEEB 0%, #98D8E8 100%);
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
  border: 3px solid #4A90E2;
  color: #4A90E2;
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
    background: #4A90E2;
    color: white;
    transform: scale(1.05);
  }
`;

const Score = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  background: rgba(74, 144, 226, 0.9);
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  border: 3px solid white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
`;

const InstructionPanel = styled.div`
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5rem 3rem;
  border-radius: 20px;
  border: 4px solid #E74C3C;
  box-shadow: 0 8px 16px rgba(0,0,0,0.3);
  z-index: 5;
`;

const InstructionText = styled.h2`
  font-size: 2rem;
  color: ${props => props.$color || '#E74C3C'};
  margin: 0;
  text-transform: uppercase;
  transition: color 0.3s ease;
`;

const PlayingField = styled.div`
  position: absolute;
  inset: 150px 50px 50px 50px;
  border: 4px solid rgba(255,255,255,0.5);
  border-radius: 10px;
  overflow: hidden;
`;

const GoalPost = styled.div`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 60%;
  background: white;
  border: 3px solid #333;
  border-right: none;
  border-radius:10px 0 0 10px;
  
  &::before, &::after {
    content: '';
    position: absolute;
    right: 0;
    width: 20px;
    height: 20px;
    background: white;
    border: 3px solid #333;
    border-right: none;
  }
  
  &::before {
    top: -23px;
    border-radius: 10px 0 0 0;
  }
  
  &::after {
    bottom: -23px;
    border-radius: 0 0 0 10px;
  }
`;

const Goalkeeper = styled.div.attrs(props => ({
  style: {
    top: `${props.$y}px`,
  }
}))`
  position: absolute;
  right: 80px;
  transform: translateY(-50%);
  width: 60px;
  height: 80px;
  background: #FF6B6B;
  border: 3px solid #333;
  border-radius: 10px;
  z-index: 3;
  cursor: pointer;
  transition: top 0.1s ease-out;
  
  &::before {
    content: '🧤';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 2rem;
  }
`;

const Shape = styled.div.attrs(props => ({
  style: {
    left: `${props.$x}px`,
    top: `${props.$y}px`,
  }
}))`
  position: absolute;
  width: 50px;
  height: 50px;
  transform: translate(-50%, -50%);
  z-index: 2;
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
  box-shadow: 0 15px 30px rgba(0,0,0,0.3);
  border: 5px solid #4A90E2;
  max-width: 600px;
  width: 90%;
`;

const StartButton = styled(Button)`
  font-size: 1.5rem;
  padding: 1rem 2rem;
  margin-top: 1rem;
  background: #4A90E2;
  color: white;
`;

const GameOverOverlay = styled(MenuOverlay)`
  border-color: ${props => props.$won ? '#2ECC71' : '#E74C3C'};
`;

// Shape rendering components
const Circle = ({ color }) => (
  <svg width="50" height="50" viewBox="0 0 50 50">
    <circle cx="25" cy="25" r="22" fill={color} stroke="#333" strokeWidth="3"/>
  </svg>
);

const Square = ({ color }) => (
  <svg width="50" height="50" viewBox="0 0 50 50">
    <rect x="3" y="3" width="44" height="44" fill={color} stroke="#333" strokeWidth="3" rx="4"/>
  </svg>
);

const Triangle = ({ color }) => (
  <svg width="50" height="50" viewBox="0 0 50 50">
    <polygon points="25,5 47,45 3,45" fill={color} stroke="#333" strokeWidth="3"/>
  </svg>
);

const Star = ({ color }) => (
  <svg width="50" height="50" viewBox="0 0 50 50">
    <polygon 
      points="25,5 30,20 45,20 33,28 38,43 25,35 12,43 17,28 5,20 20,20" 
      fill={color} 
      stroke="#333" 
      strokeWidth="2"
    />
  </svg>
);

const ShapeComponent = ({ shape, color }) => {
  const shapeMap = {
    circle: Circle,
    square: Square,
    triangle: Triangle,
    star: Star,
  };
  const Component = shapeMap[shape];
  return <Component color={color} />;
};

const ShapeGoalkeeperGame = ({ onBack }) => {
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [goals, setGoals] = useState(0);
  const [currentWave, setCurrentWave] = useState(0);
  const [objects, setObjects] = useState([]);
  const [goalkeeperY, setGoalkeeperY] = useState(300);
  const [correctSaves, setCorrectSaves] = useState(0);
  const [instructionColor, setInstructionColor] = useState('#E74C3C');
  
  const fieldRef = useRef(null);
  const nextObjectId = useRef(0);
  const spawnIntervalRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Refs for game loop access to avoid stale closures
  const goalkeeperYRef = useRef(300);
  const waveRef = useRef(WAVES[0]);
  const currentWaveRef = useRef(0);

  const wave = WAVES[currentWave];
  const maxGoals = 5;

  // Sync refs with state
  useEffect(() => {
    goalkeeperYRef.current = goalkeeperY;
  }, [goalkeeperY]);

  useEffect(() => {
    waveRef.current = WAVES[currentWave];
    currentWaveRef.current = currentWave;
    
    // Set random instruction color (Stroop effect)
    const availableColors = Object.values(COLORS);
    let forbiddenColorId = null;
    
    if (WAVES[currentWave].type === 'color') {
      forbiddenColorId = WAVES[currentWave].target;
    } else if (WAVES[currentWave].type === 'both') {
      forbiddenColorId = WAVES[currentWave].targetColor;
    }
    
    const validColors = availableColors.filter(c => c.id !== forbiddenColorId);
    const randomColor = validColors[Math.floor(Math.random() * validColors.length)];
    setInstructionColor(randomColor.value);
    
  }, [currentWave]);

  const startGame = () => {
    setScore(0);
    setGoals(0);
    setCurrentWave(0);
    setObjects([]);
    setCorrectSaves(0);
    setGameState('playing');
  };

  const checkMatch = useCallback((obj, currentWave) => {
    if (currentWave.type === 'color') {
      return obj.color === currentWave.target;
    } else if (currentWave.type === 'shape') {
      return obj.shape === currentWave.target;
    } else if (currentWave.type === 'both') {
      return obj.shape === currentWave.targetShape && obj.color === currentWave.targetColor;
    }
    return false;
  }, []);

  const spawnObject = useCallback(() => {
    if (!fieldRef.current || gameState !== 'playing') {
      console.log('Cannot spawn - field:', !!fieldRef.current, 'gameState:', gameState);
      return;
    }

    const fieldHeight = fieldRef.current.clientHeight;
    const shapes = Object.keys(SHAPES);
    const colors = Object.keys(COLORS);

    const newObject = {
      id: nextObjectId.current++,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      x: 50,
      y: Math.random() * (fieldHeight - 100) + 50,
      speed: 2 + currentWaveRef.current * 0.3, // Use ref for speed
    };

    console.log('Spawned object:', newObject);
    setObjects(prev => [...prev, newObject]);
  }, [gameState]); // Removed currentWave dependency

  const updateObjects = useCallback(() => {
    if (!fieldRef.current || gameState !== 'playing') return;

    const fieldWidth = fieldRef.current.clientWidth;
    // Goalkeeper is 60px wide, positioned at right: 80px
    // So goalkeeper occupies x from (fieldWidth - 140) to (fieldWidth - 80)
    // Center is at fieldWidth - 110
    const goalkeeperX = fieldWidth - 110;
    const goalkeeperWidth = 60;
    const goalkeeperHeight = 80;
    
    // Use refs for current state in loop
    const currentGoalkeeperY = goalkeeperYRef.current;
    const currentWaveData = waveRef.current;

    setObjects(prev => {
      let goalScored = false;
      let pointsChange = 0;
      
      const updated = prev.map(obj => {
        // Move object
        const newObj = { ...obj, x: obj.x + obj.speed };
        
        // Skip if already processed
        if (obj.hit || obj.processed) return newObj;
        
        // FIRST: Check collision with goalkeeper (higher priority)
        const horizontalDistance = Math.abs(newObj.x - goalkeeperX);
        const verticalDistance = Math.abs(newObj.y - currentGoalkeeperY);
        
        // Collision if within bounds
        if (horizontalDistance < (goalkeeperWidth / 2 + 25) && 
            verticalDistance < (goalkeeperHeight / 2 + 25)) {
          // Use currentWaveData captured at start of updateObjects
          const shouldStop = checkMatch(obj, currentWaveData);
          
          console.log('🧤 HIT! Object:', obj.shape, obj.color, 'shouldStop:', shouldStop, 'Target:', currentWaveData.text);
          
          if (shouldStop) {
            // Correct stop!
            pointsChange += 5;
            // Track correct saves
            setCorrectSaves(c => c + 1);
          }
          // Wrong stops don't penalize - no points lost
          
          return { ...newObj, hit: true };
        }
        
        // SECOND: Check if object reached goal line (past goalkeeper)
        if (newObj.x > fieldWidth - 60) {
          const shouldStop = checkMatch(obj, currentWaveData);
          
          if (shouldStop) {
            // Should have stopped but didn't - GOAL!
            goalScored = true;
            pointsChange -= 5;
            console.log('⚽ GOAL! Missed:', obj.shape, obj.color, 'Target:', currentWaveData.text);
          }
          return { ...newObj, processed: true };
        }

        return newObj;
      });

      // Apply score changes after iteration
      if (goalScored) {
        setGoals(g => g + 1);
      }
      if (pointsChange !== 0) {
        setScore(s => s + pointsChange);
      }

      // Remove objects that are hit or processed, or went off screen
      // IMPORTANT: Filter out processed objects immediately to prevent double counting
      const filtered = updated.filter(obj => !obj.hit && !obj.processed && obj.x < fieldWidth + 50);
      
      return filtered;
    });

    // Continue animation loop only if still playing
    if (gameState === 'playing') {
      animationFrameRef.current = requestAnimationFrame(updateObjects);
    }
  }, [gameState, checkMatch]); // Removed changing dependencies

  const handleMouseMove = (e) => {
    if (!fieldRef.current || gameState !== 'playing') return;
    
    const rect = fieldRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    setGoalkeeperY(Math.max(40, Math.min(rect.height - 40, y)));
  };

  const handleTouchMove = (e) => {
    if (!fieldRef.current || gameState !== 'playing') return;
    
    const rect = fieldRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const y = touch.clientY - rect.top;
    setGoalkeeperY(Math.max(40, Math.min(rect.height - 40, y)));
  };

  useEffect(() => {
    if (gameState === 'playing') {
      console.log('Starting game loop...');
      
      // Spawn first object immediately
      spawnObject();
      
      // Start spawning objects
      spawnIntervalRef.current = setInterval(() => {
        console.log('Spawning object...');
        spawnObject();
      }, 1500);
      
      // Start animation loop
      animationFrameRef.current = requestAnimationFrame(updateObjects);

      return () => {
        console.log('Cleaning up game loop...');
        if (spawnIntervalRef.current) {
          clearInterval(spawnIntervalRef.current);
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [gameState]); // Only depend on gameState

  useEffect(() => {
    if (goals >= maxGoals) {
      setGameState('gameover');
    }
  }, [goals]);

  // Auto-rotate wave every 10 correct saves
  useEffect(() => {
    if (correctSaves > 0 && correctSaves % 10 === 0) {
      console.log('🔄 Rotating wave after', correctSaves, 'correct saves');
      const nextWaveIndex = (currentWave + 1) % WAVES.length;
      setCurrentWave(nextWaveIndex);
      // Update refs immediately to prevent lag
      waveRef.current = WAVES[nextWaveIndex];
      currentWaveRef.current = nextWaveIndex;
      setCorrectSaves(0); // Reset counter
    }
  }, [correctSaves, currentWave]);

  const nextWave = () => {
    if (currentWave < WAVES.length - 1) {
      setCurrentWave(c => c + 1);
      setObjects([]);
      setGameState('playing');
    } else {
      setGameState('victory');
    }
  };

  return (
    <GameContainer>
      <Header>
        <Button onClick={onBack}><FaArrowLeft /> Salir</Button>
        <Score>⭐ {score} | 🥅 {goals}/{maxGoals}</Score>
      </Header>

      {gameState === 'menu' && (
        <MenuOverlay>
          <h1 style={{ color: '#4A90E2', marginBottom: '1rem', fontSize: '2.5rem' }}>⚽ Portero de Formas</h1>
          <p style={{ fontSize: '1.2rem', color: '#555' }}>
            ¡Para las formas que te piden! Mueve el portero con el ratón.
          </p>
          <StartButton onClick={startGame}>¡Jugar!</StartButton>
        </MenuOverlay>
      )}

      {gameState === 'gameover' && (
        <GameOverOverlay $won={false}>
          <h1 style={{ color: '#E74C3C', fontSize: '3rem' }}>😢 ¡Demasiados goles!</h1>
          <p style={{ fontSize: '1.5rem', margin: '1rem 0' }}>
            Oleada: {currentWave + 1}/{WAVES.length}
          </p>
          <p style={{ fontSize: '1.3rem', margin: '1rem 0' }}>
            Puntuación: {score}
          </p>
          <Button onClick={() => setGameState('menu')} style={{ marginTop: '1rem', fontSize: '1.3rem', padding: '1rem 2rem' }}>
            Volver al menú
          </Button>
        </GameOverOverlay>
      )}

      {gameState === 'victory' && (
        <GameOverOverlay $won={true}>
          <h1 style={{ color: '#2ECC71', fontSize: '3rem' }}>🎉 ¡Victoria!</h1>
          <p style={{ fontSize: '1.5rem', margin: '1rem 0' }}>
            ¡Completaste todas las oleadas!
          </p>
          <p style={{ fontSize: '1.3rem', margin: '1rem 0' }}>
            Puntuación final: {score}
          </p>
          <Button onClick={() => setGameState('menu')} style={{ marginTop: '1rem', fontSize: '1.3rem', padding: '1rem 2rem' }}>
            Volver al menú
          </Button>
        </GameOverOverlay>
      )}

      {(gameState === 'playing' || gameState === 'waveComplete') && wave && (
        <>
          <InstructionPanel>
            <InstructionText $color={instructionColor}>{wave.text}</InstructionText>
          </InstructionPanel>

          <PlayingField 
            ref={fieldRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
          >
            <GoalPost />
            <Goalkeeper $y={goalkeeperY} />
            
            {objects.map(obj => (
              <Shape key={obj.id} $x={obj.x} $y={obj.y}>
                <ShapeComponent 
                  shape={obj.shape} 
                  color={COLORS[obj.color].value} 
                />
              </Shape>
            ))}
          </PlayingField>

          {gameState === 'waveComplete' && (
            <MenuOverlay>
              <h1 style={{ color: '#2ECC71', fontSize: '2.5rem' }}>✅ ¡Oleada Completada!</h1>
              <p style={{ fontSize: '1.3rem', margin: '1rem 0' }}>
                Puntuación: {score}
              </p>
              <StartButton onClick={nextWave}>
                {currentWave < WAVES.length - 1 ? 'Siguiente Oleada' : 'Finalizar'}
              </StartButton>
            </MenuOverlay>
          )}
        </>
      )}
    </GameContainer>
  );
};

export default ShapeGoalkeeperGame;
