// Tests de los ajustes del aula.
//
// Lo que un educador toca antes de una sesión: si el minijuego de premio está
// apagado, los juegos no lo ofrecen.

import { AJUSTES_INICIALES, cargarAjustes, guardarAjustes, premioActivado } from './ajustes';

describe('los ajustes del aula', () => {
  afterEach(() => localStorage.removeItem('edutika:ajustes'));

  it('por defecto el minijuego de premio está encendido', () => {
    expect(AJUSTES_INICIALES.premio).toBe(true);
    expect(premioActivado()).toBe(true);
  });

  it('se puede apagar y volver a encender', () => {
    guardarAjustes({ premio: false });
    expect(premioActivado()).toBe(false);
    guardarAjustes({ premio: true });
    expect(premioActivado()).toBe(true);
  });

  it('un ajuste guardado con campos raros no rompe la carga', () => {
    localStorage.setItem('edutika:ajustes', JSON.stringify({ premio: false, otro: 1 }));
    expect(cargarAjustes().premio).toBe(false);
    expect(cargarAjustes().otro).toBe(1);
  });

  it('con el JSON roto se vuelve a los ajustes por defecto', () => {
    localStorage.setItem('edutika:ajustes', 'esto no es json');
    expect(premioActivado()).toBe(true);
  });

  it('el interruptor siempre es un booleano de verdad', () => {
    localStorage.setItem('edutika:ajustes', JSON.stringify({ premio: 'false' }));
    expect(cargarAjustes().premio).toBe(false);
    localStorage.setItem('edutika:ajustes', JSON.stringify({ premio: 0 }));
    expect(cargarAjustes().premio).toBe(true);
  });
});
