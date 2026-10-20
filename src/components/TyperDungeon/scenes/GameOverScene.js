import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeDown = keyframes`
  from { opacity:0; transform: translateY(-20px); }
  to   { opacity:1; transform: translateY(0); }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  background: radial-gradient(circle at center, #1a0000 0%, #000 100%);
  color: #f0d080;
  font-family: 'Courier New', monospace;
  gap: 20px;
  animation: ${fadeDown} 0.6s ease;
  padding: 24px;
  text-align: center;
`;

const Title = styled.h2`
  font-size: clamp(1.4rem, 4vw, 2.2rem);
  color: #c03020;
  text-shadow: 0 0 20px #c03020, 0 0 40px #800;
  margin: 0;
  letter-spacing: 3px;
`;

const Sub = styled.p`
  font-size: 0.9rem;
  color: #a08040;
  margin: 0;
  max-width: 340px;
  line-height: 1.6;
`;

const Skull = styled.div`
  font-size: 4rem;
  line-height: 1;
`;

const Button = styled.button`
  background: #2a1008;
  border: 2px solid #a08040;
  color: #f0d080;
  padding: 10px 28px;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  letter-spacing: 2px;
  &:hover { background: #3a2010; }
`;

export default function GameOverScene({ dispatch }) {
  return (
    <Wrapper>
      <Skull>💀</Skull>
      <Title>EL HÉROE HA CAÍDO</Title>
      <Sub>
        La oscuridad de la mazmorra se cierra sobre el valiente aventurero.
        Debes practicar más para vencer a los monstruos.
      </Sub>
      <Button onClick={() => dispatch({ type: 'RESTART' })}>
        ↩ Volver al menú
      </Button>
    </Wrapper>
  );
}
