// Test del flujo de la Hoja Quinzet.
//
// Lo que se comprueba: que al elegir una hoja aparece una cuenta, que la
// opción correcta se reconoce y que un fallo dice cuál era la respuesta. La
// cuenta sale al azar, así que el test la lee de la pantalla y calcula lo que
// tiene que ser.

import { render, screen, fireEvent, act } from '@testing-library/react';
import HojaQuinzetGame from './HojaQuinzetGame';

const props = {
  onBack: () => {},
  operation: 'addition',
  multiplicationConfig: { tables: [1, 2, 3], digitMode: 1 },
};

// Los botones que son opciones: los que solo tienen un número.
const opcionesEnPantalla = () =>
  screen.getAllByRole('button').filter((b) => /^\d+$/.test(b.textContent));

// La cuenta que hay en pantalla y su resultado.
const cuentaEnPantalla = () => {
  const texto = screen.getByText(/^\d+ [+\-×÷] \d+$/).textContent;
  const [, a, signo, b] = texto.match(/(\d+)\s*([+\-×÷])\s*(\d+)/);
  const x = Number(a);
  const y = Number(b);
  const resultado =
    signo === '+' ? x + y : signo === '-' ? x - y : signo === '×' ? x * y : x / y;
  return { texto, resultado };
};

describe('la hoja Quinzet', () => {
  it('elige una hoja y reconoce la respuesta correcta', () => {
    render(<HojaQuinzetGame {...props} />);

    // El menú ofrece las cuatro hojas del método.
    expect(screen.getByText(/Hoja 1 · 1º/)).toBeTruthy();
    expect(screen.getByText(/Hoja 4 · 4º/)).toBeTruthy();

    fireEvent.click(screen.getByText(/Hoja 1 · 1º/));

    // La cuenta sale al azar: la leemos de la pantalla.
    const { resultado } = cuentaEnPantalla();
    fireEvent.click(
      opcionesEnPantalla().find((b) => b.textContent === String(resultado))
    );
    expect(screen.getByText(/¡Bien!/)).toBeTruthy();

    // Y si se falla, se dice cuál era la respuesta.
    const { texto, resultado: elCorrecto } = cuentaEnPantalla();
    fireEvent.click(
      opcionesEnPantalla().find((b) => b.textContent !== String(elCorrecto))
    );
    expect(screen.getByText(`Era ${texto} = ${elCorrecto}`)).toBeTruthy();
  });

  it('acabada la hoja, ofrece el minijuego de premio', () => {
    // La hoja dura dos minutos: se adelanta el reloj y la partida termina.
    jest.useFakeTimers();
    try {
      render(<HojaQuinzetGame {...props} />);
      fireEvent.click(screen.getByText(/Hoja 1 · 1º/));
      act(() => {
        jest.advanceTimersByTime(120000);
      });
      expect(screen.getByText('🎁 Minijuego de premio')).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });
});
