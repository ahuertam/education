import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

const Wrap = styled.div`
  position: relative;
  width: min(520px, 94vw);
  aspect-ratio: 3 / 4;
  margin: 0 auto;
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(180deg, #74c0fc 0%, #a5d8ff 55%, #e7f5ff 100%);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.25);
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
`;

const Hud = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  pointer-events: none;
  z-index: 5;
`;

const Pill = styled.div`
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #fff;
  padding: 8px 10px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 0.95rem;
  letter-spacing: 0.2px;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  box-sizing: border-box;
  z-index: 10;
  background: rgba(0, 0, 0, 0.25);
`;

const Panel = styled.div`
  width: min(520px, 94vw);
  background: rgba(0, 0, 0, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 18px;
  padding: 18px;
  color: #fff;
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.4rem;
`;

const Text = styled.p`
  margin: 0;
  opacity: 0.9;
  line-height: 1.35;
`;

const Actions = styled.div`
  margin-top: 14px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  background: rgba(255, 255, 255, 0.92);
  border: none;
  border-radius: 999px;
  padding: 10px 14px;
  font-weight: 900;
  cursor: pointer;
  color: #0b1b2b;

  &:active {
    transform: scale(0.98);
  }
`;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function circleRectHit(cx, cy, r, rx, ry, rw, rh) {
  const closestX = clamp(cx, rx, rx + rw);
  const closestY = clamp(cy, ry, ry + rh);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= r * r;
}

const DEFAULT_CONFIG = {
  width: 360,
  height: 480,
  gravity: 980,
  jumpV: -320,
  pipeSpeed: 175,
  pipeWidth: 62,
  gapHeight: 150,
  spawnEvery: 1.35,
  birdX: 96,
  birdR: 12,
  groundH: 46,
};

const FlappyBonusLevel = ({
  targetPipes = 10,
  onFinish,
  onSkip,
  pointsPerPipe = 10,
  completionBonus = 60,
}) => {
  const config = useMemo(() => DEFAULT_CONFIG, []);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const lastTRef = useRef(0);
  const finishedRef = useRef(false);

  const stateRef = useRef({
    phase: 'ready',
    y: config.height * 0.45,
    vy: 0,
    pipes: [],
    spawnT: 0,
    score: 0,
  });

  const [, force] = useState(0);

  const reset = useCallback(() => {
    finishedRef.current = false;
    stateRef.current = {
      phase: 'ready',
      y: config.height * 0.45,
      vy: 0,
      pipes: [],
      spawnT: 0,
      score: 0,
    };
    lastTRef.current = 0;
    force(v => v + 1);
  }, [config.height]);

  const finish = useCallback((meta) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const score = stateRef.current.score;
    const completed = score >= targetPipes;
    const bonus = score * pointsPerPipe + (completed ? completionBonus : 0);
    onFinish?.({ score, completed, bonus });
  }, [completionBonus, onFinish, pointsPerPipe, targetPipes]);

  const flap = useCallback(() => {
    const s = stateRef.current;
    if (s.phase === 'over') return;
    if (s.phase === 'ready') s.phase = 'playing';
    s.vy = config.jumpV;
  }, [config.jumpV]);

  const spawnPipe = useCallback(() => {
    const minY = 80;
    const maxY = config.height - config.groundH - 80;
    const gapY = minY + Math.random() * (maxY - minY);
    stateRef.current.pipes.push({
      x: config.width + config.pipeWidth,
      gapY,
      passed: false,
    });
  }, [config.groundH, config.height, config.pipeWidth, config.width]);

  const step = useCallback((dt) => {
    const s = stateRef.current;
    if (s.phase !== 'playing') return;

    s.vy += config.gravity * dt;
    s.y += s.vy * dt;

    s.spawnT += dt;
    if (s.spawnT >= config.spawnEvery) {
      s.spawnT = 0;
      spawnPipe();
    }

    const removeBeforeX = -config.pipeWidth - 10;
    for (const p of s.pipes) p.x -= config.pipeSpeed * dt;
    s.pipes = s.pipes.filter(p => p.x > removeBeforeX);

    for (const p of s.pipes) {
      if (!p.passed && p.x + config.pipeWidth < config.birdX - config.birdR) {
        p.passed = true;
        s.score += 1;
      }
    }

    const yMin = config.birdR;
    const yMax = config.height - config.groundH - config.birdR;
    if (s.y < yMin || s.y > yMax) {
      s.phase = 'over';
      return;
    }

    const topPipeH = (gapY) => gapY - config.gapHeight / 2;
    const bottomPipeY = (gapY) => gapY + config.gapHeight / 2;
    const pipeX0 = (x) => x;
    const pipeW = config.pipeWidth;
    const pipeTopY0 = 0;
    const pipeBottomH = (gapY) => (config.height - config.groundH) - bottomPipeY(gapY);

    for (const p of s.pipes) {
      const rx = pipeX0(p.x);
      const topH = topPipeH(p.gapY);
      const bottomY = bottomPipeY(p.gapY);
      const bottomH = pipeBottomH(p.gapY);
      if (circleRectHit(config.birdX, s.y, config.birdR, rx, pipeTopY0, pipeW, topH)) {
        s.phase = 'over';
        return;
      }
      if (circleRectHit(config.birdX, s.y, config.birdR, rx, bottomY, pipeW, bottomH)) {
        s.phase = 'over';
        return;
      }
    }

    if (s.score >= targetPipes) {
      s.phase = 'over';
    }
  }, [config.birdR, config.birdX, config.gapHeight, config.gravity, config.groundH, config.height, config.pipeSpeed, config.pipeWidth, config.spawnEvery, spawnPipe, targetPipes]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;
    const w = config.width;
    const h = config.height;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#74c0fc';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    for (let i = 0; i < 6; i++) {
      const cx = (i * 90 + (Date.now() * 0.02)) % (w + 120) - 60;
      const cy = 60 + i * 28;
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.arc(cx + 20, cy + 6, 18, 0, Math.PI * 2);
      ctx.arc(cx + 44, cy, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    const groundY = h - config.groundH;
    ctx.fillStyle = '#2f9e44';
    ctx.fillRect(0, groundY, w, config.groundH);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, groundY, w, 6);

    ctx.fillStyle = '#0b7285';
    for (const p of s.pipes) {
      const topH = p.gapY - config.gapHeight / 2;
      const bottomY = p.gapY + config.gapHeight / 2;
      const bottomH = (h - config.groundH) - bottomY;
      ctx.fillRect(p.x, 0, config.pipeWidth, topH);
      ctx.fillRect(p.x, bottomY, config.pipeWidth, bottomH);
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(p.x + 8, 10, 6, Math.max(0, topH - 20));
      ctx.fillRect(p.x + 8, bottomY + 10, 6, Math.max(0, bottomH - 20));
      ctx.fillStyle = '#0b7285';
    }

    ctx.beginPath();
    ctx.arc(config.birdX, s.y, config.birdR, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd43b';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(config.birdX + 4, s.y - 4, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#212529';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(config.birdX + 10, s.y);
    ctx.lineTo(config.birdX + 22, s.y + 4);
    ctx.lineTo(config.birdX + 10, s.y + 8);
    ctx.closePath();
    ctx.fillStyle = '#f08c00';
    ctx.fill();

    if (s.phase === 'ready') {
      ctx.fillStyle = 'rgba(0,0,0,0.62)';
      ctx.fillRect(18, 170, w - 36, 128);
      ctx.fillStyle = '#fff';
      ctx.font = '900 20px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      ctx.fillText('Toca / clic / Espacio para saltar', 34, 212);
      ctx.font = '700 16px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      ctx.fillText(`Pasa ${targetPipes} tuberías para completar`, 34, 242);
      ctx.fillText(`Bonus: +${pointsPerPipe} por tubería`, 34, 268);
    }
  }, [config.birdR, config.birdX, config.gapHeight, config.groundH, config.height, config.pipeWidth, config.width, pointsPerPipe, targetPipes]);

  const loop = useCallback((t) => {
    if (!lastTRef.current) lastTRef.current = t;
    const dt = Math.min(0.033, (t - lastTRef.current) / 1000);
    lastTRef.current = t;

    step(dt);
    draw();

    const s = stateRef.current;
    if (s.phase === 'over') {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      finish();
      return;
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [draw, finish, step]);

  const ensureRunning = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = config.width;
    canvas.height = config.height;
    draw();
  }, [config.height, config.width, draw]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        flap();
        ensureRunning();
      }
    };
    window.addEventListener('keydown', onKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ensureRunning, flap]);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    flap();
    ensureRunning();
  }, [ensureRunning, flap]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  const s = stateRef.current;

  return (
    <Wrap>
      <Hud>
        <Pill>Pipes: {s.score}/{targetPipes}</Pill>
        <Pill>Bonus: +{s.score * pointsPerPipe}{s.score >= targetPipes ? ` (+${completionBonus})` : ''}</Pill>
      </Hud>
      <Canvas ref={canvasRef} onPointerDown={handlePointerDown} />
      {s.phase === 'ready' && (
        <Overlay>
          <Panel>
            <Title>Bonus Flappy</Title>
            <Text>Pasa tuberías para sumar puntos extra al ejercicio.</Text>
            <Actions>
              <Button type="button" onClick={() => { flap(); ensureRunning(); }}>Empezar</Button>
              {onSkip && <Button type="button" onClick={onSkip}>Saltar</Button>}
              <Button type="button" onClick={reset}>Reiniciar</Button>
            </Actions>
          </Panel>
        </Overlay>
      )}
    </Wrap>
  );
};

export default FlappyBonusLevel;
