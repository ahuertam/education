import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Accion,
  Ayuda,
  BarraJuego,
  Enunciado,
  Explicacion,
  Feedback,
  Opcion,
  Opciones,
  Page,
  PantallaFinal,
  Progreso,
  ProgresoBarra,
  Tarjeta,
  Visual,
} from './ui/JuegoBase';
import { FaCheck } from 'react-icons/fa';
import {
  compararFracciones, formatearFraccion, mcm, sonEquivalentes,
} from '../utils/matematicas';
import { loadGameRanking, recordGameRun, updateGameBestStreak } from '../utils/rankings';

// Taller de Fracciones.
//
// Inspirado en la app "Fractions" del Math Learning Center: la misma idea de
// trabajar la fracción con modelos visuales (barra y círculo), pero como
// juego de rondas con puntos, racha y ranking, que es lo que funciona aquí.
//
// Los cuatro tipos de ronda:
//   modelo   → leer la fracción que representa el dibujo
//   equivale → encontrar la fracción equivalente a otra
//   compara  → decidir cuál de dos fracciones es mayor
//   suma     → sumar dos fracciones con el mismo denominador

const TEAL = '#12b3b0';
const NARANJA = '#ff8a2a';
const NAVY = '#0b2b45';
const VERDE = '#2e9e5b';
const ROJO = '#e05555';
const RONDAS = 10;

// Parejas de fracciones para comparar. Se eligen a mano para que el
// denominador común sea pequeño: si fuese 56 partes, la barra sería un
//ílbum de casillas y no se vería nada.
const PARES_COMPARAR = [
  [{ n: 1, d: 2 }, { n: 1, d: 3 }],
  [{ n: 2, d: 3 }, { n: 1, d: 2 }],
  [{ n: 1, d: 4 }, { n: 3, d: 4 }],
  [{ n: 1, d: 2 }, { n: 3, d: 4 }],
  [{ n: 1, d: 3 }, { n: 2, d: 3 }],
  [{ n: 2, d: 4 }, { n: 1, d: 2 }],
  [{ n: 1, d: 4 }, { n: 1, d: 2 }],
  [{ n: 2, d: 5 }, { n: 1, d: 5 }],
  [{ n: 3, d: 4 }, { n: 1, d: 2 }],
  [{ n: 1, d: 6 }, { n: 2, d: 3 }],
  [{ n: 3, d: 4 }, { n: 2, d: 3 }],
  [{ n: 1, d: 5 }, { n: 3, d: 5 }],
];

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const revuelto = (lista) => {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const clave = (f) => `${f.n}/${f.d}`;

// Identificador único de una opción: distingue las fracciones de los textos.
const idOpcion = (op) => (op.tipo === 'texto' ? `t:${op.texto}` : `f:${clave(op)}`);

// --- Estilos --------------------------------------------------------------

// --- Modelos visuales -----------------------------------------------------

const PARTE = 32;
const ALTO = 52;

// Una barra dividida en d partes iguales, con las n primeras de color.
const Barra = ({ n, d, color = TEAL, alto = ALTO }) => (
  <svg
    viewBox={`0 0 ${d * PARTE} ${alto}`}
    style={{ width: '100%', maxWidth: 460, height: 'auto' }}
    role="img"
    aria-label={`Barra dividida en ${d} partes, con ${n} partes resaltadas`}
  >
    {Array.from({ length: d }, (_, i) => (
      <rect
        key={i}
        x={i * PARTE}
        y={0}
        width={PARTE}
        height={alto}
        fill={i < n ? color : '#eef4f7'}
        stroke={NAVY}
        strokeWidth="1.5"
      />
    ))}
  </svg>
);

// Dos barras independientes con denominadores distintos. Las dos ocupan el
// mismo ancho, así que la parte de color se ve exactamente igual: eso es lo
// que hace evidente que 2/3 y 4/6 son la misma fracción.
const BarrasIguales = ({ n1, d1, n2, d2 }) => (
  <div style={{ width: '100%', maxWidth: 460, display: 'grid', gap: 10 }}>
    <Barra n={n1} d={d1} color={TEAL} />
    <Barra n={n2} d={d2} color={NARANJA} />
  </div>
);

// Dos fracciones apiladas sobre la misma barra: sirve para sumar y para
// comparar (con el denominador común ya calculado).
const BarraApilada = ({ n1, n2, d, color1 = TEAL, color2 = NARANJA }) => (
  <svg
    viewBox={`0 0 ${d * PARTE} ${ALTO * 2 + 8}`}
    style={{ width: '100%', maxWidth: 460, height: 'auto' }}
    role="img"
    aria-label={`Dos fracciones sobre una barra de ${d} partes: ${n1} y ${n2} partes`}
  >
    {Array.from({ length: d }, (_, i) => (
      <rect
        key={`a${i}`}
        x={i * PARTE}
        y={0}
        width={PARTE}
        height={ALTO}
        fill={i < n1 ? color1 : '#eef4f7'}
        stroke={NAVY}
        strokeWidth="1.5"
      />
    ))}
    {Array.from({ length: d }, (_, i) => (
      <rect
        key={`b${i}`}
        x={i * PARTE}
        y={ALTO + 8}
        width={PARTE}
        height={ALTO}
        fill={i < n2 ? color2 : '#eef4f7'}
        stroke={NAVY}
        strokeWidth="1.5"
      />
    ))}
  </svg>
);

// Sector circular. La primera parte empieza siempre a las doce en punto.
const sector = (cx, cy, r, desde, hasta) => {
  const p = (a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x1, y1] = p(desde);
  const [x2, y2] = p(hasta);
  const largo = hasta - desde > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largo} 1 ${x2} ${y2} Z`;
};

const Circulo = ({ n, d, color = TEAL }) => {
  const cx = 60;
  const cy = 60;
  const r = 52;
  return (
    <svg
      viewBox="0 0 120 120"
      style={{ width: 190, height: 'auto' }}
      role="img"
      aria-label={`Círculo dividido en ${d} partes, con ${n} partes resaltadas`}
    >
      {Array.from({ length: d }, (_, i) => {
        const desde = -Math.PI / 2 + (i * 2 * Math.PI) / d;
        const hasta = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / d;
        return (
          <path
            key={i}
            d={sector(cx, cy, r, desde, hasta)}
            fill={i < n ? color : '#eef4f7'}
            stroke={NAVY}
            strokeWidth="1.5"
          />
        );
      })}
    </svg>
  );
};

// --- Generación de rondas ------------------------------------------------

const tipoFraccion = (op) => (op.tipo === 'texto' ? op.texto : formatearFraccion(op));

// Monta la lista de respuestas: la correcta siempre está y las demás son
// distractores válidos (una fracción nunca vale más de un entero).
const opcionesDesde = (correcta, candidatas) => {
  const vistas = new Set([idOpcion(correcta)]);
  const out = [correcta];

  const push = (c) => {
    if (!c || out.length >= 4) return;
    if (c.tipo === 'texto') {
      if (vistas.has(idOpcion(c))) return;
    } else {
      if (c.n < 1 || c.d < 2 || c.n > c.d) return;
      if (vistas.has(idOpcion(c))) return;
    }
    vistas.add(idOpcion(c));
    out.push(c);
  };

  candidatas.forEach(push);

  // Si los distractores se han quedado cortos, se rellena con fracciones
  // parecidas a la correcta: mismo denominador u otro muy próximo.
  if (correcta.tipo !== 'texto') {
    push({ n: correcta.n + 1, d: correcta.d });
    push({ n: Math.max(1, correcta.n - 1), d: correcta.d });
    push({ n: correcta.n, d: correcta.d + 1 });
    push({ n: correcta.n, d: Math.max(2, correcta.d - 1) });
  }
  let intentos = 0;
  while (out.length < 3 && intentos < 40) {
    intentos++;
    const d = rnd(2, 10);
    push({ n: rnd(1, d - 1), d });
  }
  return revuelto(out);
};

// Ronda 1: leer la fracción del dibujo.
const rondaModelo = () => {
  const d = rnd(2, 10);
  const n = rnd(1, d - 1);
  const circulo = Math.random() < 0.4;
  const correcta = { n, d };
  const candidatas = [];
  for (let i = 0; i < 8; i++) {
    const dd = Math.random() < 0.65 ? d : rnd(2, 10);
    candidatas.push({ n: rnd(1, Math.max(1, dd - 1)), d: dd });
  }
  return {
    tipo: 'modelo',
    enunciado: '¿Qué fracción representa el dibujo?',
    ayuda: circulo
      ? 'El círculo está dividido en partes iguales. Cuenta las partes de color.'
      : 'La barra está dividida en partes iguales. Cuenta las partes de color.',
    visual: circulo
      ? { tipo: 'circulo', n, d }
      : { tipo: 'barra', n, d },
    opciones: opcionesDesde(correcta, candidatas),
    correcta,
    explicacion: `Hay ${n} partes de color sobre ${d} partes iguales: la fracción es ${formatearFraccion(correcta)}.`,
  };
};

// Ronda 2: encontrar la fracción equivalente.
const rondaEquivale = () => {
  const d = rnd(2, 6);
  const n = rnd(1, d - 1);
  const k = rnd(2, 3);
  const correcta = { n: n * k, d: d * k };
  const candidatas = [
    { n: correcta.n + 1, d: correcta.d },
    { n: Math.max(1, correcta.n - 1), d: correcta.d },
    { n: correcta.n, d: correcta.d + 1 },
    { n: correcta.n, d: Math.max(2, correcta.d - 1) },
    { n: n, d: d },
    { n: correcta.n * 2, d: correcta.d * 2 },
  ];
  return {
    tipo: 'equivale',
    enunciado: `¿Qué fracción equivale a ${formatearFraccion({ n, d })}?`,
    ayuda: 'Mira las dos barras: si tienen la misma parte de color, son la misma fracción.',
    visual: {
      tipo: 'barras',
      n1: n,
      d1: d,
      n2: n * k,
      d2: d * k,
    },
    opciones: opcionesDesde(correcta, candidatas),
    correcta,
    explicacion: `${formatearFraccion({ n, d })} y ${formatearFraccion(correcta)} son equivalentes: las dos barras tienen la misma parte de color.`,
  };
};

// Ronda 3: comparar dos fracciones.
const rondaCompara = () => {
  const [f1, f2] = PARES_COMPARAR[rnd(0, PARES_COMPARAR.length - 1)];
  const iguales = sonEquivalentes(f1, f2);
  const comun = mcm(f1.d, f2.d);
  const n1 = (f1.n * comun) / f1.d;
  const n2 = (f2.n * comun) / f2.d;
  const mayor = compararFracciones(f1, f2);

  const correcta = iguales
    ? { tipo: 'texto', texto: 'Son iguales' }
    : { n: mayor === 1 ? f1.n : f2.n, d: mayor === 1 ? f1.d : f2.d };
  const candidatas = [
    { n: f1.n, d: f1.d },
    { n: f2.n, d: f2.d },
    { tipo: 'texto', texto: 'Son iguales' },
  ];

  return {
    tipo: 'compara',
    enunciado: iguales
      ? '¿Cómo son estas dos fracciones?'
      : '¿Cuál de las dos fracciones es mayor?',
    ayuda: 'Para comparar, las dos se ponen con el mismo denominador. Mira qué barra llega más lejos.',
    visual: { tipo: 'apilada', n1, n2, d: comun },
    opciones: opcionesDesde(correcta, candidatas),
    correcta,
    explicacion: iguales
      ? `Con el mismo denominador (${comun}), las dos ocupan ${n1} partes: ${formatearFraccion(f1)} y ${formatearFraccion(f2)} valen lo mismo.`
      : `Con el mismo denominador (${comun}), ${formatearFraccion(mayor === 1 ? f1 : f2)} ocupa más partes, así que es la mayor.`,
  };
};

// Ronda 4: sumar dos fracciones con el mismo denominador.
const rondaSuma = () => {
  const d = rnd(3, 10);
  const n1 = rnd(1, d - 1);
  const n2 = rnd(1, d - n1);
  const correcta = { n: n1 + n2, d };
  const candidatas = [
    { n: Math.max(1, correcta.n - 1), d },
    { n: Math.min(d, n1 * n2), d },
    { n: correcta.n, d: d + 1 },
    { n: Math.max(1, n1 - 1) + n2, d },
  ];
  return {
    tipo: 'suma',
    enunciado: `¿Cuánto suman ${formatearFraccion({ n: n1, d })} y ${formatearFraccion({ n: n2, d })}?`,
    ayuda: 'Las dos fracciones tienen el mismo denominador: solo hay que sumar los numeradores.',
    visual: { tipo: 'apilada', n1, n2, d },
    opciones: opcionesDesde(correcta, candidatas),
    correcta,
    explicacion: `${n1}/${d} + ${n2}/${d} = ${n1 + n2}/${d}. El denominador se mantiene y los numeradores se suman.`,
  };
};

const TIPOS = [rondaModelo, rondaEquivale, rondaCompara, rondaSuma];

const crearRondas = () => {
  const rondas = [];
  for (let i = 0; i < RONDAS; i++) {
    // Los cuatro tipos van repartidos: el niño ve de todo, no solo repetir.
    rondas.push(TIPOS[i % TIPOS.length]());
  }
  return revuelto(rondas);
};

// --- Juego ----------------------------------------------------------------

const FraccionesGame = ({ onBack }) => {
  const gameKey = 'fracciones';
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

  const responder = useCallback((opcion) => {
    if (respondida || !ronda) return;
    setElegida(opcion);
    const ok = opcion.tipo === 'texto'
      ? ronda.correcta.tipo === 'texto' && opcion.texto === ronda.correcta.texto
      : ronda.correcta.tipo !== 'texto' && clave(opcion) === clave(ronda.correcta);
    if (ok) {
      setAciertos((a) => a + 1);
      setRacha((r) => r + 1);
      setPuntos((p) => p + 10 + racha);
    } else {
      setRacha(0);
    }
  }, [respondida, ronda, racha]);

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

  const esCorrecta = (opcion) => {
    if (!ronda) return false;
    if (ronda.correcta.tipo === 'texto') {
      return opcion.tipo === 'texto' && opcion.texto === ronda.correcta.texto;
    }
    return opcion.tipo !== 'texto' && clave(opcion) === clave(ronda.correcta);
  };

  const barraVisual = useMemo(() => {
    if (!ronda) return null;
    const v = ronda.visual;
    if (v.tipo === 'circulo') return <Circulo n={v.n} d={v.d} />;
    if (v.tipo === 'barras') {
      return <BarrasIguales n1={v.n1} d1={v.d1} n2={v.n2} d2={v.d2} />;
    }
    if (v.tipo === 'apilada') {
      return <BarraApilada n1={v.n1} n2={v.n2} d={v.d} color1={TEAL} color2={NARANJA} />;
    }
    return <Barra n={v.n} d={v.d} />;
  }, [ronda]);

  return (
    <Page>
      <BarraJuego
        onBack={onBack}
        titulo="🍕 Taller de Fracciones"
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
          <Visual>{barraVisual}</Visual>
          <Opciones>
            {ronda.opciones.map((opcion, i) => {
              const correcta = esCorrecta(opcion);
              const marcada = elegida !== null && idOpcion(opcion) === idOpcion(elegida);
              return (
                <Opcion
                  key={`${tipoFraccion(opcion)}-${i}`}
                  type="button"
                  disabled={respondida}
                  $acierto={respondida && correcta}
                  $fallo={respondida && marcada && !correcta}
                  onClick={() => responder(opcion)}
                >
                  {tipoFraccion(opcion)}
                </Opcion>
              );
            })}
          </Opciones>

          <Feedback aria-live="polite" $color={respondida ? (esCorrecta(elegida || {}) ? VERDE : ROJO) : '#5b7286'}>
            {respondida
              ? (esCorrecta(elegida || {})
                ? '¡Correcto! 🎉'
                : `¡Casi! La respuesta correcta era ${tipoFraccion(ronda.correcta)}.`)
              : ''}
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

export default FraccionesGame;
