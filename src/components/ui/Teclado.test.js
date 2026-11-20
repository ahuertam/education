// Tests de la activación con teclado.
//
// Lo que se pulsa con el ratón tiene que poder pulsarse también con el
// teclado: Enter o Espacio. Si no, con teclado no se abre ningún juego.

import { render, screen, fireEvent } from '@testing-library/react';
import ActivityCard from '../ActivityCard';
import { activarConTeclado } from './Teclado';

const evento = (key) => ({ key, preventDefault: () => {} });

describe('la activación con teclado', () => {
  it('Enter y Espacio hacen lo mismo que el clic', () => {
    const accion = jest.fn();
    const manejador = activarConTeclado(accion);
    manejador(evento('Enter'));
    manejador(evento(' '));
    expect(accion).toHaveBeenCalledTimes(2);
  });

  it('las demás teclas no hacen nada', () => {
    const accion = jest.fn();
    activarConTeclado(accion)(evento('a'));
    expect(accion).not.toHaveBeenCalled();
  });

  it('el espacio no hace scroll', () => {
    const preventDefault = jest.fn();
    activarConTeclado(() => {})({ key: ' ', preventDefault });
    expect(preventDefault).toHaveBeenCalled();
  });
});

describe('la tarjeta de actividad', () => {
  const props = {
    icon: <span aria-hidden="true">🎮</span>,
    title: 'Memorama Matemático',
    description: 'Encuentra las parejas',
    color: '#4CAF50',
  };

  it('se anuncia como botón y se puede tabular', () => {
    render(<ActivityCard {...props} onClick={() => {}} />);
    const tarjeta = screen.getByRole('button', { name: /Memorama/ });
    expect(tarjeta).toHaveAttribute('tabindex', '0');
  });

  it('se abre con Enter y con Espacio', () => {
    const onClick = jest.fn();
    render(<ActivityCard {...props} onClick={onClick} />);
    const tarjeta = screen.getByRole('button', { name: /Memorama/ });
    fireEvent.keyDown(tarjeta, { key: 'Enter' });
    fireEvent.keyDown(tarjeta, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('el clic sigue funcionando', () => {
    const onClick = jest.fn();
    render(<ActivityCard {...props} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: /Memorama/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
