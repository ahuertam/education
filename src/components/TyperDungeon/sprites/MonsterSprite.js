import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import SpriteCanvas from './SpriteCanvas';

const SHEET = `${process.env.PUBLIC_URL}/games/mazmorra/monsters.png`;

const hurtShake = keyframes`
  0%,100% { transform: translateX(0); filter: brightness(1); }
  20%      { transform: translateX(-8px); filter: brightness(3) sepia(1) hue-rotate(180deg); }
  40%      { transform: translateX(8px); }
  60%      { transform: translateX(-5px); filter: brightness(2); }
  80%      { transform: translateX(5px); }
`;

const deathFade = keyframes`
  0%   { opacity:1; transform: scaleY(1); }
  60%  { opacity:0.3; transform: scaleY(0.9) translateY(10px); filter: grayscale(1); }
  100% { opacity:0; transform: scaleY(0.6) translateY(20px); }
`;

const Wrapper = styled.div`
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  ${props => props.$hurt && css`animation: ${hurtShake} 0.45s ease-in-out;`}
  ${props => props.$dead && css`animation: ${deathFade} 0.8s ease-in forwards;`}
`;

export default function MonsterSprite({ monster, animState = 'idle' }) {
  const [prevAnim, setPrevAnim] = useState(null);

  useEffect(() => {
    if (animState !== 'idle') {
      setPrevAnim(animState);
      const t = setTimeout(() => setPrevAnim(null), 500);
      return () => clearTimeout(t);
    }
  }, [animState]);

  if (!monster) return null;

  const scale  = monster.displayW / monster.w;
  const displayH = Math.round(monster.h * scale);

  return (
    <Wrapper $hurt={prevAnim === 'hurt'} $dead={prevAnim === 'dead'}>
      <SpriteCanvas
        src={SHEET}
        sx={monster.x} sy={monster.y}
        sw={monster.w} sh={monster.h}
        dw={monster.displayW} dh={displayH}
        trim={true}
        bgTolerance={35}
        cleanupTolerance={18}
      />
    </Wrapper>
  );
}
