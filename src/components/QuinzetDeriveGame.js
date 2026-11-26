// Quinzet Derive: la fábrica de cifras.
//
// La parte manipulativa del método: aquí el número no se calcula, se
// construye. La fábrica pide una cifra y el niño la monta con las fichas de
// base diez: bloques de 100, barras de 10 y cubitos de 1.
//
// Dos rondas:
//   componer → montar el número que pide la fábrica, ficha a ficha
//   cambia   → cuánto son las fichas si las cambias (1 bloque = 10 barras)
//
// Las fichas son las mismas que usa Base Diez: viven en ui/FichasBaseDiez.js.

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FaCheck } from 'react-icons/fa';
import {
  Page, Tarjeta, Enunciado, Ayuda, Visual, Opciones, Opcion, Feedback,
  Explicacion, Accion, BarraJuego, PantallaFinal, Progreso, ProgresoBarra,
  NumeroGrande, NAVY, TEAL, VERDE, ROJO,
} from './ui/JuegoBase';
import { Mesa, MesaLeyenda, COLOR_CIEN, COLOR_DIEZ, COLOR_UNO } from './ui/FichasBaseDiez';
import { baseDiez, componerBaseDiez, numeroES, opcionesNumericas } from '../utils/matematicas';
import { loadGameRanking, recordGameRun, updateGameBestStreak } from '../utils/rankings';

const RONDAS = 8;

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- Estilos --------------------------------------------------------------

const FilaFichas = styled.div`
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
`;

const BotonFicha = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  min-width: 4.4rem;
  padding: 0.5rem 0.7rem;
  background: #f7fafc;
  border: 3px solid rgba(11, 43, 69, 0.12);
  border-radius: 16px;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
  font-size: 1.05rem;
  color: ${NAVY};

  &:hover:not(:disabled) { border-color: ${TEAL}; transform: translateY(-2px); }
  &:disabled { cursor: default; opacity: 0.45; }
`;

// Las miniaturas de las fichas: un bloque rayado, una barra y un cubito.
const MiniaturaCien = styled.i`
  width: 30px;
  height: 30px;
  border-radius: 4px;
  background-color: ${COLOR_CIEN};
  background-image:
    repeating-linear-gradient(to right, rgba(255, 255, 255, 0.9) 0 1px, transparent 1px 3px),
    repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.9) 0 1px, transparent 1px 3px);
`;

const MiniaturaDiez = styled.i`
  width: 14px;
  height: 32px;
  border-radius: 3px;
  background: ${COLOR_DIEZ};
`;

const MiniaturaUno = styled.i`
  width: 20px;
  height: 20px;
  border-radius: 3px;
  background: ${COLOR_UNO};
`;

// --- Rondas ---------------------------------------------------------------

// La fábrica pide un número: el niño lo monta con las fichas.
const rondaComponer = (tresCifras) => {
  const objetivo = tresCifras ? rnd(101, 399) : rnd(11, 99);
  const partes = baseDiez(objetivo);
  return {
    tipo: 'componer',
    objetivo,
    enunciado: `La fábrica quiere el número ${numeroES(objetivo)}`,
    ayuda: 'Un bloque son 100, una barra son 10 y un cubito es 1.',
    explicacion: `${numeroES(objetivo)} son ${partes.centenas} bloques de 100, ${partes.decenas} barras de 10 y ${partes.unidades} cubitos de 1.`,
  };
};

// Cambiar fichas: un bloque de 100 son 10 barras de 10, y una barra de 10 son
// 10 cubitos de 1.
const rondaCambia = () => {
  const tipo = rnd(0, 2);

  if (tipo === 0) {
    const bloques = rnd(1, 5);
    const correcta = bloques * 10;
    return {
      tipo: 'cambia',
      mesa: { centenas: bloques, decenas: 0, unidades: 0 },
      enunciado: `¿Cuántas barras de diez hay en ${bloques} ${bloques === 1 ? 'bloque' : 'bloques'} de cien?`,
      ayuda: 'Un bloque de 100 se cambia por 10 barras de 10.',
      correcta,
      opciones: opcionesNumericas(correcta, [bloques, bloques * 100, correcta + 10, correcta - 10]),
      explicacion: `${bloques} bloques de 100 son ${numeroES(bloques * 100)}, y eso son ${correcta} barras de 10.`,
    };
  }

  if (tipo === 1) {
    const decenas = rnd(1, 9);
    const correcta = decenas * 10;
    return {
      tipo: 'cambia',
      mesa: { centenas: 0, decenas, unidades: 0 },
      enunciado: `¿Cuántos cubitos de 1 hay en ${decenas} ${decenas === 1 ? 'barra' : 'barras'} de diez?`,
      ayuda: 'Una barra de 10 se cambia por 10 cubitos de 1.',
      correcta,
      opciones: opcionesNumericas(correcta, [decenas, decenas * 100, correcta + 10, correcta - 10]),
      explicacion: `${decenas} barras de 10 son ${numeroES(correcta)}, y eso son ${correcta} cubitos de 1.`,
    };
  }

  const decenas = rnd(1, 9);
  const correcta = 100 + decenas * 10;
  return {
    tipo: 'cambia',
    mesa: { centenas: 1, decenas, unidades: 0 },
    enunciado: `¿Cuántos cubitos de 1 hay en 1 bloque de cien y ${decenas} ${decenas === 1 ? 'barra' : 'barras'} de diez?`,
    ayuda: 'Primero el bloque: 100. Y cada barra: 10 cubitos.',
    correcta,
    opciones: opcionesNumericas(correcta, [100, decenas * 10, correcta + 10, correcta - 10]),
    explicacion: `El bloque son 100 y las barras ${numeroES(decenas * 10)}: en total ${correcta} cubitos.`,
  };
};

export const crearRondas = () => {
  const rondas = [];
  for (let i = 0; i < RONDAS; i++) {
    // Las dos primeras son de dos cifras; después la fábrica pide centenas.
    rondas.push(i % 2 === 0 ? rondaComponer(i >= 2) : rondaCambia());
  }
  return rondas;
};

// --- Juego ----------------------------------------------------------------

const QuinzetDeriveGame = ({ onBack }) => {
  const gameKey = 'quinzetderive';
  const [rondas, setRondas] = useState(() => crearRondas());
  const [indice, setIndice] = useState(0);
  const [partes, setPartes] = useState({ centenas: 0, decenas: 0, unidades: 0 });
  const [elegida, setElegida] = useState(null);
  const [respondida, setRespondida] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [terminada, setTerminada] = useState(false);
  const [ranking, setRanking] = useState(() => loadGameRanking(gameKey));
  const mejorRachaRef = useRef(0);
  const registradaRef = useRef(false);
  const okRef = useRef(null);

  useEffect(() => {
    okRef.current = new Audio(`${process.env.PUBLIC_URL}/beep.mp3`);
    okRef.current.volume = 0.3;
  }, []);

  useEffect(() => {
    if (racha > mejorRachaRef.current) mejorRachaRef.current = racha;
    if (racha > ranking.bestStreak) setRanking(updateGameBestStreak(gameKey, racha));
  }, [racha, ranking.bestStreak]);

  useEffect(() => {
    if (!terminada || registradaRef.current) return;
    registradaRef.current = true;
    setRanking(recordGameRun(gameKey, { score: puntos, bestStreak: mejorRachaRef.current }));
  }, [terminada, puntos]);

  const ronda = rondas[indice] || null;
  const valor = componerBaseDiez(partes);

  const anotar = (ok) => {
    if (ok) {
      setAciertos((a) => a + 1);
      setRacha((r) => r + 1);
      setPuntos((p) => p + 10 + racha);
      okRef.current?.play()?.catch?.(() => {});
    } else {
      setRacha(0);
    }
  };

  // Poner o quitar una ficha. Cuando lo que hay en la mesa es justo lo que
  // pedía la fábrica, la ronda está resuelta.
  const mover = (campo, delta) => {
    if (respondida || !ronda) return;
    const siguiente = { ...partes, [campo]: Math.max(0, partes[campo] + delta) };
    const nuevoValor = componerBaseDiez(siguiente);
    setPartes(siguiente);
    if (nuevoValor === ronda.objetivo) {
      setRespondida(true);
      setFeedback(`¡La fábrica lo quiere! ${numeroES(ronda.objetivo)}.`);
      anotar(true);
    } else if (nuevoValor > ronda.objetivo) {
      setFeedback('Te has pasado. Quita alguna ficha.');
    } else {
      setFeedback(null);
    }
  };

  const responder = (valor) => {
    if (respondida || !ronda || ronda.tipo !== 'cambia') return;
    const ok = valor === ronda.correcta;
    setElegida(valor);
    setRespondida(true);
    setFeedback(ok ? '¡Correcto! 🎉' : `La respuesta correcta era ${numeroES(ronda.correcta)}.`);
    anotar(ok);
  };

  const siguiente = () => {
    if (indice + 1 >= rondas.length) {
      setTerminada(true);
      return;
    }
    setIndice((i) => i + 1);
    setPartes({ centenas: 0, decenas: 0, unidades: 0 });
    setElegida(null);
    setRespondida(false);
    setFeedback(null);
  };

  const reiniciar = () => {
    setRondas(crearRondas());
    setIndice(0);
    setPartes({ centenas: 0, decenas: 0, unidades: 0 });
    setElegida(null);
    setRespondida(false);
    setFeedback(null);
    setPuntos(0);
    setRacha(0);
    setAciertos(0);
    setTerminada(false);
    registradaRef.current = false;
    mejorRachaRef.current = 0;
  };

  return (
    <Page>
      <BarraJuego
        onBack={onBack}
        titulo="🏭 Quinzet Derive"
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

          {ronda.tipo === 'componer' ? (
            <>
              <Visual>
                <NumeroGrande>{numeroES(ronda.objetivo)}</NumeroGrande>
              </Visual>

              <FilaFichas>
                <BotonFicha type="button" disabled={respondida} onClick={() => mover('centenas', 1)}>
                  <MiniaturaCien />+100
                </BotonFicha>
                <BotonFicha type="button" disabled={respondida} onClick={() => mover('decenas', 1)}>
                  <MiniaturaDiez />+10
                </BotonFicha>
                <BotonFicha type="button" disabled={respondida} onClick={() => mover('unidades', 1)}>
                  <MiniaturaUno />+1
                </BotonFicha>
              </FilaFichas>
              <FilaFichas>
                <BotonFicha type="button" disabled={respondida} onClick={() => mover('centenas', -1)}>
                  −100
                </BotonFicha>
                <BotonFicha type="button" disabled={respondida} onClick={() => mover('decenas', -1)}>
                  −10
                </BotonFicha>
                <BotonFicha type="button" disabled={respondida} onClick={() => mover('unidades', -1)}>
                  −1
                </BotonFicha>
              </FilaFichas>

              <Visual>
                <Mesa partes={partes} />
              </Visual>
              <MesaLeyenda>{numeroES(valor)}</MesaLeyenda>
            </>
          ) : (
            <>
              <Visual>
                <Mesa partes={ronda.mesa} titulos={false} />
              </Visual>
              <Opciones>
                {ronda.opciones.map((valor, i) => (
                  <Opcion
                    key={`${valor}-${i}`}
                    type="button"
                    disabled={respondida}
                    $acierto={respondida && valor === ronda.correcta}
                    $fallo={respondida && elegida === valor && valor !== ronda.correcta}
                    onClick={() => responder(valor)}
                  >
                    {numeroES(valor)}
                  </Opcion>
                ))}
              </Opciones>
            </>
          )}

          <Feedback aria-live="polite" $color={respondida ? (feedback && feedback.startsWith('¡') ? VERDE : ROJO) : '#5b7286'}>
            {feedback || ''}
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

export default QuinzetDeriveGame;
