import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaArrowLeft, FaFlask, FaCheck, FaTimes } from 'react-icons/fa';

// --- Styled Components ---

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const shake = keyframes`
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
`;

const GameContainer = styled.div`
  min-height: 100vh;
  background-color: #2c003e; /* Deep purple background */
  background-image: radial-gradient(circle at 50% 50%, #4a006a 0%, #2c003e 100%);
  color: #fff;
  font-family: 'Courier New', Courier, monospace;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;
`;

const BackButton = styled.button`
  background: transparent;
  border: 2px solid #00ff00;
  color: #00ff00;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: inherit;
  font-weight: bold;
  
  &:hover {
    background: #00ff00;
    color: #000;
  }
`;

const ScoreDisplay = styled.div`
  font-size: 1.5rem;
  color: #00ff00;
  text-shadow: 0 0 5px #00ff00;
`;

const LabArea = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const ShelvesContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  margin-top: 2rem;
`;

const Shelf = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const Jar = styled.div`
  width: 60px;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  overflow: hidden;

  &:hover {
    transform: scale(1.05);
    border-color: #fff;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 70%;
    background-color: ${props => props.$color};
    opacity: 0.8;
  }
`;

const JarLabel = styled.span`
  position: absolute;
  top: -25px;
  font-size: 0.8rem;
  color: #ddd;
  text-align: center;
  width: 100px;
`;

// Hook/Claw Component
const HookContainer = styled.div`
  position: absolute;
  top: 0;
  left: 50%; /* Initial position */
  transform: translateX(-50%);
  width: 40px;
  height: ${props => props.$height}px;
  transition: height 0.5s ease-in-out, left 0.5s ease-in-out;
  z-index: 5;
  pointer-events: none;
`;

const HookLine = styled.div`
  width: 4px;
  height: 100%;
  background: #888;
  margin: 0 auto;
`;

const Claw = styled.div`
  width: 40px;
  height: 30px;
  border: 4px solid #888;
  border-top: none;
  border-radius: 0 0 20px 20px;
  position: absolute;
  bottom: 0;
  left: 0;
  
  &::before, &::after {
    content: '';
    position: absolute;
    top: -10px;
    width: 4px;
    height: 15px;
    background: #888;
  }
  &::before { left: -4px; transform: rotate(-20deg); }
  &::after { right: -4px; transform: rotate(20deg); }
`;

const PrepArea = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding-bottom: 2rem;
  position: relative;
`;

const RecipeBook = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  width: 250px;
  background: #f4e4bc;
  color: #333;
  padding: 1rem;
  border-radius: 5px;
  box-shadow: 5px 5px 15px rgba(0,0,0,0.5);
  font-family: 'Times New Roman', serif;
  transform: rotate(-2deg);
`;

const RecipeTitle = styled.h3`
  text-align: center;
  border-bottom: 2px solid #333;
  margin-bottom: 0.5rem;
`;

const RecipeItem = styled.div`
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  display: flex;
  justify-content: space-between;
`;

const Cauldron = styled.div`
  width: 200px;
  height: 150px;
  background: #222;
  border-radius: 0 0 100px 100px;
  position: relative;
  border: 4px solid #444;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 10px;
    width: 180px;
    height: 40px;
    background: ${props => props.$liquidColor || '#111'};
    border-radius: 50%;
    transition: background 0.5s;
  }
`;

const Controls = styled.div`
  background: rgba(0,0,0,0.6);
  padding: 1rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  min-width: 200px;
`;

const Slider = styled.input`
  width: 100%;
  cursor: pointer;
`;

const ActionButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1.2rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 4px 0 #c0392b;
  
  &:active {
    transform: translateY(4px);
    box-shadow: none;
  }
  
  &:disabled {
    background: #7f8c8d;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const Explosion = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, #ff0000 0%, #ffaa00 50%, transparent 80%);
  animation: ${fadeIn} 0.5s ease-out reverse;
  pointer-events: none;
  z-index: 20;
`;

// --- Game Logic & Data ---

const INGREDIENTS = [
  { id: 'A', name: 'Líquido A', color: '#00ff00' }, // Green
  { id: 'B', name: 'Polvo B', color: '#00ffff' },   // Cyan
  { id: 'C', name: 'Esencia C', color: '#ff00ff' }, // Magenta
];

const KitchenGame = ({ onBack }) => {
  const [gameState, setGameState] = useState('playing'); // playing, exploded, success
  const [recipe, setRecipe] = useState([]);
  const [currentMix, setCurrentMix] = useState({ A: 0, B: 0, C: 0 });
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [hookPosition, setHookPosition] = useState({ x: 50, height: 50 }); // x in %, height in px
  const [sliderValue, setSliderValue] = useState(0);
  const [score, setScore] = useState(0);

  // Generate a new recipe
  const generateRecipe = () => {
    // Simple logic for now: random values between 10 and 100
    const newRecipe = INGREDIENTS.map(ing => ({
      ...ing,
      target: Math.floor(Math.random() * 9 + 1) * 10 // 10, 20, ... 90
    }));
    setRecipe(newRecipe);
    setCurrentMix({ A: 0, B: 0, C: 0 });
    setGameState('playing');
  };

  useEffect(() => {
    generateRecipe();
  }, []);

  const handleJarClick = (ingredient, index) => {
    if (gameState !== 'playing') return;
    
    // Calculate hook position based on jar index (simplified)
    // Assuming 3 jars centered: 30%, 50%, 70%
    const positions = [35, 50, 65];
    const targetX = positions[index];
    
    // Animate hook
    setHookPosition({ x: targetX, height: 50 }); // Move horizontally
    
    setTimeout(() => {
      setHookPosition({ x: targetX, height: 200 }); // Drop down
      
      setTimeout(() => {
        setHookPosition({ x: targetX, height: 50 }); // Pull up
        setSelectedIngredient(ingredient);
        setSliderValue(currentMix[ingredient.id] || 0);
      }, 500);
    }, 500);
  };

  const handleSliderChange = (e) => {
    if (!selectedIngredient) return;
    const val = parseInt(e.target.value);
    setSliderValue(val);
    setCurrentMix(prev => ({
      ...prev,
      [selectedIngredient.id]: val
    }));
  };

  const handleMix = () => {
    // Check if mix matches recipe
    const isCorrect = recipe.every(item => {
      const current = currentMix[item.id];
      return Math.abs(current - item.target) < 5; // Allow small tolerance
    });

    if (isCorrect) {
      setGameState('success');
      setScore(s => s + 100);
      setTimeout(generateRecipe, 2000);
    } else {
      setGameState('exploded');
      setScore(s => Math.max(0, s - 50));
      setTimeout(() => {
        setGameState('playing');
        setCurrentMix({ A: 0, B: 0, C: 0 });
      }, 2000);
    }
  };

  return (
    <GameContainer>
      {gameState === 'exploded' && <Explosion />}
      
      <Header>
        <BackButton onClick={onBack}>
          <FaArrowLeft /> Salir
        </BackButton>
        <ScoreDisplay>Puntos: {score}</ScoreDisplay>
      </Header>

      <LabArea>
        <HookContainer style={{ left: `${hookPosition.x}%`, height: `${hookPosition.height}px` }}>
          <HookLine />
          <Claw />
        </HookContainer>

        <ShelvesContainer>
          {INGREDIENTS.map((ing, index) => (
            <Shelf key={ing.id}>
              <JarLabel>{ing.name}</JarLabel>
              <Jar 
                $color={ing.color} 
                onClick={() => handleJarClick(ing, index)}
              >
                {/* Visual fill level could go here */}
              </Jar>
            </Shelf>
          ))}
        </ShelvesContainer>

        <RecipeBook>
          <RecipeTitle>Receta Antídoto</RecipeTitle>
          {recipe.map(item => (
            <RecipeItem key={item.id}>
              <span>{item.name}:</span>
              {/* Display as fraction or decimal later */}
              <span>{item.target} ml</span>
            </RecipeItem>
          ))}
        </RecipeBook>

        <PrepArea>
          <Controls>
            <h3>
              {selectedIngredient ? `Añadiendo: ${selectedIngredient.name}` : 'Selecciona un ingrediente'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Slider 
                type="range" 
                min="0" 
                max="100" 
                value={sliderValue} 
                onChange={handleSliderChange}
                disabled={!selectedIngredient}
              />
              <span>{sliderValue} ml</span>
            </div>
            <ActionButton onClick={handleMix} disabled={gameState !== 'playing'}>
              MEZCLAR
            </ActionButton>
          </Controls>

          <Cauldron $liquidColor={gameState === 'success' ? '#00ff00' : '#330033'}>
            {/* Bubbles animation could go here */}
          </Cauldron>
        </PrepArea>
      </LabArea>
    </GameContainer>
  );
};

export default KitchenGame;
