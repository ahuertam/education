import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import SpriteCanvas from './SpriteCanvas';
import { HERO_SPRITE } from '../data/sprites';

const {
  src: SHEET,
  frameW: FRAME_W,
  frameH: FRAME_H,
  figureW: FIGURE_W,
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

    // El interval sigue corriendo con la pestaña oculta y cada tick encola un
    // setState: el navegador lo ralentiza pero no lo para. Pausamos y reanudamos.
    const tick = () => setFrame(f => (f + 1) % totalFrames);
    let id = null;
    const start = () => { if (id === null && !document.hidden) id = setInterval(tick, speed); };
    const stop  = () => { if (id !== null) { clearInterval(id); id = null; } };
    const onVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [state, totalFrames, speed]);

  useEffect(() => {
    if (state === 'hurt') {
      setHurt(true);
      const t = setTimeout(() => setHurt(false), 550);
      return () => clearTimeout(t);
    }
  }, [state]);

  // La hoja viene recortada con alfa: la celda ya esta limpia y todos los
  // frames ocupan el mismo sitio, asi que no hay que recortar ni trimar nada
  // (si se trimara, cada frame escalaria por separado y la animacion
  // bailaria). Se escala la celda para que la figura del heroe mida `size`.
  const escala    = size / FIGURE_W;
  const displayW  = Math.round(FRAME_W * escala);
  const displayH  = Math.round(FRAME_H * escala);
  const sx        = frame * FRAME_W;

  return (
    <Wrapper $hurt={hurt}>
      <SpriteCanvas
        src={SHEET}
        label="El héroe"
        sx={sx} sy={rowY}
        sw={FRAME_W} sh={FRAME_H}
        dw={displayW} dh={displayH}
        trim={false}
      />
    </Wrapper>
  );
}