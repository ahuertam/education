import React, { useRef, useEffect } from 'react';

const imgCache = {};
const frameCache = new Map();
// Recortar la croma y hacer el trim cuesta un flood-fill por frame. Cacheamos,
// pero sin tope un piso entero retiene decenas de MB de canvas para toda la
// sesión. Cada entrada es un canvas del tamaño de su celda.
const MAX_CACHED_FRAMES = 96;
const warned = new Set();

function cacheFrame(key, canvas) {
  frameCache.set(key, canvas);
  // Map itera en orden de inserción: el primero que sale es el más antiguo.
  if (frameCache.size > MAX_CACHED_FRAMES) {
    frameCache.delete(frameCache.keys().next().value);
  }
}

function loadImage(src) {
  if (imgCache[src]) return Promise.resolve(imgCache[src]);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => { imgCache[src] = img; resolve(img); };
    img.onerror = reject;
    img.src = src;
  });
}

// Sample background color by scanning the whole image and picking the most
// common neutral color (where the R/G/B channels are close to each other).
// This avoids being fooled by sprite pixels at the corners.
function sampleBackground(d, w, h) {
  const alphaMin = 250;
  const step = Math.max(2, Math.floor(Math.min(w, h) / 40));
  const buckets = new Map();

  function addSample(i) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    // Sprite sheets use a grey checkerboard bg. Restricting the sample to
    // neutral pixels keeps coloured sprite pixels (e.g. the red cape, golden
    // trim) out of the bg histogram so the dominant colour is really the bg.
    const isNeutral = Math.abs(r - g) < 25 && Math.abs(g - b) < 25 && Math.abs(r - b) < 25;
    if (!isNeutral) return;
    const key = `${r >> 4},${g >> 4},${b >> 4}`;
    const entry = buckets.get(key) ?? { c: 0, r: 0, g: 0, b: 0 };
    entry.c += 1;
    entry.r += r;
    entry.g += g;
    entry.b += b;
    buckets.set(key, entry);
  }

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4;
      if (d[i + 3] < alphaMin) continue;
      addSample(i);
    }
  }

  if (!buckets.size) return null;

  let best = null;
  for (const entry of buckets.values()) {
    if (!best || entry.c > best.c) best = entry;
  }
  const n = best?.c ?? 1;
  return [Math.round(best.r / n), Math.round(best.g / n), Math.round(best.b / n)];
}

// Flood-fill from ALL edge pixels to remove the continuous background region.
function removeBackground(ctx, w, h, tolerance = 50, cleanupTolerance = 20) {
  const alphaMin = 250;
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;

  const bgColor = sampleBackground(d, w, h);
  if (!bgColor) return null;
  const [br, bg, bb] = bgColor;
  const maxDist = tolerance * 3;

  function isArtifactColor(r, g, b) {
    return r > 220 && g > 220 && b > 220 && Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30;
  }

  function isBgPixel(pi) {
    if (d[pi + 3] < alphaMin) return false;
    const r = d[pi];
    const g = d[pi + 1];
    const b = d[pi + 2];
    const dist = Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb);
    if (dist <= maxDist) return true;
    return isArtifactColor(r, g, b);
  }

  const visited = new Uint8Array(w * h);
  const stack   = [];

  function pushFirstOpaqueFromTop(x) {
    for (let y = 0; y < h; y++) {
      const idx = y * w + x;
      if (isBgPixel(idx * 4)) { stack.push(idx); return; }
    }
  }

  function pushFirstOpaqueFromBottom(x) {
    for (let y = h - 1; y >= 0; y--) {
      const idx = y * w + x;
      if (isBgPixel(idx * 4)) { stack.push(idx); return; }
    }
  }

  function pushFirstOpaqueFromLeft(y) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (isBgPixel(idx * 4)) { stack.push(idx); return; }
    }
  }

  function pushFirstOpaqueFromRight(y) {
    for (let x = w - 1; x >= 0; x--) {
      const idx = y * w + x;
      if (isBgPixel(idx * 4)) { stack.push(idx); return; }
    }
  }

  for (let x = 0; x < w; x++) {
    pushFirstOpaqueFromTop(x);
    pushFirstOpaqueFromBottom(x);
  }
  for (let y = 0; y < h; y++) {
    pushFirstOpaqueFromLeft(y);
    pushFirstOpaqueFromRight(y);
  }

  while (stack.length) {
    const idx = stack.pop();
    if (idx < 0 || idx >= w * h || visited[idx]) continue;
    visited[idx] = 1;

    const pi = idx * 4;
    if (d[pi + 3] < alphaMin) continue;

    const r = d[pi];
    const g = d[pi + 1];
    const b = d[pi + 2];
    const dist = Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb);
    if (dist > maxDist && !isArtifactColor(r, g, b)) continue;

    d[pi + 3] = 0;

    const x = idx % w;
    const y = (idx / w) | 0;
    if (x > 0)     stack.push(idx - 1);
    if (x < w - 1) stack.push(idx + 1);
    if (y > 0)     stack.push(idx - w);
    if (y < h - 1) stack.push(idx + w);
  }

  // Cleanup pass: any pixel still within a tight tolerance of the background
  // color is removed. This catches "stragglers" the flood-fill couldn't reach
  // (e.g. background-colored pixels trapped inside the sprite) without
  // affecting sprite parts that just happen to be light-colored.
  const cleanupMaxDist = cleanupTolerance * 3;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < alphaMin) continue;
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const dist = Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb);
    if (dist <= cleanupMaxDist) d[i + 3] = 0;
  }

  ctx.putImageData(imageData, 0, 0);
  return bgColor;
}

// Compute the opaque bounding box of a sprite whose background has been
// removed. Returns { minX, minY, maxX, maxY } or null if fully transparent.
function computeTrimBbox(tmp, bgColor, trimBgTolerance, edgeThreshold = 0.6) {
  const dw = tmp.width;
  const dh = tmp.height;
  const d = tmp.getContext('2d').getImageData(0, 0, dw, dh).data;
  const tol = trimBgTolerance;
  const br = bgColor?.[0];
  const bg = bgColor?.[1];
  const bb = bgColor?.[2];
  const edgePad = 3;
  const isArtifactColor = (r, g, b) =>
    r > 200 && g > 200 && b > 200 && Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30;

  let minX = dw, minY = dh, maxX = -1, maxY = -1;
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const pi = (y * dw + x) * 4;
      const a = d[pi + 3];
      if (a !== 0) {
        const r = d[pi];
        const g = d[pi + 1];
        const b = d[pi + 2];
        const isEdgeArtifact =
          (x < edgePad || x >= dw - edgePad || y < edgePad || y >= dh - edgePad) &&
          isArtifactColor(r, g, b);
        if (isEdgeArtifact) continue;
        if (bgColor) {
          const dist = Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb);
          if (dist <= tol * 3) continue;
        }
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0 || maxY < 0) return null;

  // Trim away right-edge artifacts (frame-number labels in the sprite sheet).
  while (maxX > minX) {
    let opaque = 0;
    let artifacts = 0;
    for (let y = minY; y <= maxY; y++) {
      const pi = (y * dw + maxX) * 4;
      const a = d[pi + 3];
      if (a === 0) continue;
      opaque += 1;
      if (isArtifactColor(d[pi], d[pi + 1], d[pi + 2])) artifacts += 1;
    }
    if (opaque && artifacts / opaque >= edgeThreshold) maxX -= 1;
    else break;
  }

  while (maxY > minY) {
    let opaque = 0;
    let artifacts = 0;
    for (let x = minX; x <= maxX; x++) {
      const pi = (maxY * dw + x) * 4;
      const a = d[pi + 3];
      if (a === 0) continue;
      opaque += 1;
      if (isArtifactColor(d[pi], d[pi + 1], d[pi + 2])) artifacts += 1;
    }
    if (opaque && artifacts / opaque >= edgeThreshold) maxY -= 1;
    else break;
  }

  return { minX, minY, maxX, maxY };
}

// Heavy processing: load source region, remove background, (optionally) find
// the trim bounding box. The result is cached and reused on subsequent
// renders so animation frames don't redo the flood-fill.
function processExpensiveFrame(img, opts) {
  const {
    sx, sy, sw, sh, dw, dh,
    pad, srcInsetTop, srcInsetRight, srcInsetBottom, srcInsetLeft,
    clearW, clearH, bgTolerance, trim, trimBgTolerance, trimEdgeThreshold,
    cleanupTolerance,
  } = opts;

  const tmp = document.createElement('canvas');
  tmp.width = dw;
  tmp.height = dh;
  const tctx = tmp.getContext('2d');
  tctx.imageSmoothingEnabled = false;

  const p = Number.isFinite(pad) ? Math.max(0, pad) : 0;
  const insetTop    = Number.isFinite(srcInsetTop)    ? Math.max(0, srcInsetTop)    : 0;
  const insetRight  = Number.isFinite(srcInsetRight)  ? Math.max(0, srcInsetRight)  : 0;
  const insetBottom = Number.isFinite(srcInsetBottom) ? Math.max(0, srcInsetBottom) : 0;
  const insetLeft   = Number.isFinite(srcInsetLeft)   ? Math.max(0, srcInsetLeft)   : 0;

  const esx = sx + insetLeft;
  const esy = sy + insetTop;
  const esw = Math.max(1, sw - insetLeft - insetRight);
  const esh = Math.max(1, sh - insetTop - insetBottom);

  const imgW = img.naturalWidth  || img.width;
  const imgH = img.naturalHeight || img.height;

  const leftPad   = Math.min(p, esx);
  const topPad    = Math.min(p, esy);
  const rightPad  = Math.min(p, Math.max(0, imgW - (esx + esw)));
  const bottomPad = Math.min(p, Math.max(0, imgH - (esy + esh)));

  const psx = esx - leftPad;
  const psy = esy - topPad;
  const psw = esw + leftPad + rightPad;
  const psh = esh + topPad + bottomPad;

  tctx.clearRect(0, 0, dw, dh);
  tctx.drawImage(img, psx, psy, psw, psh, 0, 0, dw, dh);

  if (clearW > 0 && clearH > 0) {
    tctx.clearRect(0, 0, clearW, clearH);
  }
  const bgColor = removeBackground(tctx, dw, dh, bgTolerance, cleanupTolerance);
  const bbox = trim ? computeTrimBbox(tmp, bgColor, trimBgTolerance, trimEdgeThreshold) : null;
  return { tmp, bgColor, bbox };
}

// Cheap blit from the cached frame to the visible canvas. Runs on every
// render but each call is just one drawImage.
function drawToOutput(ctx, cached, dw, dh, trim) {
  const { tmp, bbox } = cached;
  ctx.clearRect(0, 0, dw, dh);
  if (!trim || !bbox) {
    ctx.drawImage(tmp, 0, 0);
    return;
  }
  const bw = bbox.maxX - bbox.minX + 1;
  const bh = bbox.maxY - bbox.minY + 1;
  const scale = Math.min(dw / bw, dh / bh);
  const outW = Math.max(1, Math.round(bw * scale));
  const outH = Math.max(1, Math.round(bh * scale));
  const dx = Math.floor((dw - outW) / 2);
  const dy = Math.floor((dh - outH) / 2);
  ctx.drawImage(tmp, bbox.minX, bbox.minY, bw, bh, dx, dy, outW, outH);
}

export default function SpriteCanvas({
  src, sx, sy, sw, sh, dw, dh,
  style, className,
  clearW = 0, clearH = 0, pad = 0, trim = false,
  bgTolerance = 60, trimBgTolerance = 60, trimEdgeThreshold = 0.6,
  cleanupTolerance = 22,
  srcInsetTop = 0, srcInsetRight = 0, srcInsetBottom = 0, srcInsetLeft = 0,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    const cacheKey = JSON.stringify({
      src, sx, sy, sw, sh, dw, dh,
      pad, trim, bgTolerance, trimBgTolerance, trimEdgeThreshold, cleanupTolerance,
      srcInsetTop, srcInsetRight, srcInsetBottom, srcInsetLeft,
      clearW, clearH,
    });

    const finalize = (cached) => {
      if (cancelled) return;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      drawToOutput(ctx, cached, dw, dh, trim);
    };

    if (frameCache.has(cacheKey)) {
      finalize(frameCache.get(cacheKey));
      return () => { cancelled = true; };
    }

    loadImage(src).then(img => {
      if (cancelled) return;
      const cached = processExpensiveFrame(img, {
        sx, sy, sw, sh, dw, dh,
        pad, srcInsetTop, srcInsetRight, srcInsetBottom, srcInsetLeft,
        clearW, clearH, bgTolerance, trim, trimBgTolerance, trimEdgeThreshold,
        cleanupTolerance,
      });
      cacheFrame(cacheKey, cached);
      finalize(cached);
    }).catch((err) => {
      // Sin esto el fallo se tragaba y el sprite salía en negro sin dar pistas.
      if (warned.has(src)) return;
      warned.add(src);
      console.warn('[SpriteCanvas] no se pudo cargar', src, err);
    });

    return () => { cancelled = true; };
  }, [
    src, sx, sy, sw, sh, dw, dh,
    pad, trim, bgTolerance, trimBgTolerance, trimEdgeThreshold, cleanupTolerance,
    srcInsetTop, srcInsetRight, srcInsetBottom, srcInsetLeft,
    clearW, clearH,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={dw}
      height={dh}
      style={{ imageRendering: 'pixelated', display: 'block', ...style }}
      className={className}
    />
  );
}
