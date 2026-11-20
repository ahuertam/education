// La lógica de Cajas y Números.
//
// Un sokoban pequeño: el niño empuja cajas hasta sus marcas y para pasar al
// otro cuarto tiene que resolver la cuenta de la puerta.
//
// El generador está pensado para que el nivel SIEMPRE tenga solución, sin
// needing un solucionador:
//
//   - cada cuarto tiene una caja y su marca en la misma fila o columna, a dos
//     casillas de distancia, con el camino libre entre las dos: empujarla en
//     línea recta basta;
//   - la casilla desde la que se empuja (la de al lado, en sentido contrario)
//     siempre está dentro del cuarto, y un cuarto de 4x4 con dos casillas
//     ocupadas nunca queda partido en dos.
//
// Así que la cuenta de la puerta es la puerta de verdad: sin resolverla no
// se pasa al otro cuarto.
//
// ponytail: el azar con semilla es el mismo que usa Fuego & Agua.

import { createRng } from '../firewater/prng';

export const FILAS = 6;
export const COLUMNAS = 11;

// La columna de la pared del medio. La puerta está en una de sus casillas.
export const COLUMNA_PARED = 5;

export const TIPOS = {
  pared: 'pared',
  suelo: 'suelo',
  puerta: 'puerta',
};

const DIRECCIONES = {
  arriba: [-1, 0],
  abajo: [1, 0],
  izquierda: [0, -1],
  derecha: [0, 1],
};

export const TECLAS = {
  ArrowUp: 'arriba', w: 'arriba', W: 'arriba',
  ArrowDown: 'abajo', s: 'abajo', S: 'abajo',
  ArrowLeft: 'izquierda', a: 'izquierda', A: 'izquierda',
  ArrowRight: 'derecha', d: 'derecha', D: 'derecha',
};

// La cuenta de la puerta: una multiplicación de las tablas.
export function cuentaDePuerta(azar) {
  const a = 2 + Math.floor(azar() * 8);   // 2..9
  const b = 2 + Math.floor(azar() * 8);
  return { a, b, resultado: a * b, texto: `${a} × ${b}` };
}

// --- Generar el nivel -----------------------------------------------------

export function generarNivel(semilla) {
  const azar = createRng(semilla);

  const celdas = [];
  for (let f = 0; f < FILAS; f += 1) {
    const fila = [];
    for (let c = 0; c < COLUMNAS; c += 1) {
      const borde = f === 0 || c === 0 || f === FILAS - 1 || c === COLUMNAS - 1;
      fila.push({ tipo: borde ? TIPOS.pared : TIPOS.suelo });
    }
    celdas.push(fila);
  }

  // La pared del medio, con la puerta en una de sus casillas.
  const filaPuerta = 1 + Math.floor(azar() * (FILAS - 2));
  const puerta = { ...cuentaDePuerta(azar), abierta: false };
  for (let f = 1; f < FILAS - 1; f += 1) {
    const esPuerta = f === filaPuerta;
    celdas[f][COLUMNA_PARED] = {
      tipo: esPuerta ? TIPOS.puerta : TIPOS.pared,
      ...(esPuerta ? { puerta } : {}),
    };
  }

  // Los dos cuartos: el izquierdo (columnas 1..4) y el derecho (6..9).
  const izquierda = colocarPareja(celdas, azar, 1, 4);
  const derecha = colocarPareja(celdas, azar, 6, 9);

  // El jugador en el cuarto izquierdo.
  const jugador = izquierda.libres[Math.floor(azar() * izquierda.libres.length)];

  return {
    celdas,
    jugador: { f: jugador[0], c: jugador[1] },
    movidas: 0,
    resolucion: 0,   // cuántas cajas ya están en su marca
    total: 2,
    // Qué caja va con qué marca: para las pistas y para los tests.
    pares: [izquierda, derecha].map((p) => ({
      caja: { f: p.casillaCaja[0], c: p.casillaCaja[1] },
      marca: { f: p.casillaMarca[0], c: p.casillaMarca[1] },
    })),
    puerta,
    filaPuerta,
    chocaPuerta: false,
    resuelto: false,
  };
}

// Una caja y su marca en el cuarto de columnas `desde`..`hasta`, en línea
// recta y con el hueco de detrás libre para empujarla.
function colocarPareja(celdas, azar, desde, hasta) {
  const candidatos = [];

  // En horizontal: la caja en (f, c) y la marca en (f, c + 2), se empuja
  // desde (f, c - 1), que tiene que estar dentro del cuarto.
  for (let f = 1; f < FILAS - 1; f += 1) {
    for (let c = desde; c + 2 <= hasta; c += 1) {
      if (c - 1 >= desde) candidatos.push({ caja: [f, c], marca: [f, c + 2] });
    }
  }

  // En vertical: igual, pero hacia abajo. La fila de la caja tiene que
  // dejar una casilla libre por encima, que es desde donde se empuja.
  for (let f = 2; f + 2 < FILAS - 1; f += 1) {
    for (let c = desde; c <= hasta; c += 1) {
      candidatos.push({ caja: [f, c], marca: [f + 2, c] });
    }
  }

  const elegido = candidatos[Math.floor(azar() * candidatos.length)];
  const [fc, cc] = elegido.caja;
  const [fm, cm] = elegido.marca;

  celdas[fc][cc] = { ...celdas[fc][cc], caja: true };
  celdas[fm][cm] = { ...celdas[fm][cm], marca: true };

  // Las casillas libres del cuarto (sin la caja ni la marca).
  const libres = [];
  for (let f = 1; f < FILAS - 1; f += 1) {
    for (let c = desde; c <= hasta; c += 1) {
      const celda = celdas[f][c];
      if (celda.tipo === TIPOS.suelo && !celda.caja && !celda.marca) {
        libres.push([f, c]);
      }
    }
  }

  return { libres, casillaCaja: elegido.caja, casillaMarca: elegido.marca };
}

// --- Mover ----------------------------------------------------------------

const dentro = (f, c) => f >= 0 && c >= 0 && f < FILAS && c < COLUMNAS;

// ¿Se puede pasar por esta casilla?
export function esTransitable(celda) {
  if (!celda) return false;
  if (celda.tipo === TIPOS.pared) return false;
  if (celda.tipo === TIPOS.puerta && !celda.puerta.abierta) return false;
  return true;
}

// Mueve al jugador en una dirección. Si choca con una puerta cerrada,
// devuelve el estado con `chocaPuerta` a true para que la interfaz abra la
// cuenta.
export function mover(estado, direccion) {
  if (estado.resuelto) return estado;
  const [df, dc] = DIRECCIONES[direccion] || [0, 0];
  const f = estado.jugador.f + df;
  const c = estado.jugador.c + dc;
  if (!dentro(f, c)) return estado;

  const destino = estado.celdas[f][c];

  if (destino.tipo === TIPOS.puerta && !destino.puerta.abierta) {
    return { ...estado, chocaPuerta: true };
  }

  if (!esTransitable(destino)) return estado;

  // ¿Hay una caja? Entonces hay que empujarla.
  if (destino.caja) {
    const ff = f + df;
    const cc = c + dc;
    if (!dentro(ff, cc)) return estado;
    const tras = estado.celdas[ff][cc];
    if (!esTransitable(tras) || tras.caja) return estado;

    const celdas = clonarCeldas(estado.celdas);
    celdas[f][c] = { ...celdas[f][c], caja: false };
    celdas[ff][cc] = { ...celdas[ff][cc], caja: true };
    const resolucion = contarResueltas(celdas);
    return {
      ...estado,
      celdas,
      jugador: { f, c },
      movidas: estado.movidas + 1,
      resolucion,
      chocaPuerta: false,
      resuelto: resolucion === 2,
    };
  }

  return {
    ...estado,
    jugador: { f, c },
    movidas: estado.movidas + 1,
    chocaPuerta: false,
  };
}

// Abrir la puerta: se comprueba la cuenta.
export function abrirPuerta(estado, resultado) {
  const celdas = clonarCeldas(estado.celdas);
  let abierta = false;
  for (let f = 0; f < FILAS; f += 1) {
    for (let c = 0; c < COLUMNAS; c += 1) {
      const celda = celdas[f][c];
      if (celda.tipo === TIPOS.puerta && !celda.puerta.abierta) {
        if (resultado === celda.puerta.resultado) {
          celdas[f][c] = { ...celda, puerta: { ...celda.puerta, abierta: true } };
          abierta = true;
        }
      }
    }
  }
  return abierta
    ? { ...estado, celdas, puerta: { ...estado.puerta, abierta: true } }
    : estado;
}

// Cuántas cajas están sobre su marca.
export function contarResueltas(celdas) {
  let resueltas = 0;
  for (let f = 0; f < celdas.length; f += 1) {
    for (let c = 0; c < celdas[f].length; c += 1) {
      const celda = celdas[f][c];
      if (celda.caja && celda.marca) resueltas += 1;
    }
  }
  return resueltas;
}

// Cuántas cajas quedan por colocar.
export function cajasPendientes(estado) {
  return estado.total - estado.resolucion;
}

// --- Utilidades ------------------------------------------------------------

export function clonarCeldas(celdas) {
  return celdas.map((fila) => fila.map((celda) => ({ ...celda })));
}
