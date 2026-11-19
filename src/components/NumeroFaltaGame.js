import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
  Page, BarraJuego, PantallaFinal, Tarjeta, Enunciado, Ayuda, Visual, Opciones,
  Opcion, Feedback, Explicacion, Accion, Progreso, ProgresoBarra, Fichas,
  Ficha, CajaOperacion, TiraOperacion, NAVY, VERDE, ROJO,
} from './ui/JuegoBase';
import { loadGameRanking, recordGameRun, updateGameBestStreak } from '../utils/rankings';
import {
  OPERACIONES, aplicarOperacion, operacionesQueCumplen,
} from '../utils/matematicas';

// ¿Qué Número Falta?
//
// La operación con un hueco: 8 + □ = 15. El niño tiene que producir el
// número, no reconocerlo.
//
// Cuatro tipos de ronda, como en el resto de los juegos: leer (qué operación
// falta), relacionar (la familia numérica), comparar (qué operación da el
// resultado) y construir (montar la cuenta con fichas).

const RONDAS = 8;
const gameKey = 'numerofalta';

const Numero = styled.span`
  font-size: 1.9rem;
  font-weight: 900;
  color: ${NAVY};
`;

const Operacion = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

const Triangulo = styled.svg`
  width: min(260px, 70vw);
  height: auto;
`;

const num = (azar, min, max) => min + Math.floor(azar() * (max - min + 1));

// Un PRNG con semilla, para que la partida sea reproducible en los tests.
const crearAzar = (semilla) => {
  let s = semilla >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
};

// --- Generadores de ronda -------------------------------------------------

// "4 ? 3 = 12": el resultado está puesto y falta el signo.
//
// El generador descarta los casos ambiguos: 2 + 2 = 4 también lo cumple
// 2 × 2, y con dos signos válidos la pregunta no tiene una sola respuesta.
const rondaLeer = (azar) => {
  for (let intento = 0; intento < 60; intento++) {
    const op = OPERACIONES[Math.floor(azar() * OPERACIONES.length)];
    const a = num(azar, 2, 12);
    const b = num(azar, 2, 9);
    const c = aplicarOperacion(op, a, b);
    if (c === null || c < 0) continue;
    if (operacionesQueCumplen(a, b, c).length !== 1) continue;
    return {
      tipo: 'leer',
      enunciado: '¿Qué operación falta?',
      ayuda: `Une el ${a} y el ${b} para llegar a ${c}.`,
      a, b, c,
      visual: 'operacion',
      opciones: OPERACIONES,
      correcta: op,
      explicacion:
        `${a} ${op} ${b} = ${c}. Sumando daría ${aplicarOperacion('+', a, b)}, ` +
        `restando ${aplicarOperacion('−', a, b)} y multiplicando ${aplicarOperacion('×', a, b)}.`,
    };
  }
  // Red de seguridad por si no sale un caso limpio.
  return {
    tipo: 'leer',
    enunciado: '¿Qué operación falta?',
    ayuda: 'Une el 4 y el 3 para llegar a 12.',
    a: 4, b: 3, c: 12,
    visual: 'operacion',
    opciones: OPERACIONES,
    correcta: '×',
    explicacion: '4 × 3 = 12. Sumando daría 7 y restando 1; solo la multiplicación llega a 12.',
  };
};

// La familia numérica: el todo arriba y las dos partes abajo, una dada.
const rondaRelacionar = (azar) => {
  const parte = num(azar, 3, 15);
  const otra = num(azar, 2, 12);
  const todo = parte + otra;
  const correcta = otra;
  // Los distractores tienen que ser distintos entre sí y de la respuesta.
  const candidatos = [parte, todo, todo + 1, todo - 2, todo + 3];
  const distractores = [];
  for (const c of candidatos) {
    if (c !== correcta && !distractores.includes(c)) distractores.push(c);
    if (distractores.length === 3) break;
  }
  const opciones = [correcta, ...distractores].sort(() => azar() - 0.5);
  return {
    tipo: 'relacionar',
    enunciado: '¿Qué número falta en la familia?',
    ayuda: `El ${todo} se parte en ${parte} y en otro número.`,
    todo, parte,
    visual: 'triangulo',
    opciones,
    correcta,
    explicacion: `${parte} + ${otra} = ${todo}. Y al revés: ${todo} − ${parte} = ${otra}.`,
  };
};

// "¿Cuál de estas operaciones da 24?": hay que operar de verdad.
const rondaComparar = (azar) => {
  const a = num(azar, 3, 12);
  const b = num(azar, 2, 9);
  const op = OPERACIONES[Math.floor(azar() * OPERACIONES.length)];
  const c = aplicarOperacion(op, a, b);
  if (c === null || c < 0) return rondaComparar(azar);
  const correcta = `${a} ${op} ${b}`;
  const otras = OPERACIONES.filter((o) => o !== op).map((o) => `${a} ${o} ${b}`);
  const opciones = [correcta, ...otras].sort(() => azar() - 0.5);
  return {
    tipo: 'comparar',
    enunciado: `¿Cuál de estas operaciones da ${c}?`,
    ayuda: 'Piensa qué operación necesitas para llegar al resultado.',
    c,
    visual: 'operaciones',
    opciones,
    correcta,
    explicacion: `${correcta} = ${c}. Las otras dan ${otras
      .map((o) => `${o} = ${aplicarOperacion(o.split(' ')[1], a, b)}`)
      .join(' y ')}.`,
  };
};

// Construir: el niño monta la cuenta con fichas.
//
// Se le dan tres números (uno sobra) y los cuatro signos. Tiene que colocar
// dos números y un signo de modo que dé el objetivo. Al comprobar mal, la
// tira enseña el valor real: "6 × 8 = 48. Eso no es 24".
const rondaConstruir = (azar) => {
  const objetivo = num(azar, 12, 48);
  const factores = [];
  for (let d = 2; d <= 9; d++) if (objetivo % d === 0) factores.push(d);
  if (!factores.length) return rondaConstruir(azar);
  const a = factores[Math.floor(azar() * factores.length)];
  const b = objetivo / a;
  const sobra = [1, 2, 3, 4, 5, 6, 7, 8, 9].find((n) => n !== a && n !== b);
  if (sobra === undefined) return rondaConstruir(azar);
  const numeros = [a, b, sobra].sort(() => azar() - 0.5);
  return {
    tipo: 'construir',
    enunciado: `Construye una cuenta que dé ${objetivo}`,
    ayuda: 'Coloca dos números y un signo. Puedes probar hasta que salga bien.',
    objetivo,
    a, b,
    numeros,
    signos: OPERACIONES,
    visual: 'construir',
    // En esta ronda no hay opciones: se comprueba lo que el niño ha montado.
    correcta: null,
    explicacion: `${a} × ${b} = ${objetivo}. Los números se multiplican: ${a} × ${b}.`,
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

const NumeroFaltaGame = ({ onBack }) => {
  const [rondas, setRondas] = useState(() => crearRondas(crearAzar(Math.floor(Math.random() * 1e9))));
  const [indice, setIndice] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [ranking, setRanking] = useState(() => loadGameRanking(gameKey));
  const [terminada, setTerminada] = useState(false);
  // Lo que el niño ha montado en la ronda de construir.
  const [compuesta, setCompuesta] = useState([]);
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

  // El signo puede tocarlo en cualquier orden, así que se busca dentro de lo
  // montado en vez de suponer que va en el medio.
  const valorDe = (piezas) => {
    const i = piezas.findIndex((p) => OPERACIONES.includes(p));
    if (i < 0) return null;
    const numeros = piezas.filter((p) => !OPERACIONES.includes(p));
    if (numeros.length < 2) return null;
    return aplicarOperacion(piezas[i], numeros[0], numeros[1]);
  };

  const comprobar = () => {
    if (respondida || !ronda) return;
    const valor = valorDe(compuesta);
    // Una cuenta a medias se cuenta como fallada, con su explicación: el
    // niño nunca se queda atascado en una ronda que no puede terminar.
    const ok = valor !== null && valor === ronda.objetivo;
    setElegida(ok ? 'bien' : 'mal');
    anotar(ok);
  };

  const colocar = (pieza) => {
    if (respondida) return;
    setCompuesta((c) => (c.length >= 3 ? c : [...c, pieza]));
  };

  // Quitar una pieza colocada, tocando sobre ella. Sin esto, colocar los tres
  // números antes que el signo dejaba la cuenta a medias y ya no se podía
  // seguir: el signo no cabía y "Comprobar" no hacía nada.
  const quitar = (indicePieza) => {
    if (respondida) return;
    setCompuesta((c) => c.filter((_, i) => i !== indicePieza));
  };

  const siguiente = () => {
    if (indice + 1 >= rondas.length) {
      setTerminada(true);
      return;
    }
    setIndice((i) => i + 1);
    setElegida(null);
    setCompuesta([]);
  };

  const reiniciar = () => {
    setRondas(crearRondas(crearAzar(Math.floor(Math.random() * 1e9))));
    setIndice(0);
    setPuntos(0);
    setRacha(0);
    setAciertos(0);
    setElegida(null);
    setCompuesta([]);
    setTerminada(false);
    registradaRef.current = false;
  };

  const valorCompuesta = valorDe(compuesta);

  return (
    <Page>
      <BarraJuego
        onBack={onBack}
        titulo="¿Qué Número Falta?"
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

          {ronda.visual === 'operacion' && (
            <Visual>
              <Operacion>
                <Numero>{ronda.a}</Numero>
                <CajaOperacion $lleno={respondida}>{respondida ? ronda.correcta : '?'}</CajaOperacion>
                <Numero>{ronda.b}</Numero>
                <Numero>=</Numero>
                <Numero>{ronda.c}</Numero>
              </Operacion>
            </Visual>
          )}

          {ronda.visual === 'triangulo' && (
            <Visual>
              <Triangulo
                viewBox="0 0 200 180"
                role="img"
                aria-label={`Familia numérica: ${ronda.todo} se parte en ${ronda.parte} y en un número que falta`}
              >
                <polygon points="100,10 15,165 185,165" fill="none" stroke="#c8d6e0" strokeWidth="3" />
                <text x="100" y="60" textAnchor="middle" fontSize="34" fontWeight="900" fill={NAVY}>{ronda.todo}</text>
                <text x="45" y="155" textAnchor="middle" fontSize="30" fontWeight="900" fill={NAVY}>{ronda.parte}</text>
                <text x="155" y="155" textAnchor="middle" fontSize="30" fontWeight="900" fill={respondida ? VERDE : '#c8d6e0'}>
                  {respondida ? ronda.correcta : '?'}
                </text>
              </Triangulo>
            </Visual>
          )}

          {ronda.visual === 'operaciones' && (
            <Visual>
              <Operacion>
                {ronda.opciones.map((o) => (
                  <Ficha key={o} as="span" style={{ cursor: 'default' }}>{o}</Ficha>
                ))}
              </Operacion>
            </Visual>
          )}

          {ronda.visual === 'construir' && (
            <Visual>
              <TiraOperacion>
                {compuesta.length === 0 && <span style={{ opacity: 0.4 }}>Coloca aquí tu cuenta</span>}
                {compuesta.map((pieza, i) => (
                  <span
                    key={`${pieza}-${i}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Quitar ${pieza} de la cuenta`}
                    onClick={() => quitar(i)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); quitar(i); } }}
                    style={{ cursor: respondida ? 'default' : 'pointer' }}
                  >
                    {pieza}
                  </span>
                ))}
                {valorCompuesta !== null && (
                  <>
                    <span>=</span>
                    <span style={{ color: valorCompuesta === ronda.objetivo ? VERDE : ROJO }}>
                      {valorCompuesta}
                    </span>
                  </>
                )}
              </TiraOperacion>
            </Visual>
          )}

          {ronda.tipo === 'construir' ? (
            <>
              <Fichas>
                {ronda.numeros.map((n) => (
                  <Ficha key={n} type="button" disabled={respondida} onClick={() => colocar(n)}>
                    {n}
                  </Ficha>
                ))}
              </Fichas>
              <Fichas style={{ marginTop: '0.8rem' }}>
                {ronda.signos.map((s) => (
                  <Ficha
                    key={s}
                    type="button"
                    disabled={respondida}
                    onClick={() => colocar(s)}
                    style={{ background: '#eaf6f5' }}
                  >
                    {s}
                  </Ficha>
                ))}
              </Fichas>
              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1.2rem', flexWrap: 'wrap' }}>
                <Accion type="button" onClick={comprobar} disabled={respondida}>
                  Comprobar
                </Accion>
                <Accion type="button" onClick={() => setCompuesta([])} disabled={respondida}>
                  Borrar todo
                </Accion>
              </div>
              {respondida && (
                <>
                  <Feedback $color={elegida === 'bien' ? VERDE : ROJO}>
                    {elegida === 'bien'
                      ? '¡Correcto!'
                      : `Has puesto ${compuesta.join(' ')} = ${valorCompuesta}. Eso no es ${ronda.objetivo}.`}
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
                    {elegida === ronda.correcta ? '¡Correcto!' : 'Casi. La respuesta correcta era otra.'}
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

export default NumeroFaltaGame;
