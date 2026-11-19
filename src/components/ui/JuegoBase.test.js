// Tests del final de partida compartido.
//
// Aquí vive el bucle de ADI: en vez de "otra cuenta", el niño se gana un
// minijuego. Y el educador puede apagarlo desde los ajustes del aula.

import { render, screen } from '@testing-library/react';
import { PantallaFinal } from './JuegoBase';

const props = {
  puntos: 10,
  aciertos: 3,
  rondas: 5,
  mejorRacha: 2,
  ranking: { top: [] },
  onReiniciar: () => {},
  onVolver: () => {},
};

describe('la pantalla final', () => {
  afterEach(() => localStorage.removeItem('edutika:ajustes'));

  it('cuenta lo que el niño ha hecho', () => {
    render(<PantallaFinal {...props} />);
    expect(screen.getByText(/Acertaste 3 de 5 rondas/)).toBeTruthy();
  });

  it('ofrece el minijuego de premio por defecto', () => {
    render(<PantallaFinal {...props} />);
    expect(screen.getByText(/Minijuego de premio/)).toBeTruthy();
  });

  it('lo omite si el educador ha apagado el premio', () => {
    localStorage.setItem('edutika:ajustes', JSON.stringify({ premio: false }));
    render(<PantallaFinal {...props} />);
    expect(screen.queryByText(/Minijuego de premio/)).toBeNull();
  });
});
