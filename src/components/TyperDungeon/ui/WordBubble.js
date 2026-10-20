import React from 'react';
import styled, { keyframes } from 'styled-components';

const appear = keyframes`
  from { transform: scale(0.7) translateY(10px); opacity:0; }
  to   { transform: scale(1) translateY(0); opacity:1; }
`;

const Bubble = styled.div`
  position: relative;
  background: #fffde8;
  border: 3px solid #333;
  border-radius: 12px;
  padding: 10px 16px;
  text-align: center;
  min-width: 160px;
  max-width: 280px;
  animation: ${appear} 0.25s ease-out;
  box-shadow: 3px 3px 0 #333;

  &::after {
    content: '';
    position: absolute;
    bottom: -16px;
    left: 50%;
    transform: translateX(-50%);
    border: 8px solid transparent;
    border-top-color: #333;
  }
  &::before {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    border: 7px solid transparent;
    border-top-color: #fffde8;
    z-index: 1;
  }
`;

const MonsterName = styled.div`
  font-size: 0.6rem;
  color: #888;
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const WordDisplay = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 1.4rem;
  font-weight: bold;
  letter-spacing: 3px;
  line-height: 1.2;
`;

const Letter = styled.span`
  color: ${props => {
    if (props.$correct) return '#1a8a1a';
    if (props.$current) return '#c04000';
    return '#222';
  }};
  border-bottom: ${props => props.$current ? '2px solid #c04000' : '2px solid transparent'};
  transition: color 0.1s;
`;

export default function WordBubble({ word, typed = '', monsterName = '' }) {
  return (
    <Bubble role="status" aria-live="polite" aria-label={monsterName ? `${monsterName} dice: ${word}` : word}>
      {monsterName && <MonsterName>{monsterName}</MonsterName>}
      <WordDisplay>
        {word.split('').map((letter, i) => (
          <Letter key={i} $correct={i < typed.length} $current={i === typed.length}>
            {letter}
          </Letter>
        ))}
      </WordDisplay>
    </Bubble>
  );
}
