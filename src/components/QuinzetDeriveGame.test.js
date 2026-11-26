// Test del flujo de Quinzet Derive.
//
// Lo que se comprueba: que la fábrica pide un número, que el niño lo monta
// con las fichas (un bloque, las barras y los cubitos que hagan falta) y que
// al acertar la ronda se explica cómo se compone.

import { render, screen, fireEvent } from '@testing-library/react';
import QuinzetDeriveGame, { crearRondas } from './QuinzetDeriveGame';
import { baseDiez } from '../utils/matematicas';

describe('las rondas de la fábrica', () => {
  it('alternan componer y cambiar, y componer pide un número', () => {
    const rondas = crearRondas();
    expect(rondas).toHaveLength(8);
    rondas.forEach((r, i) => {
      if (i % 2 === 0) {
        expect(r.tipo).toBe('componer');
        expect(r.objetivo).toBeGreaterThan(0);
        expect(r.enunciado).toMatch(/fábrica quiere/i);
      } else {
        expect(r.tipo).toBe('cambia');
        expect(r.opciones).toHaveLength(4);
        expect(r.opciones).toContain(r.correcta);
      }
    });
  });
});

describe('la fábrica de cifras', () => {
  it('monta el número que pide con las fichas', () => {
    render(<QuinzetDeriveGame onBack={() => {}} />);

    // El número que pide la fábrica, tal y como está escrito.
    const texto = screen.getByText(/La fábrica quiere el número/).textContent;
    const objetivo = Number(texto.match(/(\d+)$/)[1]);
    const { centenas, decenas, unidades } = baseDiez(objetivo);

    // La mesa empieza vacía.
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe(
      '0 centenas, 0 decenas y 0 unidades'
    );

    // Se monta con las fichas: un bloque, las barras y los cubitos.
    for (let i = 0; i < centenas; i++) fireEvent.click(screen.getByText('+100'));
    for (let i = 0; i < decenas; i++) fireEvent.click(screen.getByText('+10'));
    for (let i = 0; i < unidades; i++) fireEvent.click(screen.getByText('+1'));

    expect(screen.getByText(/¡La fábrica lo quiere!/)).toBeTruthy();
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe(
      `${centenas} centenas, ${decenas} decenas y ${unidades} unidades`
    );
  });
});
