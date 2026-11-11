import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Accion,
  Ayuda,
  BarraJuego,
  Campo,
  CampoGrupo,
  Campos,
  Enunciado,
  Explicacion,
  Feedback,
  NumeroGrande,
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
import { baseDiez, componerBaseDiez, numeroES, redondear } from '../utils/matematicas';
import { loadGameRanking, recordGameRun, updateGameBestStreak } from '../utils/rankings';

// Base Diez.
//
// Viene de las apps "Number Pieces", "Number Frames" y "Number Rack" del Math
// Learning Center: un número se construye con piezas de base diez y así se ve
// de dónde sale cada cifra. Aquí son cuatro rondas:
//
//   lee        → qué número forman las piezas
//   descompone → escribir centenas, decenas y unidades de un número
//   compara    → qué número es mayor
//   redondea   → a qué decena o centena se acerca
//
// Las piezas se dibujan con un patrón SVG: un bloque de 100 es un cuadrado
// rayado en 10×10 y una barra de 10 es una columna de 10 casillas. Pinta igual
// que la libreta del niño y no son 900 rectos.

const TEAL = '#12b3b0';
const NARANJA = '#ff8a2a';
const NAVY = '#0b2b45';
const VERDE = '#2e9e5b';
const ROJO = '#e05555';
const RONDAS = 10;
const CELDA = 10;

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

const MesaLeyenda = styled.div`
  text-align: center;
  font-weight: 800;
  font-size: 1.35rem;
  margin-top: 0.4rem;
`;

// --- La mesa de valor posicional -----------------------------------------

const COLOR_CIEN = '#845ef7';
const COLOR_DIEZ = TEAL;
const COLOR_UNO = NARANJA;

// Bloque de 100: un cuadrado con la cuadrícula de 10×10.
const BloqueCien = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x={0} y={0} width={CELDA * 10} height={CELDA * 10} fill={COLOR_CIEN} rx="2" />
    <rect x={0} y={0} width={CELDA * 10} height={CELDA * 10} fill="url(#cuadricula-base-diez)" rx="2" />
    <rect x={0} y={0} width={CELDA * 10} height={CELDA * 10} fill="none" stroke={NAVY} strokeWidth="1" rx="2" />
  </g>
);

// Barra de 10: una columna de 10 casillas.
const BarraDiez = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x={0} y={0} width={CELDA} height={CELDA * 10} fill={COLOR_DIEZ} rx="2" />
    <rect x={0} y={0} width={CELDA} height={CELDA * 10} fill="url(#cuadricula-base-diez)" rx="2" />
    <rect x={0} y={0} width={CELDA} height={CELDA * 10} fill="none" stroke={NAVY} strokeWidth="1" rx="2" />
  </g>
);

// Cubo de 1.
const Cubo = ({ x, y }) => (
  <rect
    x={x}
    y={y}
    width={CELDA}
    height={CELDA}
    fill={COLOR_UNO}
    stroke={NAVY}
    strokeWidth="1"
    rx="1.5"
  />
);

// Una columna de la mesa: los bloques y, debajo, el nombre de la posición.
const Columna = ({ titulo, ancho, alto, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}>
    <div style={{ minWidth: ancho, display: 'flex', justifyContent: 'center' }}>
      <svg
        width={ancho}
        height={alto}
        viewBox={`0 0 ${ancho} ${alto}`}
        style={{ maxWidth: '100%', height: 'auto' }}
        aria-hidden="true"
      >
        {children}
      </svg>
    </div>
    {titulo && (
      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#5b7286', whiteSpace: 'nowrap' }}>
        {titulo}
      </div>
    )}
  </div>
);

// La cuadrícula de 10×10 con la que se rayan los bloques de 100 y las barras
// de 10. Es un patrón, así que un bloque de 100 son dos rectos y no cien.
const Cuadricula = () => (
  <defs>
    <pattern id="cuadricula-base-diez" width={CELDA} height={CELDA} patternUnits="userSpaceOnUse">
      <path
        d={`M ${CELDA} 0 L 0 0 0 ${CELDA}`}
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="0.9"
      />
    </pattern>
  </defs>
);

// La mesa entera: columnas de centenas, decenas y unidades, todas apoyadas en
// la misma base para que se lean como una tabla de valor posicional.
const Mesa = ({ partes, titulos = true }) => {
  const { centenas, decenas, unidades } = partes;
  const porFila = 4;
  const filasCien = Math.ceil(centenas / porFila);
  const anchoCien = Math.min(centenas, porFila) * CELDA * 10;
  const anchoDiez = decenas * CELDA;
  const anchoUno = unidades * CELDA;
  const alto = Math.max(filasCien * CELDA * 10, CELDA * 10, CELDA);

  return (
    <div
      style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-end', justifyContent: 'center' }}
      role="img"
      aria-label={`${centenas} centenas, ${decenas} decenas y ${unidades} unidades`}
    >
      <Columna titulo={titulos ? 'Centenas' : ''} ancho={Math.max(anchoCien, CELDA)} alto={alto}>
        <Cuadricula />
        {Array.from({ length: centenas }, (_, i) => (
          <BloqueCien
            key={`c${i}`}
            x={(i % porFila) * CELDA * 10}
            y={alto - (filasCien - Math.floor(i / porFila)) * CELDA * 10}
          />
        ))}
      </Columna>

      <Columna titulo={titulos ? 'Decenas' : ''} ancho={Math.max(anchoDiez, CELDA)} alto={alto}>
        <Cuadricula />
        {Array.from({ length: decenas }, (_, i) => (
          <BarraDiez key={`d${i}`} x={i * CELDA} y={alto - CELDA * 10} />
        ))}
      </Columna>

      <Columna titulo={titulos ? 'Unidades' : ''} ancho={Math.max(anchoUno, CELDA)} alto={alto}>
        {Array.from({ length: unidades }, (_, i) => (
          <Cubo key={`u${i}`} x={i * CELDA} y={alto - CELDA} />
        ))}
      </Columna>
    </div>
  );
};

// --- Generación de rondas ------------------------------------------------

const opcionesDesde = (correcto, candidatas) => {
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
    const c = correcto + rnd(-40, 40);
    if (c < 0 || vistas.has(String(c))) continue;
    vistas.add(String(c));
    out.push(c);
  }
  return revuelto(out);
};

// ¿Qué número forman las piezas?
const rondaLee = () => {
  const centenas = rnd(0, 4);
  const decenas = rnd(0, 9);
  const unidades = rnd(0, 9);
  const partes = { centenas, decenas, unidades };
  const numero = componerBaseDiez(partes);
  return {
    tipo: 'lee',
    enunciado: '¿Qué número forman estas piezas?',
    ayuda: 'Cada bloque grande son 100, cada barra son 10 y cada cubito es 1.',
    mesa: partes,
    opciones: opcionesDesde(numero, [
      numero + 10,
      numero - 10,
      numero + 100,
      numero - 100,
      numero + 1,
    ]),
    correcta: numero,
    explicacion: `${centenas} centenas, ${decenas} decenas y ${unidades} unidades: ${numeroES(numero)}.`,
  };
};

// Escribir las partes de un número.
const rondaDescompone = () => {
  const numero = rnd(10, 999);
  const partes = baseDiez(numero);
  return {
    tipo: 'descompone',
    enunciado: `Escribe ${numeroES(numero)} con centenas, decenas y unidades`,
    ayuda: 'Piensa qué cifra va en cada columna.',
    mesa: null,
    numero,
    opciones: null,
    correcta: numero,
    explicacion: `${numeroES(numero)} = ${partes.centenas} centenas + ${partes.decenas} decenas + ${partes.unidades} unidades.`,
  };
};

// ¿Cuál de los dos números es mayor?
const rondaCompara = () => {
  const a = rnd(10, 299);
  const b = rnd(10, 299);
  const iguales = a === b;
  const correcta = a > b ? a : b;
  return {
    tipo: 'compara',
    enunciado: '¿Qué número es mayor?',
    ayuda: 'Compara primero las centenas y, si empatan, las decenas.',
    mesa: null,
    mesas: [baseDiez(a), baseDiez(b)],
    numeros: [a, b],
    opciones: opcionesDesde(correcta, [a, b, correcta + 1]),
    correcta,
    explicacion: iguales
      ? `Los dos números valen ${numeroES(a)}.`
      : `${numeroES(a > b ? a : b)} es mayor que ${numeroES(a > b ? b : a)}.`,
  };
};

// Redondear a la decena o a la centena.
const rondaRedondea = () => {
  const centena = Math.random() < 0.5;
  const numero = rnd(101, 499);
  const correcto = redondear(numero, centena ? 2 : 1);
  return {
    tipo: 'redondea',
    enunciado: centena
      ? `¿A qué centena se acerca más ${numeroES(numero)}?`
      : `¿A qué decena se acerca más ${numeroES(numero)}?`,
    ayuda: centena
      ? 'Mira la cifra de las decenas: si es 5 o más, sube a la centena siguiente.'
      : 'Mira la cifra de las unidades: si es 5 o más, sube a la decena siguiente.',
    mesa: baseDiez(numero),
    opciones: opcionesDesde(correcto, [
      correcto + (centena ? 100 : 10),
      correcto - (centena ? 100 : 10),
      numero,
    ]),
    correcta: correcto,
    explicacion: centena
      ? `${numeroES(numero)} se acerca más a ${numeroES(correcto)}.`
      : `${numeroES(numero)} se acerca más a ${numeroES(correcto)}.`,
  };
};

const crearRondas = () => {
  const rondas = [];
  for (let i = 0; i < RONDAS; i++) {
    const generador = [rondaLee, rondaDescompone, rondaCompara, rondaRedondea][i % 4];
    rondas.push(generador());
  }
  return rondas;
};

// --- Juego ----------------------------------------------------------------

const BaseDiezGame = ({ onBack }) => {
  const gameKey = 'basediez';
  const [rondas, setRondas] = useState(() => crearRondas());
  const [indice, setIndice] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [campos, setCampos] = useState({ c: '', d: '', u: '' });
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

  const responder = (valor) => {
    if (respondida || !ronda) return;
    setElegida(valor);
    anotar(Number(valor) === ronda.correcta);
  };

  const enviar = (e) => {
    e.preventDefault();
    if (respondida || !ronda) return;
    const c = parseInt(campos.c, 10);
    const d = parseInt(campos.d, 10);
    const u = parseInt(campos.u, 10);
    const ok = Number.isFinite(c) && Number.isFinite(d) && Number.isFinite(u)
      && componerBaseDiez({ centenas: c, decenas: d, unidades: u }) === ronda.correcta;
    setElegida(ok ? ronda.correcta : 'mal');
    anotar(ok);
  };

  const siguiente = () => {
    if (indice + 1 >= rondas.length) {
      setTerminada(true);
      return;
    }
    setIndice((i) => i + 1);
    setElegida(null);
    setCampos({ c: '', d: '', u: '' });
  };

  const reiniciar = () => {
    setRondas(crearRondas());
    setIndice(0);
    setPuntos(0);
    setRacha(0);
    setAciertos(0);
    setElegida(null);
    setCampos({ c: '', d: '', u: '' });
    setTerminada(false);
    mejorRachaRef.current = 0;
    registradaRef.current = false;
  };

  const acertada = respondida && ronda && Number(elegida) === ronda.correcta;

  return (
    <Page>
      <BarraJuego
        onBack={onBack}
        titulo="🧱 Base Diez"
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
            {ronda.mesas ? (
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {ronda.mesas.map((partes, i) => (
                  <div key={i}>
                    <Mesa partes={partes} titulos={false} />
                    <MesaLeyenda>{numeroES(ronda.numeros[i])}</MesaLeyenda>
                  </div>
                ))}
              </div>
            ) : ronda.numero != null ? (
              <NumeroGrande>{numeroES(ronda.numero)}</NumeroGrande>
            ) : (
              <Mesa partes={ronda.mesa} />
            )}
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
                  {numeroES(valor)}
                </Opcion>
              ))}
            </Opciones>
          ) : (
            <Campos onSubmit={enviar}>
              <CampoGrupo>
                Centenas
                <Campo
                  type="text"
                  inputMode="numeric"
                  value={campos.c}
                  disabled={respondida}
                  $fallo={respondida && !acertada}
                  aria-label="Centenas"
                  onChange={(e) => setCampos((v) => ({ ...v, c: e.target.value }))}
                />
              </CampoGrupo>
              <CampoGrupo>
                Decenas
                <Campo
                  type="text"
                  inputMode="numeric"
                  value={campos.d}
                  disabled={respondida}
                  $fallo={respondida && !acertada}
                  aria-label="Decenas"
                  onChange={(e) => setCampos((v) => ({ ...v, d: e.target.value }))}
                />
              </CampoGrupo>
              <CampoGrupo>
                Unidades
                <Campo
                  type="text"
                  inputMode="numeric"
                  value={campos.u}
                  disabled={respondida}
                  $fallo={respondida && !acertada}
                  aria-label="Unidades"
                  onChange={(e) => setCampos((v) => ({ ...v, u: e.target.value }))}
                />
              </CampoGrupo>
              <Accion type="submit" disabled={respondida}>
                Comprobar
              </Accion>
            </Campos>
          )}

          <Feedback aria-live="polite" $color={respondida ? (acertada ? VERDE : ROJO) : '#5b7286'}>
            {respondida
              ? (acertada
                ? '¡Correcto! 🎉'
                : `¡Casi! La respuesta correcta era ${numeroES(ronda.correcta)}.`)
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

export default BaseDiezGame;
