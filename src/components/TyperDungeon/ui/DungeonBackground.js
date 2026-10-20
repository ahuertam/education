import React, { useRef, useEffect, useState } from 'react';
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
function loadSheet(src) {
  if (imgCache.has(src)) return Promise.resolve(imgCache.get(src));
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => { imgCache.set(src, img); resolve(img); };
    img.onerror = reject;
    img.src = src;
  });
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas  = canvasRef.current;
    if (!wrapper || !canvas) return;
    let cancelled = false;

    const render = (img) => {
      if (cancelled) return;
      const w = wrapper.offsetWidth  || 1;
      const h = wrapper.offsetHeight || 1;
      canvas.width  = w;
      canvas.height = h;
      drawCover(canvas, img, bgKey);
      if (!ready) setReady(true);
    };

    loadSheet(SHEET_URL).then(img => { if (!cancelled) render(img); });

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        loadSheet(SHEET_URL).then(img => { if (!cancelled) render(img); });
      });
      ro.observe(wrapper);
    }

    return () => {
      cancelled = true;
      if (ro) ro.disconnect();
    };
  }, [bgKey, ready]);

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
