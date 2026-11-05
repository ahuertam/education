// El arranque y la carga bajo demanda.
//
// Los juegos se cargan con React.lazy, así que hay que comprobar dos cosas:
// que la landing aparece sin esperar a ningún juego, y que al entrar en un
// juego se descarga su trozo y se pinta.

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

jest.setTimeout(30000);

test('la landing aparece sin esperar a los juegos', async () => {
  render(<App />);
  expect(screen.getByText(/Elige tu Actividad/i)).toBeInTheDocument();
  // Las tarjetas de la landing están.
  expect(screen.getByText('Práctica de Sumas')).toBeInTheDocument();
  expect(screen.getByText('Mecanografía')).toBeInTheDocument();
});

test('entrar en un juego lo carga y lo pinta', async () => {
  render(<App />);

  // "Práctica de Sumas" lleva a la categoría, y de ahí al primer juego.
  fireEvent.click(screen.getByText('Práctica de Sumas'));

  await waitFor(() => {
    expect(screen.getByText('Memorama Matemático')).toBeInTheDocument();
  });

  // Y el juego lazy se pinta.
  fireEvent.click(screen.getByText('Memorama Matemático'));

  await waitFor(() => {
    expect(screen.getByText(/Memorama/i)).toBeInTheDocument();
  }, { timeout: 20000 });
});
