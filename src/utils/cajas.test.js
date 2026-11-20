// Tests del guardado de Cajas y Números.
//
// El nivel se guarda en el navegador para que el niño no pierda lo que ha
// colocado. Al leerlo se valida: si el guardado no cuadra, se empieza de
// cero en vez de romper el juego.

import { generarNivel } from '../components/puzzles/cajas/logic';
import { cargarCajas, guardarCajas, nivelValido } from './cajas';

describe('el nivel guardado de cajas', () => {
  beforeEach(() => localStorage.removeItem('edutika:cajas'));
  afterEach(() => localStorage.removeItem('edutika:cajas'));

  it('guarda y recupera el nivel tal cual', () => {
    const nivel = generarNivel(7);
    guardarCajas(7, nivel);
    const guardado = cargarCajas();
    expect(guardado.semilla).toBe(7);
    expect(guardado.nivel.jugador).toEqual(nivel.jugador);
    expect(guardado.nivel.celdas).toEqual(nivel.celdas);
  });

  it('si no hay nada guardado no hay nivel', () => {
    expect(cargarCajas()).toBeNull();
  });

  it('un nivel con otra rejilla no vale', () => {
    const nivel = generarNivel(1);
    expect(nivelValido(nivel)).toBe(true);
    expect(nivelValido({ ...nivel, celdas: nivel.celdas.slice(1) })).toBe(false);
    expect(nivelValido({ ...nivel, celdas: nivel.celdas.map((f) => f.slice(1)) })).toBe(false);
  });

  it('un nivel con el jugador fuera de la rejilla no vale', () => {
    const nivel = generarNivel(1);
    expect(nivelValido({ ...nivel, jugador: { f: 99, c: 0 } })).toBe(false);
    expect(nivelValido({ ...nivel, jugador: { f: '1', c: 0 } })).toBe(false);
  });

  it('un nivel sin la cuenta de la puerta no vale', () => {
    const nivel = generarNivel(1);
    expect(nivelValido({ ...nivel, puerta: undefined })).toBe(false);
  });

  it('un guardado roto no rompe nada: se empieza de cero', () => {
    localStorage.setItem('edutika:cajas', 'esto no es json');
    expect(cargarCajas()).toBeNull();
    localStorage.setItem('edutika:cajas', JSON.stringify({ semilla: 3, nivel: { celdas: [] } }));
    expect(cargarCajas()).toBeNull();
  });
});
