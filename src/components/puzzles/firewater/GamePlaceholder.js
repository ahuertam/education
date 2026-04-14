import React from 'react';
import { CanvasPlaceholder, Muted } from './styles';

const GamePlaceholder = () => {
  return (
    <CanvasPlaceholder>
      <div style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.4rem' }}>
        Motor del juego
      </div>
      <Muted>
        En el siguiente paso se monta el canvas del juego y la generación procedural siempre resoluble.
      </Muted>
    </CanvasPlaceholder>
  );
};

export default GamePlaceholder;

