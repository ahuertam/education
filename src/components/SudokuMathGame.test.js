// Tests del Sudoku Math.
//
// Lo que el usuario decía: "a veces pones operaciones imposibles".
// Las operaciones nunca son imposibles —la partida se genera con su solución—
// pero el mensaje de error era genérico y el niño se quedaba pensando que la
// partida no tenía arreglo. Aquí se comprueba que la partida siempre tiene
// solución y que el error dice qué operación falla.

import { render, screen, fireEvent } from '@testing-library/react';
import SudokuMathGame, { buildPuzzle, valorEcuacion } from './SudokuMathGame';

const LETRAS = 'ABCDEFGHIJKL'.split('');

// Rellena una casilla con el número dado.
const poner = (letra, numero) => {
  fireEvent.click(screen.getByLabelText(`Número ${numero}`));
  fireEvent.click(screen.getByLabelText(`Hueco ${letra}`));
};

describe('las partidas generadas', () => {
  it('siempre tienen solución: la que trae el generador', () => {
    const fallos = [];
    for (let i = 0; i < 5000; i++) {
      const puzzle = buildPuzzle(i % 2 === 0 ? 'easy' : 'hard');
      // La solución cumple todas las operaciones.
      for (const eq of puzzle.equations) {
        const valor = valorEcuacion(eq, puzzle.solution);
        if (valor !== eq.res) {
          fallos.push(`partida ${i}: ${JSON.stringify(eq)} da ${valor} y pone ${eq.res}`);
          break;
        }
      }
      // Cada número aparece una vez y todos están del 1 al 12.
      const usados = Object.values(puzzle.solution);
      if (new Set(usados).size !== 12 || usados.some((n) => n < 1 || n > 12)) {
        fallos.push(`partida ${i}: reparto ${usados.join(',')}`);
      }
      // El panel ofrece los mismos doce números.
      if (puzzle.pool.length !== 12) fallos.push(`partida ${i}: panel de ${puzzle.pool.length}`);
    }
    expect(fallos.slice(0, 5)).toEqual([]);
  });

  it('el resultado siempre es un número que se puede escribir', () => {
    for (let i = 0; i < 500; i++) {
      const puzzle = buildPuzzle(i % 2 === 0 ? 'easy' : 'hard');
      for (const eq of puzzle.equations) {
        expect(Number.isInteger(eq.res)).toBe(true);
        expect(eq.res).toBeGreaterThanOrEqual(0);
        expect(eq.res).toBeLessThanOrEqual(99);
      }
    }
  });

  it('cada partida es distinta', () => {
    const primera = buildPuzzle('easy');
    const segunda = buildPuzzle('easy');
    const iguales =
      JSON.stringify(primera.solution) === JSON.stringify(segunda.solution) &&
      JSON.stringify(primera.equations) === JSON.stringify(segunda.equations);
    expect(iguales).toBe(false);
  });
});

describe('el juego', () => {
  it('enseña la cuenta y las casillas', () => {
    render(<SudokuMathGame onBack={() => {}} />);
    expect(screen.getByText('Operaciones')).toBeTruthy();
    expect(screen.getAllByLabelText(/^Hueco /).length).toBe(12);
  });

  it('el error dice qué operación no cuadra', () => {
    render(<SudokuMathGame onBack={() => {}} />);
    // Se llena todo con números que no cuadran.
    LETRAS.forEach((letra, i) => poner(letra, (i % 12) + 1));

    fireEvent.click(screen.getByText('Comprobar'));
    const estado = screen.getByRole('status');
    expect(estado.textContent).toMatch(/operación no cuadra|repetidos/);
    // Y concreta cuál es.
    expect(estado.textContent).toMatch(/La \d\.ª operación|repetidos/);
  });

  it('la pista rellena una casilla con el número bueno', () => {
    render(<SudokuMathGame onBack={() => {}} />);
    fireEvent.click(screen.getByText('💡 Pista'));
    expect(screen.getByRole('status').textContent).toMatch(/Pista: en la casilla/);
    // La casilla queda con un número.
    const conNumero = screen.getAllByLabelText(/^Hueco /).filter((h) => h.textContent.trim() !== '');
    expect(conNumero.length).toBeGreaterThan(0);
  });

  it('con la solución puesta se gana', () => {
    render(<SudokuMathGame onBack={() => {}} />);
    // Se usa el botón "Nuevo" no hace falta: la pista rellena de una en una.
    const pistas = 12;
    for (let i = 0; i < pistas; i++) {
      fireEvent.click(screen.getByText('💡 Pista'));
    }
    fireEvent.click(screen.getByText('Comprobar'));
    expect(screen.getByText('¡Perfecto!')).toBeTruthy();
  });
});
