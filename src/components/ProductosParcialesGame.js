import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaCheck, FaRedo, FaTrophy } from 'react-icons/fa';
import { productosParciales } from '../utils/matematicas';
import {
  formatRankDate, loadGameRanking, recordGameRun, updateGameBestStreak,
} from '../utils/rankings';

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

const Page = styled.div`
  min-height: 100vh;
  padding: 1rem 1rem 3rem;
  font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;
  color: ${NAVY};
  background:
    radial-gradient(900px 500px at 12% 0%, rgba(255, 138, 42, 0.16), transparent 60%),
    radial-gradient(800px 500px at 92% 8%, rgba(18, 179, 176, 0.18), transparent 60%),
    linear-gradient(160deg, #fffaf4 0%, #ffffff 55%, #f1fbfb 100%);
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
  align-items: center;
  gap: 1.4rem;
  margin: 0.4rem 0 1.4rem;
  flex-wrap: wrap;
`;

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

const Campo = styled.input`
  font: inherit;
  font-size: 1.8rem;
  font-weight: 800;
  text-align: center;
  width: min(260px, 70vw);
  padding: 0.6rem 0.8rem;
  border-radius: 16px;
  border: 3px solid ${(props) => (props.$fallo ? ROJO : TEAL)};
  color: ${NAVY};
  background: #f7fafc;
`;

const FilaCampo = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
`;

const Feedback = styled.p`
  margin: 1.2rem 0 0;
  text-align: center;
  font-weight: 800;
  font-size: 1.05rem;
  min-height: 1.6rem;
  color: ${(props) => (props.$fallo ? ROJO : VERDE)};
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
  background: linear-gradient(90deg, ${NARANJA}, ${TEAL});
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
      <TopBar>
        <Volver type="button" onClick={onBack}>
          <FaArrowLeft /> Volver
        </Volver>
        <Titulo>🧱 Buscador de Productos Parciales</Titulo>
        <Pastilla>Ronda {Math.min(indice + 1, RONDAS)}/{RONDAS}</Pastilla>
        <Pastilla $tono={NARANJA}>Puntos: {puntos}</Pastilla>
        <Pastilla $tono={racha > 0 ? TEAL : undefined}>Racha: {racha}</Pastilla>
      </TopBar>

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

          <Feedback aria-live="polite" $fallo={respondida && !acertada}>
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
        <Tarjeta>
          <Enunciado>¡Partida terminada!</Enunciado>
          <Ayuda>
            Acertaste {aciertos} de {RONDAS} rondas. Tu mejor racha: {mejorRachaRef.current}.
          </Ayuda>
          <Visual>
            <Pastilla $tono={NARANJA}>Puntos: {puntos}</Pastilla>
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

export default ProductosParcialesGame;
