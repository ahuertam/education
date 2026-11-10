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

  const scale    = size / FRAME_W;
  const displayH = Math.round(FRAME_H * scale);
  const sx       = frame * FRAME_W;
  // Cada frame del heroe lleva una banda de cuadriculado arriba (el titulo
  // "HERO", hasta la fila 30) y otra abajo (el nombre del frame, desde la
  // 243). Hay que quitar las dos: si queda un resto, el recorte no encuentra
  // el fondo por el borde y el cuadriculado se queda pegado al dibujo.
  const srcInsetTop = 31;
  const srcInsetBottom = 27;
  // Las tres ultimas columnas del frame son el separador blanco entre
  // frames: se colaba en el dibujo como una linea vertical al lado.
  const srcInsetRight = 4;
  // La figura del heroe es alta y estrecha (unos 60x150 en la hoja), asi que
  // una caja mas ancha que alta la recortaba de lado y salia enano. La caja
  // lleva su proporcion y asi la figura ocupa el ancho entero.
  const croppedH    = Math.round(size * 2.5);
  const clearH      = 0;

  return (
    <Wrapper $hurt={hurt}>
      <SpriteCanvas
        src={SHEET}
        label="El héroe"
        sx={sx} sy={rowY + srcInsetTop}
        sw={FRAME_W - srcInsetRight}
        sh={FRAME_H - srcInsetTop - srcInsetBottom}
        dw={size} dh={croppedH}
        clearW={size} clearH={clearH}
        trim={true}
        trimBgTolerance={35}
        bgTolerance={35}
        cleanupTolerance={35}
      />
    </Wrapper>
  );
}