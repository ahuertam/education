// Tests de la lógica de Cajas y Números.
//
// Lo importante del generador es que el nivel SIEMPRE tiene solución: que
// haya una caja empujable hasta su marca y que se pueda abrir la puerta.
// Estos tests lo comprueban con muchos niveles, no con uno.

import {
  COLUMNAS, COLUMNA_PARED, FILAS, TECLAS, TIPOS,
  abrirPuerta, cajasPendientes, contarResueltas, esTransitable,
  generarNivel, mover,
} from './logic';

const casillas = (estado) => {
  const cajas = [];
  const marcas = [];
  estado.celdas.forEach((fila, f) => fila.forEach((celda, c) => {
    if (celda.caja) cajas.push({ f, c });
    if (celda.marca) marcas.push({ f, c });
  }));
  return { cajas, marcas };
};

// Camina hasta una casilla moviéndose en horizontal y vertical.
function irA(estado, destino, avoiding = []) {
  let actual = estado;
  const pasos = [
    // Primero en vertical, luego en horizontal.
    ...Array(FILAS).fill(0).map((_, i) => ({ f: Math.sign(destino.f - actual.f) * (i + 1), c: 0 })),
  ];
  // movements greedy: repeat until arrival or no progress
  let intentos = 0;
  while (actual.jugador.f !== destino.f && intentos < 60) {
    intentos += 1;
    const dir = actual.jugador.f < destino.f ? 'abajo' : 'arriba';
    const antes = actual.jugador.f;
    actual = mover(actual, dir);
    if (actual.jugador.f === antes) break;
  }
  intentos = 0;
  while (actual.jugador.c !== destino.c && intentos < 60) {
    intentos += 1;
    const dir = actual.jugador.c < destino.c ? 'derecha' : 'izquierda';
    const antes = actual.jugador.c;
    actual = mover(actual, dir);
    if (actual.jugador.c === antes) break;
  }
  return actual;
}

describe('el nivel de Cajas y Números', () => {
  it('la rejilla es de 6x11 con el borde de paredes', () => {
    const nivel = generarNivel('a');
    expect(nivel.celdas.length).toBe(FILAS);
    expect(nivel.celdas[0].length).toBe(COLUMNAS);
    expect(nivel.celdas[0][0].tipo).toBe(TIPOS.pared);
    expect(nivel.celdas[2][2].tipo).toBe(TIPOS.suelo);
  });

  it('la misma semilla da el mismo nivel', () => {
    const a = generarNivel('hola');
    const b = generarNivel('hola');
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('hay dos cajas, dos marcas y una puerta', () => {
    const nivel = generarNivel('b');
    const { cajas, marcas } = casillas(nivel);
    expect(cajas).toHaveLength(2);
    expect(marcas).toHaveLength(2);
    const puertas = nivel.celdas.flat().filter((c) => c.tipo === TIPOS.puerta);
    expect(puertas).toHaveLength(1);
  });

  it('la puerta está en la pared del medio', () => {
    const nivel = generarNivel('c');
    expect(nivel.celdas[nivel.filaPuerta][COLUMNA_PARED].tipo).toBe(TIPOS.puerta);
  });

  it('las cajas y las marcas están en la misma fila o columna', () => {
    for (const semilla of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const nivel = generarNivel(semilla);
      expect(nivel.pares).toHaveLength(2);
      nivel.pares.forEach(({ caja, marca }) => {
        const mismaFila = caja.f === marca.f;
        const mismaColumna = caja.c === marca.c;
        expect(mismaFila || mismaColumna).toBe(true);
      });
    }
  });

  it('siempre hay solución: la caja se puede empujar hasta su marca', () => {
    // Se comprueba con muchos niveles: para cada caja, tiene que haber una
    // casilla libre detrás (en el sentido de la marca) para empujarla.
    for (let i = 0; i < 40; i += 1) {
      const nivel = generarNivel(`semilla-${i}`);
      nivel.pares.forEach(({ caja, marca }) => {
        const mismaFila = caja.f === marca.f;
        const dirF = mismaFila ? 0 : Math.sign(marca.f - caja.f);
        const dirC = mismaFila ? Math.sign(marca.c - caja.c) : 0;
        // La casilla desde la que se empuja, a un paso en sentido contrario.
        const empujeF = caja.f - dirF;
        const empujeC = caja.c - dirC;
        // Y la casilla de detrás de la caja, que tiene que estar libre.
        const detrasF = caja.f + dirF;
        const detrasC = caja.c + dirC;
        expect(esTransitable(nivel.celdas[empujeF][empujeC])).toBe(true);
        expect(esTransitable(nivel.celdas[detrasF][detrasC])).toBe(true);
      });
    }
  });
});

describe('mover al jugador', () => {
  it('no se puede salir de la rejilla ni pasar por una pared', () => {
    const nivel = generarNivel('a');
    const antes = nivel.jugador;
    const estado = mover(nivel, 'arriba');
    // O se queda donde estaba (pared) o se mueve a una casilla libre.
    expect(estado.jugador).toBeTruthy();
    if (estado.jugador.f === antes.f && estado.jugador.c === antes.c) {
      expect(antes).toBeTruthy();
    }
  });

  it('empujar una caja la mueve y cuenta el movimiento', () => {
    const nivel = generarNivel('a');
    const celdas = nivel.celdas.map((fila) => fila.map((c) => ({ ...c })));
    // Caja en (2, 2), con el jugador en (1, 2) empujando hacia abajo.
    celdas[2][2] = { ...celdas[2][2], caja: true };
    celdas[2][2].marca = false;
    const despues = mover({ ...nivel, celdas, jugador: { f: 1, c: 2 } }, 'abajo');
    expect(despues.jugador).toEqual({ f: 2, c: 2 });
    expect(despues.celdas[3][2].caja).toBe(true);
    expect(despues.celdas[2][2].caja).toBe(false);
    expect(despues.movidas).toBe(1);
  });

  it('no se puede empujar una caja contra una pared', () => {
    const nivel = generarNivel('a');
    const celdas = nivel.celdas.map((fila) => fila.map((c) => ({ ...c })));
    // Caja en (1, 1): encima está la pared de arriba, así que no se puede
    // empujar hacia ese lado.
    celdas[1][1] = { ...celdas[1][1], caja: true };
    celdas[1][1].marca = false;
    const estado = mover({ ...nivel, celdas, jugador: { f: 2, c: 1 } }, 'arriba');
    expect(estado.jugador).toEqual({ f: 2, c: 1 });
    expect(estado.celdas[1][1].caja).toBe(true);
  });

  it('las teclas se traducen a direcciones', () => {
    expect(TECLAS.ArrowUp).toBe('arriba');
    expect(TECLAS.w).toBe('arriba');
    expect(TECLAS['4']).toBeUndefined();
  });
});

describe('la puerta con cuenta', () => {
  it('con la cuenta correcta la puerta se abre', () => {
    const nivel = generarNivel('d');
    const abierta = abrirPuerta(nivel, nivel.puerta.resultado);
    expect(abierta.puerta.abierta).toBe(true);
    expect(abierta.celdas[nivel.filaPuerta][COLUMNA_PARED].puerta.abierta).toBe(true);
  });

  it('con una cuenta equivocada la puerta sigue cerrada', () => {
    const nivel = generarNivel('d');
    const cerrada = abrirPuerta(nivel, nivel.puerta.resultado + 1);
    expect(cerrada.puerta.abierta).toBe(false);
  });

  it('chocar con la puerta cerrada avisa para abrir la cuenta', () => {
    const nivel = generarNivel('d');
    // El jugador se pone justo al lado de la puerta y la empuja.
    const celdas = nivel.celdas.map((fila) => fila.map((c) => ({ ...c })));
    const estado = {
      ...nivel,
      celdas,
      jugador: { f: nivel.filaPuerta, c: COLUMNA_PARED - 1 },
    };
    const golpeado = mover(estado, 'derecha');
    expect(golpeado.chocaPuerta).toBe(true);
    expect(golpeado.jugador).toEqual({ f: nivel.filaPuerta, c: COLUMNA_PARED - 1 });
  });

  it('con la puerta abierta se puede pasar', () => {
    let nivel = generarNivel('d');
    nivel = abrirPuerta(nivel, nivel.puerta.resultado);
    const pasado = mover(
      { ...nivel, jugador: { f: nivel.filaPuerta, c: COLUMNA_PARED - 1 } },
      'derecha'
    );
    expect(pasado.chocaPuerta).toBeFalsy();
    expect(pasado.jugador.c).toBe(COLUMNA_PARED);
  });
});

describe('el final del nivel', () => {
  it('el nivel está resuelto cuando las dos cajas están en sus marcas', () => {
    const nivel = generarNivel('a');
    const celdas = nivel.celdas.map((fila) => fila.map((c) => ({ ...c })));
    const { cajas, marcas } = casillas(nivel);
    cajas.forEach((caja, i) => {
      celdas[caja.f][caja.c].caja = false;
      celdas[caja.f][caja.c].marca = false;
      celdas[marcas[i].f][marcas[i].c].caja = true;
      celdas[marcas[i].f][marcas[i].c].marca = true;
    });
    expect(contarResueltas(celdas)).toBe(2);
    expect(cajasPendientes({ ...nivel, resolucion: 2 })).toBe(0);
  });
});
