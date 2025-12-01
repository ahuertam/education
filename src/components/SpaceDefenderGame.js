import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaRocket } from 'react-icons/fa';

const GameContainer = styled.div`
  min-height: 100vh;
  background: #000;
  color: white;
  position: relative;
  overflow: hidden;
`;

const StarField = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 2px;
    height: 2px;
    background: white;
    box-shadow: ${Array.from({length: 100}).map(() => 
      `${Math.random() * 100}vw ${Math.random() * 100}vh ${Math.random() * 2}px white`
    ).join(',')};
  }
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
`;

const Button = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const PlayArea = styled.div`
  height: 100vh;
  width: 100%;
  position: relative;
`;

const Asteroid = styled.div`
  position: absolute;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  transform: translate(-50%, -50%) rotate(${props => props.$rotation}deg);
  width: 80px;
  height: 80px;
  background: #666;
  border-radius: ${props => props.$borderRadius};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: inset -10px -10px 20px rgba(0,0,0,0.8);
  transition: top 0.1s linear;
  clip-path: polygon(
    20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%
  );
  
  &::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: #444;
    border-radius: 50%;
    top: 20%;
    left: 20%;
    opacity: 0.5;
  }
`;

const Ship = styled.div`
  position: absolute;
  bottom: 120px;
  left: 50%;
  width: 60px;
  height: 60px;
  transform: translate(-50%, 50%) rotate(${props => props.angle}deg);
  font-size: 3rem;
  color: #00ff00;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.1s linear;
  z-index: 2;
`;

const Controls = styled.div`
  position: absolute;
  bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 1rem;
  z-index: 10;
`;

const OptionButton = styled.button`
  background: #2196F3;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 0 #1976D2;
  
  &:active {
    transform: translateY(4px);
    box-shadow: none;
  }
`;

const Score = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const LaserBeam = styled.div`
  position: absolute;
  bottom: 150px; /* Adjusted to match ship center roughly */
  left: 50%;
  width: 4px;
  height: ${props => props.height}px;
  background: #00ff00;
  transform-origin: bottom center;
  transform: translate(-50%, 0) rotate(${props => props.angle}deg);
  box-shadow: 0 0 10px #00ff00;
  z-index: 1;
`;

const Particle = styled.div`
  position: absolute;
  width: 4px;
  height: 4px;
  background: ${props => props.color || '#fff'};
  border-radius: 50%;
  left: ${props => props.x}%;
  top: ${props => props.y}%;
  transform: translate(-50%, -50%);
  animation: explode 0.5s ease-out forwards;
  
  @keyframes explode {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(${props => props.dx}px, ${props => props.dy}px) scale(0);
      opacity: 0;
    }
  }
`;

const SpaceDefenderGame = ({ onBack }) => {
  const [score, setScore] = useState(0);
  const [asteroids, setAsteroids] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [laser, setLaser] = useState(null);
  const [explosions, setExplosions] = useState([]);
  const [shipAngle, setShipAngle] = useState(0);
  const [mouseX, setMouseX] = useState(window.innerWidth / 2);
  const [mouseY, setMouseY] = useState(0);
  const gameLoopRef = useRef();
  const shootSoundRef = useRef(new Audio(`${process.env.PUBLIC_URL}/beep.mp3`));
  const explosionSoundRef = useRef(new Audio(`${process.env.PUBLIC_URL}/explosion.mp3`));
  const bgmRef = useRef(new Audio(`${process.env.PUBLIC_URL}/stars.mp3`));

  const generateProblem = () => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    const answer = a * b;
    
    // Generate 4 numbers: 1 correct + 3 distractors
    const numbers = new Set([answer]);
    while(numbers.size < 4) {
      const distractor = answer + Math.floor(Math.random() * 20) - 10;
      if (distractor > 0) numbers.add(distractor);
    }
    
    const numbersArray = Array.from(numbers).sort(() => Math.random() - 0.5);
    
    // Create 4 asteroids with different positions and speeds
    const newAsteroids = numbersArray.map((num, index) => {
      const r1 = Math.floor(Math.random() * 30) + 40;
      const r2 = Math.floor(Math.random() * 30) + 40;
      const r3 = Math.floor(Math.random() * 30) + 40;
      const r4 = Math.floor(Math.random() * 30) + 40;
      const borderRadius = `${r1}% ${r2}% ${r3}% ${r4}% / ${r3}% ${r1}% ${r4}% ${r2}%`;
      
      return {
        id: Date.now() + index,
        number: num,
        top: 0,
        left: 15 + (index * 23), // Spread them out: 15%, 38%, 61%, 84%
        borderRadius,
        rotation: Math.random() * 360,
        speed: 0.3 + Math.random() * 0.4, // Random speed between 0.3 and 0.7
        rotationSpeed: (Math.random() - 0.5) * 2 // Random rotation speed
      };
    });
    
    return {
      operation: `${a} × ${b}`,
      answer,
      asteroids: newAsteroids
    };
  };

  const startGame = () => {
    setScore(0);
    setGameOver(false);
    const problem = generateProblem();
    setCurrentProblem(problem);
    setAsteroids(problem.asteroids);
    setExplosions([]);
  };

  // BGM lifecycle management
  useEffect(() => {
    const bgm = bgmRef.current;
    bgm.loop = true;
    bgm.volume = 0.3;

    // Try to play BGM
    const playBGM = () => {
      bgm.play().catch(e => {
        console.log('BGM autoplay blocked, will start on first interaction');
        // Add one-time click listener to start BGM
        const startBGM = () => {
          bgm.play().catch(err => console.log('BGM play failed', err));
          document.removeEventListener('click', startBGM);
        };
        document.addEventListener('click', startBGM);
      });
    };

    playBGM();

    return () => {
      bgm.pause();
      bgm.currentTime = 0;
    };
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (gameOver) return;
    if (asteroids.length === 0) {
      if (!laser && explosions.length === 0) {
        startGame();
      }
      return;
    }

    // Calculate ship angle to point at mouse
    const shipX = window.innerWidth / 2;
    const shipY = window.innerHeight - 120;
    const targetX = mouseX;
    const targetY = mouseY;
    
    const deltaX = targetX - shipX;
    const deltaY = shipY - targetY;
    
    const angleRad = Math.atan2(deltaX, deltaY);
    setShipAngle((angleRad * 180) / Math.PI);

    const loop = setInterval(() => {
      setAsteroids(prev => {
        const updated = prev.map(ast => {
          if (ast.top > 85) {
            setGameOver(true);
            return ast;
          }
          return { 
            ...ast, 
            top: ast.top + ast.speed,
            rotation: ast.rotation + ast.rotationSpeed
          };
        });
        return updated;
      });
    }, 50);

    gameLoopRef.current = loop;
    return () => clearInterval(loop);
  }, [asteroids, gameOver, laser, explosions, mouseX, mouseY]);

  const createExplosion = (x, y) => {
    const particles = [];
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const velocity = 50 + Math.random() * 50;
      particles.push({
        id: Date.now() + i,
        x,
        y,
        dx: Math.cos(angle) * velocity,
        dy: Math.sin(angle) * velocity,
        color: `hsl(${Math.random() * 60 + 10}, 100%, 50%)`
      });
    }
    setExplosions(prev => [...prev, { id: Date.now(), particles }]);
    
    // Play explosion sound
    explosionSoundRef.current.volume = 0.6;
    explosionSoundRef.current.currentTime = 0;
    explosionSoundRef.current.play().catch(e => console.log('Explosion sound failed', e));
    
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== particles[0].id));
    }, 500);
  };

  const handleAsteroidClick = (clickedAsteroid) => {
    if (!currentProblem || laser) return;

    const isCorrect = clickedAsteroid.number === currentProblem.answer;

    if (isCorrect) {
      // Play shoot sound
      shootSoundRef.current.volume = 0.5;
      shootSoundRef.current.currentTime = 0;
      shootSoundRef.current.play().catch(e => console.log('Audio play failed', e));

      const shipX = window.innerWidth / 2;
      const shipY = window.innerHeight - 120;
      
      const targetX = (clickedAsteroid.left / 100) * window.innerWidth;
      const targetY = (clickedAsteroid.top / 100) * window.innerHeight;
      
      const deltaX = targetX - shipX;
      const deltaY = shipY - targetY;
      
      const angleRad = Math.atan2(deltaX, deltaY); 
      const angleDeg = (angleRad * 180) / Math.PI;

      const height = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      setLaser({ angle: angleDeg, height });

      setTimeout(() => {
        setLaser(null);
        createExplosion(clickedAsteroid.left, clickedAsteroid.top);
        setAsteroids(prev => prev.filter(a => a.id !== clickedAsteroid.id));
        setScore(s => s + 10);
        
        // Generate new round after short delay
        setTimeout(() => {
          const problem = generateProblem();
          setCurrentProblem(problem);
          setAsteroids(problem.asteroids);
        }, 500);
      }, 200);

    } else {
      setScore(s => Math.max(0, s - 5));
    }
  };

  return (
    <GameContainer>
      <StarField />
      <Header>
        <Button onClick={onBack}><FaArrowLeft /> Salir</Button>
        <Score>Puntos: {score}</Score>
      </Header>

      <PlayArea>
        {asteroids.map(ast => (
          <Asteroid 
            key={ast.id}
            top={ast.top} 
            left={ast.left} 
            $borderRadius={ast.borderRadius}
            $rotation={ast.rotation}
            onClick={() => handleAsteroidClick(ast)}
            style={{ cursor: 'pointer' }}
          >
            {ast.number}
          </Asteroid>
        ))}
        
        {laser && <LaserBeam height={laser.height} angle={laser.angle} />}
        
        {explosions.map(exp => (
          <div key={exp.id}>
            {exp.particles.map(p => (
              <Particle key={p.id} x={p.x} y={p.y} dx={p.dx} dy={p.dy} color={p.color} />
            ))}
          </div>
        ))}

        <Ship angle={shipAngle}><FaRocket /></Ship>
      </PlayArea>

      {gameOver ? (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.8)',
          padding: '2rem',
          borderRadius: '20px',
          zIndex: 20
        }}>
          <h2>¡Juego Terminado!</h2>
          <p>Puntuación final: {score}</p>
          <OptionButton onClick={startGame}>Jugar de nuevo</OptionButton>
        </div>
      ) : (
        currentProblem && (
          <div style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '0 0 20px rgba(0,255,0,0.8)',
            zIndex: 10
          }}>
            {currentProblem.operation} = ?
          </div>
        )
      )}
    </GameContainer>
  );
};

export default SpaceDefenderGame;
