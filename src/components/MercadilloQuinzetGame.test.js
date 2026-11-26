// Test del flujo del Mercadillo Quinzet.
//
// Lo que se comprueba: que hay tres estrategias para elegir, que al elegir la
// buena aparece el primer paso con sus opciones, que cada paso se responde y
// se pasa al siguiente, y que al final el puesto paga con monedas.

import { render, screen, fireEvent } from '@testing-library/react';
import MercadilloQuinzetGame from './MercadilloQuinzetGame';

const NOMBRES = /Doble y mitad|×10 y ÷10|Complemento a 10|Número redondo|Reparto en partes/;

// Las tarjetas de estrategia y las opciones numéricas se distinguen por lo
// que pone dentro: las unas tienen nombre de estrategia, las otras un número.
const estrategias = () => screen.queryAllByRole('button').filter((b) => NOMBRES.test(b.textContent));
const numeros = () => screen.queryAllByRole('button').filter((b) => /^\d+$/.test(b.textContent));

describe('el Mercadillo Quinzet', () => {
  it('elige la estrategia, responde los pasos y cobra', () => {
    render(<MercadilloQuinzetGame onBack={() => {}} />);

    // Tres tarjetas de estrategia, y ninguna es la buena de entrada.
    expect(estrategias()).toHaveLength(3);
    expect(numeros()).toHaveLength(0);

    // Se prueban hasta dar con la buena: las que no sirven dejan un aviso y
    // la buena pasa al primer paso.
    for (const tarjeta of estrategias()) {
      fireEvent.click(tarjeta);
      if (numeros().length > 0) break;
    }
    expect(numeros()).toHaveLength(4);

    // Cada paso se responde y se pasa al siguiente. Un fallo dice cuál era.
    let pasos = 0;
    while (pasos < 4 && numeros().length > 0) {
      fireEvent.click(numeros()[0]);
      expect(screen.getByText(/¡Bien!|Era /)).toBeTruthy();
      fireEvent.click(screen.getByText('Siguiente'));
      pasos += 1;
    }

    // Y el puesto paga.
    expect(screen.getByText(/¡Compra hecha!/)).toBeTruthy();
    expect(screen.getByText('Siguiente puesto')).toBeTruthy();
  });
});
