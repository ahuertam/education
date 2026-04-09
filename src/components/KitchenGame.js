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

const InstructionsCard = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 320px;
  background: rgba(0, 0, 0, 0.65);
  border: 2px solid rgba(0, 255, 0, 0.4);
  color: #fff;
  padding: 1rem 1.2rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.35);
  font-family: inherit;
  z-index: 6;
`;

const ModeRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const ModeButton = styled.button`
  flex: 1;
  padding: 0.45rem 0.65rem;
  border-radius: 8px;
  border: 2px solid ${props => props.$active ? '#00ff00' : 'rgba(255,255,255,0.25)'};
  background: ${props => props.$active ? 'rgba(0,255,0,0.18)' : 'rgba(255,255,255,0.08)'};
  color: white;
  font-weight: bold;
  cursor: pointer;
`;

const InstructionTitle = styled.h3`
  margin: 0 0 0.6rem 0;
  color: #00ff00;
  text-shadow: 0 0 6px rgba(0, 255, 0, 0.5);
`;

const InstructionList = styled.ol`
  margin: 0.5rem 0 0 1.2rem;
  padding: 0;
  line-height: 1.35;
  font-size: 0.95rem;
`;

const HintLine = styled.div`
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255,255,255,0.2);
  font-size: 0.95rem;
  color: #e0e0e0;
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

const MixPanelTitle = styled.h4`
  margin: 0.9rem 0 0.5rem 0;
  border-top: 2px dashed rgba(0,0,0,0.25);
  padding-top: 0.7rem;
  font-size: 1.05rem;
`;

const MixRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
  font-size: 1rem;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.12);
  font-size: 0.9rem;
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

const StatusBanner = styled.div`
  position: absolute;
  top: 88px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.$type === 'success' ? 'rgba(0, 255, 0, 0.18)' : props.$type === 'error' ? 'rgba(255, 0, 0, 0.18)' : 'rgba(0,0,0,0.35)'};
  border: 2px solid ${props => props.$type === 'success' ? 'rgba(0, 255, 0, 0.55)' : props.$type === 'error' ? 'rgba(255, 0, 0, 0.55)' : 'rgba(255,255,255,0.25)'};
  padding: 0.7rem 1.1rem;
  border-radius: 12px;
  font-weight: bold;
  text-align: center;
  z-index: 21;
  width: min(620px, calc(100% - 2rem));
  box-shadow: 0 10px 25px rgba(0,0,0,0.35);
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
  const [touched, setTouched] = useState({ A: false, B: false, C: false });
  const [statusMessage, setStatusMessage] = useState('');
  const [gameMode, setGameMode] = useState('easy');
  
  const bgMusicRef = useRef(new Audio(`${process.env.PUBLIC_URL}/lab1.mp3`));
  const timeoutsRef = useRef([]);
  const hookBusyRef = useRef(false);
  const currentMixRef = useRef(currentMix);
  const labAreaRef = useRef(null);
  const jarRefs = useRef({});

  useEffect(() => {
    currentMixRef.current = currentMix;
  }, [currentMix]);

  const addTimeout = (fn, delay) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  // Background Music
  useEffect(() => {
    const bgMusic = bgMusicRef.current;
    bgMusic.loop = true;
    bgMusic.volume = 0.5;
    bgMusic.play().catch(e => console.log("Audio play failed", e));

    return () => {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    };
  }, []);

  // Generate a new recipe
  const generateRecipe = () => {
    clearAllTimeouts();
    const targets = [
      { ml: 20, label: '1/5' },
      { ml: 25, label: '1/4' },
      { ml: 33, label: '1/3' },
      { ml: 40, label: '2/5' },
      { ml: 50, label: '1/2' },
      { ml: 60, label: '3/5' },
      { ml: 67, label: '2/3' },
      { ml: 75, label: '3/4' },
      { ml: 80, label: '4/5' }
    ];
    const shuffled = [...targets].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, INGREDIENTS.length);
    const newRecipe = INGREDIENTS.map((ing, i) => ({
      ...ing,
      targetMl: chosen[i].ml,
      targetLabel: chosen[i].label
    }));
    setRecipe(newRecipe);
    setCurrentMix({ A: 0, B: 0, C: 0 });
    setSelectedIngredient(null);
    setSliderValue(0);
    setTouched({ A: false, B: false, C: false });
    setStatusMessage('');
    hookBusyRef.current = false;
    setGameState('playing');
  };

  useEffect(() => {
    generateRecipe();
    return () => {
      clearAllTimeouts();
    };
  }, []);

  const handleJarClick = (ingredient) => {
    if (gameState !== 'playing' || hookBusyRef.current) return;
    hookBusyRef.current = true;
    if (bgMusicRef.current && bgMusicRef.current.paused) {
      bgMusicRef.current.play().catch(e => console.log("Audio play failed", e));
    }

    const jarNode = jarRefs.current[ingredient.id];
    const labNode = labAreaRef.current;
    let targetX = 50;

    if (jarNode && labNode) {
      const jarRect = jarNode.getBoundingClientRect();
      const labRect = labNode.getBoundingClientRect();
      const center = jarRect.left + (jarRect.width / 2);
      targetX = ((center - labRect.left) / labRect.width) * 100;
      targetX = Math.max(8, Math.min(92, targetX));
    }
    
    // Animate hook
    setHookPosition({ x: targetX, height: 50 }); // Move horizontally
    
    addTimeout(() => {
      setHookPosition({ x: targetX, height: 200 }); // Drop down
      
      addTimeout(() => {
        setHookPosition({ x: targetX, height: 50 }); // Pull up
        setSelectedIngredient(ingredient);
        setSliderValue(currentMixRef.current[ingredient.id] || 0);
        hookBusyRef.current = false;
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
    setTouched(prev => ({ ...prev, [selectedIngredient.id]: true }));
  };

  const allTouched = touched.A && touched.B && touched.C;

  const getTargetForSelected = () => {
    if (!selectedIngredient) return null;
    return recipe.find(r => r.id === selectedIngredient.id) || null;
  };

  const selectedTarget = getTargetForSelected();

  const handleMix = () => {
    if (recipe.length === 0 || gameState !== 'playing') return;
    if (!allTouched) {
      setStatusMessage('Ajusta los 3 ingredientes antes de mezclar.');
      addTimeout(() => setStatusMessage(''), 1600);
      return;
    }
    // Check if mix matches recipe
    const isCorrect = recipe.every(item => {
      const current = currentMix[item.id];
      return Math.abs(current - item.targetMl) < 5; // Allow small tolerance
    });

    if (isCorrect) {
      setGameState('success');
      setStatusMessage('✅ ¡Antídoto perfecto! Nueva receta en 2 segundos...');
      setScore(s => s + 100);
      addTimeout(generateRecipe, 2000);
    } else {
      setGameState('exploded');
      setStatusMessage('💥 ¡Explosión! Revisa la receta y vuelve a intentarlo.');
      setScore(s => Math.max(0, s - 50));
      addTimeout(() => {
        setGameState('playing');
        setCurrentMix({ A: 0, B: 0, C: 0 });
        setSelectedIngredient(null);
        setSliderValue(0);
        setTouched({ A: false, B: false, C: false });
        hookBusyRef.current = false;
        setStatusMessage('');
      }, 2000);
    }
  };

  const handleBack = () => {
    clearAllTimeouts();
    onBack();
  };

  return (
    <GameContainer>
      {gameState === 'exploded' && <Explosion />}
      
      <Header>
        <BackButton onClick={handleBack}>
          <FaArrowLeft /> Salir
        </BackButton>
        <ScoreDisplay>Puntos: {score}</ScoreDisplay>
      </Header>

      <LabArea ref={labAreaRef}>
        {(statusMessage || gameState !== 'playing') && (
          <StatusBanner $type={gameState === 'success' ? 'success' : gameState === 'exploded' ? 'error' : 'info'}>
            {statusMessage}
          </StatusBanner>
        )}

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
                ref={(el) => { jarRefs.current[ing.id] = el; }}
                onClick={() => handleJarClick(ing)}
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
              <span>{gameMode === 'easy' ? `${item.targetLabel} (${item.targetMl} ml)` : item.targetLabel}</span>
            </RecipeItem>
          ))}
          <MixPanelTitle>Tu mezcla</MixPanelTitle>
          {recipe.map(item => {
            const current = currentMix[item.id] || 0;
            const ok = Math.abs(current - item.targetMl) < 5 && touched[item.id];
            const missing = !touched[item.id];
            return (
              <MixRow key={`${item.id}-mix`}>
                <span>{item.name}</span>
                <Pill>
                  {missing ? '—' : `${current} ml`}
                  {ok ? <FaCheck /> : <FaTimes />}
                </Pill>
              </MixRow>
            );
          })}
        </RecipeBook>

        <InstructionsCard>
          <InstructionTitle>Cómo jugar</InstructionTitle>
          <ModeRow>
            <ModeButton $active={gameMode === 'easy'} onClick={() => setGameMode('easy')}>
              Fácil
            </ModeButton>
            <ModeButton $active={gameMode === 'hard'} onClick={() => setGameMode('hard')}>
              Difícil
            </ModeButton>
          </ModeRow>
          <InstructionList>
            <li>Haz clic en un frasco para seleccionarlo.</li>
            <li>Ajusta la cantidad con la barra (ml).</li>
            <li>Repite con los 3 ingredientes.</li>
            <li>Pulsa MEZCLAR para comprobar el antídoto.</li>
          </InstructionList>
          <HintLine>
            {selectedIngredient && selectedTarget ? (
              <>
                Objetivo de <strong>{selectedIngredient.name}</strong>: <strong>{selectedTarget.targetLabel}</strong>{gameMode === 'easy' ? <> ({selectedTarget.targetMl} ml)</> : null}. Ahora llevas <strong>{currentMix[selectedIngredient.id] || 0} ml</strong>.
              </>
            ) : (
              <>
                {gameMode === 'easy'
                  ? 'Pista: en modo fácil ves fracción y su equivalente en ml.'
                  : 'Modo difícil: solo ves fracciones. Convierte mentalmente a ml para ajustar.'}
              </>
            )}
          </HintLine>
        </InstructionsCard>

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
            <ActionButton onClick={handleMix} disabled={gameState !== 'playing' || recipe.length === 0 || !allTouched}>
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
