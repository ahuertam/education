import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';

const GameContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #000;
  color: #fff;
  font-family: 'Courier New', Courier, monospace;
  overflow: hidden;
  position: relative;
`;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
`;

const UIOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  pointer-events: none;
  display: flex;
  justify-content: space-between;
  align-items: flex-start; // Prevent stretching
  box-sizing: border-box;
`;

const StatBox = styled.div`
  border: 1px solid #fff;
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.5);
  width: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const MessageOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid #fff;
  padding: 40px;
  z-index: 10;
`;

const Button = styled.button`
  background: transparent;
  border: 1px solid #fff;
  color: #fff;
  padding: 10px 20px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.2rem;
  cursor: pointer;
  margin-top: 20px;
  pointer-events: auto;

  &:hover {
    background: #fff;
    color: #000;
  }
`;

const BackButton = styled(Button)`
  position: absolute;
  top: 20px;
  left: 20px;
  margin: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MathLanderGame = ({ onBack, operation = 'multiplication' }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('start'); // start, playing, landed, crashed, gameover
  const [score, setScore] = useState(0);
  const [fuel, setFuel] = useState(1000);
  const fuelRef = useRef(1000); // Ref for physics loop to avoid re-renders
  const [message, setMessage] = useState('');
  const [currentProblem, setCurrentProblem] = useState(null);
  const explosionSoundRef = useRef(new Audio(`${process.env.PUBLIC_URL}/explosion.mp3`));
  const bgMusicRef = useRef(new Audio(`${process.env.PUBLIC_URL}/stars.mp3`));
  
  // Game physics state
  const stateRef = useRef({
    ship: {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2, // Pointing up
      thrusting: false,
      rotatingLeft: false,
      rotatingRight: false
    },
    platforms: [],
    terrain: [],
    particles: [],
    stars: []
  });

  // Constants
  const GRAVITY = 0.015; // Very low gravity for kids
  const THRUST = 0.05; // Gentle thrust
  const ROTATION_SPEED = 0.03; // Keep rotation responsive
  const LANDING_MAX_SPEED = 20.0; // Extremely forgiving landing speed
  const LANDING_MAX_ANGLE = 0.8; // More forgiving landing angle (~45 degrees)

  const generateProblem = () => {
    let a, b, answer, operator;
    const difficulty = 1; // Can be expanded later

    switch(operation) {
      case 'addition':
        a = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * 20) + 1;
        answer = a + b;
        operator = '+';
        break;
      case 'subtraction':
        a = Math.floor(Math.random() * 20) + 5;
        b = Math.floor(Math.random() * a);
        answer = a - b;
        operator = '-';
        break;
      case 'division':
        b = Math.floor(Math.random() * 9) + 2;
        answer = Math.floor(Math.random() * 9) + 1;
        a = b * answer;
        operator = '÷';
        break;
      case 'multiplication':
      default:
        a = Math.floor(Math.random() * 9) + 2;
        b = Math.floor(Math.random() * 9) + 2;
        answer = a * b;
        operator = '×';
        break;
    }

    // Generate distractors
    const answers = new Set([answer]);
    while(answers.size < 3) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrong = answer + offset;
      if (wrong >= 0 && wrong !== answer) answers.add(wrong);
    }
    
    return {
      text: `${a} ${operator} ${b} = ?`,
      answer: answer,
      options: Array.from(answers).sort(() => Math.random() - 0.5)
    };
  };

  const initLevel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const problem = generateProblem();
    setCurrentProblem(problem);

    // Reset ship
    stateRef.current.ship = {
      x: width / 2,
      y: 50,
      vx: (Math.random() - 0.5) * 2,
      vy: 0,
      angle: -Math.PI / 2,
      thrusting: false,
      rotatingLeft: false,
      rotatingRight: false
    };

    setFuel(1000);
    fuelRef.current = 1000;

    // Generate terrain and platforms
    const segments = 20;
    const segmentWidth = width / segments;
    const terrain = [];
    const platforms = [];
    
    // Define platform positions (left, center, right)
    const platformIndices = [4, 10, 16]; 
    
    let currentHeight = height * 0.8;
    
    for (let i = 0; i <= segments; i++) {
      const isPlatformStart = platformIndices.includes(i);
      const isPlatformEnd = platformIndices.includes(i - 1);
      
      if (isPlatformStart) {
        // Start of platform - flatten
        const platformIndex = platformIndices.indexOf(i);
        platforms.push({
          x: i * segmentWidth - segmentWidth * 0.5, // Center platform better
          y: currentHeight - 20, // Raise platform to prevent terrain collision
          width: segmentWidth * 3, // Platforms are 3 segments wide (larger)
          value: problem.options[platformIndex]
        });
        terrain.push({ x: i * segmentWidth, y: currentHeight });
      } else if (isPlatformEnd) {
        // End of platform - keep same height
        terrain.push({ x: i * segmentWidth, y: currentHeight });
      } else if (platformIndices.includes(i - 2)) {
         // Just finished a platform, can change height now
         currentHeight += (Math.random() - 0.5) * 100;
         currentHeight = Math.max(height * 0.6, Math.min(height * 0.9, currentHeight));
         terrain.push({ x: i * segmentWidth, y: currentHeight });
      } else {
        // Normal terrain
        currentHeight += (Math.random() - 0.5) * 100;
        currentHeight = Math.max(height * 0.6, Math.min(height * 0.9, currentHeight));
        terrain.push({ x: i * segmentWidth, y: currentHeight });
      }
    }

    stateRef.current.terrain = terrain;
    stateRef.current.platforms = platforms;
    
    // Generate stars (static and moving)
    stateRef.current.stars = Array.from({ length: 100 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.6), // Limit stars to upper 60% of screen to avoid underground stars
      size: Math.random() * 2 + (i % 10 === 0 ? 1 : 0), // Some slightly larger
      speed: i % 5 === 0 ? Math.random() * 0.5 + 0.1 : 0, // 20% are moving
      opacity: Math.random() * 0.5 + 0.5
    }));
  };

  const startGame = () => {
    setGameState('playing');
    initLevel();
  };

  useEffect(() => {
    // Background music setup
    const bgMusic = bgMusicRef.current;
    bgMusic.loop = true;
    bgMusic.volume = 0.5; // Set volume to 50%
    
    // Attempt to play music
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Auto-play was prevented:", error);
      });
    }

    return () => {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      switch(e.code) {
        case 'ArrowUp':
        case 'Space':
          stateRef.current.ship.thrusting = true;
          break;
        case 'ArrowLeft':
          stateRef.current.ship.rotatingLeft = true;
          break;
        case 'ArrowRight':
          stateRef.current.ship.rotatingRight = true;
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch(e.code) {
        case 'ArrowUp':
        case 'Space':
          stateRef.current.ship.thrusting = false;
          break;
        case 'ArrowLeft':
          stateRef.current.ship.rotatingLeft = false;
          break;
        case 'ArrowRight':
          stateRef.current.ship.rotatingRight = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (gameState === 'start') {
        // Initial setup if needed
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const checkCollision = (ship, terrain, platforms) => {
      // Simple point collision for ship vertices
      const shipPoints = [
        { x: ship.x + Math.cos(ship.angle) * 20, y: ship.y + Math.sin(ship.angle) * 20 }, // Nose
        { x: ship.x + Math.cos(ship.angle + 2.6) * 15, y: ship.y + Math.sin(ship.angle + 2.6) * 15 }, // Left
        { x: ship.x + Math.cos(ship.angle - 2.6) * 15, y: ship.y + Math.sin(ship.angle - 2.6) * 15 }  // Right
      ];

      // Check platform landings
      for (let platform of platforms) {
        if (ship.x >= platform.x && ship.x <= platform.x + platform.width) {
          // Above platform
          if (ship.y + 10 >= platform.y && ship.y - 10 <= platform.y) {
             // Touching platform
             const speed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
             // Normalize angle to be around -PI/2 (up)
             let angle = ship.angle;
             while (angle < -Math.PI) angle += Math.PI * 2;
             while (angle > Math.PI) angle -= Math.PI * 2;
             const angleDiff = Math.abs(angle - (-Math.PI / 2));

             if (speed < LANDING_MAX_SPEED && angleDiff < LANDING_MAX_ANGLE) {
               return { type: 'landed', platform };
             } else {
               return { type: 'crashed', reason: speed >= LANDING_MAX_SPEED ? 'Too Fast' : 'Bad Angle' };
             }
          }
        }
      }

      // Check terrain collision (simplified)
      for (let point of shipPoints) {
        if (point.y > canvas.height) return { type: 'crashed', reason: 'Out of Bounds' };
        
        // Find terrain segment below point
        // This is a basic check, could be improved with line intersection
        for (let i = 0; i < terrain.length - 1; i++) {
          const p1 = terrain[i];
          const p2 = terrain[i+1];
          if (point.x >= p1.x && point.x <= p2.x) {
            // Linear interpolation to find ground height at point.x
            const t = (point.x - p1.x) / (p2.x - p1.x);
            const groundY = p1.y + t * (p2.y - p1.y);
            if (point.y >= groundY) {
              return { type: 'crashed', reason: 'Terrain' };
            }
          }
        }
      }
      
      // Screen boundaries
      if (ship.x < 0 || ship.x > canvas.width || ship.y < -100) {
          // Wrap around x, cap y
          if (ship.x < 0) stateRef.current.ship.x = canvas.width;
          if (ship.x > canvas.width) stateRef.current.ship.x = 0;
      }

      return null;
    };

    const render = () => {
      if (gameState === 'playing') {
        const { ship } = stateRef.current;

        // Physics
        ship.vy += GRAVITY;
        ship.x += ship.vx;
        ship.y += ship.vy;

        if (ship.rotatingLeft) ship.angle -= ROTATION_SPEED;
        if (ship.rotatingRight) ship.angle += ROTATION_SPEED;

        if (ship.thrusting && fuelRef.current > 0) {
          ship.vx += Math.cos(ship.angle) * THRUST;
          ship.vy += Math.sin(ship.angle) * THRUST;
          fuelRef.current = Math.max(0, fuelRef.current - 1);
          setFuel(fuelRef.current);
          
          // Add particles
          for(let i=0; i<3; i++) {
            stateRef.current.particles.push({
              x: ship.x - Math.cos(ship.angle) * 15,
              y: ship.y - Math.sin(ship.angle) * 15,
              vx: ship.vx - Math.cos(ship.angle) * (Math.random() * 5 + 2),
              vy: ship.vy - Math.sin(ship.angle) * (Math.random() * 5 + 2),
              life: 1.0
            });
          }
        }

        // Collision
        const collision = checkCollision(ship, stateRef.current.terrain, stateRef.current.platforms);
        if (collision) {
          if (collision.type === 'landed') {
            if (collision.platform.value === currentProblem.answer) {
              setGameState('won');
              setScore(s => s + 100 + Math.floor(fuelRef.current / 10));
              setMessage('¡Correcto! Aterrizaje Exitoso');
            } else {
              setGameState('lost');
              setMessage(`Incorrecto. La respuesta era ${currentProblem.answer}`);
            }
          } else {
            setGameState('crashed');
            setMessage(`¡Te estrellaste! (${collision.reason})`);
            
            // Play explosion sound
            explosionSoundRef.current.currentTime = 0;
            explosionSoundRef.current.play().catch(e => console.log('Audio play failed', e));

            // Create explosion particles (ship parts)
            for(let i=0; i<10; i++) {
              stateRef.current.particles.push({
                x: ship.x,
                y: ship.y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 2.0,
                type: 'debris', // New particle type
                angle: Math.random() * Math.PI * 2,
                length: Math.random() * 20 + 10
              });
            }
          }
        }
      }

      // Drawing
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      stateRef.current.stars.forEach(star => {
        // Update moving stars
        if (star.speed > 0) {
          star.x -= star.speed;
          if (star.x < 0) star.x = canvas.width;
        }
        
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      // Terrain
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (stateRef.current.terrain.length > 0) {
        ctx.moveTo(stateRef.current.terrain[0].x, stateRef.current.terrain[0].y);
        for (let i = 1; i < stateRef.current.terrain.length; i++) {
          ctx.lineTo(stateRef.current.terrain[i].x, stateRef.current.terrain[i].y);
        }
      }
      ctx.stroke();

      // Platforms
      stateRef.current.platforms.forEach(platform => {
        // Draw platform line
        ctx.beginPath();
        ctx.moveTo(platform.x, platform.y);
        ctx.lineTo(platform.x + platform.width, platform.y);
        
        // Draw legs
        ctx.moveTo(platform.x + 5, platform.y);
        ctx.lineTo(platform.x + 5, platform.y + 20);
        ctx.moveTo(platform.x + platform.width - 5, platform.y);
        ctx.lineTo(platform.x + platform.width - 5, platform.y + 20);
        
        ctx.strokeStyle = '#00FF00'; // Neon green
        ctx.lineWidth = 4; // Thicker line
        ctx.stroke();
        ctx.lineWidth = 2; // Reset line width
        ctx.strokeStyle = 'white'; // Reset color

        // Draw text
        ctx.fillStyle = '#00FF00'; // Neon green text
        ctx.font = 'bold 24px Courier New'; // Larger and bold
        ctx.textAlign = 'center';
        ctx.fillText(platform.value, platform.x + platform.width / 2, platform.y - 10); // Draw above platform
        
        // Draw landing zone markers
        ctx.font = '12px Courier New';
        ctx.fillText('x2', platform.x + platform.width / 2, platform.y + 15); // Draw inside legs
      });

      // Ship
      if (gameState !== 'crashed') {
        const { ship } = stateRef.current;
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle + Math.PI / 2); // Adjust for drawing orientation

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(-15, 15);
        ctx.lineTo(0, 10);
        ctx.lineTo(15, 15);
        ctx.closePath();
        ctx.stroke();

        // Thrust flame
        if (ship.thrusting && fuelRef.current > 0) {
          ctx.beginPath();
          ctx.moveTo(-5, 15);
          ctx.lineTo(0, 15 + Math.random() * 20 + 10);
          ctx.lineTo(5, 15);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Particles
      stateRef.current.particles = stateRef.current.particles.filter(p => p.life > 0);
      stateRef.current.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${p.life})`;
        
        if (p.type === 'debris') {
          // Draw line segments for debris
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle + p.life); // Rotate as they fly
          ctx.beginPath();
          ctx.moveTo(-p.length/2, 0);
          ctx.lineTo(p.length/2, 0);
          ctx.stroke();
          ctx.restore();
        } else {
          // Standard thrust particles
          ctx.fillStyle = `rgba(255, 255, 255, ${p.life})`;
          ctx.fillRect(p.x, p.y, 2, 2);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, currentProblem]); // Removed fuel from dependencies

  return (
    <GameContainer>
      <Canvas ref={canvasRef} />
      
      <BackButton onClick={onBack}>
        <FaArrowLeft /> Salir
      </BackButton>

      <UIOverlay>
        <StatBox style={{ marginLeft: '140px' }}>
          SCORE: {score.toString().padStart(6, '0')}
        </StatBox>
        <StatBox style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          {currentProblem ? currentProblem.text : 'PREPARING...'}
        </StatBox>
        <StatBox>
          FUEL: {fuel}
          <div style={{ 
            width: '100px', 
            height: '10px', 
            border: '1px solid white',
            marginTop: '5px'
          }}>
            <div style={{
              width: `${fuel/10}%`,
              height: '100%',
              background: fuel < 200 ? 'red' : 'white'
            }} />
          </div>
        </StatBox>
        <StatBox>
          ALT: {Math.max(0, Math.floor(600 - stateRef.current.ship.y))}
          <br/>
          HS: {Math.abs(Math.floor(stateRef.current.ship.vx * 10))}
          <br/>
          VS: {Math.floor(stateRef.current.ship.vy * 10)}
        </StatBox>
      </UIOverlay>

      {gameState === 'start' && (
        <MessageOverlay>
          <h1>MATH LANDER</h1>
          <p>Usa las flechas para controlar la nave.</p>
          <p>Aterriza suavemente en la plataforma con la respuesta correcta.</p>
          <p>¡Cuidado con la velocidad y el combustible!</p>
          <Button onClick={startGame}>INICIAR MISIÓN</Button>
        </MessageOverlay>
      )}

      {(gameState === 'won' || gameState === 'lost' || gameState === 'crashed') && (
        <MessageOverlay>
          <h2>{gameState === 'won' ? '¡MISIÓN CUMPLIDA!' : 'MISIÓN FALLIDA'}</h2>
          <p>{message}</p>
          <Button onClick={startGame}>SIGUIENTE MISIÓN</Button>
        </MessageOverlay>
      )}
    </GameContainer>
  );
};

export default MathLanderGame;
