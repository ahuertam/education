// Tests de los juegos constructivos: Geoboard, Bloques de Patrones, Tabla de
// Números y Dinero en euros.
//
// La prueba fuerte es la de siempre: jugar la partida entera. En el Geoboard
// hay una ronda en la que el niño construye la figura, así que ahí la prueba
// dibuja un rectángulo con los clavos que pide el juego.

import { render, screen, fireEvent } from '@testing-library/react';
import GeoboardGame from './GeoboardGame';
import PatronesGame from './PatronesGame';
import TablaNumerosGame from './TablaNumerosGame';
import DineroGame from './DineroGame';

// Los clavos del Geoboard también son botones, pero no son respuestas.
const botonesDeJuego = () =>
  screen.getAllByRole('button').filter(
    (b) =>
      !b.disabled &&
      b.textContent.trim() !== 'Volver' &&
      !/Clavo/.test(b.getAttribute('aria-label') || '')
  );

// La ronda del Geoboard en la que hay que construir la figura.
const construirFigura = () => {
  const texto = screen.getByText(/Cierra una figura de (\d+) casillas/).textContent;
  const casillas = Number(texto.match(/(\d+) casillas/)[1]);
  // Un rectángulo que quepa en la rejilla con esa área.
  let ancho = 1;
  while (casillas % ancho !== 0 || casillas / ancho > 4) ancho++;
  const alto = casillas / ancho;

  const clavo = (x, y) => screen.getByLabelText(`Clavo ${x}, ${y}`);
  fireEvent.click(clavo(0, 0));
  fireEvent.click(clavo(ancho, 0));
  fireEvent.click(clavo(ancho, alto));
  fireEvent.click(clavo(0, alto));
  fireEvent.click(clavo(0, 0)); // cierra la figura
};

const jugarRonda = () => {
  if (screen.queryByText(/Cierra una figura de/)) {
    construirFigura();
    return;
  }
  fireEvent.click(botonesDeJuego()[0]);
};

const jugarPartidaCompleta = (rondas) => {
  for (let ronda = 0; ronda < rondas; ronda++) {
    jugarRonda();
    const siguiente = screen.queryByText('Siguiente') || screen.queryByText('Ver resultado');
    expect(siguiente).toBeTruthy();
    fireEvent.click(siguiente);
  }
  expect(screen.getByText('¡Partida terminada!')).toBeTruthy();
};

describe('El Geoboard', () => {
  it('dibuja la rejilla de clavos', () => {
    render(<GeoboardGame onBack={() => {}} />);
    expect(screen.getByText('Ronda 1/8')).toBeTruthy();
    expect(screen.getAllByLabelText(/Clavo/)).toHaveLength(25);
  });

  it('se puede jugar la partida entera', () => {
    render(<GeoboardGame onBack={() => {}} />);
    jugarPartidaCompleta(8);
  });
});

describe('Bloques de Patrones', () => {
  it('pregunta por las piezas de la figura', () => {
    render(<PatronesGame onBack={() => {}} />);
    expect(screen.getByText('Ronda 1/8')).toBeTruthy();
    expect(botonesDeJuego().length).toBeGreaterThanOrEqual(3);
  });

  it('se puede jugar la partida entera', () => {
    render(<PatronesGame onBack={() => {}} />);
    jugarPartidaCompleta(8);
  });
});

describe('La Tabla de Números', () => {
  it('dibuja la rejilla de 24 casillas', () => {
    const { container } = render(<TablaNumerosGame onBack={() => {}} />);
    expect(screen.getByText('Ronda 1/8')).toBeTruthy();
    expect(container.querySelectorAll('[data-celda]')).toHaveLength(24);
  });

  it('se puede jugar la partida entera', () => {
    render(<TablaNumerosGame onBack={() => {}} />);
    jugarPartidaCompleta(8);
  });
});

describe('Dinero en euros', () => {
  it('pregunta cuánto dinero hay', () => {
    render(<DineroGame onBack={() => {}} />);
    expect(screen.getByText('Ronda 1/8')).toBeTruthy();
    expect(screen.getByText(/¿Cuánto dinero hay en total\?/)).toBeTruthy();
  });

  it('las cantidades van en formato español', () => {
    render(<DineroGame onBack={() => {}} />);
    const opciones = botonesDeJuego().map((b) => b.textContent);
    // Ninguna cantidad debe llevar punto decimal.
    expect(opciones.every((t) => !/\d\.\d/.test(t))).toBe(true);
    expect(opciones.every((t) => t.endsWith('€') || t.includes('c'))).toBe(true);
  });

  it('se puede jugar la partida entera', () => {
    render(<DineroGame onBack={() => {}} />);
    jugarPartidaCompleta(8);
  });
});
