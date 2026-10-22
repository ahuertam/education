import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { DUNGEON_SPRITE, DUNGEON_GRID } from '../data/sprites';

const FALLBACK_COLOR = '#0a0704';

const SHEET_URL = DUNGEON_SPRITE.src;
const SHEET_W   = DUNGEON_SPRITE.sheetW;
const SHEET_H   = DUNGEON_SPRITE.sheetH;
const COLS = 3;
const ROWS = 3;
const CELL_W = Math.floor(SHEET_W / COLS);
const CELL_H = Math.floor(SHEET_H / ROWS);
const LABEL_H = DUNGEON_SPRITE.labelH;

const imgCache = new Map();
// Cacheamos la promesa, no solo el resultado: así un asset que falla no se
// vuelve a pedir en cada resize, y uno que funciona no re-resuelve.
function loadSheet(src) {
  if (imgCache.has(src)) return imgCache.get(src);
  const p = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
  imgCache.set(src, p);
  return p;
}

// Draws the cropped dungeon cell onto the canvas, filling it completely
// (object-fit: cover). Transparent edges of the sprite cell are filled
// with the fallback color so the container never shows the page background.
function drawCover(canvas, img, bgKey) {
  const [col, row] = DUNGEON_GRID[bgKey] ?? [0, 0];
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');

  const srcW = CELL_W;
  const srcH = CELL_H - LABEL_H;
  const cellAspect = srcW / srcH;
  const canvasAspect = W / H;

  let sx = col * CELL_W;
  let sy = row * CELL_H + LABEL_H;
  let cropW = srcW;
  let cropH = srcH;

  // Cover: scale to fill the canvas, cropping the source if aspect differs.
  if (canvasAspect > cellAspect) {
    // Canvas is wider than the cell — crop vertically.
    cropH = srcW / canvasAspect;
    sy += (srcH - cropH) / 2;
  } else {
    // Canvas is taller than the cell — crop horizontally.
    // ponytail: mild inset so the source cell's outer stone-wall pillar
    // doesn't show as a hard vertical strip when the aspect ratio leaves
    // enough room. Small enough that no cell loses its main content.
    cropW = Math.max(srcH * canvasAspect - 40, 1);
    sx += (srcW - cropW) / 2;
  }

  ctx.fillStyle = FALLBACK_COLOR;
  ctx.fillRect(0, 0, W, H);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, W, H);
}

const Canvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
`;

export default function DungeonBackground({ bgKey, children, className, style }) {
  const wrapperRef = useRef(null);
  const canvasRef  = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas  = canvasRef.current;
    if (!wrapper || !canvas) return;
    let cancelled = false;
    let lastW = 0, lastH = 0, lastImg = null;

    const render = (img) => {
      if (cancelled) return;
      const w = wrapper.offsetWidth  || 1;
      const h = wrapper.offsetHeight || 1;
      // El ResizeObserver también avisa cuando el tamaño no ha cambiado, y el
      // ajuste de bgKey repinta aunque el canvas mida igual.
      if (img && lastImg === img && w === lastW && h === lastH) return;
      lastImg = img; lastW = w; lastH = h;
      canvas.width  = w;
      canvas.height = h;
      if (img) {
        drawCover(canvas, img, bgKey);
      } else {
        // Asset roto: fondo plano en vez de una promesa rechazada suelta y un
        // canvas en negro sin explicación.
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = FALLBACK_COLOR;
        ctx.fillRect(0, 0, w, h);
      }
    };

    // El segundo argumento de then es el fallo: sin él el reject de onerror
    // queda sin manejar y se ve como "Unhandled Promise Rejection" en consola.
    loadSheet(SHEET_URL).then(render, (err) => {
      console.warn('[DungeonBackground] no se pudo cargar', SHEET_URL, err);
      render(null);
    });

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        loadSheet(SHEET_URL).then(render, () => render(null));
      });
      ro.observe(wrapper);
    }

    return () => {
      cancelled = true;
      if (ro) ro.disconnect();
    };
  }, [bgKey]);

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative', overflow: 'hidden', backgroundColor: FALLBACK_COLOR, ...style }}
      className={className}
    >
      <Canvas ref={canvasRef} />
      {children && (
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {children}
        </div>
      )}
    </div>
  );
}
