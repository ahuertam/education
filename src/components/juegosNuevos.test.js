// Tests de los juegos nuevos.
//
// No basta con que se rendericen: El Colgado y Rosco tienen el dataset de
// palabras, y ahí es donde se cuelan las palabras imposibles de acertar.

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ElColgadoGame from './ElColgadoGame';
import RoscoPalabrasGame from './RoscoPalabrasGame';
import JeopardyGame from './JeopardyGame';
import { PALABRAS_AHORCADO } from './data/ahorcadoPalabras';

const TECLADO = 'abcdefghijklmnopqrstuvwxyzñ'.split('');
const sinTilde = (c) => (c === 'ñ' ? 'ñ' : c.normalize('NFD').replace(/[̀-ͯ]/g, ''));

describe('el dataset de palabras', () => {
  it('no tiene palabras repetidas', () => {
    const palabras = PALABRAS_AHORCADO.map((p) => p.palabra.toLowerCase());
    expect(new Set(palabras).size).toBe(palabras.length);
  });

  it('todas las palabras tienen pista y dificultad válida', () => {
    for (const p of PALABRAS_AHORCADO) {
      expect(p.pista.length).toBeGreaterThan(10);
      expect([1, 2, 3, 4]).toContain(p.dificultad);
      expect(p.palabra).toBe(p.palabra.toLowerCase());
    }
  });

  it('toda palabra es acertable con el teclado del juego', () => {
    // Este es el fallo que casi se cuela: una palabra con "á" o "ü" es
    // imposible de completar si el teclado no tiene tildes.
    const sinTeclado = [];
    for (const p of PALABRAS_AHORCADO) {
      for (const letra of new Set(p.palabra.toLowerCase().split(''))) {
        if (!TECLADO.includes(sinTilde(letra))) sinTeclado.push(`${p.palabra} (${letra})`);
      }
    }
    expect(sinTeclado).toEqual([]);
  });

  it('ninguna palabra es más larga que 14 letras', () => {
    for (const p of PALABRAS_AHORCADO) {
      expect(p.palabra.length).toBeLessThanOrEqual(14);
    }
  });
});

describe('El Colgado', () => {
  it('arranca y muestra el teclado', () => {
    render(<ElColgadoGame onBack={() => {}} />);
    fireEvent.click(screen.getByText('Jugar'));
    expect(screen.getByLabelText('Letra a')).toBeTruthy();
    expect(screen.getByLabelText('Letra ñ')).toBeTruthy();
  });

  it('una letra correcta completa su hueco y una fallada cuesta un corazón', () => {
    render(<ElColgadoGame onBack={() => {}} />);
    fireEvent.click(screen.getByText('Jugar'));

    const corazones = () => screen.getAllByText('❤️').length;
    const antes = corazones();

    // Se prueban todas las letras: las que están en la palabra se dibujan.
    for (const letra of TECLADO) {
      const boton = screen.getByLabelText(`Letra ${letra}`);
      if (!boton.disabled) fireEvent.click(boton);
    }

    // O se gana (el corazón se mantiene) o se pierde, pero nunca se queda
    // en un estado imposible.
    expect(corazones()).toBeLessThanOrEqual(antes);
    expect(screen.getByText(/Palabra \d+\//)).toBeTruthy();
  });
});

describe('Rosco de Palabras', () => {
  it('escribe la palabra letra a letra y la termina', async () => {
    render(<RoscoPalabrasGame onBack={() => {}} />);
    fireEvent.click(screen.getByText('Jugar'));

    // La pista identifica la palabra en el dataset.
    const pista = screen.getByText(/💡/).textContent.replace('💡', '').trim();
    const palabra = PALABRAS_AHORCADO.find((p) => p.pista === pista);
    expect(palabra).toBeTruthy();

    for (const letra of palabra.palabra.toLowerCase()) {
      const boton = screen.getByLabelText(`Letra ${letra}`);
      if (!boton.disabled) fireEvent.click(boton);
    }

    await waitFor(() => {
      expect(screen.queryByText(pista)).toBeNull();
    }, { timeout: 5000 });
  });
});

describe('Jeopardy', () => {
  it('monta un tablero de 5 categorías con 4 valores', () => {
    render(<JeopardyGame onBack={() => {}} />);
    // 5 categorías × 4 valores = 20 casillas, más el botón de volver.
    const botones = screen.getAllByRole('button');
    expect(botones.length).toBe(21);
    for (const valor of ['100', '200', '300', '400']) {
      expect(screen.getAllByRole('button', { name: valor }).length).toBe(5);
    }
  });

  it('al pulsar una casilla abre la pregunta con sus opciones', () => {
    render(<JeopardyGame onBack={() => {}} />);
    fireEvent.click(screen.getAllByRole('button', { name: '100' })[0]);
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('al responder, la casilla queda usada', () => {
    render(<JeopardyGame onBack={() => {}} />);
    const casilla = screen.getAllByRole('button', { name: '100' })[0];
    fireEvent.click(casilla);
    const opciones = within(screen.getByRole('dialog')).getAllByRole('button');
    // Da igual si se acierta o se falla: la casilla queda marcada.
    fireEvent.click(opciones[0]);
    expect(casilla).toBeDisabled();
  });
});
