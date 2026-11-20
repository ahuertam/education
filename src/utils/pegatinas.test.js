// Tests del álbum de pegatinas.
//
// El estado vive en localStorage, así que puede llegar roto. Lo que importa
// es que un guardado raro no rompa el álbum y que las pegatinas no se
// repitan.

import { ESTRELLAS_PARA_PEGATINA, PEGATINAS } from '../components/data/pegatinas';
import {
  cargarPegatinas,
  elegirPegatina,
  limpiarNuevas,
  registrarPartida,
  registrarPremio,
} from './pegatinas';

describe('el álbum de pegatinas', () => {
  beforeEach(() => localStorage.removeItem('edutika:pegatinas'));
  afterEach(() => localStorage.removeItem('edutika:pegatinas'));

  it('empieza vacío', () => {
    const estado = cargarPegatinas();
    expect(estado.pegatinas).toEqual([]);
    expect(estado.partidas).toBe(0);
  });

  it('cuenta las partidas terminadas', () => {
    registrarPartida();
    registrarPartida();
    expect(cargarPegatinas().partidas).toBe(2);
  });

  it('los contadores guardados como texto no se cuelan', () => {
    localStorage.setItem(
      'edutika:pegatinas',
      JSON.stringify({ partidas: '5', estrellasPerfectas: '2', mejorPuntos: '9' }),
    );
    const estado = cargarPegatinas();
    expect(estado.partidas).toBe(0);
    expect(estado.estrellasPerfectas).toBe(0);
    expect(estado.mejorPuntos).toBe(0);
  });

  it('con tres estrellas cae una pegatina nueva', () => {
    registrarPremio(ESTRELLAS_PARA_PEGATINA, 40);
    const estado = cargarPegatinas();
    expect(estado.pegatinas).toHaveLength(1);
    expect(estado.nuevas).toEqual(estado.pegatinas);
    expect(estado.estrellasPerfectas).toBe(1);
    expect(estado.mejorPuntos).toBe(40);
  });

  it('con menos de tres estrellas no cae ninguna', () => {
    registrarPremio(2, 40);
    expect(cargarPegatinas().pegatinas).toHaveLength(0);
  });

  it('la misma pegatina no se repite', () => {
    const ganada = elegirPegatina([]);
    const nuevo = registrarPremio(ESTRELLAS_PARA_PEGATINA, 40, {
      ...cargarPegatinas(),
      pegatinas: [ganada.id],
    });
    expect(nuevo.pegatinas).toHaveLength(2);
    expect(nuevo.pegatinas[0]).toBe(ganada.id);
    expect(nuevo.pegatinas[1]).not.toBe(ganada.id);
  });

  it('con el álbum lleno no cae otra pegatina', () => {
    const nuevo = registrarPremio(ESTRELLAS_PARA_PEGATINA, 40, {
      ...cargarPegatinas(),
      pegatinas: PEGATINAS.map((p) => p.id),
    });
    expect(nuevo.pegatinas).toHaveLength(PEGATINAS.length);
  });

  it('al abrir el álbum se marcan como vistas', () => {
    registrarPremio(ESTRELLAS_PARA_PEGATINA, 40);
    limpiarNuevas();
    expect(cargarPegatinas().nuevas).toEqual([]);
    expect(cargarPegatinas().pegatinas).toHaveLength(1);
  });
});
