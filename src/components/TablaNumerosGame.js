import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaCheck } from 'react-icons/fa';
import {
  Page, Tarjeta, Enunciado, Ayuda, Visual, Opciones, Opcion, Feedback,
  Explicacion, Accion, Progreso, ProgresoBarra, BarraJuego, PantallaFinal,
  NARANJA, NAVY, VERDE, ROJO,
} from './ui/JuegoBase';
import { loadGameRanking, recordGameRun, updateGameBestStreak } from '../utils/rankings';
import { numeroES } from '../utils/matematicas';

// La Tabla de Números.
//
// Viene de la app "Number Chart" del Math Learning Center: una rejilla llena
// de números para contar, ver patrones y entender la serie. Aquí la serie la
// pone el juego y el niño tiene que leer la rejilla, prever el número que
// sigue o descubrir de cuánto en cuánto avanza.
//
// La rejilla es de 6 columnas y 4 filas, y la serie puede ir de 1 en 1, de 5
// en 5 o de décimas en décimas.

const RONDAS = 8;
const COLUMNAS = 6;
const FILAS = 4;
const CELDAS = COLUMNAS * FILAS;

// Los pasos posibles: enteros y también décimas y céntimas.
const PASOS = [1, 2, 5, 10, 25, 50, 100, 0.5, 0.25];

const revuelto = (lista) => {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const numero = (n) => numeroES(n);

// --- Estilos --------------------------------------------------------------

const Rejilla = styled.div`
  display: grid;
  grid-template-columns: repeat(${COLUMNAS}, 1fr);
  gap: 6px;
  background: #f7fafc;
  border-radius: 18px;
  border: 1px solid rgba(11, 43, 69, 0.08);
  padding: 10px;
  width: 100%;
  max-width: 560px;
`;

const Casilla = styled.div`
  background: #ffffff;
  border: 2px solid rgba(11, 43, 69, 0.08);
  border-radius: 10px;
  padding: 0.5rem 0.2rem;
  text-align: center;
  font-weight: 800;
  font-size: clamp(0.85rem, 2.6vw, 1.15rem);
  color: ${NAVY};
  min-height: 2.6rem;
  display: flex;
  align-items: center;
  justify-content: center;

  ${(props) => props.$marcada && `
    border-color: ${NARANJA};
    background: rgba(255, 138, 42, 0.14);
    box-shadow: 0 0 0 3px rgba(255, 138, 42, 0.22);
  `}
  ${(props) => props.$vacia && `
    border-style: dashed;
    border-color: ${NARANJA};
    color: ${NARANJA};
  `}
`;

// --- Estilos locales ------------------------------------------------------

// --- Rondas ---------------------------------------------------------------

const crearRejilla = (paso) => {
  const celdas = [];
  for (let i = 0; i < CELDAS; i++) celdas.push(i * paso);
  return celdas;
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
  let intentos = 0;
  while (out.length < 3 && intentos < 40) {
    intentos++;
    const c = correcto + rnd(1, 9);
    if (vistas.has(String(c))) continue;
    vistas.add(String(c));
    out.push(c);
  }
  return revuelto(out);
};

// 1. ¿Qué número hay en esta casilla?
const rondaCasilla = (paso) => {
  const celdas = crearRejilla(paso);
  const marcada = Math.floor(Math.random() * CELDAS);
  const correcta = celdas[marcada];
  return {
    tipo: 'casilla',
    enunciado: '¿Qué número hay en la casilla marcada?',
    ayuda: 'Mira las casillas de alrededor y cuenta de cuánto en cuánto avanza la tabla.',
    celdas,
    marcada,
    vacia: null,
    opciones: opcionesNumericas(correcta, [
      correcta + paso,
      correcta - paso,
      correcta + 2 * paso,
      correcta - 2 * paso,
    ]),
    correcta,
    explicacion: `En esa casilla hay ${numero(correcta)}.`,
  };
};

// 2. ¿Qué número va en la casilla vacía?
const rondaSigue = (paso) => {
  const celdas = crearRejilla(paso);
  const ultimo = CELDAS - 1;
  return {
    tipo: 'sigue',
    enunciado: '¿Qué número va en la casilla vacía?',
    ayuda: 'La tabla sigue la misma regla: mira la última casilla que tiene número.',
    celdas: celdas.slice(0, ultimo),
    marcada: ultimo,
    vacia: ultimo,
    opciones: opcionesNumericas(celdas[ultimo], [
      celdas[ultimo] + paso,
      celdas[ultimo] - paso,
      celdas[ultimo] + 2 * paso,
    ]),
    correcta: celdas[ultimo],
    explicacion: `Después de ${numero(celdas[ultimo - 1])} viene ${numero(celdas[ultimo])}.`,
  };
};

// 3. ¿De cuánto en cuánto avanza la tabla?
const rondaRegla = (paso) => {
  const celdas = crearRejilla(paso);
  const distractores = PASOS.filter((p) => p !== paso && !(p * 2 === paso || paso * 2 === p));
  return {
    tipo: 'regla',
    enunciado: '¿De cuánto en cuánto avanza la tabla?',
    ayuda: 'Mira cuánto le suma a cada número al pasar a la casilla de al lado.',
    celdas,
    marcada: null,
    vacia: null,
    opciones: revuelto([paso, ...revuelto(distractores).slice(0, 3)]),
    correcta: paso,
    explicacion: `La tabla avanza de ${numero(paso)} en ${numero(paso)}.`,
  };
};

const crearRondas = () => {
  const rondas = [];
  for (let i = 0; i < RONDAS; i++) {
    const paso = PASOS[Math.floor(Math.random() * PASOS.length)];
    const generador = [rondaCasilla, rondaSigue, rondaRegla][i % 3];
    rondas.push(generador(paso));
  }
  return rondas;
};

// --- Juego ----------------------------------------------------------------

const TablaNumerosGame = ({ onBack }) => {
  const gameKey = 'tablanumeros';
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
        titulo="🔢 La Tabla de Números"
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
            <Rejilla>
              {ronda.celdas.map((valor, i) => (
                <Casilla key={i} data-celda="1" $marcada={i === ronda.marcada}>
                  {numero(valor)}
                </Casilla>
              ))}
              {ronda.vacia != null && (
                <Casilla data-celda="1" $marcada $vacia>?</Casilla>
              )}
            </Rejilla>
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
                {numero(opcion)}
              </Opcion>
            ))}
          </Opciones>

          <Feedback
            aria-live="polite"
            $color={respondida ? (elegida === ronda.correcta ? VERDE : ROJO) : '#5b7286'}
          >
            {respondida ? (elegida === ronda.correcta ? '¡Correcto! 🎉' : `La respuesta correcta era ${numero(ronda.correcta)}.`) : ''}
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

export default TablaNumerosGame;
