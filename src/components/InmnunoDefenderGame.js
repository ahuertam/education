import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';
import QUESTIONS from './data/inmunoDefenderQuestions.json';
import { SUBJECTS } from './data/inmunoDefenderSubjects';

const GameContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at 30% 20%, #ff6b6b 0%, #7a0b0b 55%, #2a0000 100%);
  color: #fff;
  overflow: hidden;
  position: relative;
  user-select: none;
`;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
`;

const Header = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
  z-index: 10;
  box-sizing: border-box;
`;

const Button = styled.button`
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fff;
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
  backdrop-filter: blur(6px);
`;

const StatBar = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  pointer-events: none;
`;

const Pill = styled.div`
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 8px 12px;
  border-radius: 999px;
  font-weight: 700;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  background: rgba(0, 0, 0, 0.55);
  padding: 24px;
  box-sizing: border-box;
`;

const Panel = styled.div`
  width: min(820px, 96vw);
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 18px;
  padding: 22px;
  box-sizing: border-box;
`;

const Title = styled.h2`
  margin: 0 0 10px 0;
  font-size: 1.8rem;
`;

const SubTitle = styled.p`
  margin: 0 0 16px 0;
  opacity: 0.9;
  line-height: 1.35;
`;

const SubjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
`;

const SubjectCard = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #fff;
  padding: 14px 14px;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: transform 0.08s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${p => p.$color};
  box-shadow: 0 0 18px ${p => p.$color};
`;

const TouchControls = styled.div`
  position: absolute;
  left: 16px;
  bottom: 16px;
  display: flex;
  gap: 16px;
  z-index: 15;
  pointer-events: auto;
`;

const Pad = styled.div`
  display: grid;
  grid-template-columns: 60px 60px 60px;
  grid-template-rows: 60px 60px 60px;
  gap: 10px;
`;

const TouchButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 1.2rem;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:active {
    background: rgba(255, 255, 255, 0.24);
    transform: scale(0.98);
  }
`;

const ShootButton = styled(TouchButton)`
  width: 140px;
  height: 140px;
  border-radius: 18px;
  font-size: 1rem;
  font-weight: 800;
`;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dist2(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

const InmnunoDefenderGame = ({ onBack }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const updateRef = useRef(null);
  const keysRef = useRef(new Set());
  const touchRef = useRef({ up: false, down: false, left: false, right: false, shoot: false });
  const bgmRef = useRef(new Audio(`${process.env.PUBLIC_URL}/lab2.mp3`));
  const shootSoundRef = useRef(new Audio(`${process.env.PUBLIC_URL}/beep.mp3`));
  const hitSoundRef = useRef(new Audio(`${process.env.PUBLIC_URL}/beep.mp3`));
  const correctSoundRef = useRef(new Audio(`${process.env.PUBLIC_URL}/beep.mp3`));
  const wrongSoundRef = useRef(new Audio(`${process.env.PUBLIC_URL}/beep.mp3`));
  const killSoundRef = useRef(new Audio(`${process.env.PUBLIC_URL}/explosion.mp3`));

  const [phase, setPhase] = useState('menu');
  const [subjectId, setSubjectId] = useState(null);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [hp, setHp] = useState(100);
  const [message, setMessage] = useState(null);
  const [question, setQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [helpersCount, setHelpersCount] = useState(0);
  const [isMobile] = useState(() => 'ontouchstart' in window || navigator.maxTouchPoints > 0);

  const uiRef = useRef({
    lastShootAt: 0,
    lastHitAt: 0,
    difficultyFactor: 1,
    quizHover: { idx: null, startedAt: 0 },
    quizLocked: false,
    waveClearHandled: false,
    audioUnlocked: false,
    audioStarted: false
  });

  const playSound = (ref) => {
    const a = ref.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => {});
  };

  const unlockAudio = () => {
    if (uiRef.current.audioUnlocked) return;
    uiRef.current.audioUnlocked = true;
    const bgm = bgmRef.current;
    const tryStart = () => {
      bgm.play()
        .then(() => { uiRef.current.audioStarted = true; })
        .catch(() => {});
    };
    tryStart();
    const handler = () => {
      tryStart();
    };
    window.addEventListener('pointerdown', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });
  };

  const stateRef = useRef({
    t0: performance.now(),
    bgOrbs: [],
    player: { x: 0, y: 0, r: 18, vx: 0, vy: 0, aimX: 0, aimY: -1 },
    bullets: [],
    enemies: [],
    helpers: []
  });

  const subjectQuestions = useMemo(() => {
    if (!subjectId) return [];
    if (subjectId === 'mixed') {
      const all = Object.values(QUESTIONS).flat();
      return shuffle(all);
    }
    return shuffle(QUESTIONS[subjectId] || []);
  }, [subjectId]);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const initBackground = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    stateRef.current.bgOrbs = Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      x: Math.random() * w,
      y: Math.random() * h,
      r: 10 + Math.random() * 46,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      a: 0.06 + Math.random() * 0.08
    }));
  };

  useEffect(() => {
    const bgm = bgmRef.current;
    bgm.loop = true;
    bgm.volume = 0.22;
    bgm.playbackRate = 1;

    const shoot = shootSoundRef.current;
    shoot.volume = 0.12;
    shoot.playbackRate = 1.6;

    const hit = hitSoundRef.current;
    hit.volume = 0.14;
    hit.playbackRate = 0.75;

    const correct = correctSoundRef.current;
    correct.volume = 0.12;
    correct.playbackRate = 1.1;

    const wrong = wrongSoundRef.current;
    wrong.volume = 0.14;
    wrong.playbackRate = 0.6;

    const kill = killSoundRef.current;
    kill.volume = 0.12;
    kill.playbackRate = 1;

    return () => {
      bgm.pause();
      bgm.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    const bgm = bgmRef.current;
    if (!uiRef.current.audioUnlocked) return;
    if (phase === 'playing' || phase === 'quiz') {
      bgm.play().then(() => { uiRef.current.audioStarted = true; }).catch(() => {});
    } else {
      bgm.pause();
      bgm.currentTime = 0;
    }
  }, [phase]);

  const resetRun = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    stateRef.current.player = { x: w / 2, y: h / 2, r: 18, vx: 0, vy: 0, aimX: 0, aimY: -1 };
    stateRef.current.bullets = [];
    stateRef.current.enemies = [];
    stateRef.current.helpers = [];
    uiRef.current.lastShootAt = 0;
    uiRef.current.lastHitAt = 0;
    uiRef.current.difficultyFactor = 1;
    uiRef.current.quizHover = { idx: null, startedAt: 0 };
    uiRef.current.quizLocked = false;
    uiRef.current.waveClearHandled = false;
    setScore(0);
    setWave(1);
    setHp(100);
    setHelpersCount(0);
    setMessage(null);
  };

  const spawnWave = (waveNumber) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const countBase = 5 + Math.floor(waveNumber * 1.6);
    const count = Math.floor(countBase * (0.9 + Math.random() * 0.3));
    const speedBase = (0.65 + waveNumber * 0.05) * uiRef.current.difficultyFactor;
    uiRef.current.waveClearHandled = false;

    const enemies = Array.from({ length: count }).map((_, i) => {
      const side = Math.floor(Math.random() * 4);
      let x = 0;
      let y = 0;
      if (side === 0) { x = -30; y = Math.random() * h; }
      if (side === 1) { x = w + 30; y = Math.random() * h; }
      if (side === 2) { x = Math.random() * w; y = -30; }
      if (side === 3) { x = Math.random() * w; y = h + 30; }
      const isAttack = (i % 2 === 0);
      const color = isAttack ? '#ff3b3b' : '#4aa3ff';
      const kind = Math.random() < 0.5 ? 'virus' : 'bacteria';
      const r = kind === 'virus' ? 16 : 18;
      return {
        id: `${Date.now()}_${i}`,
        x,
        y,
        r,
        hp: 1,
        kind,
        behavior: isAttack ? 'attack' : 'flee',
        color,
        speed: speedBase * (0.85 + Math.random() * 0.35)
      };
    });

    stateRef.current.enemies = enemies;
  };

  const addHelper = () => {
    const idx = stateRef.current.helpers.length;
    const angle = (idx * Math.PI * 2) / Math.max(1, Math.min(8, idx + 1));
    stateRef.current.helpers.push({
      id: `${Date.now()}_h_${idx}`,
      angle,
      radius: 44 + idx * 6,
      cooldownUntil: 0
    });
    setHelpersCount(stateRef.current.helpers.length);
  };

  const nextQuestion = (fromIndex) => {
    const list = subjectQuestions;
    if (list.length === 0) return null;
    const idx = fromIndex % list.length;
    return { ...list[idx], _idx: idx };
  };

  const beginQuiz = (nextWaveNumber) => {
    setPhase('quiz');
    uiRef.current.quizLocked = false;
    const q = nextQuestion(questionIndex);
    setQuestion(q);
    setMessage({ kind: 'info', text: 'Ve al botón correcto y quédate encima un momento.' });
    setTimeout(() => setMessage(null), 900);
    setWave(nextWaveNumber);
  };

  const beginPlaying = (waveNumber) => {
    setPhase('playing');
    spawnWave(waveNumber);
  };

  const startGameWithSubject = (id) => {
    setSubjectId(id);
    unlockAudio();
    setQuestionIndex(0);
    resetRun();
    setPhase('playing');
    spawnWave(1);
  };

  const endRun = () => {
    setPhase('gameover');
    stateRef.current.enemies = [];
    stateRef.current.bullets = [];
  };

  const resolveQuizAnswer = (answerIndex) => {
    if (uiRef.current.quizLocked) return;
    if (!question) return;
    uiRef.current.quizLocked = true;
    const isCorrect = answerIndex === question.correct;
    setQuestionIndex(i => i + 1);
    uiRef.current.quizHover = { idx: null, startedAt: 0 };

    if (isCorrect) {
      playSound(correctSoundRef);
      const rewardHelper = Math.random() < 0.5;
      if (rewardHelper) {
        addHelper();
        setMessage({ kind: 'good', text: '¡Correcto! Se une un glóbulo blanco ayudante.' });
      } else {
        setScore(s => s + 120);
        setMessage({ kind: 'good', text: '¡Correcto! +120 puntos.' });
      }
    } else {
      playSound(wrongSoundRef);
      uiRef.current.difficultyFactor *= 1.18;
      setMessage({ kind: 'bad', text: 'Ups… La siguiente oleada llega más rápida.' });
    }

    setTimeout(() => {
      setMessage(null);
      beginPlaying(wave);
    }, 900);
  };

  const tryShoot = (now) => {
    const cooldownMs = 220;
    if (now - uiRef.current.lastShootAt < cooldownMs) return;
    uiRef.current.lastShootAt = now;
    playSound(shootSoundRef);

    const { player, enemies } = stateRef.current;
    let dx = player.aimX;
    let dy = player.aimY;
    if (enemies.length > 0) {
      let best = null;
      let bestD2 = Infinity;
      for (const e of enemies) {
        const d = dist2(player.x, player.y, e.x, e.y);
        if (d < bestD2) { bestD2 = d; best = e; }
      }
      if (best) {
        const vx = best.x - player.x;
        const vy = best.y - player.y;
        const m = Math.hypot(vx, vy) || 1;
        dx = vx / m;
        dy = vy / m;
      }
    }
    const speed = 9.2;
    stateRef.current.bullets.push({
      id: `${now}_${Math.random()}`,
      x: player.x + dx * (player.r + 6),
      y: player.y + dy * (player.r + 6),
      vx: dx * speed,
      vy: dy * speed,
      r: 5,
      life: 1100
    });
  };

  const step = (now) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = window.innerWidth;
    const h = window.innerHeight;

    const dt = Math.min(33, now - stateRef.current.t0);
    stateRef.current.t0 = now;
    const t = now / 1000;

    for (const o of stateRef.current.bgOrbs) {
      o.x += o.vx * (dt / 16.67);
      o.y += o.vy * (dt / 16.67);
      if (o.x < -80) o.x = w + 80;
      if (o.x > w + 80) o.x = -80;
      if (o.y < -80) o.y = h + 80;
      if (o.y > h + 80) o.y = -80;
    }

    const move = { up: false, down: false, left: false, right: false, shoot: false };
    for (const k of keysRef.current) {
      if (k === 'ArrowUp' || k === 'w') move.up = true;
      if (k === 'ArrowDown' || k === 's') move.down = true;
      if (k === 'ArrowLeft' || k === 'a') move.left = true;
      if (k === 'ArrowRight' || k === 'd') move.right = true;
      if (k === ' ') move.shoot = true;
    }
    move.up = move.up || touchRef.current.up;
    move.down = move.down || touchRef.current.down;
    move.left = move.left || touchRef.current.left;
    move.right = move.right || touchRef.current.right;
    move.shoot = move.shoot || touchRef.current.shoot;

    const player = stateRef.current.player;
    const accel = 0.44;
    const maxV = 5.4;
    let ax = 0;
    let ay = 0;
    if (phase !== 'menu' && phase !== 'gameover') {
      if (move.up) ay -= 1;
      if (move.down) ay += 1;
      if (move.left) ax -= 1;
      if (move.right) ax += 1;
    }
    if (ax !== 0 || ay !== 0) {
      const m = Math.hypot(ax, ay) || 1;
      ax /= m;
      ay /= m;
      player.aimX = ax;
      player.aimY = ay;
    }
    player.vx = clamp(player.vx + ax * accel, -maxV, maxV);
    player.vy = clamp(player.vy + ay * accel, -maxV, maxV);
    player.vx *= 0.88;
    player.vy *= 0.88;
    player.x = clamp(player.x + player.vx * (dt / 16.67), player.r + 6, w - player.r - 6);
    player.y = clamp(player.y + player.vy * (dt / 16.67), player.r + 56, h - player.r - 16);

    if (phase === 'playing' && move.shoot) {
      tryShoot(now);
    }

    if (phase === 'playing') {
      for (const helper of stateRef.current.helpers) {
        helper.angle += 0.015 * (dt / 16.67);
        if (helper.angle > Math.PI * 2) helper.angle -= Math.PI * 2;
        if (now < helper.cooldownUntil) continue;
        if (stateRef.current.enemies.length === 0) continue;
        helper.cooldownUntil = now + 900;
        const hx = player.x + Math.cos(helper.angle) * helper.radius;
        const hy = player.y + Math.sin(helper.angle) * helper.radius;
        let best = null;
        let bestD2 = Infinity;
        for (const e of stateRef.current.enemies) {
          const d = dist2(hx, hy, e.x, e.y);
          if (d < bestD2) { bestD2 = d; best = e; }
        }
        if (!best) continue;
        const vx = best.x - hx;
        const vy = best.y - hy;
        const m = Math.hypot(vx, vy) || 1;
        const dx = vx / m;
        const dy = vy / m;
        const speed = 9.8;
        stateRef.current.bullets.push({
          id: `${now}_${Math.random()}_hb`,
          x: hx + dx * 12,
          y: hy + dy * 12,
          vx: dx * speed,
          vy: dy * speed,
          r: 4,
          life: 900
        });
      }
    }

    const bullets = stateRef.current.bullets;
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.life -= dt;
      b.x += b.vx * (dt / 16.67);
      b.y += b.vy * (dt / 16.67);
      if (b.life <= 0 || b.x < -60 || b.x > w + 60 || b.y < -60 || b.y > h + 60) bullets.splice(i, 1);
    }

    if (phase === 'playing') {
      const enemies = stateRef.current.enemies;
      for (const e of enemies) {
        const vx = player.x - e.x;
        const vy = player.y - e.y;
        const m = Math.hypot(vx, vy) || 1;
        let dx = vx / m;
        let dy = vy / m;
        if (e.behavior === 'flee') { dx = -dx; dy = -dy; }
        e.x += dx * e.speed * (dt / 16.67) * 3.2;
        e.y += dy * e.speed * (dt / 16.67) * 3.2;

        if (e.behavior === 'flee') {
          e.x = clamp(e.x, e.r + 10, w - e.r - 10);
          e.y = clamp(e.y, e.r + 60, h - e.r - 10);
        }

        const touchD2 = dist2(player.x, player.y, e.x, e.y);
        const rr = (player.r + e.r) * (player.r + e.r);
        if (touchD2 <= rr) {
          if (now - uiRef.current.lastHitAt > 520) {
            uiRef.current.lastHitAt = now;
            playSound(hitSoundRef);
            setHp(prev => {
              const next = Math.max(0, prev - (e.kind === 'bacteria' ? 14 : 10));
              if (next <= 0) setTimeout(() => endRun(), 0);
              return next;
            });
          }
        }
      }

      for (let bi = bullets.length - 1; bi >= 0; bi--) {
        const b = bullets[bi];
        let hit = -1;
        for (let ei = enemies.length - 1; ei >= 0; ei--) {
          const e = enemies[ei];
          const rr = (b.r + e.r) * (b.r + e.r);
          if (dist2(b.x, b.y, e.x, e.y) <= rr) {
            hit = ei;
            break;
          }
        }
        if (hit !== -1) {
          const e = enemies[hit];
          e.hp -= 1;
          bullets.splice(bi, 1);
          if (e.hp <= 0) {
            enemies.splice(hit, 1);
            playSound(killSoundRef);
            setScore(s => s + 10);
          }
        }
      }

      if (stateRef.current.enemies.length === 0 && !uiRef.current.waveClearHandled) {
        uiRef.current.waveClearHandled = true;
        addHelper();
        beginQuiz(wave + 1);
      }
    }

    const pads = (() => {
      const padH = 90;
      const gap = 14;
      const padW = Math.min(240, Math.floor((w - gap * 5) / 4));
      const totalW = padW * 4 + gap * 3;
      const x0 = Math.floor((w - totalW) / 2);
      const y0 = Math.floor(h - padH - 20);
      return Array.from({ length: 4 }).map((_, i) => ({
        x: x0 + i * (padW + gap),
        y: y0,
        w: padW,
        h: padH
      }));
    })();

    if (phase === 'quiz' && question) {
      let hovered = null;
      for (let i = 0; i < pads.length; i++) {
        const p = pads[i];
        const inside =
          player.x >= p.x && player.x <= p.x + p.w &&
          player.y >= p.y && player.y <= p.y + p.h;
        if (inside) { hovered = i; break; }
      }
      if (hovered === null) {
        uiRef.current.quizHover = { idx: null, startedAt: 0 };
      } else {
        if (uiRef.current.quizHover.idx !== hovered) {
          uiRef.current.quizHover = { idx: hovered, startedAt: now };
        } else {
          if (now - uiRef.current.quizHover.startedAt > 650) {
            resolveQuizAnswer(hovered);
          }
        }
      }
    }

    ctx.clearRect(0, 0, w, h);

    ctx.save();
    for (const o of stateRef.current.bgOrbs) {
      ctx.globalAlpha = o.a;
      ctx.beginPath();
      ctx.fillStyle = '#ffd1d1';
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const drawCell = (x, y, r, color, glow) => {
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.shadowColor = glow || color;
      ctx.shadowBlur = 18;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.fillStyle = '#ffffff';
      ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    for (const b of stateRef.current.bullets) {
      drawCell(b.x, b.y, b.r, '#00ffb2', '#00ffb2');
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.beginPath();
      ctx.strokeStyle = '#00ffb2';
      ctx.lineWidth = 2;
      ctx.arc(b.x, b.y, b.r + 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    for (const e of stateRef.current.enemies) {
      if (e.kind === 'virus') {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(t * 0.7);
        ctx.beginPath();
        const spikes = 10;
        for (let i = 0; i < spikes * 2; i++) {
          const ang = (i / (spikes * 2)) * Math.PI * 2;
          const rr = i % 2 === 0 ? e.r * 1.18 : e.r * 0.85;
          ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
        }
        ctx.closePath();
        ctx.fillStyle = e.color;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.restore();
      } else {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(Math.sin(t * 1.5) * 0.35);
        ctx.fillStyle = e.color;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 14;
        ctx.fillRect(-e.r * 0.95, -e.r * 0.55, e.r * 1.9, e.r * 1.1);
        ctx.restore();
      }
    }

    drawCell(player.x, player.y, player.r, '#f4f9ff', '#b2e6ff');
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    ctx.strokeStyle = '#b2e6ff';
    ctx.lineWidth = 2;
    ctx.arc(player.x, player.y, player.r + 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    for (const helper of stateRef.current.helpers) {
      const hx = player.x + Math.cos(helper.angle) * helper.radius;
      const hy = player.y + Math.sin(helper.angle) * helper.radius;
      drawCell(hx, hy, 10, '#eaf7ff', '#b2e6ff');
    }

    if (phase === 'quiz' && question) {
      ctx.save();
      const panelW = Math.min(920, w - 32);
      const panelH = 108;
      const panelX = Math.floor((w - panelW) / 2);
      const panelY = 60;
      const radius = 16;
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = 'rgba(0,0,0,0.58)';
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(panelX + radius, panelY);
      ctx.lineTo(panelX + panelW - radius, panelY);
      ctx.quadraticCurveTo(panelX + panelW, panelY, panelX + panelW, panelY + radius);
      ctx.lineTo(panelX + panelW, panelY + panelH - radius);
      ctx.quadraticCurveTo(panelX + panelW, panelY + panelH, panelX + panelW - radius, panelY + panelH);
      ctx.lineTo(panelX + radius, panelY + panelH);
      ctx.quadraticCurveTo(panelX, panelY + panelH, panelX, panelY + panelH - radius);
      ctx.lineTo(panelX, panelY + radius);
      ctx.quadraticCurveTo(panelX, panelY, panelX + radius, panelY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = '800 20px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      ctx.fillText('Pregunta', panelX + panelW / 2, panelY + 32);

      ctx.font = '700 18px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      const maxWidth = panelW - 40;
      const words = String(question.q || '').split(/\s+/).filter(Boolean);
      const lines = [];
      let line = '';
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width <= maxWidth) {
          line = test;
        } else {
          if (line) lines.push(line);
          line = word;
        }
      }
      if (line) lines.push(line);
      const maxLines = 2;
      const shown = lines.slice(0, maxLines);
      if (lines.length > maxLines) {
        const last = shown[maxLines - 1];
        let clipped = last;
        while (clipped.length > 0 && ctx.measureText(`${clipped}…`).width > maxWidth) {
          clipped = clipped.slice(0, -1);
        }
        shown[maxLines - 1] = `${clipped}…`;
      }
      const lineHeight = 22;
      const startY = panelY + 62;
      for (let i = 0; i < shown.length; i++) {
        ctx.fillText(shown[i], panelX + panelW / 2, startY + i * lineHeight);
      }
      ctx.restore();

      const hoverIdx = uiRef.current.quizHover.idx;
      const hoverProgress = hoverIdx === null ? 0 : clamp((now - uiRef.current.quizHover.startedAt) / 650, 0, 1);
      for (let i = 0; i < pads.length; i++) {
        const p = pads[i];
        const isHover = i === hoverIdx;
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = isHover ? 'rgba(0, 255, 178, 0.20)' : 'rgba(255,255,255,0.10)';
        ctx.strokeStyle = isHover ? 'rgba(0, 255, 178, 0.65)' : 'rgba(255,255,255,0.20)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const r = 14;
        const x = p.x;
        const y = p.y;
        const pw = p.w;
        const ph = p.h;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + pw - r, y);
        ctx.quadraticCurveTo(x + pw, y, x + pw, y + r);
        ctx.lineTo(x + pw, y + ph - r);
        ctx.quadraticCurveTo(x + pw, y + ph, x + pw - r, y + ph);
        ctx.lineTo(x + r, y + ph);
        ctx.quadraticCurveTo(x, y + ph, x, y + ph - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '700 18px system-ui, -apple-system, Segoe UI, Roboto, Arial';
        const text = String(question.a[i] ?? '');
        const cx = x + 14;
        const cy = y + 38;
        ctx.fillText(text.length > 18 ? text.slice(0, 18) + '…' : text, cx, cy);

        if (isHover) {
          ctx.globalAlpha = 0.95;
          ctx.strokeStyle = 'rgba(0, 255, 178, 0.9)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(x + pw - 18, y + 18, 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hoverProgress);
          ctx.stroke();
        }
        ctx.restore();
      }
    } else {
      ctx.save();
      ctx.globalAlpha = 0.24;
      ctx.fillStyle = '#fff';
      ctx.font = '600 14px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      ctx.fillText('Mover: WASD / Flechas    Disparar ácido: Espacio', 16, h - 18);
      ctx.restore();
    }

    if (message) {
      const bg =
        message.kind === 'good'
          ? 'rgba(0, 255, 178, 0.18)'
          : message.kind === 'bad'
            ? 'rgba(255, 59, 59, 0.18)'
            : 'rgba(255, 255, 255, 0.12)';
      const border =
        message.kind === 'good'
          ? 'rgba(0, 255, 178, 0.55)'
          : message.kind === 'bad'
            ? 'rgba(255, 59, 59, 0.55)'
            : 'rgba(255, 255, 255, 0.25)';
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle = bg;
      ctx.strokeStyle = border;
      ctx.lineWidth = 2;
      const mw = Math.min(720, w - 40);
      const mx = Math.floor((w - mw) / 2);
      const my = 98;
      const mh = 52;
      ctx.beginPath();
      const rr = 14;
      ctx.moveTo(mx + rr, my);
      ctx.lineTo(mx + mw - rr, my);
      ctx.quadraticCurveTo(mx + mw, my, mx + mw, my + rr);
      ctx.lineTo(mx + mw, my + mh - rr);
      ctx.quadraticCurveTo(mx + mw, my + mh, mx + mw - rr, my + mh);
      ctx.lineTo(mx + rr, my + mh);
      ctx.quadraticCurveTo(mx, my + mh, mx, my + mh - rr);
      ctx.lineTo(mx, my + rr);
      ctx.quadraticCurveTo(mx, my, mx + rr, my);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '700 16px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      ctx.fillText(message.text, mx + 16, my + 32);
      ctx.restore();
    }

  };

  useEffect(() => {
    resizeCanvas();
    initBackground();
    const handleResize = () => {
      resizeCanvas();
      initBackground();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const down = (e) => {
      unlockAudio();
      const key = e.key === ' ' ? ' ' : e.key.toLowerCase();
      keysRef.current.add(key);
    };
    const up = (e) => {
      const key = e.key === ' ' ? ' ' : e.key.toLowerCase();
      keysRef.current.delete(key);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    updateRef.current = step;
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    stateRef.current.t0 = performance.now();
    const loop = (now) => {
      if (updateRef.current) updateRef.current(now);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === 'menu') {
      const w = window.innerWidth;
      const h = window.innerHeight;
      stateRef.current.player.x = w / 2;
      stateRef.current.player.y = h / 2;
    }
  }, [phase]);

  const onTouch = (key, value) => {
    if (value) unlockAudio();
    touchRef.current[key] = value;
  };

  return (
    <GameContainer>
      <Header>
        <Button onClick={onBack}><FaArrowLeft /> Salir</Button>
        <StatBar>
          <Pill>Vida: {hp}</Pill>
          <Pill>Oleada: {wave}</Pill>
          <Pill>Ayudantes: {helpersCount}</Pill>
          <Pill>Puntos: {score}</Pill>
        </StatBar>
      </Header>

      <Canvas ref={canvasRef} />

      {isMobile && phase !== 'menu' && phase !== 'gameover' && (
        <TouchControls>
          <Pad>
            <div />
            <TouchButton
              onTouchStart={() => onTouch('up', true)}
              onTouchEnd={() => onTouch('up', false)}
              onTouchCancel={() => onTouch('up', false)}
            >
              ▲
            </TouchButton>
            <div />
            <TouchButton
              onTouchStart={() => onTouch('left', true)}
              onTouchEnd={() => onTouch('left', false)}
              onTouchCancel={() => onTouch('left', false)}
            >
              ◀
            </TouchButton>
            <div />
            <TouchButton
              onTouchStart={() => onTouch('right', true)}
              onTouchEnd={() => onTouch('right', false)}
              onTouchCancel={() => onTouch('right', false)}
            >
              ▶
            </TouchButton>
            <div />
            <TouchButton
              onTouchStart={() => onTouch('down', true)}
              onTouchEnd={() => onTouch('down', false)}
              onTouchCancel={() => onTouch('down', false)}
            >
              ▼
            </TouchButton>
            <div />
          </Pad>
          <ShootButton
            onTouchStart={() => onTouch('shoot', true)}
            onTouchEnd={() => onTouch('shoot', false)}
            onTouchCancel={() => onTouch('shoot', false)}
          >
            Disparar ácido
          </ShootButton>
        </TouchControls>
      )}

      {phase === 'menu' && (
        <Overlay>
          <Panel>
            <Title>InmnunoDefender</Title>
            <SubTitle>
              Eres un glóbulo blanco. Elimina virus y bacterias con ácido. Los rojos atacan y los azules huyen.
              Tras cada oleada se unirá un ayudante. Entre oleadas, responde una pregunta y pisa la respuesta correcta.
            </SubTitle>
            <SubTitle>Elige la materia para las preguntas:</SubTitle>
            <SubjectsGrid>
              {SUBJECTS.map(s => (
                <SubjectCard key={s.id} onClick={() => startGameWithSubject(s.id)}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{s.name}</div>
                    <div style={{ opacity: 0.85, fontSize: '0.9rem' }}>Preguntas de {s.name.toLowerCase()}</div>
                  </div>
                  <Dot $color={s.color} />
                </SubjectCard>
              ))}
            </SubjectsGrid>
          </Panel>
        </Overlay>
      )}

      {phase === 'gameover' && (
        <Overlay>
          <Panel>
            <Title>Fin de partida</Title>
            <SubTitle>Puntuación final: {score}</SubTitle>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button onClick={() => setPhase('menu')}>Elegir materia</Button>
              <Button
                onClick={() => {
                  if (!subjectId) { setPhase('menu'); return; }
                  resetRun();
                  setQuestion(null);
                  setQuestionIndex(0);
                  setPhase('playing');
                  spawnWave(1);
                }}
              >
                Reintentar
              </Button>
            </div>
          </Panel>
        </Overlay>
      )}
    </GameContainer>
  );
};

export default InmnunoDefenderGame;
