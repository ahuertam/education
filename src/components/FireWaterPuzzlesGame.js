import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, GameStage } from './puzzles/firewater/styles';
import StartScreen from './puzzles/firewater/StartScreen';
import HudBar from './puzzles/firewater/HudBar';
import GameCanvas from './puzzles/firewater/GameCanvas';
import { CompleteOverlay, PauseOverlay } from './puzzles/firewater/Overlays';
import { loadKeymap, saveKeymap } from './puzzles/firewater/keymap';
import { createRandomSeed, normalizeSeed } from './puzzles/firewater/seed';

const FireWaterPuzzlesGame = ({ onBack }) => {
  const savedKeymap = useMemo(() => loadKeymap(), []);
  const defaultKeymap = {
    fire: { left: 'a', right: 'd', jump: 'w', interact: 'e' },
    water: { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp', interact: 'l' },
    system: { pause: 'Escape', restart: 'r', help: 'h' }
  };
  const [phase, setPhase] = useState('start');
  const [difficulty, setDifficulty] = useState('easy');
  const [seed, setSeed] = useState('');
  const [activeSeed, setActiveSeed] = useState('');
  const [runId, setRunId] = useState(0);
  const [gems, setGems] = useState({ fire: 0, water: 0, total: { fire: 0, water: 0 } });
  const [keymap, setKeymap] = useState(
    savedKeymap
      ? {
          fire: { ...defaultKeymap.fire, ...savedKeymap.fire },
          water: { ...defaultKeymap.water, ...savedKeymap.water },
          system: { ...defaultKeymap.system, ...savedKeymap.system }
        }
      : defaultKeymap
  );

  useEffect(() => {
    saveKeymap(keymap);
  }, [keymap]);

  const startGame = () => {
    const normalized = normalizeSeed(seed);
    const finalSeed = normalized.length > 0 ? normalized : createRandomSeed();
    setActiveSeed(finalSeed);
    setPhase('playing');
    setGems({ fire: 0, water: 0, total: { fire: 0, water: 0 } });
    setRunId(v => v + 1);
  };

  const restartSame = useCallback(() => {
    setPhase('playing');
    setGems({ fire: 0, water: 0, total: { fire: 0, water: 0 } });
    setRunId(v => v + 1);
  }, []);

  const newSeed = () => {
    const s = createRandomSeed();
    setSeed(s);
    setActiveSeed(s);
    setPhase('playing');
    setGems({ fire: 0, water: 0, total: { fire: 0, water: 0 } });
    setRunId(v => v + 1);
  };

  const exitToSetup = () => {
    setPhase('start');
  };

  const onRequestPause = useCallback(() => setPhase('paused'), []);
  const onResume = () => setPhase('playing');
  const onDeath = useCallback(() => setPhase('paused'), []);
  const onComplete = useCallback(() => setPhase('complete'), []);

  const difficultyLabel = difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Medio' : 'Difícil';

  return (
    <Container>
      {phase === 'start' && (
        <StartScreen
          onBack={onBack}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          seed={seed}
          setSeed={setSeed}
          onStart={startGame}
          onRandomSeed={() => setSeed(createRandomSeed())}
          keymap={keymap}
          setKeymap={setKeymap}
        />
      )}

      {phase !== 'start' && (
        <GameStage>
          <HudBar
            seed={activeSeed}
            difficultyLabel={difficultyLabel}
            gems={gems}
            onPause={onRequestPause}
            onRestart={restartSame}
            onNewSeed={newSeed}
          />

          <GameCanvas
            key={runId}
            seed={activeSeed}
            difficulty={difficulty}
            keymap={keymap}
            paused={phase !== 'playing'}
            onPause={onRequestPause}
            onRestart={restartSame}
            onDeath={onDeath}
            onComplete={onComplete}
            onGemChange={setGems}
          />
        </GameStage>
      )}

      {phase === 'paused' && (
        <PauseOverlay
          onResume={onResume}
          onRestart={restartSame}
          onNewLevel={newSeed}
          onBackToSetup={exitToSetup}
          onExit={onBack}
        />
      )}

      {phase === 'complete' && (
        <CompleteOverlay
          onNext={newSeed}
          onRepeat={restartSame}
          onChangeSeed={exitToSetup}
          onExit={onBack}
        />
      )}
    </Container>
  );
};

export default FireWaterPuzzlesGame;
