// El Mercadillo Quinzet: el cálculo global del método.
//
// La otra mitad del método: no automatizar la cuenta, sino elegir la
// estrategia y aplicarla. Cada compra trae sus pasos —lo que hay que
// responder, en orden— porque no se valida solo el resultado final: se valida
// el camino. Al final, el puesto paga con monedas y billetes de verdad.

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  Page, Tarjeta, Enunciado, Ayuda, Visual, Opciones, Opcion, Feedback,
  Accion, BarraJuego, PantallaFinal,
  NAVY, TEAL, VERDE, ROJO,
} from './ui/JuegoBase';
import { Pieza, descomponer, euros } from './ui/DineroPiezas';
import { loadGameRanking, recordGameRun, updateGameBestStreak } from '../utils/rankings';
import { mercado, opciones, ESTRATEGIAS } from './data/quinzet';

// --- Estilos --------------------------------------------------------------

const Estrategias = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0.9rem;
`;

const BotonEstrategia = styled.button`
  text-align: left;
  background: ${(props) => (props.$fallo ? 'rgba(224, 85, 85, 0.16)' : '#f7fafc')};
  border: 3px solid ${(props) => (props.$fallo ? ROJO : 'rgba(11, 43, 69, 0.12)')};
  border-radius: 18px;
  padding: 0.9rem 1rem;
  cursor: pointer;
  font: inherit;
  color: ${NAVY};
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  &:hover:not(:disabled) { border-color: ${TEAL}; transform: translateY(-2px); }
  &:disabled { cursor: default; }

  strong { font-size: 1.05rem; }
  span { font-size: 0.9rem; color: #5b7286; line-height: 1.45; }
`;

const Puesto = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;

  img { image-rendering: auto; }
  span { font-size: 1.05rem; font-weight: 800; color: ${NAVY}; }
`;

const Fila = styled.div`
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`;

// --- Juego ----------------------------------------------------------------

const MercadilloQuinzetGame = ({ onBack }) => {
  const gameKey = 'mercadilloquinzet';
  const [rondas, setRondas] = useState(() => mercado());
  const [indice, setIndice] = useState(0);
  const [fase, setFase] = useState('estrategia'); // estrategia | paso | cobrar
  const [elegida, setElegida] = useState(null);
  const [paso, setPaso] = useState(0);
  const [opcionesPaso, setOpcionesPaso] = useState([]);
  const [respondido, setRespondido] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [terminada, setTerminada] = useState(false);
  const [ranking, setRanking] = useState(() => loadGameRanking(gameKey));
  const mejorRachaRef = useRef(0);
  const registradaRef = useRef(false);
  const okRef = useRef(null);
  const malRef = useRef(null);

  useEffect(() => {
    okRef.current = new Audio(`${process.env.PUBLIC_URL}/beep.mp3`);
    okRef.current.volume = 0.3;
    malRef.current = new Audio(`${process.env.PUBLIC_URL}/explosion.mp3`);
    malRef.current.volume = 0.2;
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

  const ronda = rondas[indice];
  const totalPasos = rondas.reduce((s, r) => s + r.pasos.length, 0);
  const estrategia = ESTRATEGIAS.find((e) => e.id === ronda.estrategia);

  const anotar = (ok) => {
    if (ok) {
      setAciertos((a) => a + 1);
      setRacha((r) => r + 1);
      setPuntos((p) => p + 10 + racha);
      okRef.current?.play()?.catch?.(() => {});
    } else {
      setRacha(0);
      malRef.current?.play()?.catch?.(() => {});
    }
  };

  // Elegir la estrategia: solo una sirve para esta cuenta.
  //
  // La estrategia no cuenta como acierto: los aciertos son los pasos. Pero
  // fallar al elegirla corta la racha.
  const elegirEstrategia = (id) => {
    if (fase !== 'estrategia') return;
    setElegida(id);
    if (id !== ronda.estrategia) {
      setRacha(0);
      malRef.current?.play()?.catch?.(() => {});
      setFeedback('Esa estrategia no sirve para esta cuenta. Piensa cómo se hace.');
      return;
    }
    setFeedback(null);
    setOpcionesPaso(opciones(ronda.pasos[0].respuesta));
    setPaso(0);
    setRespondido(false);
    setFase('paso');
  };

  // Responder un paso: se valida el paso, no solo el final. Si falla, se ve la
  // respuesta correcta y se pasa al siguiente paso con "Siguiente".
  const responderPaso = (valor) => {
    if (fase !== 'paso' || respondido) return;
    const actual = ronda.pasos[paso];
    const ok = valor === actual.respuesta;
    anotar(ok);
    setRespondido(true);
    setFeedback(
      ok
        ? `¡Bien! ${actual.texto.split(':')[0]}: ${actual.respuesta}`
        : `Era ${actual.respuesta}. ${actual.texto}`
    );
  };

  const avanzarPaso = () => {
    if (paso + 1 >= ronda.pasos.length) {
      setFase('cobrar');
      return;
    }
    setOpcionesPaso(opciones(ronda.pasos[paso + 1].respuesta));
    setPaso((p) => p + 1);
    setRespondido(false);
    setFeedback(null);
  };

  const siguiente = () => {
    if (indice + 1 >= rondas.length) {
      setTerminada(true);
      return;
    }
    setIndice((i) => i + 1);
    setFase('estrategia');
    setElegida(null);
    setPaso(0);
    setRespondido(false);
    setFeedback(null);
  };

  const reiniciar = () => {
    setRondas(mercado());
    setIndice(0);
    setFase('estrategia');
    setElegida(null);
    setPaso(0);
    setRespondido(false);
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
        titulo="🏪 El Mercadillo Quinzet"
        ronda={Math.min(indice + 1, rondas.length)}
        rondas={rondas.length}
        puntos={puntos}
        racha={racha}
      />

      {!terminada && ronda && (
        <Tarjeta>
          {fase === 'estrategia' && (
            <>
              <Enunciado>{ronda.enunciado}</Enunciado>
              <Ayuda>¿Qué estrategia usas para resolverlo?</Ayuda>
              <Visual>
                <Puesto>
                  <img
                    src={`${process.env.PUBLIC_URL}/huerto/${ronda.puesto.svg}`}
                    alt=""
                    width="64"
                    height="64"
                  />
                  <span>{ronda.puesto.emoji} {ronda.puesto.nombre}</span>
                </Puesto>
              </Visual>
              <Estrategias>
                {ronda.tarjetas.map((e) => (
                  <BotonEstrategia
                    key={e.id}
                    type="button"
                    $fallo={elegida === e.id && e.id !== ronda.estrategia}
                    onClick={() => elegirEstrategia(e.id)}
                  >
                    <strong>{e.emoji} {e.nombre}</strong>
                    <span>{e.explica}</span>
                  </BotonEstrategia>
                ))}
              </Estrategias>
            </>
          )}

          {fase === 'paso' && (
            <>
              <Enunciado>{ronda.pasos[paso].texto}</Enunciado>
              <Ayuda>
                {estrategia.emoji} {estrategia.nombre}: {estrategia.explica}
              </Ayuda>
              <Opciones>
                {opcionesPaso.map((valor, i) => (
                  <Opcion
                    key={`${valor}-${i}`}
                    type="button"
                    disabled={respondido}
                    onClick={() => responderPaso(valor)}
                  >
                    {valor}
                  </Opcion>
                ))}
              </Opciones>
              {respondido && (
                <Accion type="button" onClick={avanzarPaso}>
                  Siguiente
                </Accion>
              )}
            </>
          )}

          {fase === 'cobrar' && (
            <>
              <Enunciado>¡Compra hecha! 🎉</Enunciado>
              <Ayuda>El puesto te paga {euros(ronda.total)}.</Ayuda>
              <Visual>
                <Fila>
                  {descomponer(ronda.total).map((p, i) => (
                    <Pieza key={i} tipo={p.tipo} indice={p.indice} />
                  ))}
                </Fila>
              </Visual>
              <Accion type="button" onClick={siguiente}>
                Siguiente puesto
              </Accion>
            </>
          )}

          {fase !== 'cobrar' && (
            <Feedback
              aria-live="polite"
              $color={feedback ? (feedback.startsWith('¡Bien!') ? VERDE : ROJO) : '#5b7286'}
            >
              {feedback || ''}
            </Feedback>
          )}
        </Tarjeta>
      )}

      {terminada && (
        <PantallaFinal
          puntos={puntos}
          aciertos={aciertos}
          rondas={totalPasos}
          mejorRacha={mejorRachaRef.current}
          ranking={ranking}
          onReiniciar={reiniciar}
          onVolver={onBack}
        />
      )}
    </Page>
  );
};

export default MercadilloQuinzetGame;
