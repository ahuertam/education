import React, { useEffect } from 'react';
import styled from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';
import { useGameState } from './hooks/useGameState';
import MenuScene from './scenes/MenuScene';
import DungeonScene from './scenes/DungeonScene';
import BattleScene from './scenes/BattleScene';
import GameOverScene from './scenes/GameOverScene';
import VictoryScene from './scenes/VictoryScene';

const Container = styled.div`
  min-height: 100vh;
  background: #060401;
  display: flex;
  flex-direction: column;
  color: #f0d080;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #0a0704;
  border-bottom: 2px solid #3a2808;
  flex-shrink: 0;
`;

const BackBtn = styled.button`
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  color: #f0d080;
  padding: 6px 14px;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  &:hover { background: rgba(255,255,255,0.14); }
`;

const GameTitle = styled.div`
  flex: 1;
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  font-weight: bold;
  letter-spacing: 3px;
  color: #c09040;
`;

const Canvas = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  max-width: 880px;
  width: 100%;
  margin: 0 auto;
`;

// Phases that auto-transition after a delay
const AUTO_ADVANCE = {
  exploring:         1400,
  pre_battle:        1300,
  monster_dying:     1800,  // 800ms death animation + ~1s pause
  treasure:          2400,
};

const AUTO_ACTIONS = {
  exploring:         'ADVANCE_ROOM',
  pre_battle:        'START_BATTLE',
  monster_dying:     'ADVANCE_ROOM',
  treasure:          'COLLECT_TREASURE',
};

export default function TyperDungeonGame({ onBack }) {
  const { state, dispatch } = useGameState();
  const { phase, roomIndex } = state;

  // Auto-transition for phases that don't need user input.
  // roomIndex is a dependency so two consecutive exploring rooms both trigger the timer,
  // even though `phase` stays 'exploring' and wouldn't re-fire the effect on its own.
  useEffect(() => {
    const delay = AUTO_ADVANCE[phase];
    if (!delay) return;
    const t = setTimeout(() => dispatch({ type: AUTO_ACTIONS[phase] }), delay);
    return () => clearTimeout(t);
  }, [phase, roomIndex, dispatch]);

  const renderScene = () => {
    if (phase === 'menu')        return <MenuScene dispatch={dispatch} />;
    if (phase === 'battle' || phase === 'monster_dying') {
      return <BattleScene state={state} dispatch={dispatch} />;
    }
    if (phase === 'game_over')   return <GameOverScene dispatch={dispatch} />;
    if (phase === 'victory')     return <VictoryScene dispatch={dispatch} />;
    // exploring | pre_battle | treasure | stairs_found
    return <DungeonScene state={state} dispatch={dispatch} />;
  };

  return (
    <Container>
      <Header>
        <BackBtn onClick={onBack}>
          <FaArrowLeft /> Salir
        </BackBtn>
        <GameTitle>⚔ TYPER DUNGEON ⚔</GameTitle>
        <div style={{ width: 80 }} />
      </Header>
      <Canvas>
        {renderScene()}
      </Canvas>
    </Container>
  );
}
