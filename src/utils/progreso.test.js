// Tests del progreso.
//
// Qué juegos ha probado el niño. Lo anota App.js al abrir un juego, así que
// aquí solo se comprueba que se guarda bien y que se cuenta bien.

import { GAMES } from '../config/games';
import {
  cargarProgreso,
  progresoPorCategoria,
  registrarJuegoJugado,
} from './progreso';

describe('el progreso', () => {
  beforeEach(() => localStorage.removeItem('edutika:progreso'));
  afterEach(() => localStorage.removeItem('edutika:progreso'));

  it('empieza vacío', () => {
    expect(cargarProgreso()).toEqual([]);
  });

  it('anota un juego y no lo repite', () => {
    registrarJuegoJugado('memory');
    registrarJuegoJugado('memory');
    registrarJuegoJugado('space');
    expect(cargarProgreso()).toEqual(['memory', 'space']);
  });

  it('cuenta los juegos probados del catálogo', () => {
    registrarJuegoJugado('memory');
    registrarJuegoJugado('space');
    const progreso = progresoPorCategoria(GAMES);
    expect(progreso.jugados).toBe(2);
    // Todos los juegos del catálogo cuentan, también el que se abre directo.
    expect(progreso.total).toBe(GAMES.length);
  });

  it('cuenta también por categoría', () => {
    registrarJuegoJugado('memory');
    const progreso = progresoPorCategoria(GAMES);
    // El memorama está en addition, subtraction, multiplication, division y mixed_math.
    expect(progreso.porCategoria.addition.jugados).toBe(1);
    expect(progreso.porCategoria.addition.total).toBeGreaterThan(1);
    expect(progreso.porCategoria.english.jugados).toBe(0);
  });

  it('un id que no es del catálogo no cuenta', () => {
    registrarJuegoJugado('no-existe');
    expect(progresoPorCategoria(GAMES).jugados).toBe(0);
  });
});
