import React from 'react';
import { Button, ButtonRow, Muted, OverlayCard, OverlayShade, OverlayTitle } from './styles';

export const PauseOverlay = ({ onResume, onRestart, onNewLevel, onBackToSetup, onExit }) => {
  return (
    <OverlayShade>
      <OverlayCard>
        <OverlayTitle>Pausa</OverlayTitle>
        <Muted>
          Puedes continuar, reiniciar con la misma seed o generar un nivel nuevo.
        </Muted>
        <ButtonRow>
          <Button $variant="primary" onClick={onResume}>Continuar</Button>
          <Button onClick={onRestart}>Reiniciar</Button>
          <Button onClick={onNewLevel}>Nuevo nivel</Button>
          <Button onClick={onBackToSetup}>Volver a ajustes</Button>
          <Button onClick={onExit}>Salir</Button>
        </ButtonRow>
      </OverlayCard>
    </OverlayShade>
  );
};

export const CompleteOverlay = ({ onNext, onRepeat, onChangeSeed, onExit }) => {
  return (
    <OverlayShade>
      <OverlayCard>
        <OverlayTitle>¡Nivel completado!</OverlayTitle>
        <Muted>¿Qué quieres hacer ahora?</Muted>
        <ButtonRow>
          <Button $variant="primary" onClick={onNext}>Siguiente</Button>
          <Button onClick={onRepeat}>Repetir</Button>
          <Button onClick={onChangeSeed}>Cambiar seed</Button>
          <Button onClick={onExit}>Salir</Button>
        </ButtonRow>
      </OverlayCard>
    </OverlayShade>
  );
};

