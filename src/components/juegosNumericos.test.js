// Tests de los cuatro juegos de fracciones y sentido numérico.
//
// No basta con que se rendericen: estos juegos tienen rondas aleatorias, y lo
// que se rompe es que una ronda deje al niño sin salida (sin botón de
// "Siguiente") o que la partida no llegue nunca a su final. Por eso la prueba
// fuerte es jugar las diez rondas enteras.

import { render, screen, fireEvent } from '@testing-library/react';
import TallerFraccionesGame from './FraccionesGame';
import ProductosParcialesGame from './ProductosParcialesGame';
import RectaNumericaGame from './RectaNumericaGame';
import BaseDiezGame from './BaseDiezGame';

const esBoton = (b) => b.tagName === 'BUTTON' && !b.disabled;

const botonesDeJuego = () =>
  screen.getAllByRole('button').filter(
    (b) => esBoton(b) && b.textContent.trim() !== 'Volver'
  );

// Juega una ronda, sea de opciones, de casillas para escribir o de fichas que
// hay que ordenar. Devuelve el botón para pasar a la siguiente.
const jugarRonda = () => {
  const campos = screen.queryAllByRole('textbox');
  if (campos.length > 0) {
    // Rondas de escribir: se rellenan los campos con cualquier número.
    campos.forEach((campo, i) =>
      fireEvent.change(campo, { target: { value: String(i + 1) } })
    );
    fireEvent.click(screen.getByText('Comprobar'));
  } else if (screen.queryByText(/Toca el número/)) {
    // La ronda de ordenar: se van tocando fichas hasta que encajen en orden.
    for (let i = 0; i < 40; i++) {
      if (screen.queryByText('Siguiente') || screen.queryByText('Ver resultado')) break;
      const fichas = botonesDeJuego().filter((b) => !/Siguiente|resultado/.test(b.textContent));
      if (fichas.length === 0) break;
      fireEvent.click(fichas[i % fichas.length]);
    }
  } else {
    fireEvent.click(botonesDeJuego()[0]);
  }
};

const jugarPartidaCompleta = () => {
  for (let ronda = 0; ronda < 10; ronda++) {
    jugarRonda();
    const siguiente = screen.queryByText('Siguiente') || screen.queryByText('Ver resultado');
    expect(siguiente).toBeTruthy();
    fireEvent.click(siguiente);
  }
  expect(screen.getByText('¡Partida terminada!')).toBeTruthy();
};

describe('Taller de Fracciones', () => {
  it('pregunta y espera una respuesta', () => {
    render(<TallerFraccionesGame onBack={() => {}} />);
    expect(screen.getByText('Ronda 1/10')).toBeTruthy();
    expect(botonesDeJuego().length).toBeGreaterThanOrEqual(3);
  });

  it('al responder enseña el acierto o el fallo con su explicación', () => {
    render(<TallerFraccionesGame onBack={() => {}} />);
    fireEvent.click(botonesDeJuego()[0]);
    const feedback = screen.getByText(/¡Correcto!|¡Casi!/);
    expect(feedback).toBeTruthy();
    expect(screen.getByText('Siguiente')).toBeTruthy();
  });

  it('se puede jugar la partida entera', () => {
    render(<TallerFraccionesGame onBack={() => {}} />);
    jugarPartidaCompleta();
  });
});

describe('Buscador de Productos Parciales', () => {
  it('pregunta con el modelo del rectángulo', () => {
    render(<ProductosParcialesGame onBack={() => {}} multiplicationConfig={{ tables: [1, 2, 3], digitMode: 1 }} />);
    expect(screen.getByText('Ronda 1/10')).toBeTruthy();
    expect(screen.getByText(/¿Cuánto vale/)).toBeTruthy();
  });

  it('se puede jugar la partida entera', () => {
    render(<ProductosParcialesGame onBack={() => {}} multiplicationConfig={{ tables: [2, 3, 4, 5], digitMode: 1 }} />);
    jugarPartidaCompleta();
  });
});

describe('La Recta Numérica', () => {
  it('dibuja la recta y pregunta qué número marca el tren', () => {
    render(<RectaNumericaGame onBack={() => {}} />);
    expect(screen.getByText('Ronda 1/10')).toBeTruthy();
    // La recta es un <svg role="img">, así que se busca por su rol y no
    // bufleando el DOM a mano.
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
    expect(screen.getByText(/¿Qué número marca el tren/)).toBeTruthy();
  });

  it('se puede jugar la partida entera', () => {
    render(<RectaNumericaGame onBack={() => {}} />);
    jugarPartidaCompleta();
  });
});

describe('Base Diez', () => {
  it('pregunta qué número forman las piezas', () => {
    render(<BaseDiezGame onBack={() => {}} />);
    expect(screen.getByText('Ronda 1/10')).toBeTruthy();
    expect(screen.getByText(/¿Qué número forman estas piezas/)).toBeTruthy();
  });

  it('se puede jugar la partida entera', () => {
    render(<BaseDiezGame onBack={() => {}} />);
    jugarPartidaCompleta();
  });
});
