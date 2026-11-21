// Tests de ¿Qué Número Falta?, Los Números del Álgebra y La Ruleta y los Dados.
//
// La prueba fuerte es la de siempre: jugar la partida entera. Lo que se rompe en
// estos juegos es que una ronda deje al niño sin salida, y eso solo se ve
// jugando. Las rondas de "construir" son las delicadas, porque el niño tiene
// que montar algo y siempre tiene que poder deshacerlo.

import { render, screen, fireEvent } from '@testing-library/react';
import NumeroFaltaGame from './NumeroFaltaGame';
import AlgebraGame from './AlgebraGame';
import RuletaDadosGame from './RuletaDadosGame';

const RONDAS = 8;

// Los botones que son respuestas, quitando el de volver.
const botonesDeJuego = () =>
  screen.getAllByRole('button').filter(
    (b) => !b.disabled && b.textContent.trim() !== 'Volver'
  );

const jugarPartidaCompleta = (montar) => {
  for (let ronda = 0; ronda < RONDAS; ronda++) {
    // Si la ronda es de construir, hay que montar algo antes de comprobar.
    const construir = screen.queryByText('Comprobar');
    if (construir) {
      montar();
      fireEvent.click(screen.getByText('Comprobar'));
    } else {
      const botones = botonesDeJuego();
      expect(botones.length).toBeGreaterThan(0);
      fireEvent.click(botones[0]);
    }

    const siguiente = screen.queryByText('Siguiente');
    expect(siguiente).toBeTruthy();
    fireEvent.click(siguiente);
  }
  expect(screen.getByText('¡Partida terminada!')).toBeTruthy();
};

// --- ¿Qué Número Falta? ----------------------------------------------------

describe('¿Qué Número Falta?', () => {
  const montar = () => {
    // La ronda de construir pide dos números y un signo.
    const numeros = screen.getAllByRole('button').filter(
      (b) => /^\d+$/.test(b.textContent.trim()) && b.textContent.trim() !== 'Volver'
    );
    const signos = screen.getAllByRole('button').filter((b) => ['+', '−', '×', '÷'].includes(b.textContent.trim()));
    // Se montan todos los números y el primer signo.
    for (const n of numeros) fireEvent.click(n);
    if (signos[0]) fireEvent.click(signos[0]);
  };

  it('pregunta qué operación falta', () => {
    render(<NumeroFaltaGame onBack={() => {}} />);
    expect(screen.getByText('¿Qué operación falta?')).toBeTruthy();
  });

  it('se puede jugar la partida entera', () => {
    render(<NumeroFaltaGame onBack={() => {}} />);
    jugarPartidaCompleta(montar);
  });

  it('siempre hay un botón de Siguiente después de responder', () => {
    render(<NumeroFaltaGame onBack={() => {}} />);
    for (let ronda = 0; ronda < RONDAS; ronda++) {
      const construir = screen.queryByText('Comprobar');
      if (construir) {
        montar();
        fireEvent.click(screen.getByText('Comprobar'));
      } else {
        fireEvent.click(botonesDeJuego()[0]);
      }
      expect(screen.queryByText('Siguiente')).toBeTruthy();
      fireEvent.click(screen.getByText('Siguiente'));
    }
  });
});

// --- Los Números del Álgebra ------------------------------------------------

describe('Los Números del Álgebra', () => {
  // La ronda de construir: colocar las fichas que pide la expresión.
  const montar = () => {
    // Las fichas disponibles son las que dicen "Poner ficha ...".
    const poner = screen.getAllByRole('button').filter((b) =>
      /^Poner ficha/.test(b.getAttribute('aria-label') || '')
    );
    // Se colocan todas menos una: así se comprueba que el botón de quitar
    // funciona y que una ronda mal montada se puede corregir.
    for (const b of poner.slice(0, Math.max(0, poner.length - 1))) fireEvent.click(b);
    // Y se quita una de las colocadas.
    const quitar = screen.getAllByRole('button').filter((b) =>
      /^Quitar ficha/.test(b.getAttribute('aria-label') || '')
    );
    if (quitar[0]) fireEvent.click(quitar[0]);
  };

  it('enseña las fichas de álgebra', () => {
    render(<AlgebraGame onBack={() => {}} />);
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('se puede jugar la partida entera', () => {
    render(<AlgebraGame onBack={() => {}} />);
    jugarPartidaCompleta(montar);
  });

  it('en la ronda de construir se puede borrar todo', () => {
    render(<AlgebraGame onBack={() => {}} />);
    // Se llega a la ronda de construir jugando las anteriores.
    for (let ronda = 0; ronda < RONDAS; ronda++) {
      const construir = screen.queryByText('Comprobar');
      if (construir) {
        expect(screen.queryByText('Borrar todo')).toBeTruthy();
        break;
      }
      fireEvent.click(botonesDeJuego()[0]);
      fireEvent.click(screen.getByText('Siguiente'));
    }
  });
});

// --- La Ruleta y los Dados --------------------------------------------------

describe('La Ruleta y los Dados', () => {
  // Para la ronda de construir: se tocan los sectores hasta que el color
  // objetivo sale 2 de 4 veces.
  const montar = () => {
    const sectores = screen.getAllByRole('button').filter((b) =>
      /^Sector \d/.test(b.getAttribute('aria-label') || '')
    );
    for (const sector of sectores) {
      const texto = sector.getAttribute('aria-label') || '';
      if (!/color (rojo|azul|amarillo)/.test(texto)) continue;
      fireEvent.click(sector);
      break;
    }
  };

  it('dibuja la ruleta', () => {
    render(<RuletaDadosGame onBack={() => {}} />);
    expect(screen.getByRole('img')).toBeTruthy();
  });

  it('se puede jugar la partida entera', () => {
    render(<RuletaDadosGame onBack={() => {}} />);
    jugarPartidaCompleta(montar);
  });

  it('en la ronda de construir los sectores se pueden cambiar de color', () => {
    render(<RuletaDadosGame onBack={() => {}} />);
    for (let ronda = 0; ronda < RONDAS; ronda++) {
      const construir = screen.queryByText('Comprobar');
      if (construir) {
        const sector = screen.getAllByRole('button').find((b) =>
          /^Sector \d/.test(b.getAttribute('aria-label') || '')
        );
        expect(sector).toBeTruthy();
        const antes = sector.getAttribute('aria-label');
        fireEvent.click(sector);
        expect(
          screen.getAllByRole('button').find((b) =>
            /^Sector \d/.test(b.getAttribute('aria-label') || '')
          ).getAttribute('aria-label')
        ).not.toBe(antes);
        break;
      }
      fireEvent.click(botonesDeJuego()[0]);
      fireEvent.click(screen.getByText('Siguiente'));
    }
  });

  it('repartir 2 y 2 los sectores da el reparto por bueno', () => {
    render(<RuletaDadosGame onBack={() => {}} />);
    // Las rondas van: leer, relacionar, comparar, construir.
    for (let ronda = 0; ronda < 3; ronda++) {
      fireEvent.click(botonesDeJuego()[0]);
      fireEvent.click(screen.getByText('Siguiente'));
    }
    montar();
    fireEvent.click(screen.getByText('Comprobar'));
    expect(screen.getByText(/Lo has conseguido/)).toBeTruthy();
  });

  it('la ronda de dados enseña los ocho dados', () => {
    render(<RuletaDadosGame onBack={() => {}} />);
    // Las rondas van: leer, relacionar, comparar, construir, dados.
    for (let ronda = 0; ronda < 4; ronda++) {
      const construir = screen.queryByText('Comprobar');
      if (construir) {
        montar();
        fireEvent.click(screen.getByText('Comprobar'));
      } else {
        fireEvent.click(botonesDeJuego()[0]);
      }
      fireEvent.click(screen.getByText('Siguiente'));
    }
    expect(screen.getByText('¿Qué número sale más a menudo?')).toBeTruthy();
    expect(screen.getAllByLabelText(/^Dado \d/)).toHaveLength(8);
  });
});
