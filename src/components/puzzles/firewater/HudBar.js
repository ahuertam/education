import React from 'react';
import { Button, ButtonRow, Hud, HudLeft, HudMeta, HudTitle } from './styles';

const HudBar = ({ seed, difficultyLabel, onPause, onRestart, onNewSeed }) => {
  return (
    <Hud>
      <HudLeft>
        <HudTitle>Fuego & Agua</HudTitle>
        <HudMeta>Seed: {seed} · {difficultyLabel}</HudMeta>
      </HudLeft>
      <ButtonRow style={{ marginTop: 0 }}>
        <Button onClick={onPause}>Pausa</Button>
        <Button onClick={onRestart}>Reiniciar</Button>
        <Button onClick={onNewSeed}>Nueva seed</Button>
      </ButtonRow>
    </Hud>
  );
};

export default HudBar;

