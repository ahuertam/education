import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Accion,
  Ayuda,
  BarraJuego,
  Campo,
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
import styled from 'styled-components';
import { FaCheck } from 'react-icons/fa';
import { productosParciales } from '../utils/matematicas';
import { loadGameRanking, recordGameRun, updateGameBestStreak } from '../utils/rankings';

// Buscador de Productos Parciales.
//
// La idea viene de la app "Partial Product Finder" del Math Learning Center:
// la multiplicación se ve como un rectángulo partido en dos (las decenas
// por un lado, las unidades por otro) y el resultado es la suma de las dos
// partes. Aquí es un juego de rondas: hay que leer el modelo, calcular los
// productos parciales y saber el total.

const TEAL = '#12b3b0';
const NARANJA = '#ff8a2a';
const NAVY = '#0b2b45';
const VERDE = '#2e9e5b';
const ROJO = '#e05555';
const RONDAS = 10;

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const revuelto = (lista) => {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// --- Estilos --------------------------------------------------------------

const Cuenta = styled.div`
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: clamp(1.1rem, 3.4vw, 1.7rem);
  line-height: 1.35;
  padding: 0.9rem 1.2rem;
  background: #f7fafc;
  border-radius: 16px;
  border: 1px solid rgba(11, 43, 69, 0.08);
  display: inline-block;
  text-align: right;
`;

const Linea = styled.div`
  white-space: pre;
  color: ${(props) => props.$color || NAVY};
  font-weight: ${(props) => (props.$negrita ? 800 : 500)};
`;

const FilaCampo = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
`;

// --- Vistas ---------------------------------------------------------------

// El modelo de área: un rectángulo partido en la parte de las decenas y la
// de las unidades. Las líneas horizontales insinúan las filas del multiplicador.
// Debajo, la leyenda con el reparto exacto, que si no el niño no ve cuántos
// son cuando la parte de las unidades es una astilla.
const ModeloArea = ({ decenas, unidades, b }) => {
  const total = decenas * 10 + unidades;
  const ancho = 320;
  const anchoTeal = total ? (ancho * (decenas * 10)) / total : 0;
  const alto = 96;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <svg
        viewBox="0 0 340 120"
        style={{ width: 'min(340px, 80vw)', height: 'auto' }}
        role="img"
        aria-label={`Rectángulo dividido en ${decenas * 10} y ${unidades} partes, con ${b} filas`}
      >
        <rect x={0} y={0} width={anchoTeal} height={alto} fill={TEAL} opacity="0.9" rx="6" />
        <rect x={anchoTeal} y={0} width={ancho - anchoTeal} height={alto} fill={NARANJA} opacity="0.95" rx="6" />
        {Array.from({ length: b }, (_, i) => (
          <line
            key={i}
            x1={0}
            y1={((i + 1) * alto) / b}
            x2={ancho}
            y2={((i + 1) * alto) / b}
            stroke="rgba(11,43,69,0.28)"
            strokeWidth="1"
          />
        ))}
        {anchoTeal > 46 && (
          <text x={anchoTeal / 2} y={alto / 2 + 6} textAnchor="middle" fill="#ffffff" fontWeight="800" fontSize="17">
            {decenas * 10}
          </text>
        )}
        {ancho - anchoTeal > 34 && (
          <text x={anchoTeal + (ancho - anchoTeal) / 2} y={alto / 2 + 6} textAnchor="middle" fill="#ffffff" fontWeight="800" fontSize="17">
            {unidades}
          </text>
        )}
      </svg>
      <div style={{ display: 'flex', gap: '1.1rem', fontWeight: 800, fontSize: '1rem' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: TEAL, display: 'inline-block' }} />
          {decenas * 10}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: NARANJA, display: 'inline-block' }} />
          {unidades}
        </span>
      </div>
    </div>
  );
};

// La cuenta vertical al estilo de la libreta. Los dos productos parciales
// van alineados a la derecha (cada uno en su columna) y en color: el de las
// decenas en teal y el de las unidades en naranja, como el rectángulo de
// arriba.
const CuentaVertical = ({ a, b, pDecenas, pUnidades, total, ocultarTotal, ocultarParte }) => {
  const W = String(a).length + 2;
  const separador = '─'.repeat(W);
  const filas = [
    { t: String(a).padStart(W) },
    { t: `× ${String(b).padStart(W - 2)}` },
    { t: separador },
    ocultarParte === 'decenas'
      ? { t: '?'.padStart(W), color: TEAL }
      : { t: String(pDecenas).padStart(W), color: TEAL },
    ocultarParte === 'unidades'
      ? { t: '?'.padStart(W), color: NARANJA }
      : { t: String(pUnidades).padStart(W), color: NARANJA },
    { t: separador },
    ocultarTotal
      ? { t: '?'.padStart(W), negrita: true }
      : { t: String(total).padStart(W), negrita: true },
  ];
  return (
    <Cuenta role="img" aria-label={`${a} por ${b} igual a ${total}`}>
      {filas.map((f, i) => (
        <Linea key={i} $color={f.color} $negrita={f.negrita}>{f.t}</Linea>
      ))}
    </Cuenta>
  );
};

// --- Generación de rondas ------------------------------------------------

// El multiplicador sale de las tablas que el niño eligió en la configuración
// (las de una cifra); si no hay ninguna, se usa el rango del propio juego.
const generarCuenta = (multiplicationConfig) => {
  const elegidas = (multiplicationConfig?.tables || []).filter((t) => t >= 2 && t <= 9);
  const b = elegidas.length ? elegidas[rnd(0, elegidas.length - 1)] : rnd(2, 9);
  const a = rnd(11, 99);
  return { a, b };
};

const opcionesNumericas = (correcto, candidatas) => {
  const vistas = new Set([String(correcto)]);
  const out = [correcto];
  for (const c of candidatas) {
    if (out.length >= 4) break;
    if (!Number.isFinite(c) || c <= 0 || vistas.has(String(c))) continue;
    vistas.add(String(c));
    out.push(c);
  }
  let intentos = 0;
  while (out.length < 3 && intentos < 40) {
    intentos++;
    const c = correcto + rnd(-20, 20);
    if (c <= 0 || vistas.has(String(c))) continue;
    vistas.add(String(c));
    out.push(c);
  }
  return revuelto(out);
};

// ¿Cuánto vale el total?
const rondaTotal = (a, b) => {
  const { pDecenas, pUnidades, total } = productosParciales(a, b);
  return {
    tipo: 'total',
    enunciado: `¿Cuánto vale ${a} × ${b}?`,
    ayuda: 'Divide el rectángulo en la parte de las decenas y la de las unidades, y suma las dos partes.',
    cuenta: { a, b, pDecenas, pUnidades, total },
    modelo: { decenas: Math.floor(a / 10), unidades: a % 10, b },
    opciones: opcionesNumericas(total, [
      a * (b + 1),
      (a - 1) * b,
      a * b + Math.floor(a / 10),
      pDecenas,
      pUnidades,
    ]),
    correcta: total,
    explicacion: `${Math.floor(a / 10)}0 × ${b} = ${pDecenas} y ${a % 10} × ${b} = ${pUnidades}. Sumando: ${pDecenas} + ${pUnidades} = ${total}.`,
  };
};

// ¿Cuánto vale una de las dos partes?
const rondaParcial = (a, b) => {
  const { decenas, unidades, pDecenas, pUnidades, total } = productosParciales(a, b);
  const parte = Math.random() < 0.5 ? 'decenas' : 'unidades';
  const correcto = parte === 'decenas' ? pDecenas : pUnidades;
  const enunciado = parte === 'decenas'
    ? `En ${a} × ${b}, ¿cuánto vale ${decenas}0 × ${b}?`
    : `En ${a} × ${b}, ¿cuánto vale ${unidades} × ${b}?`;
  return {
    tipo: 'parcial',
    enunciado,
    ayuda: parte === 'decenas'
      ? 'Es la parte grande del rectángulo: las decenas multiplicadas por el otro número.'
      : 'Es la parte pequeña del rectángulo: las unidades multiplicadas por el otro número.',
    cuenta: { a, b, pDecenas, pUnidades, total, ocultarParte: parte },
    modelo: { decenas, unidades, b },
    opciones: opcionesNumericas(correcto, [
      parte === 'decenas' ? pUnidades : pDecenas,
      total,
      correcto + 10,
      correcto - 10,
    ]),
    correcta: correcto,
    explicacion: parte === 'decenas'
      ? `${decenas}0 × ${b} = ${correcto}.`
      : `${unidades} × ${b} = ${correcto}.`,
  };
};

// El niño escribe el resultado.
const rondaEscribe = (a, b) => {
  const { pDecenas, pUnidades, total } = productosParciales(a, b);
  return {
    tipo: 'escribe',
    enunciado: `Escribe el resultado de ${a} × ${b}`,
    ayuda: 'Primero calcula los dos productos parciales y luego súmalos.',
    cuenta: { a, b, pDecenas, pUnidades, total, ocultarTotal: true },
    modelo: { decenas: Math.floor(a / 10), unidades: a % 10, b },
    opciones: null,
    correcta: total,
    explicacion: `${Math.floor(a / 10)}0 × ${b} = ${pDecenas} y ${a % 10} × ${b} = ${pUnidades}. Sumando: ${total}.`,
  };
};

// Estimación: se redondea a la decena antes de multiplicar.
const rondaEstima = (a, b) => {
  const decenaA = Math.round(a / 10) * 10;
  const decenaB = Math.round(b / 10) * 10;
  const bRedondeado = decenaB === 0 ? 10 : decenaB;
  const estimado = decenaA * bRedondeado;
  const { pDecenas, pUnidades, total } = productosParciales(a, b);
  return {
    tipo: 'estima',
    enunciado: `¿Cuánto vale ${a} × ${b}, aproximadamente?`,
    ayuda: `Redondea ${a} a la decena (${decenaA}) y multiplica.`,
    cuenta: { a, b, pDecenas, pUnidades, total },
    modelo: { decenas: Math.floor(a / 10), unidades: a % 10, b },
    opciones: opcionesNumericas(estimado, [total, estimado + 10, estimado - 10, decenaA * b]),
    correcta: estimado,
    explicacion: `Redondeando ${a} a ${decenaA}, el resultado se parece a ${estimado}. El exacto es ${total}.`,
  };
};

const crearRondas = (multiplicationConfig) => {
  const rondas = [];
  for (let i = 0; i < RONDAS; i++) {
    const { a, b } = generarCuenta(multiplicationConfig);
    const generador = [rondaTotal, rondaParcial, rondaEscribe, rondaEstima][i % 4];
    rondas.push(generador(a, b));
  }
  return rondas;
};

// --- Juego ----------------------------------------------------------------

const ProductosParcialesGame = ({ onBack, multiplicationConfig }) => {
  const gameKey = 'productosparciales';
  const [rondas, setRondas] = useState(() => crearRondas(multiplicationConfig));
  const [indice, setIndice] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [texto, setTexto] = useState('');
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
    anotar(Number(opcion) === ronda.correcta);
  };

  const enviar = (e) => {
    e.preventDefault();
    if (respondida || !ronda) return;
    const valor = parseInt(texto.replace(/\s/g, ''), 10);
    setElegida(Number.isNaN(valor) ? 'sin respuesta' : valor);
    anotar(valor === ronda.correcta);
  };

  const siguiente = () => {
    if (indice + 1 >= rondas.length) {
      setTerminada(true);
      return;
    }
    setIndice((i) => i + 1);
    setElegida(null);
    setTexto('');
  };

  const reiniciar = () => {
    setRondas(crearRondas(multiplicationConfig));
    setIndice(0);
    setPuntos(0);
    setRacha(0);
    setAciertos(0);
    setElegida(null);
    setTexto('');
    setTerminada(false);
    mejorRachaRef.current = 0;
    registradaRef.current = false;
  };

  const acertada = respondida && Number(elegida) === ronda?.correcta;

  return (
    <Page>
      <BarraJuego
        onBack={onBack}
        titulo="🧱 Buscador de Productos Parciales"
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
            <ModeloArea
              decenas={ronda.modelo.decenas}
              unidades={ronda.modelo.unidades}
              b={ronda.modelo.b}
            />
            <CuentaVertical {...ronda.cuenta} />
          </Visual>

          {ronda.opciones ? (
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
                  {valor}
                </Opcion>
              ))}
            </Opciones>
          ) : (
            <FilaCampo onSubmit={enviar}>
              <Campo
                type="text"
                inputMode="numeric"
                autoFocus
                value={texto}
                disabled={respondida}
                $fallo={respondida && !acertada}
                aria-label="Resultado de la multiplicación"
                placeholder="?"
                onChange={(e) => setTexto(e.target.value)}
              />
              <Accion type="submit" disabled={respondida}>
                Comprobar
              </Accion>
            </FilaCampo>
          )}

          <Feedback aria-live="polite" $color={respondida ? (acertada ? VERDE : ROJO) : '#5b7286'}>
            {respondida
              ? (acertada ? '¡Correcto! 🎉' : `¡Casi! La respuesta correcta era ${ronda.correcta}.`)
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

export default ProductosParcialesGame;
