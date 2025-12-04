import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';

const rise = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100vh);
  }
`;

const pop = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.8; }
  100% { transform: scale(0); opacity: 0; }
`;

const deflate = keyframes`
  0% { transform: scale(1) scaleY(1); }
  50% { transform: scale(0.8) scaleY(0.6); }
  100% { transform: scale(0.3) scaleY(0.1); opacity: 0; }
`;

const GameContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #4A90E2 0%, #E8F4F8 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
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

const Balloon = styled.div`
  position: absolute;
  bottom: ${props => props.$isPopping ? 'auto' : '-100px'};
  left: ${props => props.$left}%;
  animation: ${props => props.$isPopping ? pop : props.$isDeflating ? deflate : rise} 
             ${props => props.$isPopping || props.$isDeflating ? '0.5s' : props.$speed}s linear;
  animation-fill-mode: forwards;
  cursor: ${props => props.$awaitingClassification ? 'default' : 'pointer'};
  z-index: ${props => props.$awaitingClassification ? 6 : 5};
`;

const BalloonBody = styled.div`
  width: 150px;
  height: 180px;
  background: ${props => props.color};
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-shadow: inset -10px -10px 20px rgba(0,0,0,0.2),
              inset 10px 10px 20px rgba(255,255,255,0.3),
              0 10px 20px rgba(0,0,0,0.3);
  border: 3px solid rgba(255,255,255,0.5);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 20%;
    left: 30%;
    width: 30px;
    height: 40px;
    background: rgba(255,255,255,0.4);
    border-radius: 50%;
    transform: rotate(-20deg);
  }
`;

const BalloonString = styled.div`
  width: 2px;
  height: 60px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), transparent);
  margin: 0 auto;
`;

const SyllableContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  align-items: center;
  margin-top: auto;
  margin-bottom: auto;
`;

const Syllable = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  color: ${props => props.$isSelected ? '#FFD700' : 'white'};
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  padding: 4px 8px;
  border-radius: 8px;
  background: ${props => props.$isSelected ? 'rgba(255,215,0,0.3)' : 'transparent'};
  border: 2px solid ${props => props.$isSelected ? '#FFD700' : 'transparent'};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  
  &:hover {
    ${props => !props.$disabled && `
      transform: scale(1.1);
      background: rgba(255,255,255,0.2);
    `}
  }
`;

const ClassificationButtons = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 15px;
  z-index: 7;
`;

const ClassifyButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1.3rem;
  font-weight: bold;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(0,0,0,0.3);
  transition: all 0.2s;
  color: white;
  background: ${props => props.$type === 'diptongo' ? '#2ECC71' : '#E74C3C'};
  
  &:hover {
    transform: scale(1.1) translateY(-4px);
    box-shadow: 0 12px 20px rgba(0,0,0,0.4);
  }
  
  &:active {
    transform: scale(1.05);
  }
`;

const Confetti = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  background: ${props => props.color};
  top: ${props => props.top}px;
  left: ${props => props.left}px;
  animation: confettiFall 1s ease-out forwards;
  
  @keyframes confettiFall {
    to {
      transform: translateY(${props => props.distance}px) rotate(${props => props.rotation}deg);
      opacity: 0;
    }
  }
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
`;

const StartButton = styled(Button)`
  font-size: 1.5rem;
  padding: 1rem 2rem;
  margin-top: 1rem;
  background: #4A90E2;
  color: white;
  border-color: #357ABD;
  
  &:hover {
    background: #357ABD;
  }
`;

const FeedbackPanel = styled.div`
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%) scale(${props => props.$show ? 1 : 0});
  background: ${props => props.$isCorrect ? '#2ECC71' : '#E74C3C'};
  color: white;
  padding: 1rem 2rem;
  border-radius: 15px;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 8px 16px rgba(0,0,0,0.3);
  z-index: 15;
  transition: transform 0.3s ease;
  min-width: 300px;
  text-align: center;
`;

// Word database with syllables, stressed index, and classification
const WORDS = [
  // Diptongos (20 total)
  { syllables: ['ciu', 'dad'], stressedIndex: 1, type: 'diptongo', word: 'ciudad' },
  { syllables: ['tie', 'rra'], stressedIndex: 0, type: 'diptongo', word: 'tierra' },
  { syllables: ['vie', 'jo'], stressedIndex: 0, type: 'diptongo', word: 'viejo' },
  { syllables: ['cau', 'sa'], stressedIndex: 0, type: 'diptongo', word: 'causa' },
  { syllables: ['bai', 'le'], stressedIndex: 0, type: 'diptongo', word: 'baile' },
  { syllables: ['pei', 'ne'], stressedIndex: 0, type: 'diptongo', word: 'peine' },
  { syllables: ['au', 'to'], stressedIndex: 0, type: 'diptongo', word: 'auto' },
  { syllables: ['eu', 'ro'], stressedIndex: 0, type: 'diptongo', word: 'euro' },
  { syllables: ['rei', 'no'], stressedIndex: 0, type: 'diptongo', word: 'reino' },
  { syllables: ['cue', 'va'], stressedIndex: 0, type: 'diptongo', word: 'cueva' },
  { syllables: ['fue', 'go'], stressedIndex: 0, type: 'diptongo', word: 'fuego' },
  { syllables: ['puer', 'ta'], stressedIndex: 0, type: 'diptongo', word: 'puerta' },
  { syllables: ['bue', 'no'], stressedIndex: 0, type: 'diptongo', word: 'bueno' },
  { syllables: ['rue', 'da'], stressedIndex: 0, type: 'diptongo', word: 'rueda' },
  { syllables: ['ai', 're'], stressedIndex: 0, type: 'diptongo', word: 'aire' },
  { syllables: ['seis'], stressedIndex: 0, type: 'diptongo', word: 'seis' },
  { syllables: ['vein', 'te'], stressedIndex: 0, type: 'diptongo', word: 'veinte' },
  { syllables: ['nue', 've'], stressedIndex: 0, type: 'diptongo', word: 'nueve' },
  { syllables: ['cui', 'da', 'do'], stressedIndex: 2, type: 'diptongo', word: 'cuidado' },
  { syllables: ['lim', 'pio'], stressedIndex: 0, type: 'diptongo', word: 'limpio' },
  
  // Hiatos (20 total)
  { syllables: ['pa', 'is'], syllablesWithAccent: ['pa', 'ís'], stressedIndex: 1, type: 'hiato', word: 'país' },
  { syllables: ['le', 'er'], syllablesWithAccent: ['le', 'er'], stressedIndex: 1, type: 'hiato', word: 'leer' },
  { syllables: ['Ma', 'ri', 'a'], syllablesWithAccent: ['Ma', 'rí', 'a'], stressedIndex: 1, type: 'hiato', word: 'María' },
  { syllables: ['te', 'a', 'tro'], syllablesWithAccent: ['te', 'a', 'tro'], stressedIndex: 1, type: 'hiato', word: 'teatro' },
  { syllables: ['re', 'ir'], syllablesWithAccent: ['re', 'ír'], stressedIndex: 1, type: 'hiato', word: 'reír' },
  { syllables: ['po', 'e', 'ta'], syllablesWithAccent: ['po', 'e', 'ta'], stressedIndex: 2, type: 'hiato', word: 'poeta' },
  { syllables: ['ma', 'iz'], syllablesWithAccent: ['ma', 'íz'], stressedIndex: 1, type: 'hiato', word: 'maíz' },
  { syllables: ['ra', 'iz'], syllablesWithAccent: ['ra', 'íz'], stressedIndex: 1, type: 'hiato', word: 'raíz' },
  { syllables: ['ca', 'i', 'da'], syllablesWithAccent: ['ca', 'í', 'da'], stressedIndex: 1, type: 'hiato', word: 'caída' },
  { syllables: ['bu', 'ho'], syllablesWithAccent: ['bú', 'ho'], stressedIndex: 0, type: 'hiato', word: 'búho' },
  { syllables: ['di', 'a'], syllablesWithAccent: ['dí', 'a'], stressedIndex: 0, type: 'hiato', word: 'día' },
  { syllables: ['fri', 'o'], syllablesWithAccent: ['frí', 'o'], stressedIndex: 0, type: 'hiato', word: 'frío' },
  { syllables: ['ti', 'o'], syllablesWithAccent: ['tí', 'o'], stressedIndex: 0, type: 'hiato', word: 'tío' },
  { syllables: ['ri', 'o'], syllablesWithAccent: ['rí', 'o'], stressedIndex: 0, type: 'hiato', word: 'río' },
  { syllables: ['le', 'on'], syllablesWithAccent: ['le', 'ón'], stressedIndex: 1, type: 'hiato', word: 'león' },
  { syllables: ['pe', 'on'], syllablesWithAccent: ['pe', 'ón'], stressedIndex: 1, type: 'hiato', word: 'peón' },
  { syllables: ['re', 'al'], syllablesWithAccent: ['re', 'al'], stressedIndex: 1, type: 'hiato', word: 'real' },
  { syllables: ['cre', 'er'], syllablesWithAccent: ['cre', 'er'], stressedIndex: 1, type: 'hiato', word: 'creer' },
  { syllables: ['a', 'e', 're', 'o'], syllablesWithAccent: ['a', 'é', 're', 'o'], stressedIndex: 1, type: 'hiato', word: 'aéreo' },
  { syllables: ['ba', 'ul'], syllablesWithAccent: ['ba', 'úl'], stressedIndex: 1, type: 'hiato', word: 'baúl' },
];

const AccentHunterGame = ({ onBack }) => {
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('menu');
  const [balloons, setBalloons] = useState([]);
  const [confetti, setConfetti] = useState([]);
  const [selectedBalloon, setSelectedBalloon] = useState(null);
  const [feedback, setFeedback] = useState({ show: false, isCorrect: false, message: '' });
  
  const bgMusicRef = useRef(new Audio(`${process.env.PUBLIC_URL}/lab2.mp3`));

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
  
  const nextId = useRef(0);
  const spawnInterval = useRef(null);

  const balloonColors = ['#FF6B9D', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94', '#C7CEEA'];

  const createBalloon = useCallback(() => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    const balloon = {
      id: nextId.current++,
      ...word,
      left: Math.random() * 80 + 10,
      speed: 15 + Math.random() * 5,
      color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
      selectedSyllableIndex: null,
      awaitingClassification: false,
      isPopping: false,
      isDeflating: false
    };
    return balloon;
  }, [balloonColors]);

  const startGame = () => {
    setScore(0);
    setBalloons([createBalloon()]); // Start with one balloon immediately
    setConfetti([]);
    setSelectedBalloon(null);
    setGameState('playing');
    
    // Spawn balloons periodically
    spawnInterval.current = setInterval(() => {
      setBalloons(prev => {
        if (prev.length < 3) {
          return [...prev, createBalloon()];
        }
        return prev;
      });
    }, 3000);
  };

  const handleSyllableClick = (balloon, syllableIndex) => {
    if (balloon.awaitingClassification || balloon.isPopping || balloon.isDeflating) return;
    
    // Hide previous feedback when clicking new balloon
    setFeedback({ show: false, isCorrect: false, message: '' });

    setBalloons(prev => prev.map(b => {
      if (b.id === balloon.id) {
        const isCorrect = syllableIndex === b.stressedIndex;
        if (isCorrect) {
          setSelectedBalloon(b.id);
          setFeedback({ show: true, isCorrect: true, message: '¡Sílaba correcta! 🎯' });
          setTimeout(() => setFeedback({ show: false, isCorrect: false, message: '' }), 4000);
          return { ...b, selectedSyllableIndex: syllableIndex, awaitingClassification: true };
        } else {
          // Wrong syllable - deflate
          setScore(s => Math.max(0, s - 3));
          setFeedback({ show: true, isCorrect: false, message: '❌ Sílaba incorrecta' });
          setTimeout(() => setFeedback({ show: false, isCorrect: false, message: '' }), 1500);
          setTimeout(() => {
            setBalloons(prev => {
              const filtered = prev.filter(balloon => balloon.id !== b.id);
              if (filtered.length < 3) {
                return [...filtered, createBalloon()];
              }
              return filtered;
            });
          }, 500);
          return { ...b, isDeflating: true };
        }
      }
      return b;
    }));
  };

  const handleClassification = (balloon, chosenType) => {
    const isCorrect = chosenType === balloon.type;
    
    if (isCorrect) {
      // Correct! Pop balloon and show confetti
      setScore(s => s + 10);
      setFeedback({ show: true, isCorrect: true, message: `✅ ¡Correcto! Es un ${chosenType}` });
      setTimeout(() => setFeedback({ show: false, isCorrect: false, message: '' }), 5000); // Extended to see the accent better
      
      // Create confetti
      const newConfetti = [];
      for (let i = 0; i < 20; i++) {
        newConfetti.push({
          id: Date.now() + i,
          top: window.innerHeight / 2,
          left: window.innerWidth / 2,
          color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
          distance: 100 + Math.random() * 100,
          rotation: Math.random() * 360
        });
      }
      setConfetti(prev => [...prev, ...newConfetti]);
      setTimeout(() => setConfetti([]), 1000);
      
      setBalloons(prev => prev.map(b => 
        b.id === balloon.id ? { ...b, isPopping: true } : b
      ));
      
      setTimeout(() => {
        setBalloons(prev => {
          const filtered = prev.filter(b => b.id !== balloon.id);
          if (filtered.length < 3) {
            return [...filtered, createBalloon()];
          }
          return filtered;
        });
        setSelectedBalloon(null);
      }, 500);
    } else {
      // Wrong classification - deflate
      setScore(s => Math.max(0, s - 3));
      setFeedback({ show: true, isCorrect: false, message: `❌ Incorrecto. Era un ${balloon.type}` });
      setTimeout(() => setFeedback({ show: false, isCorrect: false, message: '' }), 1500);
      setBalloons(prev => prev.map(b => 
        b.id === balloon.id ? { ...b, isDeflating: true, awaitingClassification: false } : b
      ));
      
      setTimeout(() => {
        setBalloons(prev => {
          const filtered = prev.filter(b => b.id !== balloon.id);
          if (filtered.length < 3) {
            return [...filtered, createBalloon()];
          }
          return filtered;
        });
        setSelectedBalloon(null);
      }, 500);
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') {
      if (spawnInterval.current) {
        clearInterval(spawnInterval.current);
      }
    }
    
    return () => {
      if (spawnInterval.current) {
        clearInterval(spawnInterval.current);
      }
    };
  }, [gameState]);

  // Remove balloons that have floated off screen
  useEffect(() => {
    if (gameState === 'playing') {
      const removeInterval = setInterval(() => {
        setBalloons(prev => prev.filter(b => !b.isPopping && !b.isDeflating));
      }, 20000);
      
      return () => clearInterval(removeInterval);
    }
  }, [gameState]);

  return (
    <GameContainer>
      <Header>
        <Button onClick={onBack}><FaArrowLeft /> Salir</Button>
        <Score>⭐ {score}</Score>
      </Header>

      <FeedbackPanel $show={feedback.show} $isCorrect={feedback.isCorrect}>
        {feedback.message}
      </FeedbackPanel>

      {gameState === 'menu' && (
        <MenuOverlay>
          <h1 style={{ color: '#4A90E2', marginBottom: '1rem', fontSize: '2.5rem' }}>🎈 Cazador de Acentos</h1>
          <p style={{ fontSize: '1.2rem', color: '#555' }}>
            Haz clic en la sílaba tónica y clasifica si es diptongo o hiato
          </p>
          <StartButton onClick={startGame}>¡Jugar!</StartButton>
        </MenuOverlay>
      )}

      {gameState === 'playing' && (
        <>
          {balloons.map(balloon => (
            <Balloon
              key={balloon.id}
              $left={balloon.left}
              $speed={balloon.speed}
              $isPopping={balloon.isPopping}
              $isDeflating={balloon.isDeflating}
              $awaitingClassification={balloon.awaitingClassification}
            >
              <BalloonBody color={balloon.color}>
                <SyllableContainer>
                  {balloon.syllables.map((syllable, index) => {
                    // Show accent only if this syllable is selected and correct
                    const displaySyllable = balloon.selectedSyllableIndex === index && balloon.syllablesWithAccent
                      ? balloon.syllablesWithAccent[index]
                      : syllable;
                    
                    return (
                      <Syllable
                        key={index}
                        $isSelected={balloon.selectedSyllableIndex === index}
                        $disabled={balloon.awaitingClassification}
                        onClick={() => handleSyllableClick(balloon, index)}
                      >
                        {displaySyllable}
                      </Syllable>
                    );
                  })}
                </SyllableContainer>
              </BalloonBody>
              <BalloonString />
              
              {balloon.awaitingClassification && selectedBalloon === balloon.id && (
                <ClassificationButtons>
                  <ClassifyButton
                    $type="diptongo"
                    onClick={() => handleClassification(balloon, 'diptongo')}
                  >
                    DIPTONGO
                  </ClassifyButton>
                  <ClassifyButton
                    $type="hiato"
                    onClick={() => handleClassification(balloon, 'hiato')}
                  >
                    HIATO
                  </ClassifyButton>
                </ClassificationButtons>
              )}
            </Balloon>
          ))}

          {confetti.map(piece => (
            <Confetti
              key={piece.id}
              top={piece.top}
              left={piece.left}
              color={piece.color}
              distance={piece.distance}
              rotation={piece.rotation}
            />
          ))}
        </>
      )}
    </GameContainer>
  );
};

export default AccentHunterGame;
