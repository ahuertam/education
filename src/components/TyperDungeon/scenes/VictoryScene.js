import React from 'react';
import styled, { keyframes } from 'styled-components';

const burst = keyframes`
  0%   { transform: scale(0.5); opacity:0; }
  60%  { transform: scale(1.1); opacity:1; }
  100% { transform: scale(1); opacity:1; }
`;

const glow = keyframes`
  0%,100% { text-shadow: 0 0 10px #ffd700, 0 0 20px #ffa000; }
  50%      { text-shadow: 0 0 25px #ffd700, 0 0 60px #ffd700, 0 0 80px #ff6000; }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  background: radial-gradient(circle at center, #1a1200 0%, #000 100%);
  color: #f0d080;
  font-family: 'Courier New', monospace;
  gap: 20px;
  padding: 24px;
  text-align: center;
`;

const Trophy = styled.div`
  font-size: 4.5rem;
  animation: ${burst} 0.8s ease-out;
`;

const Title = styled.h2`
  font-size: clamp(1.4rem, 4vw, 2.4rem);
  color: #ffd700;
  margin: 0;
  letter-spacing: 3px;
  animation: ${glow} 2s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Sub = styled.p`
  font-size: 0.9rem;
  color: #a08040;
  margin: 0;
  max-width: 360px;
  line-height: 1.6;
`;

const Button = styled.button`
  background: #2a1a00;
  border: 2px solid #ffd700;
  color: #ffd700;
  padding: 10px 28px;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  letter-spacing: 2px;
  &:hover { background: #4a3000; }
`;

export default function VictoryScene({ dispatch }) {
  return (
    <Wrapper>
      <Trophy>🏆</Trophy>
      <Title>¡MAZMORRA CONQUISTADA!</Title>
      <Sub>
        ¡Increíble! Has derrotado al Dragón Rojo y liberado la mazmorra.
        Tu habilidad mecanográfica ha salvado el reino.
      </Sub>
      <Button onClick={() => dispatch({ type: 'RESTART' })}>
        ↩ Jugar de nuevo
      </Button>
    </Wrapper>
  );
}
