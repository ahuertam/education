import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import DungeonBackground from '../ui/DungeonBackground';

const flicker = keyframes`
  0%,100%,92% { opacity:1; }
  93%          { opacity:0.7; }
  95%          { opacity:1; }
  97%          { opacity:0.8; }
`;

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  position: relative;
  overflow: hidden;
`;

const Inner = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-family: 'Courier New', monospace;
  font-size: clamp(1.6rem, 5vw, 2.4rem);
  color: #ffd700;
  text-shadow: 0 0 15px #ffd700, 0 0 30px #a06000;
  letter-spacing: 4px;
  text-align: center;
  margin: 0;
  animation: ${flicker} 4s infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Sub = styled.p`
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  color: #a08040;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;
`;

const OptionGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const OptionLabel = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  color: #a08040;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const Buttons = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

const OptionBtn = styled.button`
  flex: 1;
  padding: 8px 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.78rem;
  font-weight: bold;
  letter-spacing: 1px;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.15s;
  background: ${props => props.$sel ? '#4a3010' : '#1a1208'};
  color: ${props => props.$sel ? '#ffd700' : '#706040'};
  border: 2px solid ${props => props.$sel ? '#ffd700' : '#3a2808'};
  &:hover { background: #3a2810; color: #e0b050; border-color: #a08030; }
`;

const StartButton = styled.button`
  width: 100%;
  padding: 14px;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  font-weight: bold;
  letter-spacing: 3px;
  text-transform: uppercase;
  cursor: pointer;
  background: #2a1800;
  color: #ffd700;
  border: 2px solid #ffd700;
  border-radius: 4px;
  margin-top: 8px;
  transition: all 0.15s;
  &:hover { background: #4a3010; box-shadow: 0 0 12px rgba(255,215,0,0.4); }
`;

export default function MenuScene({ dispatch }) {
  const [language, setLanguage]   = useState('es');
  const [difficulty, setDifficulty] = useState('normal');
  const [totalFloors, setTotalFloors] = useState(5);
  const [timeLimit, setTimeLimit]   = useState(0);  // seconds; 0 = off

  const handleStart = () => {
    dispatch({ type: 'START_GAME', config: { language, difficulty, totalFloors, timeLimit } });
  };

  return (
    <Menu>
      <DungeonBackground bgKey="entrance" style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 0, pointerEvents: 'none' }} />
        <Inner>
          <Title>TYPER DUNGEON</Title>
          <Sub>— derrota monstruos escribiendo —</Sub>

          <OptionGroup>
            <OptionLabel>Idioma / Language</OptionLabel>
            <Buttons>
              <OptionBtn $sel={language === 'es'} onClick={() => setLanguage('es')}>Español</OptionBtn>
              <OptionBtn $sel={language === 'en'} onClick={() => setLanguage('en')}>English</OptionBtn>
            </Buttons>
          </OptionGroup>

          <OptionGroup>
            <OptionLabel>Dificultad</OptionLabel>
            <Buttons>
              <OptionBtn $sel={difficulty === 'easy'} onClick={() => setDifficulty('easy')}>
                Fácil (3.º)
              </OptionBtn>
              <OptionBtn $sel={difficulty === 'normal'} onClick={() => setDifficulty('normal')}>
                Normal (4.º-5.º)
              </OptionBtn>
              <OptionBtn $sel={difficulty === 'hard'} onClick={() => setDifficulty('hard')}>
                Difícil (6.º)
              </OptionBtn>
            </Buttons>
          </OptionGroup>

          <OptionGroup>
            <OptionLabel>Duración</OptionLabel>
            <Buttons>
              <OptionBtn $sel={totalFloors === 5} onClick={() => setTotalFloors(5)}>
                Corta (5 pisos)
              </OptionBtn>
              <OptionBtn $sel={totalFloors === 10} onClick={() => setTotalFloors(10)}>
                Larga (10 pisos)
              </OptionBtn>
            </Buttons>
          </OptionGroup>

          <OptionGroup>
            <OptionLabel>Tiempo por palabra</OptionLabel>
            <Buttons>
              <OptionBtn $sel={timeLimit === 0}  onClick={() => setTimeLimit(0)}>Sin límite</OptionBtn>
              <OptionBtn $sel={timeLimit === 8}  onClick={() => setTimeLimit(8)}>8 s</OptionBtn>
              <OptionBtn $sel={timeLimit === 12} onClick={() => setTimeLimit(12)}>12 s</OptionBtn>
              <OptionBtn $sel={timeLimit === 15} onClick={() => setTimeLimit(15)}>15 s</OptionBtn>
            </Buttons>
          </OptionGroup>

          <StartButton onClick={handleStart}>
            ▶ Comenzar aventura
          </StartButton>
        </Inner>
      </DungeonBackground>
    </Menu>
  );
}
