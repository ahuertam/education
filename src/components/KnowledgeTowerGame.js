import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import Matter from 'matter-js';
import QUESTIONS from './data/knowledgeTowerQuestions.json';
import { CATEGORIES } from './data/knowledgeTowerCategories';
import {
  GameContainer,
  Header,
  Button,
  Score,
  CanvasContainer,
  QuestionPanel,
  QuestionText,
  AnswerBlocksContainer,
  AnswerBlock,
  FeedbackPanel,
  MenuOverlay,
  CategoriesGrid,
  CategoryCard,
  GameOverOverlay
} from './styles/KnowledgeTowerStyles';

const KnowledgeTowerGame = ({ onBack }) => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameover
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [blocksStacked, setBlocksStacked] = useState(0);
  const [feedback, setFeedback] = useState({ show: false, isCorrect: false, message: '' });
  const [showAnswerBlocks, setShowAnswerBlocks] = useState(true);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0); // Track errors for instability
  
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const groundRef = useRef(null);
  const blocksRef = useRef([]);

  const nextBlockY = useRef(500);
  
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

  const categoryData = selectedCategory ? CATEGORIES.find(c => c.id === selectedCategory) : null;
  const [questions, setQuestions] = useState([]);
  const currentQuestion = questions[currentQuestionIndex];

  const startGame = (categoryId) => {
    setSelectedCategory(categoryId);
    
    // Prepare questions
    let gameQuestions = [];
    if (categoryId === 'mixed') {
      // Combine all questions
      Object.values(QUESTIONS).forEach(catQuestions => {
        gameQuestions = [...gameQuestions, ...catQuestions];
      });
    } else {
      gameQuestions = [...QUESTIONS[categoryId]];
    }
    
    // Shuffle questions (Fisher-Yates)
    for (let i = gameQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameQuestions[i], gameQuestions[j]] = [gameQuestions[j], gameQuestions[i]];
    }
    
    setQuestions(gameQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setBlocksStacked(0);
    setConsecutiveErrors(0);
    setGameState('playing');
    setShowAnswerBlocks(true);
  };

  const initPhysics = useCallback(() => {
    // Clean up any existing physics first
    if (renderRef.current) {
      Matter.Render.stop(renderRef.current);
      if (renderRef.current.canvas) {
        renderRef.current.canvas.remove();
      }
      renderRef.current = null;
    }
    if (engineRef.current) {
      Matter.Engine.clear(engineRef.current);
      engineRef.current = null;
    }

    if (!canvasRef.current) return;

    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Events = Matter.Events;

    // Create engine
    const engine = Engine.create();
    engine.world.gravity.y = 1;
    engineRef.current = engine;

    // Create renderer
    const render = Render.create({
      element: canvasRef.current,
      engine: engine,
      options: {
        width: 600,
        height: 400,
        wireframes: false,
        background: 'rgba(255,255,255,0.1)',
      },
    });
    renderRef.current = render;

    // Create ground at bottom
    const ground = Bodies.rectangle(300, 385, 610, 30, {
      isStatic: true,
      render: {
        fillStyle: '#34495E',
      },
    });
    groundRef.current = ground;
    World.add(engine.world, ground);

    // Run engine with Runner (more reliable than Engine.run)
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    Render.run(render);
    
    console.log('Physics engine started, gravity:', engine.world.gravity.y);

    let gameEnded = false; // Flag to prevent multiple endGame calls

    // Check for game over - tower fell
    Events.on(engine, 'afterUpdate', () => {
      if (gameEnded) return; // Don't check if game already ended
      
      const bodies = Matter.Composite.allBodies(engine.world);
      
      // Check each block (not the ground)
      for (let i = 0; i < blocksRef.current.length; i++) {
        const block = blocksRef.current[i];
        
        // If ANY block except the first touches near the ground level, game over
        // Ground is at y=385, blocks are 30px tall, so center at 370 means touching ground
        if (i > 0 && block.position.y > 365) {
          console.log('Tower fell! Block', i, 'touched ground at y:', block.position.y);
          gameEnded = true;
          endGame(false);
          return;
        }
        
        // If block fell way off screen
        if (block.position.y > 450 || block.position.x < -50 || block.position.x > 650) {
          console.log('Block fell off screen');
          gameEnded = true;
          endGame(false);
          return;
        }
      }
    });

    nextBlockY.current = 500;
    blocksRef.current = [];
  }, []);

  const handleAnswer = (answerIndex) => {
    if (!showAnswerBlocks) return;

    const isCorrect = answerIndex === currentQuestion.correct;
    setShowAnswerBlocks(false);

    if (isCorrect) {
      setFeedback({ show: true, isCorrect: true, message: '✅ ¡Correcto!' });
      setTimeout(() => setFeedback({ show: false, isCorrect: false, message: '' }), 2000);
      
      addBlock(true);
      setScore(s => s + 10);
      setBlocksStacked(b => b + 1);
      setConsecutiveErrors(0); // Reset error counter on correct answer

      setTimeout(() => {
        if (blocksStacked + 1 >= 10) {
          endGame(true);
        } else {
          nextQuestion();
        }
      }, 1500);
    } else {
      const correctAnswer = currentQuestion.a[currentQuestion.correct];
      setFeedback({ show: true, isCorrect: false, message: `❌ Era: ${correctAnswer}` });
      setTimeout(() => {
        setFeedback({ show: false, isCorrect: false, message: '' });
        setShowAnswerBlocks(true);
      }, 2000);
      
      addBlock(false);
      setScore(s => s - 3); // Allow negative scores
      setConsecutiveErrors(e => e + 1); // Increment error counter
    }
  };

  const addBlock = (isCorrect) => {
    if (!engineRef.current) {
      console.error('Engine not initialized!');
      return;
    }

    const Bodies = Matter.Bodies;
    const World = Matter.World;
    
    const blockWidth = 120;
    const blockHeight = 30;
    
    if (isCorrect) {
      // Correct answer: drop near center with slight variation
      const randomOffset = (Math.random() - 0.5) * 15; // ±7.5px variation
      const xPos = 300 + randomOffset;
      const yPos = 20;
      
      const categoryColor = categoryData?.color || '#E91E63';
      
      console.log('Adding CORRECT block at', xPos, yPos);
      
      const block = Bodies.rectangle(xPos, yPos, blockWidth, blockHeight, {
        isStatic: false,
        friction: 0.9,
        restitution: 0.1,
        density: 0.002,
        angle: (Math.random() - 0.5) * 0.03,
        render: {
          fillStyle: categoryColor,
          strokeStyle: '#fff',
          lineWidth: 3,
        },
      });

      World.add(engineRef.current.world, block);
      blocksRef.current.push(block);
    } else {
      // Wrong answer: drop MORE off-center based on consecutive errors
      // First error: slight offset, more errors = more offset (max 70px)
      const errorMultiplier = Math.min(consecutiveErrors, 4); // Cap at 4 errors
      const baseOffset = 15; // Start with subtle offset
      const maxAdditionalOffset = 55; // Can go up to 70px total (15 + 55)
      const offset = baseOffset + (errorMultiplier * maxAdditionalOffset / 4);
      
      const side = Math.random() < 0.5 ? -1 : 1;
      const xPos = 300 + (side * offset);
      const yPos = 20;
      
      const categoryColor = categoryData?.color || '#E91E63';
      
      console.log(`Adding WRONG block (error #${consecutiveErrors + 1}) at offset ${offset.toFixed(1)}px, x=${xPos.toFixed(1)}`);
      
      const block = Bodies.rectangle(xPos, yPos, blockWidth, blockHeight, {
        isStatic: false,
        friction: 0.9,
        restitution: 0.1,
        density: 0.002,
        angle: (Math.random() - 0.5) * (0.04 + errorMultiplier * 0.02), // More rotation with more errors
        render: {
          fillStyle: categoryColor,
          strokeStyle: '#FFB74D', // Orange border for wrong blocks
          lineWidth: 3,
        },
      });

      World.add(engineRef.current.world, block);
      blocksRef.current.push(block); // Also counts toward tower
    }
    
    console.log('Total blocks in tower:', blocksRef.current.length);
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(i => i + 1);
    setShowAnswerBlocks(true);
  };

  const endGame = (won) => {
    setGameState('gameover');
    setFeedback({ show: false, isCorrect: false, message: '' });
    
    // Clean up physics
    if (engineRef.current) {
      Matter.Engine.clear(engineRef.current);
    }
    if (renderRef.current) {
      Matter.Render.stop(renderRef.current);
      renderRef.current.canvas.remove();
      renderRef.current = null;
    }
  };

  const restartGame = () => {
    // Clean up physics completely
    if (engineRef.current) {
      Matter.Engine.clear(engineRef.current);
      engineRef.current = null;
    }
    if (renderRef.current) {
      Matter.Render.stop(renderRef.current);
      if (renderRef.current.canvas) {
        renderRef.current.canvas.remove();
      }
      renderRef.current = null;
    }
    
    // Reset all state
    blocksRef.current = [];
    setGameState('menu');
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setBlocksStacked(0);
    setShowAnswerBlocks(true);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      // Small delay to ensure DOM is ready
      const timeout = setTimeout(() => {
        initPhysics();
      }, 100);
      
      return () => clearTimeout(timeout);
    }
    
    return () => {
      // Cleanup on unmount or state change
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current);
      }
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current);
        if (renderRef.current.canvas) {
          renderRef.current.canvas.remove();
        }
        renderRef.current = null;
      }
    };
  }, [gameState, initPhysics]);

  return (
    <GameContainer>
      <Header>
        <Button onClick={onBack}><FaArrowLeft /> Salir</Button>
        <Score>🏗️ {blocksStacked}/10 | ⭐ {score}</Score>
      </Header>

      <FeedbackPanel $show={feedback.show} $isCorrect={feedback.isCorrect}>
        {feedback.message}
      </FeedbackPanel>

      {gameState === 'menu' && (
        <MenuOverlay>
          <h1 style={{ color: '#4A90E2', marginBottom: '1rem', fontSize: '2.5rem' }}>🏗️ Torre del Saber</h1>
          <p style={{ fontSize: '1.2rem', color: '#555' }}>
            Apila bloques respondiendo correctamente. ¡No dejes que se caiga la torre!
          </p>
          <CategoriesGrid>
            {CATEGORIES.map(cat => (
              <CategoryCard
                key={cat.id}
                color={cat.color}
                onClick={() => startGame(cat.id)}
              >
                {cat.name}
              </CategoryCard>
            ))}
          </CategoriesGrid>
        </MenuOverlay>
      )}

      {gameState === 'gameover' && (
        <GameOverOverlay $won={blocksStacked >= 10}>
          <h1 style={{ color: blocksStacked >= 10 ? '#2ECC71' : '#E74C3C', fontSize: '3rem' }}>
            {blocksStacked >= 10 ? '🎉 ¡Victoria!' : '💥 Torre Caída'}
          </h1>
          <p style={{ fontSize: '1.5rem', margin: '1rem 0' }}>
            Bloques apilados: {blocksStacked}/10
          </p>
          <p style={{ fontSize: '1.3rem', margin: '1rem 0' }}>
            Puntuación: {score}
          </p>
          <Button onClick={restartGame} style={{ marginTop: '1rem', fontSize: '1.3rem', padding: '1rem 2rem' }}>
            Volver al menú
          </Button>
        </GameOverOverlay>
      )}

      {gameState === 'playing' && (
        <>
          <CanvasContainer ref={canvasRef} />

          {showAnswerBlocks && currentQuestion && (
            <AnswerBlocksContainer>
              {currentQuestion.a.map((answer, index) => (
                <AnswerBlock
                  key={index}
                  color={categoryData?.color}
                  onClick={() => handleAnswer(index)}
                >
                  {answer}
                </AnswerBlock>
              ))}
            </AnswerBlocksContainer>
          )}

          {currentQuestion && (
            <QuestionPanel>
              <QuestionText>{currentQuestion.q}</QuestionText>
            </QuestionPanel>
          )}
        </>
      )}
    </GameContainer>
  );
};

export default KnowledgeTowerGame;
