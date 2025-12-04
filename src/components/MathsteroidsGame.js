import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  align-items: flex-start;
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
  white-space: nowrap;
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

const TouchControls = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  z-index: 15;
  pointer-events: auto;
`;

const TouchButton = styled.button`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid #fff;
  color: #fff;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  backdrop-filter: blur(5px);

  &:active {
    background: rgba(255, 255, 255, 0.4);
    transform: scale(0.95);
  }
`;

const MathsteroidsGame = ({ onBack, operation = 'multiplication' }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('start'); // start, playing, gameover
  const [score, setScore] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [isMobile] = useState(() => 'ontouchstart' in window || navigator.maxTouchPoints > 0);
  
  const explosionSoundRef = useRef(new Audio(`${process.env.PUBLIC_URL}/explosion.mp3`));
  const bgMusicRef = useRef(new Audio(`${process.env.PUBLIC_URL}/stars.mp3`));
  
  // Game physics state
  const stateRef = useRef({
    ship: {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      rotation: 0,
      thrusting: false,
      rotatingLeft: false,
      rotatingRight: false,
      shooting: false,
      cooldown: 0,
      invulnerable: 0 // Frames of invulnerability
    },
    asteroids: [],
    bullets: [],
    particles: [],
    stars: []
  });

  // Constants
  const SHIP_SIZE = 20;
  const ROTATION_SPEED = 0.08;
  const THRUST = 0.15;
  const FRICTION = 0.99;
  const BULLET_SPEED = 10;
  const BULLET_LIFETIME = 60;
  const ASTEROID_SPEED_MIN = 0.5;
  const ASTEROID_SPEED_MAX = 2;

  const generateProblem = useCallback(() => {
    let a, b, answer, operator;

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

    return {
      text: `${a} ${operator} ${b} = ?`,
      answer: answer
    };
  }, [operation]);

  const createAsteroid = (x, y, size, value, safeZone = null) => {
    let vx, vy;
    do {
      vx = (Math.random() - 0.5) * (ASTEROID_SPEED_MAX - ASTEROID_SPEED_MIN) * 2;
      vy = (Math.random() - 0.5) * (ASTEROID_SPEED_MAX - ASTEROID_SPEED_MIN) * 2;
    } while (Math.abs(vx) < ASTEROID_SPEED_MIN && Math.abs(vy) < ASTEROID_SPEED_MIN);

    // If safeZone is provided (usually ship position), ensure asteroid doesn't spawn too close
    if (safeZone) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 300; // Minimum distance from ship
      x = safeZone.x + Math.cos(angle) * dist;
      y = safeZone.y + Math.sin(angle) * dist;
    }

    // Generate random polygon shape
    const vertices = [];
    const numVertices = Math.floor(Math.random() * 5) + 7;
    for (let i = 0; i < numVertices; i++) {
      const angle = (i / numVertices) * Math.PI * 2;
      const radius = size * (0.8 + Math.random() * 0.4);
      vertices.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
    }

    return {
      x, y, vx, vy, size, value, vertices,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05
    };
  };

  const spawnAsteroids = (problem) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newAsteroids = [];
    // 1 Correct answer
    newAsteroids.push(createAsteroid(0, 0, 40, problem.answer, stateRef.current.ship));
    
    // 4 Distractors
    const answers = new Set([problem.answer]);
    while(answers.size < 5) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrong = problem.answer + offset;
      if (wrong >= 0 && wrong !== problem.answer) answers.add(wrong);
    }
    
    Array.from(answers).forEach(val => {
      if (val !== problem.answer) {
        newAsteroids.push(createAsteroid(0, 0, 40, val, stateRef.current.ship));
      }
    });

    stateRef.current.asteroids = newAsteroids;
  };

  const initGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    
    const problem = generateProblem();
    setCurrentProblem(problem);

    stateRef.current.ship = {
      x: width / 2,
      y: height / 2,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      thrusting: false,
      rotatingLeft: false,
      rotatingRight: false,
      shooting: false,
      cooldown: 0,
      invulnerable: 180 // 3 seconds invulnerability
    };

    stateRef.current.bullets = [];
    stateRef.current.particles = [];
    
    // Generate stars
    stateRef.current.stars = Array.from({ length: 100 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + (i % 10 === 0 ? 1 : 0),
      opacity: Math.random() * 0.5 + 0.5
    }));

    spawnAsteroids(problem);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    initGame();
    
    // Start music
    const bgMusic = bgMusicRef.current;
    bgMusic.loop = true;
    bgMusic.volume = 0.5;
    bgMusic.play().catch(e => console.log("Audio play failed", e));
  };

  const createExplosion = (x, y, color = 'white', count = 10) => {
    // Play sound
    const sound = explosionSoundRef.current.cloneNode();
    sound.play().catch(() => {});

    for(let i=0; i<count; i++) {
      stateRef.current.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 2.0,
        angle: Math.random() * Math.PI * 2,
        length: Math.random() * 20 + 5,
        color
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      switch(e.code) {
        case 'ArrowUp':
          stateRef.current.ship.thrusting = true;
          break;
        case 'ArrowLeft':
          stateRef.current.ship.rotatingLeft = true;
          break;
        case 'ArrowRight':
          stateRef.current.ship.rotatingRight = true;
          break;
        case 'Space':
          stateRef.current.ship.shooting = true;
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch(e.code) {
        case 'ArrowUp':
          stateRef.current.ship.thrusting = false;
          break;
        case 'ArrowLeft':
          stateRef.current.ship.rotatingLeft = false;
          break;
        case 'ArrowRight':
          stateRef.current.ship.rotatingRight = false;
          break;
        case 'Space':
          stateRef.current.ship.shooting = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
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
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const render = () => {
      if (gameState !== 'playing' && gameState !== 'start') return;

      const { ship, asteroids, bullets, particles, stars } = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Clear
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, width, height);

      // Stars
      ctx.fillStyle = 'white';
      stars.forEach(star => {
        ctx.globalAlpha = star.opacity;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });
      ctx.globalAlpha = 1;

      if (gameState === 'playing') {
        // Ship Physics
        if (ship.rotatingLeft) ship.angle -= ROTATION_SPEED;
        if (ship.rotatingRight) ship.angle += ROTATION_SPEED;
        
        if (ship.thrusting) {
          ship.vx += Math.cos(ship.angle) * THRUST;
          ship.vy += Math.sin(ship.angle) * THRUST;
          
          // Thrust particles
          if (Math.random() > 0.5) {
            particles.push({
              x: ship.x - Math.cos(ship.angle) * 15,
              y: ship.y - Math.sin(ship.angle) * 15,
              vx: ship.vx - Math.cos(ship.angle) * (Math.random() * 5 + 2),
              vy: ship.vy - Math.sin(ship.angle) * (Math.random() * 5 + 2),
              life: 0.5,
              length: 2,
              color: 'orange'
            });
          }
        }

        ship.vx *= FRICTION;
        ship.vy *= FRICTION;
        ship.x += ship.vx;
        ship.y += ship.vy;

        // Wrap ship
        if (ship.x < 0) ship.x = width;
        if (ship.x > width) ship.x = 0;
        if (ship.y < 0) ship.y = height;
        if (ship.y > height) ship.y = 0;

        // Shooting
        if (ship.cooldown > 0) ship.cooldown--;
        if (ship.shooting && ship.cooldown <= 0) {
          bullets.push({
            x: ship.x + Math.cos(ship.angle) * 20,
            y: ship.y + Math.sin(ship.angle) * 20,
            vx: Math.cos(ship.angle) * BULLET_SPEED,
            vy: Math.sin(ship.angle) * BULLET_SPEED,
            life: BULLET_LIFETIME
          });
          ship.cooldown = 15;
        }

        // Bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i];
          b.x += b.vx;
          b.y += b.vy;
          b.life--;

          if (b.life <= 0 || b.x < 0 || b.x > width || b.y < 0 || b.y > height) {
            bullets.splice(i, 1);
            continue;
          }

          // Check collision with asteroids
          for (let j = asteroids.length - 1; j >= 0; j--) {
            const a = asteroids[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < a.size) {
              // Hit!
              createExplosion(a.x, a.y);
              bullets.splice(i, 1);
              
              if (a.value === currentProblem.answer) {
                // Correct answer!
                setScore(s => s + 500);
                const newProblem = generateProblem();
                setCurrentProblem(newProblem);
                spawnAsteroids(newProblem); // Reset asteroids with new numbers
              } else {
                // Wrong answer
                setScore(s => Math.max(0, s - 100));
                // Respawn this asteroid elsewhere
                asteroids[j] = createAsteroid(0, 0, 40, a.value, ship); // Keep value or change? User said "only change numbers ... in case you hit it". Actually user said "cambian los números ... y la operación en caso de que la aciertes". So if wrong, maybe just respawn same or new distractor? Let's spawn new distractor.
                // Actually, let's keep it simple: destroy and respawn a new random distractor
                 const offset = Math.floor(Math.random() * 10) - 5;
                 let val = currentProblem.answer + offset;
                 if (val === currentProblem.answer) val += 1;
                 asteroids[j] = createAsteroid(0, 0, 40, val, ship);
              }
              break;
            }
          }
        }

        // Asteroids
        asteroids.forEach(a => {
          a.x += a.vx;
          a.y += a.vy;
          a.angle += a.rotationSpeed;

          if (a.x < -50) a.x = width + 50;
          if (a.x > width + 50) a.x = -50;
          if (a.y < -50) a.y = height + 50;
          if (a.y > height + 50) a.y = -50;

          // Check collision with ship
          if (ship.invulnerable <= 0) {
            const dx = ship.x - a.x;
            const dy = ship.y - a.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < a.size + 10) {
              // Crash!
              createExplosion(ship.x, ship.y, 'white', 20);
              ship.invulnerable = 180;
              ship.x = width / 2;
              ship.y = height / 2;
              ship.vx = 0;
              ship.vy = 0;
              setScore(s => Math.max(0, s - 200));
            }
          }
        });

        if (ship.invulnerable > 0) ship.invulnerable--;

        // Draw Ship
        if (ship.invulnerable % 20 < 10) { // Blink when invulnerable
            ctx.save();
            ctx.translate(ship.x, ship.y);
            ctx.rotate(ship.angle + Math.PI / 2);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.lineTo(-15, 15);
            ctx.lineTo(0, 10);
            ctx.lineTo(15, 15);
            ctx.closePath();
            ctx.stroke();
            
            if (ship.thrusting) {
                ctx.beginPath();
                ctx.moveTo(-5, 15);
                ctx.lineTo(0, 25);
                ctx.lineTo(5, 15);
                ctx.stroke();
            }
            ctx.restore();
        }

        // Draw Asteroids
        asteroids.forEach(a => {
            ctx.save();
            ctx.translate(a.x, a.y);
            ctx.rotate(a.angle);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (a.vertices.length > 0) {
                ctx.moveTo(a.vertices[0].x, a.vertices[0].y);
                for (let i = 1; i < a.vertices.length; i++) {
                    ctx.lineTo(a.vertices[i].x, a.vertices[i].y);
                }
            }
            ctx.closePath();
            ctx.stroke();

            // Draw Number - Fixed rotation so it's readable
            ctx.rotate(-a.angle); // Undo rotation for text
            ctx.fillStyle = '#00FF00';
            ctx.font = 'bold 24px Courier New';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(a.value, 0, 0);
            ctx.restore();
        });

        // Draw Bullets
        ctx.fillStyle = 'white';
        bullets.forEach(b => {
            ctx.beginPath();
            ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Particles
        stateRef.current.particles = particles.filter(p => p.life > 0);
        stateRef.current.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle + p.life);
            ctx.strokeStyle = p.color === 'orange' ? `rgba(255, 165, 0, ${p.life})` : `rgba(255, 255, 255, ${p.life})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-p.length/2, 0);
            ctx.lineTo(p.length/2, 0);
            ctx.stroke();
            ctx.restore();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, currentProblem, generateProblem]);

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
           {/* Placeholder for balance */}
           MATHSTEROIDS
        </StatBox>
      </UIOverlay>

      {gameState === 'start' && (
        <MessageOverlay>
          <h1>MATHSTEROIDS</h1>
          <p>Usa las flechas para moverte y ESPACIO para disparar.</p>
          <p>Destruye el asteroide con la respuesta correcta.</p>
          <Button onClick={startGame}>INICIAR MISIÓN</Button>
        </MessageOverlay>
      )}

      {isMobile && gameState === 'playing' && (
        <TouchControls>
          <TouchButton
            onTouchStart={() => stateRef.current.ship.rotatingLeft = true}
            onTouchEnd={() => stateRef.current.ship.rotatingLeft = false}
          >
            ←
          </TouchButton>
          <TouchButton
            onTouchStart={() => stateRef.current.ship.thrusting = true}
            onTouchEnd={() => stateRef.current.ship.thrusting = false}
          >
            ↑
          </TouchButton>
          <TouchButton
            onTouchStart={() => stateRef.current.ship.shooting = true}
            onTouchEnd={() => stateRef.current.ship.shooting = false}
          >
            🔫
          </TouchButton>
          <TouchButton
            onTouchStart={() => stateRef.current.ship.rotatingRight = true}
            onTouchEnd={() => stateRef.current.ship.rotatingRight = false}
          >
            →
          </TouchButton>
        </TouchControls>
      )}
    </GameContainer>
  );
};

export default MathsteroidsGame;
