// Hoja Quinzet: cálculo mental cronometrado.
//
// El método Quinzet es una hoja de papel con 4 columnas de 15 cuentas que hay
// que hacer en dos minutos. Aquí la hoja se dibuja en pantalla y se va
// rellenando: es el mismo reto, pero con la hoja viva.
//
// El final usa los umbrales del método: 55 o más cuentas bien hechas suben de
// nivel, menos de 15 piden repetir la hoja anterior.

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  Page, Tarjeta, Enunciado, Ayuda, Visual, Opciones, Opcion, Feedback,
  BarraJuego, PantallaFinal, Pastilla, TopBar, Volver, Titulo,
  NAVY, TEAL, VERDE, ROJO,
} from './ui/JuegoBase';
import { loadGameRanking, recordGameRun, updateGameBestStreak } from '../utils/rankings';
import {
  HOJAS, hoja, opciones, veredicto, textoCuenta,
  OPERACIONES_HOJA, SEGUNDOS_HOJA, COLUMNAS,
} from './data/quinzet';

// --- Estilos --------------------------------------------------------------

const Hojas = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 0.9rem;
`;

const BotonHoja = styled.button`
  text-align: left;
  background: #f7fafc;
  border: 3px solid ${(props) => (props.$destacada ? TEAL : 'rgba(11, 43, 69, 0.12)')};
  border-radius: 18px;
  padding: 0.9rem 1rem;
  cursor: pointer;
  font: inherit;
  color: ${NAVY};
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  &:hover { border-color: ${TEAL}; transform: translateY(-2px); }

  strong { font-size: 1.05rem; }
  span { font-size: 0.92rem; color: #5b7286; line-height: 1.45; }
  em {
    font-style: normal;
    font-size: 0.78rem;
    font-weight: 800;
    color: ${TEAL};
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
`;

// La hoja de papel: 4 columnas de 15 casillas que se van rellenando.
const Papel = styled.div`
  display: grid;
  grid-template-columns: repeat(${COLUMNAS}, 1fr);
  gap: 4px;
  max-width: 360px;
  margin: 0 auto 1.1rem;
`;

const Casilla = styled.div`
  aspect-ratio: 1;
  border-radius: 6px;
  border: 1px solid rgba(11, 43, 69, 0.12);
  background: ${(props) =>
    props.$estado === 'ok' ? VERDE : props.$estado === 'mal' ? ROJO : '#eef3f7'};
  opacity: ${(props) => (props.$estado ? 1 : 0.55)};
`;

const Operacion = styled.div`
  font-size: clamp(2.8rem, 12vw, 4.6rem);
  font-weight: 900;
  color: ${NAVY};
  line-height: 1.1;
`;

const crono = (segundos) =>
  `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`;

// --- Juego ----------------------------------------------------------------

const HojaQuinzetGame = ({ onBack, operation, multiplicationConfig }) => {
  const gameKey = 'hojaquinzet';
  const [hojaId, setHojaId] = useState(null);
  const [cuentas, setCuentas] = useState([]);
  const [opcionesCuenta, setOpcionesCuenta] = useState([]);
  const [indice, setIndice] = useState(0);
  const [resultados, setResultados] = useState([]);
  const [segundos, setSegundos] = useState(SEGUNDOS_HOJA);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [terminada, setTerminada] = useState(false);
  const [ranking, setRanking] = useState(() => loadGameRanking(gameKey));
  const mejorRachaRef = useRef(0);
  const registradaRef = useRef(false);
  const okRef = useRef(null);
  const malRef = useRef(null);
  // La última cuenta contestada: un doble toque no puede contar dos veces.
  const ultimaRef = useRef(-1);

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

  // La partida terminada se apunta una vez, aunque el niño le dé a reiniciar.
  useEffect(() => {
    if (!terminada || registradaRef.current) return;
    registradaRef.current = true;
    setRanking(recordGameRun(gameKey, { score: puntos, bestStreak: mejorRachaRef.current }));
  }, [terminada, puntos]);

  const empezar = (id) => {
    const nuevas = hoja(id, multiplicationConfig);
    setHojaId(id);
    setCuentas(nuevas);
    setOpcionesCuenta(opciones(nuevas[0]));
    setIndice(0);
    setResultados([]);
    setSegundos(SEGUNDOS_HOJA);
    setPuntos(0);
    setRacha(0);
    setAciertos(0);
    setFeedback(null);
    setTerminada(false);
    registradaRef.current = false;
    mejorRachaRef.current = 0;
    ultimaRef.current = -1;
  };

  const responder = (valor) => {
    if (terminada || indice >= cuentas.length) return;
    if (ultimaRef.current === indice) return; // doble toque
    ultimaRef.current = indice;

    const cuenta = cuentas[indice];
    const ok = valor === cuenta.answer;
    setResultados((r) => [...r.slice(0, indice), ok]);
    setFeedback({ ok, texto: `${textoCuenta(cuenta)} = ${cuenta.answer}` });
    if (ok) {
      setAciertos((a) => a + 1);
      setRacha((r) => r + 1);
      setPuntos((p) => p + 10 + racha);
      okRef.current?.play()?.catch?.(() => {});
    } else {
      setRacha(0);
      malRef.current?.play()?.catch?.(() => {});
    }
    if (indice + 1 >= cuentas.length) {
      setTerminada(true);
    } else {
      setOpcionesCuenta(opciones(cuentas[indice + 1]));
      setIndice((i) => i + 1);
    }
  };

  // El reloj. Cuando se llega a cero, se acabó la hoja.
  useEffect(() => {
    if (terminada || hojaId === null) return undefined;
    const t = setInterval(() => setSegundos((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [terminada, hojaId]);

  useEffect(() => {
    if (hojaId !== null && segundos === 0) setTerminada(true);
  }, [segundos, hojaId]);

  const cuenta = cuentas[indice];
  const v = veredicto(aciertos);

  // --- Menú: las cuatro hojas del método ---------------------------------
  if (hojaId === null) {
    return (
      <Page>
        <TopBar>
          <Volver type="button" onClick={onBack}>← Volver</Volver>
          <Titulo>🧠 Hoja Quinzet</Titulo>
        </TopBar>
        <Tarjeta>
          <Enunciado>Elige tu hoja</Enunciado>
          <Ayuda>
            Cada hoja tiene 60 cuentas (4 columnas de 15) y tienes dos minutos
            para hacerlas. Con 55 o más subes de nivel; con menos de 15 repites
            la hoja anterior.
          </Ayuda>
          <Hojas>
            {HOJAS.map((h) => (
              <BotonHoja
                key={h.id}
                type="button"
                $destacada={h.categorias.includes(operation)}
                onClick={() => empezar(h.id)}
              >
                <strong>{h.emoji} {h.titulo}</strong>
                <span>{h.ayuda}</span>
                {h.categorias.includes(operation) && <em>De tu categoría</em>}
              </BotonHoja>
            ))}
          </Hojas>
        </Tarjeta>
      </Page>
    );
  }

  // --- Partida ------------------------------------------------------------
  if (!terminada) {
    return (
      <Page>
        <BarraJuego
          onBack={onBack}
          titulo={`🧠 ${HOJAS.find((h) => h.id === hojaId)?.titulo ?? 'Hoja Quinzet'}`}
          ronda={Math.min(indice + 1, OPERACIONES_HOJA)}
          rondas={OPERACIONES_HOJA}
          puntos={puntos}
          racha={racha}
          extra={<Pastilla $tono={segundos <= 10 ? ROJO : undefined}>⏱ {crono(segundos)}</Pastilla>}
        />

        <Tarjeta>
          <Papel>
            {Array.from({ length: OPERACIONES_HOJA }, (_, i) => (
              <Casilla
                key={i}
                $estado={resultados[i] === true ? 'ok' : resultados[i] === false ? 'mal' : null}
              />
            ))}
          </Papel>

          <Visual>
            <Operacion>{cuenta ? textoCuenta(cuenta) : ''}</Operacion>
          </Visual>

          <Opciones>
            {opcionesCuenta.map((valor, i) => (
              <Opcion key={`${valor}-${i}`} type="button" onClick={() => responder(valor)}>
                {valor}
              </Opcion>
            ))}
          </Opciones>

          <Feedback aria-live="polite" $color={feedback ? (feedback.ok ? VERDE : ROJO) : '#5b7286'}>
            {feedback ? (feedback.ok ? '¡Bien! 🎉' : `Era ${feedback.texto}`) : ''}
          </Feedback>
        </Tarjeta>
      </Page>
    );
  }

  // --- Final --------------------------------------------------------------
  return (
    <Page>
      <BarraJuego
        onBack={onBack}
        titulo="🧠 Hoja Quinzet"
        ronda={OPERACIONES_HOJA}
        rondas={OPERACIONES_HOJA}
        puntos={puntos}
        racha={racha}
      />
      <Tarjeta style={{ marginBottom: '1rem' }}>
        <Enunciado>{v.titulo}</Enunciado>
        <Ayuda>{v.texto}</Ayuda>
        <Visual>
          <Pastilla $tono={TEAL}>{aciertos} cuentas en 2 minutos</Pastilla>
        </Visual>
      </Tarjeta>
      <PantallaFinal
        puntos={puntos}
        aciertos={aciertos}
        rondas={OPERACIONES_HOJA}
        mejorRacha={mejorRachaRef.current}
        ranking={ranking}
        onReiniciar={() => empezar(hojaId)}
        onVolver={onBack}
      />
    </Page>
  );
};

export default HojaQuinzetGame;
