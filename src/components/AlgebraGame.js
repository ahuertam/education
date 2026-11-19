import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
  Page, BarraJuego, PantallaFinal, Tarjeta, Enunciado, Ayuda, Visual, Opciones,
  Opcion, Feedback, Explicacion, Accion, Progreso, ProgresoBarra,
  GRIS, NAVY, VERDE, ROJO,
} from './ui/JuegoBase';
import { loadGameRanking, recordGameRun, updateGameBestStreak } from '../utils/rankings';
import {
  TIPOS_FICHA, etiquetaFicha, COLOR_FICHA, bolsaVacia, anadirFicha,
  mismaBolsa, expresionDeBolsa, formatearExpresion, evaluar,
  areaCuadrado, bolsaAleatoria,
} from '../utils/algebra';

// Los Números del Álgebra.
//
// Las fichas de álgebra de Polypad: x², x y 1. El niño ve un modelo hecho con
// ellas y tiene que saber qué expresión representa, cuánto vale, cuál de dos
// es mayor y cómo construir una.
//
// Cuatro rondas: leer, relacionar, comparar y construir.

const RONDAS = 8;
const gameKey = 'algebra';

const FichaAlgebra = styled.button`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  border: 3px solid ${NAVY};
  background: ${(p) => COLOR_FICHA[p.$tipo]};
  color: #ffffff;
  font-size: 1.6rem;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: inherit;

  sup { font-size: 0.55em; vertical-align: super; margin-left: 1px; }

  &:hover:not(:disabled) { transform: translateY(-2px); }
  &:disabled { cursor: default; opacity: 0.45; }
`;

const TextoFicha = ({ tipo }) => {
  if (tipo === 'x2') return <>x<sup>2</sup></>;
  return <>{etiquetaFicha(tipo)}</>;
};

const Bandeja = styled.div`
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  flex-wrap: wrap;
  align-items: flex-end;
`;

const Expresion = styled.div`
  font-size: 2rem;
  font-weight: 900;
  color: ${NAVY};
  background: #f7fafc;
  border: 2px solid rgba(11, 43, 69, 0.08);
  border-radius: 20px;
  padding: 0.5rem 1.2rem;
`;

const Cuadricula = styled.div`
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: 3px;
  background: ${NAVY};
  padding: 3px;
  border-radius: 12px;
`;

const Celda = styled.div`
  background: #f7fafc;
  padding: 0.5rem 0.8rem;
  text-align: center;
  font-weight: 800;
  font-size: 0.95rem;
  color: ${NAVY};
  min-width: 4.5rem;
`;

const num = (azar, min, max) => min + Math.floor(azar() * (max - min + 1));

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

// Una bolsa distinta de la dada: se cambia el número de alguna ficha.
const bolsaDistinta = (bolsa, azar) => {
  const tipo = TIPOS_FICHA[Math.floor(azar() * TIPOS_FICHA.length)];
  const cambio = azar() < 0.5 ? 1 : -1;
  const nueva = { ...bolsa, [tipo]: Math.max(0, bolsa[tipo] + cambio) };
  // Si el cambio no ha movido nada (no había fichas de ese tipo), se prueba
  // con otro tipo.
  if (mismaBolsa(nueva, bolsa)) return null;
  return nueva;
};

// N bolsas distintas entre sí y distintas de la original.
const distractoresDeBolsa = (bolsa, azar, cuantos) => {
  const salida = [];
  let intentos = 0;
  while (salida.length < cuantos && intentos < 60) {
    intentos++;
    const otra = bolsaDistinta(bolsa, azar);
    if (!otra) continue;
    if (salida.some((b) => mismaBolsa(b, otra))) continue;
    salida.push(otra);
  }
  return salida;
};

// Leer: una bandeja de fichas y la expresión que suman.
const rondaLeer = (azar) => {
  const bolsa = bolsaAleatoria(azar);
  const correcta = formatearExpresion(expresionDeBolsa(bolsa));
  const otras = distractoresDeBolsa(bolsa, azar, 3).map(
    (b) => formatearExpresion(expresionDeBolsa(b))
  );
  return {
    tipo: 'leer',
    enunciado: '¿Qué expresión suman estas fichas?',
    ayuda: 'Junta las fichas iguales: dos x son 2x.',
    bolsa,
    visual: 'bandeja',
    opciones: [correcta, ...otras].sort(() => azar() - 0.5),
    correcta,
    explicacion:
      `Hay ${bolsa.x2} ficha${bolsa.x2 === 1 ? '' : 's'} x², ${bolsa.x} ficha${bolsa.x === 1 ? '' : 's'} x ` +
      `y ${bolsa.uno} ficha${bolsa.uno === 1 ? '' : 's'} 1. Al juntarlas sale ${correcta}.`,
  };
};

// Leer (segunda variante): el modelo del área de (x + k)².
const rondaArea = (azar) => {
  const k = num(azar, 2, 4);
  const area = areaCuadrado(k);
  const correcta = formatearExpresion(expresionDeBolsa(area.total));
  const otras = distractoresDeBolsa(area.total, azar, 3).map(
    (b) => formatearExpresion(expresionDeBolsa(b))
  );
  return {
    tipo: 'leer',
    enunciado: '¿Qué expresión sale de este cuadrado?',
    ayuda: 'Multiplica cada fila por cada columna y suma los cuatro trozos.',
    k,
    area,
    visual: 'area',
    opciones: [correcta, ...otras].sort(() => azar() - 0.5),
    correcta,
    explicacion:
      `El cuadrado es (x + ${k})². Sale x² + 2·${k}x + ${k * k}, que es ${correcta}.`,
  };
};

// Relacionar: cuánto vale la expresión con un número en lugar de x.
const rondaRelacionar = (azar) => {
  const bolsa = bolsaAleatoria(azar);
  const expresion = expresionDeBolsa(bolsa);
  const x = num(azar, 2, 5);
  const correcta = evaluar(expresion, x);
  // Distractores cerca del valor: así el niño tiene que calcular, no adivinar.
  const candidatos = [correcta + 1, correcta - 1, correcta + x, correcta - x];
  const distractores = [];
  for (const c of candidatos) {
    if (c !== correcta && c >= 0 && !distractores.includes(c)) distractores.push(c);
    if (distractores.length === 3) break;
  }
  while (distractores.length < 3) distractores.push(correcta + distractores.length + 2);
  return {
    tipo: 'relacionar',
    enunciado: `¿Cuánto vale ${formatearExpresion(expresion)} si x = ${x}?`,
    ayuda: 'Cambia cada x por el número y calcula.',
    bolsa,
    x,
    visual: 'bandeja',
    opciones: [correcta, ...distractores].sort(() => azar() - 0.5),
    correcta,
    explicacion:
      `Con x = ${x}: ${expresion
        .map(({ coef, exp }) => `${coef === 1 ? '' : coef}x${exp === 0 ? '' : `^${exp}`} = ${coef * Math.pow(x, exp)}`)
        .join(', ')}. En total ${correcta}.`,
  };
};

// Comparar: cuál de las dos expresiones vale más.
const rondaComparar = (azar) => {
  const bolsaA = bolsaAleatoria(azar);
  let bolsaB = bolsaAleatoria(azar);
  let intentos = 0;
  while (mismaBolsa(bolsaA, bolsaB) && intentos < 20) {
    bolsaB = bolsaAleatoria(azar);
    intentos++;
  }
  // Con x dado siempre se puede comparar. Sin x, solo se puede si las dos
  // expresiones son la misma... y entonces la respuesta sería "vale lo mismo",
  // que no es lo que se quiere preguntar. Así que se da siempre la x.
  const x = num(azar, 2, 6);
  const valorA = evaluar(expresionDeBolsa(bolsaA), x);
  const valorB = evaluar(expresionDeBolsa(bolsaB), x);
  const correcta = valorA > valorB ? 'La primera' : valorA < valorB ? 'La segunda' : 'Valen lo mismo';
  const opciones = ['La primera', 'La segunda', 'Valen lo mismo'];
  return {
    tipo: 'comparar',
    enunciado: '¿Cuál de estas expresiones vale más?',
    ayuda: `Mira las dos bandejas. Recuerda que x = ${x}.`,
    bolsaA,
    bolsaB,
    x,
    visual: 'dos',
    opciones,
    correcta,
    explicacion:
      `Con x = ${x}: la primera vale ${valorA} y la segunda ${valorB}. ` +
      `Por eso ${correcta.toLowerCase()}.`,
  };
};

// Construir: montar la expresión con fichas.
const rondaConstruir = (azar) => {
  const bolsa = bolsaAleatoria(azar, 5);
  const objetivo = formatearExpresion(expresionDeBolsa(bolsa));
  // La bandeja lleva las fichas necesarias y una de sobra, para que el niño
  // tenga que decidir cuáles poner.
  const sobrante = TIPOS_FICHA[Math.floor(azar() * TIPOS_FICHA.length)];
  const bandeja = { ...bolsa, [sobrante]: bolsa[sobrante] + 1 };
  return {
    tipo: 'construir',
    enunciado: `Construye ${objetivo}`,
    ayuda: 'Coloca las fichas que pide la expresión. Toca una ficha colocada para quitarla.',
    bolsa,
    bandeja,
    objetivo,
    visual: 'construir',
    correcta: null,
    explicacion:
      `${objetivo} son ${bolsa.x2} ficha${bolsa.x2 === 1 ? '' : 's'} x², ` +
      `${bolsa.x} ficha${bolsa.x === 1 ? '' : 's'} x y ${bolsa.uno} ficha${bolsa.uno === 1 ? '' : 's'} 1.`,
  };
};

const crearRondas = (azar) => {
  const rondas = [];
  for (let i = 0; i < RONDAS; i++) {
    const generador = [rondaLeer, rondaRelacionar, rondaArea, rondaComparar, rondaConstruir][i % 5];
    rondas.push(generador(azar));
  }
  return rondas;
};

// --- El juego --------------------------------------------------------------

const AlgebraGame = ({ onBack }) => {
  const [rondas, setRondas] = useState(() => crearRondas(crearAzar(Math.floor(Math.random() * 1e9))));
  const [indice, setIndice] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [ranking, setRanking] = useState(() => loadGameRanking(gameKey));
  const [terminada, setTerminada] = useState(false);
  // Las fichas que el niño ha colocado.
  const [colocadas, setColocadas] = useState([]);
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

  const colocar = (tipo) => {
    if (respondida) return;
    setColocadas((c) => [...c, tipo]);
  };

  const quitar = (indiceFicha) => {
    if (respondida) return;
    setColocadas((c) => c.filter((_, i) => i !== indiceFicha));
  };

  const comprobar = () => {
    if (respondida || !ronda) return;
    // La bolsa de lo colocado se cuenta por tipo.
    const bolsa = colocadas.reduce((b, t) => anadirFicha(b, t), bolsaVacia());
    const ok = mismaBolsa(bolsa, ronda.bolsa);
    setElegida(ok ? 'bien' : 'mal');
    anotar(ok);
  };

  const siguiente = () => {
    if (indice + 1 >= rondas.length) {
      setTerminada(true);
      return;
    }
    setIndice((i) => i + 1);
    setElegida(null);
    setColocadas([]);
  };

  const reiniciar = () => {
    setRondas(crearRondas(crearAzar(Math.floor(Math.random() * 1e9))));
    setIndice(0);
    setPuntos(0);
    setRacha(0);
    setAciertos(0);
    setElegida(null);
    setColocadas([]);
    setTerminada(false);
    registradaRef.current = false;
  };

  // Las fichas que quedan sin usar en la bandeja.
  const disponibles = (bolsa) => {
    const usados = colocadas.reduce((b, t) => anadirFicha(b, t), bolsaVacia());
    const quedan = { ...bolsa };
    for (const t of TIPOS_FICHA) quedan[t] = Math.max(0, bolsa[t] - usados[t]);
    return quedan;
  };

  // Una bandeja de fichas, solo para mirar.
  const BandejaFichas = ({ bolsa }) => (
    <Bandeja>
      {TIPOS_FICHA.flatMap((tipo) =>
        Array.from({ length: bolsa[tipo] }, (_, i) => (
          <FichaAlgebra
            key={`${tipo}-${i}`}
            as="div"
            $tipo={tipo}
            role="img"
            aria-label={`Ficha ${etiquetaFicha(tipo)}`}
          >
            <TextoFicha tipo={tipo} />
          </FichaAlgebra>
        ))
      )}
    </Bandeja>
  );

  return (
    <Page>
      <BarraJuego
        onBack={onBack}
        titulo="Los Números del Álgebra"
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

          {ronda.visual === 'bandeja' && (
            <Visual>
              <BandejaFichas bolsa={ronda.bolsa} />
            </Visual>
          )}

          {ronda.visual === 'dos' && (
            <Visual>
              <Bandeja>
                <BandejaFichas bolsa={ronda.bolsaA} />
                <BandejaFichas bolsa={ronda.bolsaB} />
              </Bandeja>
            </Visual>
          )}

          {ronda.visual === 'area' && (
            <Visual>
              <Cuadricula>
                {ronda.area.celdas.map((celda, i) => (
                  <Celda key={i}>
                    {celda.etiqueta}
                    <div style={{ marginTop: '0.3rem', fontSize: '0.8rem', color: GRIS, fontWeight: 700 }}>
                      {celda.bolsa.x2 > 0 && `${celda.bolsa.x2} x²`}
                      {celda.bolsa.x > 0 && `${celda.bolsa.x} x`}
                      {celda.bolsa.uno > 0 && `${celda.bolsa.uno} 1`}
                    </div>
                  </Celda>
                ))}
              </Cuadricula>
            </Visual>
          )}

          {ronda.visual === 'construir' && (
            <Visual>
              <Expresion>{ronda.objetivo}</Expresion>
              <div style={{ marginTop: '0.9rem' }}>
                <Bandeja>
                  {colocadas.map((tipo, i) => (
                    <FichaAlgebra
                      key={`${tipo}-${i}-${i}`}
                      type="button"
                      $tipo={tipo}
                      aria-label={`Quitar ficha ${etiquetaFicha(tipo)}`}
                      onClick={() => quitar(i)}
                    >
                      <TextoFicha tipo={tipo} />
                    </FichaAlgebra>
                  ))}
                  {colocadas.length === 0 && (
                    <span style={{ opacity: 0.45, alignSelf: 'center' }}>Toca las fichas de abajo</span>
                  )}
                </Bandeja>
              </div>
              <Bandeja style={{ marginTop: '0.8rem' }}>
                {TIPOS_FICHA.flatMap((tipo) =>
                  Array.from({ length: disponibles(ronda.bandeja)[tipo] }, (_, i) => (
                    <FichaAlgebra
                      key={`${tipo}-${i}`}
                      type="button"
                      $tipo={tipo}
                      aria-label={`Poner ficha ${etiquetaFicha(tipo)}`}
                      onClick={() => colocar(tipo)}
                    >
                      <TextoFicha tipo={tipo} />
                    </FichaAlgebra>
                  ))
                )}
              </Bandeja>
            </Visual>
          )}

          {ronda.tipo === 'construir' ? (
            <>
              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1.2rem', flexWrap: 'wrap' }}>
                <Accion type="button" onClick={comprobar} disabled={respondida}>
                  Comprobar
                </Accion>
                <Accion type="button" onClick={() => setColocadas([])} disabled={respondida}>
                  Borrar todo
                </Accion>
              </div>
              {respondida && (
                <>
                  <Feedback $color={elegida === 'bien' ? VERDE : ROJO}>
                    {elegida === 'bien'
                      ? '¡Correcto! Esa es la expresión.'
                      : `Has puesto ${colocadas.map((t) => etiquetaFicha(t)).join(' + ')}. Faltaba o sobraba alguna ficha.`}
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

export default AlgebraGame;
