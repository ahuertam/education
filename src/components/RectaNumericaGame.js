import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaCheck, FaRedo, FaTrophy } from 'react-icons/fa';
import { numeroES } from '../utils/matematicas';
import {
  formatRankDate, loadGameRanking, recordGameRun, updateGameBestStreak,
} from '../utils/rankings';

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

const Page = styled.div`
  min-height: 100vh;
  padding: 1rem 1rem 3rem;
  font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;
  color: ${NAVY};
  background:
    radial-gradient(900px 500px at 15% 0%, rgba(18, 179, 176, 0.18), transparent 60%),
    radial-gradient(800px 500px at 90% 10%, rgba(255, 138, 42, 0.16), transparent 60%),
    linear-gradient(160deg, #f2fbfb 0%, #ffffff 55%, #fff6ec 100%);
`;

const TopBar = styled.header`
  max-width: 900px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
`;

const Volver = styled.button`
  background: #ffffff;
  border: 2px solid rgba(11, 43, 69, 0.15);
  color: ${NAVY};
  padding: 0.55rem 1.1rem;
  border-radius: 30px;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;

  &:hover { border-color: ${TEAL}; color: ${TEAL}; }
`;

const Titulo = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  flex: 1;
  min-width: 12rem;
`;

const Pastilla = styled.span`
  background: ${(props) => props.$tono || 'rgba(11, 43, 69, 0.07)'};
  color: ${(props) => (props.$tono ? '#ffffff' : NAVY)};
  border-radius: 30px;
  padding: 0.4rem 0.9rem;
  font-weight: 700;
  font-size: 0.92rem;
  white-space: nowrap;
`;

const Tarjeta = styled.section`
  max-width: 900px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 26px;
  padding: 1.6rem 1.4rem 1.8rem;
  box-shadow: 0 18px 40px rgba(11, 43, 69, 0.10);
  border: 1px solid rgba(11, 43, 69, 0.06);
`;

const Enunciado = styled.h2`
  margin: 0 0 0.4rem;
  font-size: 1.35rem;
  font-weight: 800;
  text-align: center;
`;

const Ayuda = styled.p`
  margin: 0 0 1.2rem;
  text-align: center;
  color: #5b7286;
  font-size: 1rem;
  line-height: 1.5;
`;

const Visual = styled.div`
  display: flex;
  justify-content: center;
  margin: 0.4rem 0 1.4rem;
`;

const Opciones = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.9rem;
`;

const Opcion = styled.button`
  background: ${(props) =>
    props.$acierto ? 'rgba(46, 158, 91, 0.16)' :
    props.$fallo ? 'rgba(224, 85, 85, 0.16)' : '#f7fafc'};
  border: 3px solid ${(props) =>
    props.$acierto ? VERDE :
    props.$fallo ? ROJO : 'rgba(11, 43, 69, 0.12)'};
  border-radius: 18px;
  padding: 1rem 0.6rem;
  cursor: pointer;
  font: inherit;
  color: ${NAVY};
  font-weight: 800;
  font-size: 1.5rem;
  min-height: 4.2rem;
  transition: transform 0.12s ease, border-color 0.12s ease;

  &:hover:not(:disabled) { border-color: ${TEAL}; transform: translateY(-2px); }
  &:disabled { cursor: default; }
`;

const Fichas = styled.div`
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Ficha = styled.button`
  background: ${(props) =>
    props.$puesta ? 'rgba(46, 158, 91, 0.16)' :
    props.$error ? 'rgba(224, 85, 85, 0.16)' : '#f7fafc'};
  border: 3px solid ${(props) =>
    props.$puesta ? VERDE :
    props.$error ? ROJO : 'rgba(11, 43, 69, 0.12)'};
  border-radius: 18px;
  padding: 1rem 1.2rem;
  cursor: pointer;
  font: inherit;
  color: ${NAVY};
  font-weight: 800;
  font-size: 1.6rem;
  min-height: 4.2rem;

  &:hover:not(:disabled) { border-color: ${TEAL}; transform: translateY(-2px); }
  &:disabled { cursor: default; }
`;

const Feedback = styled.p`
  margin: 1.2rem 0 0;
  text-align: center;
  font-weight: 800;
  font-size: 1.05rem;
  min-height: 1.6rem;
  color: ${(props) => props.$color || VERDE};
`;

const Explicacion = styled.p`
  margin: 0.4rem 0 0;
  text-align: center;
  color: #5b7286;
  font-size: 0.98rem;
  line-height: 1.55;
`;

const Accion = styled.button`
  display: block;
  margin: 1.2rem auto 0;
  background: ${TEAL};
  color: #ffffff;
  border: none;
  border-radius: 30px;
  padding: 0.75rem 1.8rem;
  font: inherit;
  font-weight: 800;
  font-size: 1.05rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover { background: #0f9a97; }
`;

const Progreso = styled.div`
  max-width: 900px;
  margin: 0 auto 0.9rem;
  height: 10px;
  border-radius: 10px;
  background: rgba(11, 43, 69, 0.10);
  overflow: hidden;
`;

const ProgresoBarra = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${TEAL}, ${NARANJA});
  border-radius: 10px;
  transition: width 0.35s ease;
`;

const Ranking = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0.6rem 0 0;
  display: grid;
  gap: 0.4rem;
`;

const RankingFila = styled.li`
  display: flex;
  justify-content: space-between;
  background: #f7fafc;
  border-radius: 12px;
  padding: 0.55rem 0.9rem;
  font-weight: 700;
  font-size: 0.95rem;
`;

const Vacio = styled.p`
  margin: 0.4rem 0 0;
  color: #7d93a5;
  font-size: 0.95rem;
`;

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
      <TopBar>
        <Volver type="button" onClick={onBack}>
          <FaArrowLeft /> Volver
        </Volver>
        <Titulo>🚂 La Recta Numérica</Titulo>
        <Pastilla>Ronda {Math.min(indice + 1, RONDAS)}/{RONDAS}</Pastilla>
        <Pastilla $tono={TEAL}>Puntos: {puntos}</Pastilla>
        <Pastilla $tono={racha > 0 ? NARANJA : undefined}>Racha: {racha}</Pastilla>
      </TopBar>

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
        <Tarjeta>
          <Enunciado>¡Partida terminada!</Enunciado>
          <Ayuda>
            Acertaste {aciertos} de {RONDAS} rondas. Tu mejor racha: {mejorRachaRef.current}.
          </Ayuda>
          <Visual>
            <Pastilla $tono={TEAL}>Puntos: {puntos}</Pastilla>
          </Visual>
          <Ranking>
            {(ranking.top || []).length === 0 && (
              <Vacio>Todavía no hay partidas registradas. ¡Esta es la primera!</Vacio>
            )}
            {(ranking.top || []).map((r, i) => (
              <RankingFila key={`${r.at}-${i}`}>
                <span>#{i + 1} — {r.score} pts</span>
                <span>{formatRankDate(r.at)}</span>
              </RankingFila>
            ))}
          </Ranking>
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Accion type="button" onClick={reiniciar}>
              <FaRedo /> Otra partida
            </Accion>
            <Accion type="button" onClick={onBack} style={{ background: NAVY }}>
              <FaTrophy /> Volver al menú
            </Accion>
          </div>
        </Tarjeta>
      )}
    </Page>
  );
};

export default RectaNumericaGame;
