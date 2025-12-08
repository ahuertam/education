import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaPause, FaPlay, FaRedo } from 'react-icons/fa';
import dragonLessons from './data/dragonLessons.json';

const GameContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #87CEEB 0%, #E0F7FA 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
`;

const HUD = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 100;
  pointer-events: none;
`;

const Button = styled.button`
  background: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #333;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  pointer-events: auto;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const TargetSentence = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem 2rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  pointer-events: auto;
  max-width: 60%;
`;

const SpanishText = styled.h2`
  margin: 0;
  color: #2C3E50;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;

const EnglishProgress = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const WordPlaceholder = styled.span`
  background: ${props => props.filled ? '#2ECC71' : '#EEE'};
  color: ${props => props.filled ? 'white' : 'transparent'};
  padding: 0.25rem 0.75rem;
  border-radius: 10px;
  border: 2px dashed ${props => props.filled ? '#27AE60' : '#BDC3C7'};
  min-width: 30px;
  font-weight: bold;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  touch-action: none;
`;

const GameOverModal = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  z-index: 200;
`;

const DragonTragonGame = ({ onBack }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(5);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [spanishSentence, setSpanishSentence] = useState("");
  const [targetWords, setTargetWords] = useState([]);
  const [collectedWords, setCollectedWords] = useState([]);

  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);

  const [allWords, setAllWords] = useState([]); // Pool for distractors
  const [shuffledKeys, setShuffledKeys] = useState([]); // Random order of sentences

  // Fisher-Yates Shuffle
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Game State Refs (for animation loop)
  const dragonRef = useRef({
    x: 100,
    y: 100,
    body: [], // Array of {x, y, word}
    angle: 0,
    speed: 3,
    direction: { x: 1, y: 0 },
    jawOpen: 0 // For animation
  });
  const cloudsRef = useRef([]); // Array of {x, y, word, speed, scale}
  const keysPressed = useRef({});

  // Initialize Level & Shuffle
  useEffect(() => {
    const sentences = dragonLessons[level];
    if (sentences) {
      const keys = Object.keys(sentences);
      setShuffledKeys(shuffleArray(keys));
      setCurrentSentenceIndex(0);
    }
  }, [level]);

  // Setup Current Sentence
  useEffect(() => {
    const sentences = dragonLessons[level];
    if (sentences && shuffledKeys.length > 0) {
      if (currentSentenceIndex < shuffledKeys.length) {
        const spanish = shuffledKeys[currentSentenceIndex];
        const english = sentences[spanish];
        setSpanishSentence(spanish);
        const words = english.split(' ');
        setTargetWords(words);
        setCollectedWords([]);
        
        // Reset Dragon
        dragonRef.current = {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          body: [],
          angle: 0,
          speed: 4,
          direction: { x: 1, y: 0 },
          jawOpen: 0
        };
        
        // Reset Clouds
        cloudsRef.current = [];
        
        setIsPlaying(true);
      } else {
        setGameWon(true);
        setIsPlaying(false);
      }
    }
  }, [level, currentSentenceIndex, shuffledKeys]);

  // Extract all words for distractors
  useEffect(() => {
    const words = new Set();
    const sentences = dragonLessons[level] || {};
    Object.values(sentences).forEach(sentence => {
      sentence.split(' ').forEach(word => words.add(word));
    });
    setAllWords(Array.from(words));
  }, [level]);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e) => keysPressed.current[e.key] = true;
    const handleKeyUp = (e) => keysPressed.current[e.key] = false;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game Loop
  const update = useCallback(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update Dragon Direction
    const dragon = dragonRef.current;
    if (keysPressed.current['ArrowUp']) dragon.direction = { x: 0, y: -1 };
    if (keysPressed.current['ArrowDown']) dragon.direction = { x: 0, y: 1 };
    if (keysPressed.current['ArrowLeft']) dragon.direction = { x: -1, y: 0 };
    if (keysPressed.current['ArrowRight']) dragon.direction = { x: 1, y: 0 };

    // Move Dragon Head
    const prevHeadPos = { x: dragon.x, y: dragon.y };
    dragon.x += dragon.direction.x * dragon.speed;
    dragon.y += dragon.direction.y * dragon.speed;

    // Boundary Check (Wrap around)
    if (dragon.x < 0) dragon.x = canvas.width;
    if (dragon.x > canvas.width) dragon.x = 0;
    if (dragon.y < 0) dragon.y = canvas.height;
    if (dragon.y > canvas.height) dragon.y = 0;

    // Update Body
    if (dragon.body.length > 0) {
      // Move first segment to where head was
      let prevPos = prevHeadPos;
      
      dragon.body.forEach((segment, index) => {
        // Simple follow logic: move towards prevPos
        // To make it smoother and look like a snake, we can store history of positions
        // For now, let's just lerp or simple follow with distance constraint
        
        const dx = prevPos.x - segment.x;
        const dy = prevPos.y - segment.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const targetDist = 30; // Distance between segments
        
        if (dist > targetDist) {
            const angle = Math.atan2(dy, dx);
            segment.x += Math.cos(angle) * (dist - targetDist); // Move to maintain distance
            segment.y += Math.sin(angle) * (dist - targetDist);
        }
        
        prevPos = { x: segment.x, y: segment.y };
      });
    }

    // Spawn Clouds
    if (Math.random() < 0.02 && cloudsRef.current.length < 10) {
      // Pick a random word from the target set OR a distractor (using other words from the sentence for now)
      // To ensure playable, prioritize the NEXT needed word if not present
      const neededIndex = dragon.body.length;
      const nextWord = targetWords[neededIndex];
      
      let wordToSpawn;
      // 50% chance to spawn the next correct word
      if (Math.random() < 0.5 && nextWord) {
        wordToSpawn = nextWord;
      } else if (allWords.length > 0) {
        // Random distractor
        wordToSpawn = allWords[Math.floor(Math.random() * allWords.length)];
      }

      // Ensure we don't spam the screen too much
      if (wordToSpawn) {
        cloudsRef.current.push({
            x: Math.random() < 0.5 ? -50 : canvas.width + 50,
            y: Math.random() * canvas.height,
            word: wordToSpawn,
            speed: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? 1 : -1),
            radius: 30
        });
      }
    }

    // Update and Draw Clouds
    cloudsRef.current.forEach((cloud, index) => {
      cloud.x += cloud.speed;
      
      // Remove if off screen
      if (cloud.x < -100 || cloud.x > canvas.width + 100) {
        cloudsRef.current.splice(index, 1);
        return;
      }

      // Draw Cloud
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw Word
      ctx.fillStyle = '#333';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cloud.word, cloud.x, cloud.y);

      // Collision Detection with Head
      const dx = dragon.x - cloud.x;
      const dy = dragon.y - cloud.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist < 30 + 15) { // Head radius + Cloud radius approx
        // Check if it's the correct next word
        const nextWordIndex = dragon.body.length;
        if (targetWords[nextWordIndex] === cloud.word) {
          // Correct!
          dragon.body.push({ x: cloud.x, y: cloud.y, word: cloud.word });
          setCollectedWords(prev => [...prev, cloud.word]);
          cloudsRef.current.splice(index, 1);
          
          // Score update
          const points = 10 * multiplier;
          setScore(s => s + points);
          const newStreak = streak + 1;
          setStreak(newStreak);
          setMultiplier(1 + Math.floor(newStreak / 5));

           if (dragon.body.length === targetWords.length) {
             // Delay slightly then next sentence
             setTimeout(() => {
                 setCurrentSentenceIndex(prev => prev + 1);
             }, 1000);
          }
        } else {
          // Wrong word - Penalties
          cloudsRef.current.splice(index, 1); // remove the bad cloud
          
          // Reset sentence progress
          setCollectedWords([]);
          dragon.body = [];
          
          // Reset Streak & Multiplier
          setStreak(0);
          setMultiplier(1);
          
          // Visual feedback could be added here (screen shake etc)
        }
      }
    });

    // Draw Dragon Body
    dragon.body.forEach(segment => {
      ctx.fillStyle = '#E67E22';
      ctx.beginPath();
      ctx.arc(segment.x, segment.y, 20, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText(segment.word, segment.x, segment.y);
    });

    // Draw Dragon Head (Geometric Custom Design)
    ctx.save();
    ctx.translate(dragon.x, dragon.y);
    
    // Calculate angle based on direction
    const headAngle = Math.atan2(dragon.direction.y, dragon.direction.x);
    ctx.rotate(headAngle);

    // Jaw animation
    const jawOffset = Math.sin(Date.now() / 150) * 5; // Oscillate
    
    // Main Head Color
    ctx.fillStyle = '#D35400';
    
    // Upper Jaw
    ctx.fillRect(-15, -20 - jawOffset, 30, 20);
    // Lower Jaw
    ctx.fillRect(-15, 0 + jawOffset, 30, 15);
    
    // Eyes (on upper jaw)
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(0, -15 - jawOffset, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(2, -15 - jawOffset, 2, 0, Math.PI * 2);
    ctx.fill();

    // Teeth
    ctx.fillStyle = '#FFF';
    // Upper teeth
    ctx.beginPath();
    ctx.moveTo(10, -jawOffset);
    ctx.lineTo(15, -jawOffset + 5);
    ctx.lineTo(5, -jawOffset + 5);
    ctx.fill();
    
    ctx.restore();


    requestRef.current = requestAnimationFrame(update);
  }, [isPlaying, targetWords]); // Added update to dependencies, but carefully to avoid infinite re-creation if not wrapped in callback.
  // Actually update uses refs mostly, so it's stable. Dependencies: isPlaying is key.

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  return (
    <GameContainer>
      <HUD>
        <Button onClick={onBack}>
          <FaArrowLeft />
        </Button>
        
        <TargetSentence>
            <SpanishText>{spanishSentence}</SpanishText>
            <EnglishProgress>
                {targetWords.map((word, idx) => (
                    <WordPlaceholder key={idx} filled={idx < collectedWords.length}>
                        {word}
                    </WordPlaceholder>
                ))}
            </EnglishProgress>
        </TargetSentence>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'white', padding: '0.5rem 1rem', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <strong>Puntos:</strong> {score}
            </div>
            <div style={{ background: '#FFEB3B', padding: '0.5rem 1rem', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <strong>x{multiplier}</strong>
            </div>
        </div>

        <Button onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </Button>
      </HUD>

      <Canvas ref={canvasRef} />
      
      {gameWon && (
          <GameOverModal>
              <h2>¡Fantástico!</h2>
              <p>Has completado todas las frases.</p>
              <Button onClick={onBack} style={{width: 'auto', padding: '1rem', borderRadius: '10px'}}>
                  Volver al Menú
              </Button>
          </GameOverModal>
      )}
    </GameContainer>
  );
};

export default DragonTragonGame;
