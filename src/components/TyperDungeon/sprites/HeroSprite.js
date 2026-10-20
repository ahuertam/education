import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import SpriteCanvas from './SpriteCanvas';
import { HERO_SPRITE } from '../data/sprites';

const {
  src: SHEET,
  frameW: FRAME_W,
  frameH: FRAME_H,
  idleFrames: IDLE_FRAMES,
  attackFrames: ATTACK_FRAMES,
  idleRowY: IDLE_ROW_Y,
  attackRowY: ATTACK_ROW_Y,
} = HERO_SPRITE;

const hurtFlash = keyframes`
  0%,100% { opacity:1; filter: brightness(1); }
  25%     { opacity:0.3; filter: brightness(3) sepia(1) hue-rotate(-30deg); }
  50%     { opacity:1; filter: brightness(1); }
  75%     { opacity:0.3; filter: brightness(3) sepia(1) hue-rotate(-30deg); }
`;

const Wrapper = styled.div`
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  ${props => props.$hurt && css`animation: ${hurtFlash} 0.5s ease-in-out;`}
`;

// Hero sprite. Idle breathes through all 8 frames; attack cycles 8 frames
// at 70ms/frame. The flood-fill cost is paid once per frame and then cached,
// so the loop is a single drawImage per tick.
export default function HeroSprite({ state = 'idle', size = 100 }) {
  const [frame, setFrame] = useState(0);
  const [hurt,  setHurt]  = useState(false);

  const isAttacking  = state === 'attack';
  const totalFrames  = isAttacking ? ATTACK_FRAMES : IDLE_FRAMES;
  const rowY         = isAttacking ? ATTACK_ROW_Y  : IDLE_ROW_Y;
  const speed        = isAttacking ? 70 : 180;

  useEffect(() => {
    setFrame(0);
    if (state === 'hurt') return undefined;
    const id = setInterval(() => setFrame(f => (f + 1) % totalFrames), speed);
    return () => clearInterval(id);
  }, [state, totalFrames, speed]);

  useEffect(() => {
    if (state === 'hurt') {
      setHurt(true);
      const t = setTimeout(() => setHurt(false), 550);
      return () => clearTimeout(t);
    }
  }, [state]);

  const scale    = size / FRAME_W;
  const displayH = Math.round(FRAME_H * scale);
  const sx       = frame * FRAME_W;
  // Crop the top of the source frame to skip the label area entirely.
  // Also wipe a strip across the top of the tmp canvas in case any bg
  // variation slips through.
  const srcInsetTop = Math.round(FRAME_H * 0.08);
  const croppedH    = Math.round(displayH * 0.85);
  const clearH      = Math.max(8, Math.round(croppedH * 0.06));

  return (
    <Wrapper $hurt={hurt}>
      <SpriteCanvas
        src={SHEET}
        sx={sx} sy={rowY + srcInsetTop}
        sw={FRAME_W} sh={FRAME_H - srcInsetTop}
        dw={size} dh={croppedH}
        clearW={size} clearH={clearH}
        bgTolerance={35}
        cleanupTolerance={18}
      />
    </Wrapper>
  );
}