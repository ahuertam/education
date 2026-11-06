import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaCheck } from 'react-icons/fa';
import {
  Page, Tarjeta, Enunciado, Ayuda, Visual, Opciones, Opcion, Feedback,
  Explicacion, Accion, Progreso, ProgresoBarra, BarraJuego, PantallaFinal,
  NAVY, VERDE, ROJO,
} from './ui/JuegoBase';
import { loadGameRanking, recordGameRun, updateGameBestStreak } from '../utils/rankings';
import { numeroES } from '../utils/matematicas';

// Dinero en euros.
//
// La app "Money Pieces" del Math Learning Center es en dólares: allí se
// combinan piezas de un centavo y de un cuarto para ver los valores. Aquí es
// lo mismo con el euro: monedas de 1 a 50 céntimos, de 1 € y 2 €, y
// billetes de 5 a 200 €.
//
// Todas las cantidades van en formato español: 3,45 €.

const RONDAS = 8;

// Las monedas de euro, con su color de verdad.
const MONEDAS = [
  { valor: 0.01, etiqueta: '1 c', color: '#b87333', texto: '#ffffff' },
  { valor: 0.02, etiqueta: '2 c', color: '#b87333', texto: '#ffffff' },
  { valor: 0.05, etiqueta: '5 c', color: '#b87333', texto: '#ffffff' },
  { valor: 0.1, etiqueta: '10 c', color: '#d9b310', texto: '#0b2b45' },
  { valor: 0.2, etiqueta: '20 c', color: '#d9b310', texto: '#0b2b45' },
  { valor: 0.5, etiqueta: '50 c', color: '#d9b310', texto: '#0b2b45' },
  { valor: 1, etiqueta: '1 €', color: '#c3c9cf', texto: '#0b2b45' },
  { valor: 2, etiqueta: '2 €', color: '#d9b310', texto: '#0b2b45' },
];

// Los billetes de euro, con el color que tienen de verdad.
const BILLETES = [
  { valor: 5, etiqueta: '5 €', color: '#b5b9b4' },
  { valor: 10, etiqueta: '10 €', color: '#d4655a' },
  { valor: 20, etiqueta: '20 €', color: '#4a83b0' },
  { valor: 50, etiqueta: '50 €', color: '#e08b2e' },
  { valor: 100, etiqueta: '100 €', color: '#5b9e6f' },
  { valor: 200, etiqueta: '200 €', color: '#d9b310' },
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

// El dinero en castellano: coma para los céntimos y el euro detrás.
const euros = (valor) => `${numeroES(Math.round(valor * 100) / 100)} €`;

// --- Estilos --------------------------------------------------------------

const Moneda = styled.div`
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: ${(props) => props.$color};
  border: 3px solid rgba(11, 43, 69, 0.35);
  color: ${(props) => props.$texto};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.95rem;
  box-shadow: 0 3px 8px rgba(11, 43, 69, 0.22);
`;

const Billete = styled.div`
  padding: 0.55rem 0.9rem;
  border-radius: 8px;
  background: ${(props) => props.$color};
  border: 2px solid rgba(11, 43, 69, 0.3);
  color: #0b2b45;
  font-weight: 800;
  font-size: 1.05rem;
  box-shadow: 0 3px 8px rgba(11, 43, 69, 0.18);
  min-width: 78px;
  text-align: center;
`;

const Fila = styled.div`
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`;

const Ticket = styled.div`
  background: #fffdf5;
  border: 2px dashed rgba(11, 43, 69, 0.25);
  border-radius: 14px;
  padding: 0.8rem 1.6rem;
  text-align: center;
  color: ${NAVY};

  span {
    display: block;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #7d93a5;
  }

  strong {
    font-size: 1.9rem;
    font-weight: 900;
  }
`;

// --- Las piezas de dinero --------------------------------------------------

// Una moneda suelta o un billete suelto.
const Pieza = ({ tipo, indice }) => {
  if (tipo === 'moneda') {
    const m = MONEDAS[indice];
    return <Moneda $color={m.color} $texto={m.texto}>{m.etiqueta}</Moneda>;
  }
  const b = BILLETES[indice];
  return <Billete $color={b.color}>{b.etiqueta}</Billete>;
};

// --- Rondas ---------------------------------------------------------------

// 1. ¿Cuánto dinero hay?
const rondaCuanto = () => {
  const piezas = [];
  const total = rnd(2, 7);
  let suma = 0;
  for (let i = 0; i < total; i++) {
    if (Math.random() < 0.25) {
      const b = BILLETES[rnd(0, BILLETES.length - 1)];
      piezas.push({ tipo: 'billete', indice: BILLETES.indexOf(b) });
      suma += b.valor;
    } else {
      const m = MONEDAS[rnd(0, MONEDAS.length - 1)];
      piezas.push({ tipo: 'moneda', indice: MONEDAS.indexOf(m) });
      suma += m.valor;
    }
  }
  const correcta = Math.round(suma * 100) / 100;
  return {
    tipo: 'cuanto',
    enunciado: '¿Cuánto dinero hay en total?',
    ayuda: 'Suma las monedas y los billetes. ¡Cuidado con los céntimos!',
    piezas,
    opciones: revuelto([
      correcta,
      Math.round((correcta + 0.5) * 100) / 100,
      Math.max(0.01, Math.round((correcta - 0.5) * 100) / 100),
      Math.round((correcta + 1) * 100) / 100,
    ]),
    correcta,
    explicacion: `En total hay ${euros(correcta)}.`,
  };
};

// 2. ¿Cuánto te devuelven?
const rondaCambio = () => {
  const pagador = BILLETES[rnd(0, 2)]; // 5, 10 o 20 €
  const entero = rnd(1, pagador.valor - 1);
  const precio = Math.random() < 0.5 ? entero : entero + 0.5;
  const cambio = Math.round((pagador.valor - precio) * 100) / 100;
  return {
    tipo: 'cambio',
    enunciado: `Pagas ${euros(pagador.valor)} y el objeto cuesta ${euros(precio)}. ¿Cuánto te devuelven?`,
    ayuda: 'Lo que pagas menos lo que cuesta es el cambio.',
    piezas: [{ tipo: 'billete', indice: BILLETES.indexOf(pagador) }],
    opciones: revuelto([
      cambio,
      Math.round((cambio + 1) * 100) / 100,
      Math.max(0.01, Math.round((cambio - 0.5) * 100) / 100),
      Math.round((cambio + 2) * 100) / 100,
    ]),
    correcta: cambio,
    explicacion: `${euros(pagador.valor)} menos ${euros(precio)} son ${euros(cambio)}.`,
  };
};

// 3. ¿Con qué monedas pagas? La idea de "combinar piezas" de la app original.
const rondaMonedas = () => {
  const monedas = MONEDAS.filter((m) => m.valor <= 2);
  const elegidas = [];
  const usadas = new Set();
  const cuantas = rnd(2, 3);
  let total = 0;
  for (let i = 0; i < cuantas; i++) {
    const m = monedas[rnd(0, monedas.length - 1)];
    if (usadas.has(m.valor)) {
      i--;
      continue;
    }
    usadas.add(m.valor);
    elegidas.push(m);
    total += m.valor;
  }

  const texto = (lista) => lista.map((m) => m.etiqueta).join(' + ');
  const correcta = texto(elegidas);

  // Los distractores son combinaciones parecidas: se cambia una moneda por
  // otra del mismo tipo, que es el error típico.
  const otras = [];
  for (let i = 0; i < elegidas.length && otras.length < 3; i++) {
    const cambio = monedas.find((m) => m.valor !== elegidas[i].valor);
    const copia = [...elegidas];
    copia[i] = cambio;
    const candidato = texto(copia);
    if (candidato !== correcta && !otras.includes(candidato)) otras.push(candidato);
  }

  return {
    tipo: 'monedas',
    enunciado: '¿Con qué monedas pagas el ticket?',
    ayuda: 'Elige las monedas que sumen exactamente el precio del ticket.',
    piezas: [],
    ticket: total,
    opciones: revuelto([correcta, ...otras]),
    correcta,
    texto: true,
    explicacion: `${correcta} son ${euros(total)}.`,
  };
};

const crearRondas = () => {
  const rondas = [];
  for (let i = 0; i < RONDAS; i++) {
    const generador = [rondaCuanto, rondaCambio, rondaMonedas][i % 3];
    rondas.push(generador());
  }
  return rondas;
};

// --- Juego ----------------------------------------------------------------

const DineroGame = ({ onBack }) => {
  const gameKey = 'dinero';
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
        titulo="💶 Dinero en euros"
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
            {ronda.ticket != null ? (
              <Ticket>
                <span>Ticket de compra</span>
                <strong>{euros(ronda.ticket)}</strong>
              </Ticket>
            ) : (
              <Fila>
                {ronda.piezas.map((p, i) => (
                  <Pieza key={i} tipo={p.tipo} indice={p.indice} />
                ))}
              </Fila>
            )}
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
                {ronda.texto ? opcion : euros(opcion)}
              </Opcion>
            ))}
          </Opciones>

          <Feedback
            aria-live="polite"
            $color={respondida ? (elegida === ronda.correcta ? VERDE : ROJO) : '#5b7286'}
          >
            {respondida ? (elegida === ronda.correcta ? '¡Correcto! 🎉' : `La respuesta correcta era ${ronda.texto ? ronda.correcta : euros(ronda.correcta)}.`) : ''}
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

export default DineroGame;
