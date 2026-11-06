import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaCheck } from 'react-icons/fa';
import { areaPoligono, perimetroPoligono } from '../utils/matematicas';
import {
  loadGameRanking, recordGameRun, updateGameBestStreak,
} from '../utils/rankings';
import {
  Page, Tarjeta, Enunciado, Ayuda, Visual, Opciones, Opcion, Feedback,
  Explicacion, Accion, Progreso, ProgresoBarra, BarraJuego, PantallaFinal,
  NARANJA, NAVY, VERDE, ROJO,
} from './ui/JuegoBase';

// El Geoboard.
//
// Viene de la app "Geoboard" del Math Learning Center: una rejilla de clavos
// con gomas elásticas que se estiran entre ellos. Aquí las gomas las pone el
// niño en tres de las cuatro rondas (elegir, medir y construir) y en la
// cuarta figura ya la tiene hecha y hay que descifrarla.
//
// La rejilla va de 0 a 5 en cada eje, así que cada casilla es una unidad.

const LADO = 5; // clavos por lado (0..4 son 5 líneas, 4 casillas)
const RONDAS = 8;
const CELDA = 76;

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

const Rejilla = styled.div`
  background: #f7fafc;
  border-radius: 18px;
  border: 1px solid rgba(11, 43, 69, 0.08);
  padding: 0.6rem;
  position: relative;
`;

const Goma = styled.div`
  position: absolute;
  height: 14px;
  background: linear-gradient(180deg, #2dd4bf, #0d9488);
  border-radius: 8px;
  transform-origin: 0 50%;
  box-shadow: 0 2px 6px rgba(11, 43, 69, 0.25);
  pointer-events: none;
`;

const Clavo = styled.button`
  position: absolute;
  width: 26px;
  height: 26px;
  margin: -13px 0 0 -13px;
  border-radius: 50%;
  border: 3px solid ${NAVY};
  background: ${(props) => (props.$activo ? NARANJA : '#ffffff')};
  cursor: pointer;
  padding: 0;
  transition: transform 0.12s ease;

  &:hover { transform: scale(1.15); }
`;

const Leyenda = styled.div`
  display: flex;
  gap: 1.2rem;
  justify-content: center;
  font-weight: 800;
  font-size: 0.98rem;
  margin-top: 0.6rem;
  flex-wrap: wrap;
`;

const Ficha = styled.div`
  background: #f7fafc;
  border-radius: 14px;
  border: 1px solid rgba(11, 43, 69, 0.08);
  padding: 0.5rem 1rem;
  font-weight: 800;
`;

// --- La rejilla -----------------------------------------------------------

// Coordenadas de un clavo: (columna, fila) con la casilla de arriba a la
// izquierda. La casilla (0,0) es la de arriba a la izquierda.
const posicionClavo = (x, y) => ({
  izquierda: 24 + x * CELDA,
  arriba: 24 + y * CELDA,
});

// Los clavos se guardan como {x, y} pero las utilidades de geometría
// esperan [x, y].
const aLista = (puntos) => puntos.map((p) => [p.x, p.y]);

const Poligono = ({ puntos, cerrado }) => {
  if (puntos.length < 2) return null;
  const gomas = [];
  for (let i = 0; i < puntos.length - 1; i++) {
    gomas.push([puntos[i], puntos[i + 1]]);
  }
  if (cerrado && puntos.length >= 3) gomas.push([puntos[puntos.length - 1], puntos[0]]);

  return (
    <>
      {gomas.map(([a, b], i) => {
        const pa = posicionClavo(a.x, a.y);
        const pb = posicionClavo(b.x, b.y);
        const dx = pb.izquierda - pa.izquierda;
        const dy = pb.arriba - pa.arriba;
        const largo = Math.hypot(dx, dy);
        const angulo = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <Goma
            key={i}
            style={{
              left: `${pa.izquierda}px`,
              top: `${pa.arriba - 7}px`,
              width: `${largo}px`,
              transform: `rotate(${angulo}deg)`,
            }}
          />
        );
      })}
    </>
  );
};

const RejillaClavos = ({ puntos, cerrado, onClavo, ancho, alto, objetivo }) => {
  const clavos = [];
  for (let y = 0; y <= LADO - 1; y++) {
    for (let x = 0; x <= LADO - 1; x++) {
      const pos = posicionClavo(x, y);
      const activo = puntos.some((p) => p.x === x && p.y === y);
      clavos.push(
        <Clavo
          key={`${x}-${y}`}
          type="button"
          $activo={activo}
          aria-label={`Clavo ${x}, ${y}`}
          style={{ left: `${pos.izquierda}px`, top: `${pos.arriba}px` }}
          onClick={() => onClavo(x, y)}
        />
      );
    }
  }
  return (
    <Rejilla style={{ width: `${ancho}px`, height: `${alto}px` }}>
      {Array.from({ length: LADO - 1 }, (_, i) => (
        <div
          key={`v${i}`}
          style={{
            position: 'absolute',
            left: `${posicionClavo(i, 0).izquierda}px`,
            top: `${posicionClavo(0, 0).arriba}px`,
            width: 2,
            height: `${(LADO - 1) * CELDA}px`,
            background: 'rgba(11,43,69,0.13)',
          }}
        />
      ))}
      {Array.from({ length: LADO - 1 }, (_, i) => (
        <div
          key={`h${i}`}
          style={{
            position: 'absolute',
            left: `${posicionClavo(0, 0).izquierda}px`,
            top: `${posicionClavo(0, i).arriba}px`,
            width: `${(LADO - 1) * CELDA}px`,
            height: 2,
            background: 'rgba(11,43,69,0.13)',
          }}
        />
      ))}
      <Poligono puntos={puntos} cerrado={cerrado} />
      {clavos}
      {objetivo && (
        <div
          style={{
            position: 'absolute',
            right: '0.7rem',
            top: '0.5rem',
            fontWeight: 800,
            fontSize: '0.9rem',
            color: '#5b7286',
          }}
        >
          {objetivo}
        </div>
      )}
    </Rejilla>
  );
};

// --- Generación de figuras ------------------------------------------------

// Un rectángulo en la rejilla.
const rectangulo = () => {
  const ancho = rnd(2, 3);
  const alto = rnd(2, 3);
  const x = rnd(0, LADO - 1 - ancho);
  const y = rnd(0, LADO - 1 - alto);
  return [[x, y], [x + ancho, y], [x + ancho, y + alto], [x, y + alto]];
};

// Una L: un rectángulo al que se le quita un trozo.
const figuraEnL = () => {
  const ancho = rnd(3, 4);
  const alto = rnd(3, 4);
  const x = rnd(0, LADO - 1 - ancho);
  const y = rnd(0, LADO - 1 - alto);
  const corteX = rnd(1, ancho - 1);
  const corteY = rnd(1, alto - 1);
  return [
    [x, y],
    [x + ancho, y],
    [x + ancho, y + corteY],
    [x + corteX, y + corteY],
    [x + corteX, y + alto],
    [x, y + alto],
  ];
};

const aPuntos = (lista) => lista.map(([x, y]) => ({ x, y }));

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
    const c = correcto + rnd(-4, 4);
    if (c < 0 || vistas.has(String(c))) continue;
    vistas.add(String(c));
    out.push(c);
  }
  return revuelto(out);
};

// --- Rondas ---------------------------------------------------------------

// 1. ¿Cuántas casillas ocupa la figura?
const rondaArea = () => {
  const puntos = aPuntos(Math.random() < 0.5 ? rectangulo() : figuraEnL());
  const area = areaPoligono(aLista(puntos));
  return {
    tipo: 'area',
    enunciado: '¿Cuántas casillas ocupa la figura?',
    ayuda: 'Cuenta las casillas que quedan dentro de la goma.',
    puntos,
    cerrada: true,
    opciones: opcionesNumericas(area, [area + 1, area - 1, area + 2, area + 3]),
    correcta: area,
    explicacion: `La figura ocupa ${area} casillas.`,
  };
};

// 2. ¿Cuánto mide el borde?
const rondaPerimetro = () => {
  const puntos = aPuntos(Math.random() < 0.5 ? rectangulo() : figuraEnL());
  const perimetro = perimetroPoligono(aLista(puntos));
  return {
    tipo: 'perimetro',
    enunciado: '¿Cuántas unidades mide el borde?',
    ayuda: 'Cuenta las unidades de cada lado de la goma y súmalas.',
    puntos,
    cerrada: true,
    opciones: opcionesNumericas(perimetro, [perimetro + 2, perimetro - 2, perimetro + 4, perimetro + 1]),
    correcta: perimetro,
    explicacion: `El borde mide ${perimetro} unidades.`,
  };
};

// 3. ¿Qué forma es?
const rondaForma = () => {
  const puntos = aPuntos(rectangulo());
  const ancho = puntos[1].x - puntos[0].x;
  const alto = puntos[3].y - puntos[0].y;
  const esCuadrado = ancho === alto;
  const correcta = esCuadrado ? 'Cuadrado' : 'Rectángulo';
  return {
    tipo: 'forma',
    enunciado: '¿Qué forma has formado?',
    ayuda: 'Mira si los lados de arriba y de abajo miden lo mismo que los de los lados.',
    puntos,
    cerrada: true,
    opciones: revuelto([correcta, 'Triángulo', 'Rombo', 'Círculo']),
    texto: true,
    correcta,
    explicacion: esCuadrado
      ? 'Todos los lados miden igual: es un cuadrado.'
      : 'Los lados de arriba y de abajo son más largos: es un rectángulo.',
  };
};

// 4. Construir: cierra una figura con el área que pide el juego.
const rondaConstruye = () => {
  // Áreas que se pueden hacer con un rectángulo dentro de la rejilla.
  const objetivo = [4, 6, 8, 9][rnd(0, 3)];
  return {
    tipo: 'construye',
    enunciado: `Cierra una figura de ${objetivo} casillas`,
    ayuda: 'Toca los clavos uno a uno. El último tiene que ser el primero para cerrar la goma.',
    objetivo,
    puntos: [],
    cerrada: false,
    opciones: null,
    correcta: null,
    explicacion: `Has cerrado una figura de ${objetivo} casillas.`,
  };
};

const crearRondas = () => {
  const rondas = [];
  for (let i = 0; i < RONDAS; i++) {
    const generador = [rondaArea, rondaPerimetro, rondaForma, rondaConstruye][i % 4];
    rondas.push(generador());
  }
  return rondas;
};

// --- Juego ----------------------------------------------------------------

const GeoboardGame = ({ onBack }) => {
  const gameKey = 'geoboard';
  const [rondas, setRondas] = useState(() => crearRondas());
  const [indice, setIndice] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [clavos, setClavos] = useState([]);
  const [cerrada, setCerrada] = useState(false);
  const [ranking, setRanking] = useState(() => loadGameRanking(gameKey));
  const [terminada, setTerminada] = useState(false);
  const mejorRachaRef = useRef(0);
  const registradaRef = useRef(false);

  const ronda = rondas[indice] || null;
  const respondida = elegida !== null;
  const construir = ronda?.tipo === 'construye';

  // En las rondas de figura ya hecha, los clavos son los de la figura.
  const puntosVisibles = construir ? clavos : ronda?.puntos || [];
  const cerradaVisible = construir ? cerrada : true;

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

  // El niño va tocando clavos: cada toque une el último con el nuevo, y
  // tocar el primero otra vez cierra la figura.
  const tocarClavo = (x, y) => {
    if (!construir || respondida) return;
    if (clavos.length === 0) {
      setClavos([{ x, y }]);
      return;
    }
    const primero = clavos[0];
    if (clavos.length >= 3 && primero.x === x && primero.y === y) {
      setCerrada(true);
      const area = areaPoligono(aLista(clavos));
      const ok = area === ronda.objetivo;
      setElegida(ok ? 'bien' : 'mal');
      anotar(ok);
      return;
    }
    setClavos((c) => [...c, { x, y }]);
  };

  const siguiente = () => {
    if (indice + 1 >= rondas.length) {
      setTerminada(true);
      return;
    }
    setIndice((i) => i + 1);
    setElegida(null);
    setClavos([]);
    setCerrada(false);
  };

  const reiniciar = () => {
    setRondas(crearRondas());
    setIndice(0);
    setPuntos(0);
    setRacha(0);
    setAciertos(0);
    setElegida(null);
    setClavos([]);
    setCerrada(false);
    setTerminada(false);
    mejorRachaRef.current = 0;
    registradaRef.current = false;
  };

  const anchoRejilla = (LADO - 1) * CELDA + 48;
  const altoRejilla = (LADO - 1) * CELDA + 48;
  const areaActual = clavos.length >= 3 ? areaPoligono(aLista(clavos)) : 0;
  const acertada = construir ? elegida === 'bien' : elegida === ronda?.correcta;

  return (
    <Page>
      <BarraJuego
        onBack={onBack}
        titulo="📌 El Geoboard"
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
            <div>
              <RejillaClavos
                puntos={puntosVisibles}
                cerrado={cerradaVisible}
                onClavo={tocarClavo}
                ancho={anchoRejilla}
                alto={altoRejilla}
                objetivo={construir ? `Objetivo: ${ronda.objetivo} casillas` : null}
              />
              <Leyenda>
                {construir && (
                  <>
                    <Ficha>Tu figura: {areaActual} casillas</Ficha>
                    <Ficha>Lados: {clavos.length}</Ficha>
                  </>
                )}
              </Leyenda>
            </div>
          </Visual>

          {ronda.opciones && (
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
                  {opcion}
                </Opcion>
              ))}
            </Opciones>
          )}

          <Feedback
            aria-live="polite"
            $color={respondida ? (acertada ? VERDE : ROJO) : '#5b7286'}
          >
            {respondida
              ? (acertada
                ? '¡Correcto! 🎉'
                : (construir
                  ? `Tu figura tiene ${areaActual} casillas y el juego pedía ${ronda.objetivo}.`
                  : `La respuesta correcta era ${ronda.correcta}.`))
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

export default GeoboardGame;
