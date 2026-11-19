import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
  Page, BarraJuego, PantallaFinal, Tarjeta, Enunciado, Ayuda, Visual, Opciones,
  Opcion, Feedback, Explicacion, Accion, Progreso, ProgresoBarra, Fichas,
  GRIS, NAVY, VERDE, ROJO,
} from './ui/JuegoBase';
import { loadGameRanking, recordGameRun, updateGameBestStreak } from '../utils/rankings';
import {
  casosDe, compararProbabilidades, formatearProbabilidad, repartosDe,
} from '../utils/probabilidad';

// La Ruleta y los Dados.
//
// La probabilidad nunca se había tocado en el repo: con 30 juegos no había ni
// una sola pregunta sobre ella. Aquí el modelo es la ruleta: un círculo
// partido en sectores, y la pregunta es qué color sale más a menudo.
//
// Cuatro rondas: leer (qué color es más probable), relacionar (dos
// probabilidades comparadas), comparar (qué ruleta da más) y construir (el
// niño reparte los sectores para cumplir un objetivo).

const RONDAS = 8;
const gameKey = 'probabilidad';

// Los colores de la ruleta. Se eligieron los del ábaco: rojo, azul y
// amarillo, que son los que el niño ya conoce.
const COLORES = [
  { nombre: 'rojo', color: '#e05555' },
  { nombre: 'azul', color: '#4a80c8' },
  { nombre: 'amarillo', color: '#f0b429' },
];

const Sector = styled.button`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 3px solid ${NAVY};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 900;
  font-size: 0.9rem;
  cursor: pointer;
  font-family: inherit;

  &:hover:not(:disabled) { transform: translateY(-2px); }
  &:disabled { cursor: default; }
`;

const crearAzar = (semilla) => {
  let s = semilla >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
};

// Una ruleta con n sectores repartidos entre los colores. Cada sector es un
// color, así que la lista de sectores ES el espacio muestral.
const ruletaCon = (azar, sectores = 8) => {
  const reparto = repartosDe(sectores, COLORES.map((c) => c.nombre));
  const elegido = reparto[Math.floor(azar() * reparto.length)];
  const lista = [];
  for (const [color, cuantos] of Object.entries(elegido)) {
    for (let i = 0; i < cuantos; i++) lista.push(color);
  }
  // Barajados, para que los sectores del mismo color no salgan juntos.
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
};

// --- Generadores de ronda -------------------------------------------------

// Leer: qué color sale más a menudo.
const rondaLeer = (azar) => {
  const sectores = ruletaCon(azar);
  const color = COLORES[Math.floor(azar() * COLORES.length)].nombre;
  const n = casosDe(sectores, color);
  // Que la respuesta no sea obvia: el color elegido tiene que salir más de
  // una vez pero no ser TODOS los sectores.
  if (n < 2 || n >= sectores.length) return rondaLeer(azar);
  const opciones = COLORES.map((c) => c.nombre);
  return {
    tipo: 'leer',
    enunciado: '¿Qué color sale más a menudo?',
    ayuda: 'Cuenta los sectores de cada color.',
    sectores,
    visual: 'ruleta',
    opciones,
    correcta: color,
    explicacion:
      `El ${color} sale ${n} de ${sectores.length} veces (${formatearProbabilidad(sectores, color)}). ` +
      `Los otros salen menos.`,
  };
};

// Relacionar: dos probabilidades comparadas.
const rondaRelacionar = (azar) => {
  const sectoresA = ruletaCon(azar);
  const sectoresB = ruletaCon(azar);
  const colorA = COLORES[Math.floor(azar() * COLORES.length)].nombre;
  const colorB = COLORES[Math.floor(azar() * COLORES.length)].nombre;
  if (colorA === colorB) return rondaRelacionar(azar);
  const comparacion = compararProbabilidades(
    { sectores: sectoresA, valor: colorA },
    { sectores: sectoresB, valor: colorB }
  );
  const correcta =
    comparacion === 'mayor' ? 'La primera' : comparacion === 'menor' ? 'La segunda' : 'Las dos';
  return {
    tipo: 'relacionar',
    enunciado: '¿Cuál de las dos ruletas da su color más a menudo?',
    ayuda: 'Cuenta los sectores de cada color en las dos ruletas.',
    sectoresA,
    sectoresB,
    colorA,
    colorB,
    visual: 'dos',
    opciones: ['La primera', 'La segunda', 'Las dos'],
    correcta,
    explicacion:
      `En la primera, el ${colorA} sale ${formatearProbabilidad(sectoresA, colorA)}. ` +
      `En la segunda, el ${colorB} sale ${formatearProbabilidad(sectoresB, colorB)}. ` +
      `Por eso ${correcta.toLowerCase()} da su color más a menudo.`,
  };
};

// Comparar: dos ruletas con el MISMO color, cuál sale más.
const rondaComparar = (azar) => {
  const sectoresA = ruletaCon(azar);
  let sectoresB = ruletaCon(azar);
  const color = COLORES[Math.floor(azar() * COLORES.length)].nombre;
  // Que no sean la misma ruleta: si lo son, "las dos" sería la respuesta.
  let intentos = 0;
  while (sectoresB.join() === sectoresA.join() && intentos < 20) {
    sectoresB = ruletaCon(azar);
    intentos++;
  }
  const comparacion = compararProbabilidades(
    { sectores: sectoresA, valor: color },
    { sectores: sectoresB, valor: color }
  );
  const correcta =
    comparacion === 'mayor' ? 'La primera' : comparacion === 'menor' ? 'La segunda' : 'Las dos';
  return {
    tipo: 'comparar',
    enunciado: '¿En qué ruleta sale más a menudo ese color?',
    ayuda: 'Mira cuántos sectores del mismo color hay en cada una.',
    sectoresA,
    sectoresB,
    color,
    visual: 'dos',
    opciones: ['La primera', 'La segunda', 'Las dos'],
    correcta,
    explicacion:
      `En la primera hay ${casosDe(sectoresA, color)} sectores de ese color y en la segunda ${casosDe(sectoresB, color)}. ` +
      `Por eso ${correcta.toLowerCase()}.`,
  };
};

// Construir: el niño reparte los sectores para cumplir un objetivo.
const rondaConstruir = (azar) => {
  const colorObjetivo = COLORES[Math.floor(azar() * COLORES.length)].nombre;
  const otro = COLORES[(COLORES.findIndex((c) => c.nombre === colorObjetivo) + 1) % COLORES.length].nombre;
  // El reparto inicial NO cumple el objetivo: 3 de un color y 1 del otro. El
  // niño tiene que mover un sector para que queden 2 y 2.
  const repartoInicial = [colorObjetivo, colorObjetivo, colorObjetivo, otro];
  return {
    tipo: 'construir',
    enunciado: 'Reparte los 4 sectores para que un color salga la mitad de las veces',
    ayuda: 'Toca un sector para cambiarlo de color. Ese color debe salir 2 de 4 veces.',
    objetivo: 'la mitad',
    colorObjetivo,
    sectores: repartoInicial,
    visual: 'construir',
    correcta: null,
    explicacion:
      'Para que salga la mitad, el color tiene que tener 2 de los 4 sectores. ' +
      'Repartir 2 y 2 lo cumple; 3 y 1 no.',
  };
};

const crearRondas = (azar) => {
  const rondas = [];
  for (let i = 0; i < RONDAS; i++) {
    const generador = [rondaLeer, rondaRelacionar, rondaComparar, rondaConstruir][i % 4];
    rondas.push(generador(azar));
  }
  return rondas;
};

// --- El juego --------------------------------------------------------------

const colorDe = (nombre) => COLORES.find((c) => c.nombre === nombre)?.color ?? GRIS;

const RuletaDadosGame = ({ onBack }) => {
  const [rondas, setRondas] = useState(() => crearRondas(crearAzar(Math.floor(Math.random() * 1e9))));
  const [indice, setIndice] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [ranking, setRanking] = useState(() => loadGameRanking(gameKey));
  const [terminada, setTerminada] = useState(false);
  // Los sectores que el niño ha repartido, en la ronda de construir.
  const [sectors, setSectores] = useState(rondas[0]?.sectores ?? []);
  const mejorRachaRef = useRef(0);
  const registradaRef = useRef(false);

  const ronda = rondas[indice] || null;
  const respondida = elegida !== null;

  useEffect(() => {
    if (racha > mejorRachaRef.current) mejorRachaRef.current = racha;
    if (racha > ranking.bestStreak) setRanking(updateGameBestStreak(gameKey, racha));
  }, [ranking.bestStreak, racha]);

  useEffect(() => {
    if (!terminada || registradaRef.current) return;
    registradaRef.current = true;
    setRanking(recordGameRun(gameKey, { score: puntos, bestStreak: mejorRachaRef.current }));
  }, [terminada, puntos]);

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

  // En la ronda de construir, cambiar el color de un sector.
  const cambiarSector = (indiceSector) => {
    if (respondida) return;
    setSectores((prev) => {
      const siguiente = [...prev];
      const pos = COLORES.findIndex((c) => c.nombre === siguiente[indiceSector]);
      siguiente[indiceSector] = COLORES[(pos + 1) % COLORES.length].nombre;
      return siguiente;
    });
  };

  const comprobar = () => {
    if (respondida || !ronda) return;
    const n = casosDe(sectors, ronda.colorObjetivo);
    const ok = n === 2;
    setElegida(ok ? 'bien' : 'mal');
    anotar(ok);
  };

  const siguiente = () => {
    if (indice + 1 >= rondas.length) {
      setTerminada(true);
      return;
    }
    const siguienteRonda = rondas[indice + 1];
    setIndice((i) => i + 1);
    setElegida(null);
    setSectores(siguienteRonda?.sectores ?? []);
  };

  const reiniciar = () => {
    setRondas(crearRondas(crearAzar(Math.floor(Math.random() * 1e9))));
    setIndice(0);
    setPuntos(0);
    setRacha(0);
    setAciertos(0);
    setElegida(null);
    setSectores(rondas[0]?.sectores ?? []);
    setTerminada(false);
    registradaRef.current = false;
  };

  // Dibuja la ruleta: un sector por elemento, con su color.
  const DibujoRuleta = ({ sectores, titulo }) => {
    const total = sectores.length;
    const radio = 90;
    const centro = 100;
    let angulo = -90;
    const paths = sectores.map((nombre, i) => {
      const paso = 360 / total;
      const a1 = (angulo * Math.PI) / 180;
      const a2 = ((angulo + paso) * Math.PI) / 180;
      const x1 = centro + radio * Math.cos(a1);
      const y1 = centro + radio * Math.sin(a1);
      const x2 = centro + radio * Math.cos(a2);
      const y2 = centro + radio * Math.sin(a2);
      angulo += paso;
      return { d: `M ${centro} ${centro} L ${x1} ${y1} A ${radio} ${radio} 0 0 1 ${x2} ${y2} Z`, color: colorDe(nombre) };
    });
    return (
      <svg viewBox="0 0 200 200" width="min(220px, 55vw)" role="img" aria-label={titulo}>
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} stroke="#ffffff" strokeWidth="1.5" />
        ))}
        <circle cx={centro} cy={centro} r="10" fill={NAVY} />
      </svg>
    );
  };

  return (
    <Page>
      <BarraJuego
        onBack={onBack}
        titulo="La Ruleta y los Dados"
        ronda={Math.min(indice + 1, rondas.length)}
        rondas={rondas.length}
        puntos={puntos}
        racha={racha}
      />
      {!terminada && (
        <Progreso><ProgresoBarra style={{ width: `${(indice / rondas.length) * 100}%` }} /></Progreso>
      )}

      {!terminada && ronda && (
        <Tarjeta>
          <Enunciado>{ronda.enunciado}</Enunciado>
          <Ayuda>{ronda.ayuda}</Ayuda>

          {ronda.visual === 'ruleta' && (
            <Visual>
              <DibujoRuleta sectores={ronda.sectores} titulo="Ruleta de colores" />
            </Visual>
          )}

          {ronda.visual === 'dos' && (
            <Visual>
              <DibujoRuleta sectores={ronda.sectoresA} titulo="Primera ruleta" />
              <DibujoRuleta sectores={ronda.sectoresB} titulo="Segunda ruleta" />
            </Visual>
          )}

          {ronda.visual === 'construir' && (
            <Visual>
              <Fichas>
                {sectors.map((nombre, i) => (
                  <Sector
                    key={i}
                    type="button"
                    style={{ background: colorDe(nombre) }}
                    aria-label={`Sector ${i + 1}, color ${nombre}. Tocar para cambiarlo`}
                    disabled={respondida}
                    onClick={() => cambiarSector(i)}
                  >
                    {i + 1}
                  </Sector>
                ))}
              </Fichas>
              <div style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: GRIS }}>
                Ahora mismo el {ronda.colorObjetivo} sale {casosDe(sectors, ronda.colorObjetivo)} de 4 veces.
              </div>
            </Visual>
          )}

          {ronda.tipo === 'construir' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.2rem' }}>
                <Accion type="button" onClick={comprobar} disabled={respondida}>
                  Comprobar
                </Accion>
              </div>
              {respondida && (
                <>
                  <Feedback $color={elegida === 'bien' ? VERDE : ROJO}>
                    {elegida === 'bien'
                      ? '¡Lo has conseguido! Sale la mitad de las veces.'
                      : `Ahora sale ${casosDe(sectors, ronda.colorObjetivo)} de 4. Necesitas 2.`}
                  </Feedback>
                  <Explicacion>{ronda.explicacion}</Explicacion>
                </>
              )}
            </>
          ) : (
            <>
              <Opciones>
                {ronda.opciones.map((o) => (
                  <Opcion
                    key={o}
                    type="button"
                    $acierto={respondida && o === ronda.correcta}
                    $fallo={respondida && o === elegida && o !== ronda.correcta}
                    disabled={respondida}
                    onClick={() => responder(o)}
                  >
                    {o}
                  </Opcion>
                ))}
              </Opciones>
              {respondida && (
                <>
                  <Feedback $color={elegida === ronda.correcta ? VERDE : ROJO}>
                    {elegida === ronda.correcta ? '¡Correcto!' : 'Casi. Mira bien los sectores.'}
                  </Feedback>
                  <Explicacion>{ronda.explicacion}</Explicacion>
                </>
              )}
            </>
          )}

          {respondida && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <Accion type="button" onClick={siguiente}>Siguiente</Accion>
            </div>
          )}
        </Tarjeta>
      )}

      {terminada && (
        <PantallaFinal
          puntos={puntos}
          aciertos={aciertos}
          rondas={rondas.length}
          mejorRacha={mejorRachaRef.current}
          ranking={ranking}
          onReiniciar={reiniciar}
          onVolver={onBack}
        />
      )}
    </Page>
  );
};

export default RuletaDadosGame;
