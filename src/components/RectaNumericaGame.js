import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Accion,
  Ayuda,
  BarraJuego,
  Enunciado,
  Explicacion,
  Feedback,
  Ficha,
  Fichas,
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
import { numeroES } from '../utils/matematicas';
import { loadGameRanking, recordGameRun, updateGameBestStreak } from '../utils/rankings';

// La Recta Numérica.
//
// Viene de la app "Number Line" del Math Learning Center: los números
// colocados en orden sobre una línea y, a partir de ahí, todo lo que se puede
// preguntar. Aquí son cuatro tipos de ronda:
//
//   situa  → leer qué número marca un punto de la recta
//   salta  → saltar una distancia y calcular dónde se cae
//   entre  → qué número hay entre dos marcados
//   ordena → colocar varios números de menor a mayor
//
// La recta cambia de escala entre rondas (0-20, 0-100, 0-1000) para que el
// niño no se quede con una sola.

const TEAL = '#12b3b0';
const NARANJA = '#ff8a2a';
const NAVY = '#0b2b45';
const VERDE = '#2e9e5b';
const ROJO = '#e05555';
const RONDAS = 10;

const COLORES = ['#12b3b0', '#ff8a2a', '#845ef7', '#e91e63'];

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const revuelto = (lista) => {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Las tres escalas de la recta.
const NIVELES = [
  { min: 0, max: 20, paso: 1, nombre: 'del 0 al 20' },
  { min: 0, max: 100, paso: 10, nombre: 'del 0 al 100' },
  { min: 0, max: 1000, paso: 100, nombre: 'del 0 al 1000' },
];

// --- Estilos --------------------------------------------------------------

// --- La recta -------------------------------------------------------------

const Recta = ({ nivel, marcador, segundo, marcadores }) => {
  const x0 = 30;
  const x1 = 770;
  const pos = (v) => x0 + ((v - nivel.min) / (nivel.max - nivel.min)) * (x1 - x0);
  const marcas = [];
  for (let v = nivel.min; v <= nivel.max; v += nivel.paso) marcas.push(v);

  return (
    <svg
      viewBox="0 0 800 130"
      style={{ width: '100%', maxWidth: 780, height: 'auto' }}
      role="img"
      aria-label={`Recta numérica ${nivel.nombre}`}
    >
      <line x1={x0} y1={70} x2={x1} y2={70} stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
      {marcas.map((v) => (
        <g key={v}>
          <line x1={pos(v)} y1={61} x2={pos(v)} y2={79} stroke={NAVY} strokeWidth="2" />
          <text x={pos(v)} y={102} textAnchor="middle" fill={NAVY} fontSize="15" fontWeight="700">
            {numeroES(v)}
          </text>
        </g>
      ))}
      {(marcadores || []).map((v, i) => (
        <circle
          key={`m${v}`}
          cx={pos(v)}
          cy={70}
          r={9}
          fill={COLORES[i % COLORES.length]}
          stroke="#ffffff"
          strokeWidth="2"
        />
      ))}
      {segundo != null && (
        <g>
          <circle cx={pos(segundo)} cy={70} r={9} fill={NARANJA} />
          <text x={pos(segundo)} y={42} textAnchor="middle" fontSize="24">🚩</text>
        </g>
      )}
      {marcador != null && (
        <g>
          <circle cx={pos(marcador)} cy={70} r={11} fill={TEAL} />
          <text x={pos(marcador)} y={40} textAnchor="middle" fontSize="28">🚂</text>
        </g>
      )}
    </svg>
  );
};

// --- Generación de rondas ------------------------------------------------

// Las opciones siempre están dentro de la recta y a saltos del mismo peldaño
// que las marcas: así ninguna respuesta se queda fuera de la escala.
const opcionesDesde = (correcto, candidatas, nivel) => {
  const vistas = new Set([String(correcto)]);
  const out = [correcto];
  const dentro = (v) => v >= nivel.min && v <= nivel.max;

  for (const c of candidatas) {
    if (out.length >= 4) break;
    if (!Number.isFinite(c) || !dentro(c) || vistas.has(String(c))) continue;
    vistas.add(String(c));
    out.push(c);
  }

  let intentos = 0;
  while (out.length < 3 && intentos < 40) {
    intentos++;
    const c = correcto + rnd(-3, 3) * nivel.paso;
    if (!dentro(c) || vistas.has(String(c))) continue;
    vistas.add(String(c));
    out.push(c);
  }
  return revuelto(out);
};

// ¿Qué número marca el tren?
const rondaSitua = (nivel) => {
  const marcas = Math.floor((nivel.max - nivel.min) / nivel.paso);
  const indice = rnd(1, marcas - 1);
  const v = nivel.min + indice * nivel.paso;
  return {
    tipo: 'situa',
    enunciado: '¿Qué número marca el tren?',
    ayuda: `Mira dónde está el tren en la recta ${nivel.nombre}.`,
    nivel,
    marcador: v,
    opciones: opcionesDesde(v, [
      v + nivel.paso,
      v - nivel.paso,
      v + 2 * nivel.paso,
      v - 2 * nivel.paso,
    ], nivel),
    correcta: v,
    explicacion: `El tren está en ${numeroES(v)}.`,
  };
};

// Saltar una distancia.
const rondaSalta = (nivel) => {
  const marcas = Math.floor((nivel.max - nivel.min) / nivel.paso);
  const inicio = nivel.min + rnd(1, marcas - 1) * nivel.paso;
  const derecha = Math.random() < 0.7;
  // El salto tiene que caber en la recta hacia el lado elegido.
  const espacio = derecha ? nivel.max - inicio : inicio - nivel.min;
  const pasos = Math.max(1, Math.min(3, Math.floor(espacio / nivel.paso)));
  const salto = pasos * nivel.paso;
  const destino = derecha ? inicio + salto : inicio - salto;

  return {
    tipo: 'salta',
    enunciado: derecha
      ? `El tren está en ${numeroES(inicio)} y salta ${numeroES(salto)} hacia la derecha. ¿Dónde acaba?`
      : `El tren está en ${numeroES(inicio)} y salta ${numeroES(salto)} hacia la izquierda. ¿Dónde acaba?`,
    ayuda: 'Cuenta los saltos de la recta, uno a uno.',
    nivel,
    marcador: inicio,
    opciones: opcionesDesde(destino, [
      inicio,
      destino + nivel.paso,
      destino - nivel.paso,
      inicio + (derecha ? salto : -salto),
    ], nivel),
    correcta: destino,
    explicacion: `De ${numeroES(inicio)} saltas ${numeroES(salto)} hacia ${derecha ? 'la derecha' : 'la izquierda'}: el tren acaba en ${numeroES(destino)}.`,
  };
};

// El número que está entre dos marcados.
const rondaEntre = (nivel) => {
  const marcas = Math.floor((nivel.max - nivel.min) / nivel.paso);
  const indice = rnd(1, marcas - 2);
  const a = nivel.min + indice * nivel.paso;
  const b = a + 2 * nivel.paso;
  return {
    tipo: 'entre',
    enunciado: `¿Qué número está entre ${numeroES(a)} y ${numeroES(b)}?`,
    ayuda: 'Mira las dos banderas de la recta y busca el número que queda en medio.',
    nivel,
    marcador: a,
    segundo: b,
    opciones: opcionesDesde(a + nivel.paso, [a, b, a + 3 * nivel.paso, a - nivel.paso], nivel),
    correcta: a + nivel.paso,
    explicacion: `Entre ${numeroES(a)} y ${numeroES(b)} está ${numeroES(a + nivel.paso)}.`,
  };
};

// Poner varios números en orden.
const rondaOrdena = (nivel) => {
  const numeros = [];
  while (numeros.length < 4) {
    const v = rnd(Math.ceil(nivel.max / 10), nivel.max);
    if (!numeros.includes(v)) numeros.push(v);
  }
  const ordenados = [...numeros].sort((a, b) => a - b);
  return {
    tipo: 'ordena',
    enunciado: 'Toca los números de menor a mayor',
    ayuda: 'Primero el más pequeño, y así hasta el más grande.',
    nivel,
    marcadores: numeros,
    numeros: revuelto(numeros),
    ordenados,
    correcta: null,
    explicacion: `De menor a mayor: ${ordenados.map((n) => numeroES(n)).join(' · ')}.`,
  };
};

const crearRondas = () => {
  const rondas = [];
  for (let i = 0; i < RONDAS; i++) {
    const nivel = NIVELES[i % NIVELES.length];
    const generador = [rondaSitua, rondaSalta, rondaEntre, rondaOrdena][i % 4];
    rondas.push(generador(nivel));
  }
  return rondas;
};

// --- Juego ----------------------------------------------------------------

const RectaNumericaGame = ({ onBack }) => {
  const gameKey = 'rectanumerica';
  const [rondas, setRondas] = useState(() => crearRondas());
  const [indice, setIndice] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [puestas, setPuestas] = useState([]);
  const [falloFicha, setFalloFicha] = useState(null);
  const [ranking, setRanking] = useState(() => loadGameRanking(gameKey));
  const [terminada, setTerminada] = useState(false);
  const mejorRachaRef = useRef(0);
  const registradaRef = useRef(false);

  const ronda = rondas[indice] || null;
  const respondida = elegida !== null;
  const ordenar = ronda?.tipo === 'ordena';

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

  const responder = (valor) => {
    if (respondida || !ronda) return;
    setElegida(valor);
    anotar(Number(valor) === ronda.correcta);
  };

  // La ronda de ordenar es un puzzle: se van tocando las fichas en orden.
  const tocarFicha = (valor) => {
    if (respondida || !ronda) return;
    const esperado = ronda.ordenados[puestas.length];
    if (valor === esperado) {
      const nuevas = [...puestas, valor];
      setPuestas(nuevas);
      setFalloFicha(null);
      if (nuevas.length === ronda.ordenados.length) {
        setElegida(valor);
        anotar(true);
      }
    } else {
      setFalloFicha(valor);
      anotar(false);
    }
  };

  const siguiente = () => {
    if (indice + 1 >= rondas.length) {
      setTerminada(true);
      return;
    }
    setIndice((i) => i + 1);
    setElegida(null);
    setPuestas([]);
    setFalloFicha(null);
  };

  const reiniciar = () => {
    setRondas(crearRondas());
    setIndice(0);
    setPuntos(0);
    setRacha(0);
    setAciertos(0);
    setElegida(null);
    setPuestas([]);
    setFalloFicha(null);
    setTerminada(false);
    mejorRachaRef.current = 0;
    registradaRef.current = false;
  };

  const acertada = ronda?.tipo === 'ordena'
    ? respondida
    : respondida && Number(elegida) === ronda?.correcta;

  const colorFeedback = respondida ? (acertada ? VERDE : ROJO) : '#5b7286';

  return (
    <Page>
      <BarraJuego
        onBack={onBack}
        titulo="🚂 La Recta Numérica"
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
            <Recta
              nivel={ronda.nivel}
              marcador={ronda.marcador}
              segundo={ronda.segundo}
              marcadores={ronda.marcadores}
            />
          </Visual>

          {ordenar ? (
            <Fichas>
              {ronda.numeros.map((n) => (
                <Ficha
                  key={n}
                  type="button"
                  disabled={respondida || puestas.includes(n)}
                  $puesta={puestas.includes(n)}
                  $error={falloFicha === n}
                  onClick={() => tocarFicha(n)}
                >
                  {numeroES(n)}
                </Ficha>
              ))}
            </Fichas>
          ) : (
            <Opciones>
              {ronda.opciones.map((valor, i) => (
                <Opcion
                  key={`${valor}-${i}`}
                  type="button"
                  disabled={respondida}
                  $acierto={respondida && valor === ronda.correcta}
                  $fallo={respondida && Number(elegida) === valor && valor !== ronda.correcta}
                  onClick={() => responder(valor)}
                >
                  {numeroES(valor)}
                </Opcion>
              ))}
            </Opciones>
          )}

          <Feedback aria-live="polite" $color={colorFeedback}>
            {respondida
              ? (acertada
                ? '¡Correcto! 🎉'
                : `¡Casi! La respuesta correcta era ${ronda.tipo === 'ordena' ? ronda.ordenados.map(numeroES).join(' · ') : numeroES(ronda.correcta)}.`)
              : (ordenar ? `Toca el número que va en el puesto ${puestas.length + 1}.` : '')}
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

export default RectaNumericaGame;
