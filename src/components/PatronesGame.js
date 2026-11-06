import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FaCheck } from 'react-icons/fa';
import {
  Page, Tarjeta, Enunciado, Ayuda, Visual, Opciones, Opcion, Feedback,
  Explicacion, Accion, Progreso, ProgresoBarra, BarraJuego, PantallaFinal,
  VERDE, ROJO,
} from './ui/JuegoBase';
import {
  loadGameRanking, recordGameRun, updateGameBestStreak,
} from '../utils/rankings';

// Bloques de Patrones.
//
// Viene de la app "Pattern Shapes" del Math Learning Center: las piezas
// clásicas de patrón (triángulo, rombo, trapecio y hexágono) para contar,
// comparar y descubrir cuántas piezas forman una figura.
//
// Aquí la unidad es el triángulo, como en el aula: el rombo son 2 triángulos,
// el trapecio 3 y el hexágono 6. Todas las piezas están dibujadas a la misma
// escala, con las rayas de los triángulos dentro, para que se vea de qué
// está hecha cada una.

const RONDAS = 8;
const CELDA = 210; // hueco que ocupa cada pieza en la figura

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const revuelto = (lista) => {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// --- Las piezas ------------------------------------------------------------
//
// Cada pieza lleva sus vértices, las rayas que la parten en triángulos y el
// hueco que ocupa dentro de su celda.

const PIEZAS = {
  triangulo: {
    nombre: 'Triángulo', triangulos: 1, color: '#6ab04c',
    puntos: [[0, 90], [50, 3.4], [100, 90]],
    lineas: [],
    dx: 55, dy: 100,
  },
  rombo: {
    nombre: 'Rombo', triangulos: 2, color: '#4a80c8',
    puntos: [[0, 0], [100, 0], [150, 86.6], [50, 86.6]],
    lineas: [[[100, 0], [50, 86.6]]],
    dx: 30, dy: 103,
  },
  trapecio: {
    nombre: 'Trapecio', triangulos: 3, color: '#d94f4f',
    puntos: [[0, 86.6], [50, 0], [150, 0], [200, 86.6]],
    lineas: [[[50, 0], [100, 86.6]], [[150, 0], [100, 86.6]]],
    dx: 5, dy: 103,
  },
  hexagono: {
    nombre: 'Hexágono', triangulos: 6, color: '#f0932b',
    puntos: [[250, 86.6], [200, 0], [100, 0], [50, 86.6], [100, 173.2], [200, 173.2]],
    lineas: [
      [[150, 86.6], [250, 86.6]], [[150, 86.6], [200, 0]],
      [[150, 86.6], [100, 0]], [[150, 86.6], [50, 86.6]],
      [[150, 86.6], [100, 173.2]], [[150, 86.6], [200, 173.2]],
    ],
    dx: 5, dy: 17,
  },
};

const TIPOS = Object.keys(PIEZAS);
const NOMBRES = TIPOS.map((t) => PIEZAS[t].nombre);

// Dibuja una pieza en su celda. `fantasma` la pinta solo con el borde, que es
// como se ve la pieza que falta.
const DibujoPieza = ({ tipo, col, fila, fantasma }) => {
  const pieza = PIEZAS[tipo];
  const puntos = pieza.puntos.map(([x, y]) => `${x},${y}`).join(' ');
  return (
    <g transform={`translate(${col * CELDA + pieza.dx}, ${fila * CELDA + pieza.dy})`}>
      <polygon
        points={puntos}
        fill={fantasma ? 'none' : pieza.color}
        stroke={fantasma ? '#7d93a5' : '#0b2b45'}
        strokeWidth={fantasma ? 5 : 2}
        strokeDasharray={fantasma ? '10 8' : undefined}
        strokeLinejoin="round"
      />
      {!fantasma && pieza.lineas.map(([a, b], i) => (
        <line
          key={i}
          x1={a[0]}
          y1={a[1]}
          x2={b[0]}
          y2={b[1]}
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
};

// La figura: una lista de piezas con su hueco.
const Figura = ({ piezas, ancho, alto, fantasma }) => (
  <svg
    viewBox={`0 0 ${ancho} ${alto}`}
    style={{ width: '100%', maxWidth: 560, height: 'auto' }}
    role="img"
    aria-label={`Figura con ${piezas.length} piezas`}
  >
    {piezas.map((p, i) => (
      <DibujoPieza key={i} tipo={p.tipo} col={p.col} fila={p.fila} fantasma={fantasma && p.fantasma} />
    ))}
  </svg>
);

// --- Generación de figuras ------------------------------------------------

// Una fila de piezas, con al menos una repetida.
const generarFigura = (cuantas) => {
  const piezas = [];
  const repetida = TIPOS[rnd(0, TIPOS.length - 1)];
  const tipos = [];
  for (let i = 0; i < cuantas; i++) {
    tipos.push(i < 2 ? repetida : TIPOS[rnd(0, TIPOS.length - 1)]);
  }

  const columnas = Math.min(tipos.length, 3);
  tipos.forEach((tipo, i) => {
    piezas.push({ tipo, col: i % columnas, fila: Math.floor(i / columnas) });
  });
  return piezas;
};

// Una figura con una pieza claramente repetida: tres iguales y las demás una
// vez cada una. Sirve para la ronda de "¿qué pieza se repite más?".
const figuraConRepeticion = () => {
  const repetida = TIPOS[rnd(0, TIPOS.length - 1)];
  const otras = TIPOS.filter((t) => t !== repetida);
  const tipos = [
    repetida, repetida, repetida,
    otras[rnd(0, otras.length - 1)],
    otras[rnd(0, otras.length - 1)],
  ];
  const piezas = [];
  tipos.forEach((tipo, i) => {
    piezas.push({ tipo, col: i % 3, fila: Math.floor(i / 3) });
  });
  return piezas;
};

const anchoFigura = (piezas) => {
  const maxCol = Math.max(...piezas.map((p) => p.col));
  return (maxCol + 1) * CELDA;
};

const altoFigura = (piezas) => {
  const maxFila = Math.max(...piezas.map((p) => p.fila));
  return (maxFila + 1) * CELDA;
};

const opcionesNumericas = (correcto, candidatas) => {
  const vistas = new Set([String(correcto)]);
  const out = [correcto];
  for (const c of candidatas) {
    if (out.length >= 4) break;
    if (!Number.isFinite(c) || c < 0 || vistas.has(String(c))) continue;
    vistas.add(String(c));
    out.push(c);
  }
  return revuelto(out);
};

// --- Rondas ---------------------------------------------------------------

// 1. ¿Cuántas piezas hay?
const rondaCuenta = () => {
  const piezas = generarFigura(rnd(3, 6));
  return {
    tipo: 'cuenta',
    enunciado: '¿Cuántas piezas hay en la figura?',
    ayuda: 'Cuenta las piezas, sin contar los triángulos de dentro.',
    piezas,
    opciones: opcionesNumericas(piezas.length, [piezas.length + 1, piezas.length - 1, piezas.length + 2]),
    correcta: piezas.length,
    explicacion: `La figura tiene ${piezas.length} piezas.`,
  };
};

// 2. ¿Qué pieza se repite más?
const rondaRepite = () => {
  const piezas = figuraConRepeticion();
  const cuentas = {};
  piezas.forEach((p) => { cuentas[p.tipo] = (cuentas[p.tipo] || 0) + 1; });
  const maxima = Math.max(...Object.values(cuentas));
  const tipoMas = Object.keys(cuentas).find((t) => cuentas[t] === maxima);
  const correcta = PIEZAS[tipoMas].nombre;
  return {
    tipo: 'repite',
    enunciado: '¿Qué pieza se repite más?',
    ayuda: 'Mira cuál de los tipos de pieza aparece más veces.',
    piezas,
    opciones: revuelto([correcta, ...NOMBRES.filter((n) => n !== correcta)]),
    correcta,
    explicacion: `La pieza que más se repite es el ${correcta.toLowerCase()}.`,
  };
};

// 3. ¿Cuántos triángulos tiene esta pieza?
const rondaUnidades = () => {
  const tipo = TIPOS[rnd(0, TIPOS.length - 1)];
  const pieza = PIEZAS[tipo];
  return {
    tipo: 'unidades',
    enunciado: '¿Cuántos triángulos tiene esta pieza?',
    ayuda: 'Los triángulos son la unidad: cuenta las rayas de dentro.',
    piezas: [{ tipo, col: 0, fila: 0 }],
    opciones: opcionesNumericas(pieza.triangulos, [1, 2, 3, 6, 4]),
    correcta: pieza.triangulos,
    explicacion: `El ${pieza.nombre.toLowerCase()} está hecho de ${pieza.triangulos} triángulos.`,
  };
};

// 4. ¿Qué pieza falta?
const rondaFalta = () => {
  const piezas = generarFigura(rnd(3, 5));
  const hueco = rnd(0, piezas.length - 1);
  const tipo = piezas[hueco].tipo;
  const conHueco = piezas.map((p, i) => (i === hueco ? { ...p, fantasma: true } : p));
  return {
    tipo: 'falta',
    enunciado: '¿Qué pieza falta en la figura?',
    ayuda: 'El hueco está dibujado con puntos. Piensa qué pieza encaja ahí.',
    piezas: conHueco,
    opciones: revuelto([PIEZAS[tipo].nombre, ...NOMBRES.filter((n) => n !== PIEZAS[tipo].nombre)]),
    correcta: PIEZAS[tipo].nombre,
    explicacion: `El hueco es de un ${PIEZAS[tipo].nombre.toLowerCase()}.`,
  };
};

const crearRondas = () => {
  const rondas = [];
  for (let i = 0; i < RONDAS; i++) {
    const generador = [rondaCuenta, rondaRepite, rondaUnidades, rondaFalta][i % 4];
    rondas.push(generador());
  }
  return rondas;
};

// --- Juego ----------------------------------------------------------------

const PatronesGame = ({ onBack }) => {
  const gameKey = 'patrones';
  const [rondas, setRondas] = useState(() => crearRondas());
  const [indice, setIndice] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [ranking, setRanking] = useState(() => loadGameRanking(gameKey));
  const [terminada, setTerminada] = useState(false);
  const mejorRachaRef = useRef(0);
  const registradaRef = useRef(false);

  const ronda = rondas[indice] || null;
  const respondida = elegida !== null;

  useEffect(() => {
    if (racha > mejorRachaRef.current) mejorRachaRef.current = racha;
    if (racha > ranking.bestStreak) setRanking(updateGameBestStreak(gameKey, racha));
  }, [gameKey, ranking.bestStreak, racha]);

  useEffect(() => {
    if (!terminada || registradaRef.current) return;
    registradaRef.current = true;
    setRanking(recordGameRun(gameKey, { score: puntos, bestStreak: mejorRachaRef.current }));
  }, [gameKey, terminada, puntos]);

  const anotar = useCallback((ok) => {
    if (ok) {
      setAciertos((a) => a + 1);
      setRacha((r) => r + 1);
      setPuntos((p) => p + 10 + racha);
    } else {
      setRacha(0);
    }
  }, [racha]);

  const responder = (opcion) => {
    if (respondida || !ronda) return;
    setElegida(opcion);
    anotar(opcion === ronda.correcta);
  };

  const siguiente = () => {
    if (indice + 1 >= rondas.length) {
      setTerminada(true);
      return;
    }
    setIndice((i) => i + 1);
    setElegida(null);
  };

  const reiniciar = () => {
    setRondas(crearRondas());
    setIndice(0);
    setPuntos(0);
    setRacha(0);
    setAciertos(0);
    setElegida(null);
    setTerminada(false);
    mejorRachaRef.current = 0;
    registradaRef.current = false;
  };

  return (
    <Page>
      <BarraJuego
        onBack={onBack}
        titulo="🔷 Bloques de Patrones"
        ronda={Math.min(indice + 1, RONDAS)}
        rondas={RONDAS}
        puntos={puntos}
        racha={racha}
      />

      {!terminada && <Progreso><ProgresoBarra style={{ width: `${(indice / RONDAS) * 100}%` }} /></Progreso>}

      {!terminada && ronda && (
        <Tarjeta>
          <Enunciado>{ronda.enunciado}</Enunciado>
          <Ayuda>{ronda.ayuda}</Ayuda>
          <Visual>
            <Figura
              piezas={ronda.piezas}
              ancho={anchoFigura(ronda.piezas)}
              alto={altoFigura(ronda.piezas)}
            />
          </Visual>

          <Opciones>
            {ronda.opciones.map((opcion, i) => (
              <Opcion
                key={`${opcion}-${i}`}
                type="button"
                disabled={respondida}
                $acierto={respondida && opcion === ronda.correcta}
                $fallo={respondida && elegida === opcion && opcion !== ronda.correcta}
                onClick={() => responder(opcion)}
              >
                {opcion}
              </Opcion>
            ))}
          </Opciones>

          <Feedback
            aria-live="polite"
            $color={respondida ? (elegida === ronda.correcta ? VERDE : ROJO) : '#5b7286'}
          >
            {respondida ? (elegida === ronda.correcta ? '¡Correcto! 🎉' : `La respuesta correcta era ${ronda.correcta}.`) : ''}
          </Feedback>

          {respondida && <Explicacion>{ronda.explicacion}</Explicacion>}

          {respondida && (
            <Accion type="button" onClick={siguiente}>
              {indice + 1 >= RONDAS ? 'Ver resultado' : 'Siguiente'} <FaCheck />
            </Accion>
          )}
        </Tarjeta>
      )}

      {terminada && (
        <PantallaFinal
          puntos={puntos}
          aciertos={aciertos}
          rondas={RONDAS}
          mejorRacha={mejorRachaRef.current}
          ranking={ranking}
          onReiniciar={reiniciar}
          onVolver={onBack}
        />
      )}
    </Page>
  );
};

export default PatronesGame;
