// Tests del RPG Fútbol (Turnos).
//
// El juego vive en public/games/tsubasa/, en vanilla JS dentro de un iframe.
// Aquí se comprueba lo que se rompió sin que nadie lo notara: el recorte de
// sprites fallaba en silencio y el juego pintaba muñecos de palitos, y las
// fuentes que pedía el HTML no existían en el repo.

import fs from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import TsubasaRpgGame from './TsubasaRpgGame';

const BASE = path.join(__dirname, '../../public/games/tsubasa');
const leer = (rel) => fs.readFileSync(path.join(BASE, rel), 'utf8');

describe('el iframe', () => {
  it('monta el juego del directorio público', () => {
    render(<TsubasaRpgGame onBack={() => {}} />);
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeTruthy();
    expect(iframe.getAttribute('src')).toContain('/games/tsubasa/index.html');
  });

  it('tiene botón de volver', () => {
    render(<TsubasaRpgGame onBack={() => {}} />);
    expect(screen.getByText(/Volver/)).toBeTruthy();
  });
});

describe('los recursos del juego', () => {
  // Todas las rutas locales que pide el juego, sin la cache-buster.
  const rutasLocales = () => {
    const html = leer('index.html');
    const js = leer('game.js');
    const todo = [
      ...[...html.matchAll(/(?:src|href)=["'`]([^"'`]+)["'`]/g)].map((m) => m[1]),
      ...[...html.matchAll(/\.src\s*=\s*[`'"]([^`'"]+)[`'"]/g)].map((m) => m[1]),
      ...[...js.matchAll(/["'`](\.\/assets\/[^"'`]+)["'`]/g)].map((m) => m[1]),
    ];
    return todo
      .map((r) => r.split('?')[0])
      .filter((r) => r.startsWith('./') || r.startsWith('../'));
  };

  it('todos los ficheros que pide el juego existen', () => {
    const rutas = rutasLocales();
    expect(rutas.length).toBeGreaterThan(0);
    const faltan = rutas.filter((r) => !fs.existsSync(path.join(BASE, r)));
    expect(faltan).toEqual([]);
  });

  it('no pide fuentes que no estén en el repo', () => {
    const html = leer('index.html');
    const fuentes = [...html.matchAll(/url\(["']([^"']+)["']\)/g)].map((m) => m[1]);
    const faltan = fuentes.filter((r) => !fs.existsSync(path.join(BASE, r)));
    expect(faltan).toEqual([]);
  });

  it('el recorte avisa cuando no encuentra las figuras', () => {
    // Si el recorte del atlas falla, tiene que dejar constancia: el juego no
    // puede quedarse en silencio y enseñar los dibujos de reserva.
    const js = leer('game.js');
    expect(js).toContain('avisos');
    expect(js).toMatch(/avisos\.push/);
  });
});
