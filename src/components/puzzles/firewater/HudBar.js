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

const HudBar = ({ seed, difficultyLabel, gems, onPause, onRestart, onNewSeed }) => {
  const fireNow = gems?.fire ?? 0;
  const waterNow = gems?.water ?? 0;
  const fireTotal = gems?.total?.fire ?? 0;
  const waterTotal = gems?.total?.water ?? 0;
  return (
    <Hud>
      <HudLeft>
        <HudTitle>Fuego & Agua</HudTitle>
        <HudMeta>
          Seed: {seed} · {difficultyLabel} · Gemas: {fireNow}/{fireTotal} · {waterNow}/{waterTotal}
        </HudMeta>
        <LegendRow>
          <LegendItem><LegendSwatch $color="#FF5A3C" />Gema fuego</LegendItem>
          <LegendItem><LegendSwatch $color="#3CA8FF" />Gema agua</LegendItem>
          <LegendItem><LegendSwatch $color="#FF5A3C" />Fuego (lava OK)</LegendItem>
          <LegendItem><LegendSwatch $color="#3CA8FF" />Agua (agua OK)</LegendItem>
          <LegendItem><LegendSwatch $color="#FF3B5C" />Lava mata Agua</LegendItem>
          <LegendItem><LegendSwatch $color="#2D9CDB" />Agua mata Fuego</LegendItem>
          <LegendItem><LegendSwatch $color="#9FD9FF" />Hielo resbala</LegendItem>
          <LegendItem><LegendSwatch $color="#24304F" />Plataforma móvil</LegendItem>
          <LegendItem><LegendSwatch $color="#2ED47A" />Botón abre puerta</LegendItem>
          <LegendItem><LegendSwatch $color="#F2C94C" />Palanca / láser</LegendItem>
          <LegendItem><LegendSwatch $color="#E8EEFF" />Espejo rota</LegendItem>
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
