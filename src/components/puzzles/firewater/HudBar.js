import React from 'react';
import {
  Button,
  ButtonRow,
  Hud,
  HudLeft,
  HudMeta,
  HudTitle,
  LegendItem,
  LegendRow,
  LegendSwatch
} from './styles';

const HudBar = ({ seed, difficultyLabel, onPause, onRestart, onNewSeed }) => {
  return (
    <Hud>
      <HudLeft>
        <HudTitle>Fuego & Agua</HudTitle>
        <HudMeta>Seed: {seed} · {difficultyLabel}</HudMeta>
        <LegendRow>
          <LegendItem><LegendSwatch $color="#FF5A3C" />Fuego (lava OK)</LegendItem>
          <LegendItem><LegendSwatch $color="#3CA8FF" />Agua (agua OK)</LegendItem>
          <LegendItem><LegendSwatch $color="#FF3B5C" />Lava mata Agua</LegendItem>
          <LegendItem><LegendSwatch $color="#2D9CDB" />Agua mata Fuego</LegendItem>
          <LegendItem><LegendSwatch $color="#2ED47A" />Botón abre puerta</LegendItem>
          <LegendItem><LegendSwatch $color="#8893B5" />Puerta bloquea</LegendItem>
        </LegendRow>
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
