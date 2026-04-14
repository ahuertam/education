import React, { useEffect, useMemo, useRef, useState } from 'react';
import { generateLevel } from './levelGenerator';
import { validateLevel } from './solvability';

const wrapperStyle = {
  maxWidth: 1200,
  margin: '1rem auto 2rem',
  borderRadius: 18,
  border: '1px solid rgba(255, 255, 255, 0.14)',
  background: 'rgba(255, 255, 255, 0.08)',
  overflow: 'hidden'
};

const innerStyle = {
  width: '100%',
  aspectRatio: '16 / 9'
};

const errorStyle = {
  padding: '1.25rem',
  color: 'white'
};

const GameCanvas = ({ seed, difficulty, keymap, paused, onPause, onRestart, onDeath, onComplete }) => {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const [error, setError] = useState(null);

  const level = useMemo(() => {
    const lvl = generateLevel({ seed, difficulty });
    const validation = validateLevel(lvl);
    if (!validation.ok) {
      return { lvl, validation };
    }
    return { lvl, validation: null };
  }, [seed, difficulty]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (level.validation) {
      setError(level.validation.reasons.join(', '));
      return;
    }
    setError(null);

    const Phaser = require('phaser');
    const { createPuzzleScene } = require('./puzzleScene');

    const sceneClass = createPuzzleScene({
      level: level.lvl,
      keymap,
      onPause,
      onRestart,
      onDeath,
      onComplete
    });

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 960,
      height: 540,
      backgroundColor: '#0B1020',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 900 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [sceneClass]
    });

    gameRef.current = game;

    return () => {
      try {
        game.destroy(true);
      } finally {
        gameRef.current = null;
      }
    };
  }, [level, keymap, onPause, onRestart, onDeath, onComplete]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    const scene = game.scene.getScene('FireWaterPuzzleScene');
    if (!scene) return;
    if (typeof scene.setPaused === 'function') scene.setPaused(paused);
  }, [paused]);

  return (
    <div style={wrapperStyle}>
      {error ? (
        <div style={errorStyle}>
          No se pudo generar un nivel válido: {error}
        </div>
      ) : (
        <div ref={containerRef} style={innerStyle} />
      )}
    </div>
  );
};

export default GameCanvas;
