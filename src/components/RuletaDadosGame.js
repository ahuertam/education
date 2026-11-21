import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
  Page, BarraJuego, PantallaFinal, Tarjeta, Enunciado, Ayuda, Visual, Opciones,
  Opcion, Feedback, Explicacion, Accion, Progreso, ProgresoBarra, Fichas,
  GRIS, NAVY, VERDE, ROJO,
} from './ui/JuegoBase';
import { loadGameRanking, recordGameRun, updateGameBestStreak } from '../utils/rankings';
import { casosDe } from '../utils/probabilidad';
import {
  COLORES, colorDe, crearAzar, crearRondas, esRepartoEquitativo,
} from '../utils/ruleta';

// La Ruleta y los Dados.
//
// La probabilidad nunca se había tocado en el repo: con 30 juegos no había ni
// una sola pregunta sobre ella. Aquí el modelo es la ruleta: un círculo
// partido en sectores, y la pregunta es qué color sale más a menudo.
//
// Cuatro tipos de ronda y uno de dados:
//   leer      (qué color es más probable)
//   relacionar (dos probabilidades comparadas)
//   comparar  (qué ruleta da más)
//   construir (el niño reparte los sectores para cumplir un objetivo)
//   dados     (qué número sale más a menudo)
//
// Los generadores están en src/utils/ruleta.js, que es donde se pueden
// comprobar: lo que se rompe aquí es que la respuesta marcada sea la que se
// ve en la ruleta.

const gameKey = 'probabilidad';

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

const Dado = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 12px;
  border: 3px solid ${NAVY};
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${NAVY};
  font-weight: 900;
  font-size: 1.3rem;
`;

// Dibuja la ruleta: un sector por elemento, con su color.
const DibujoRuleta = ({ sectores, titulo }) => {
  const total = sectores.length;
  const radio = 90;
  const centro = 100;
  let angulo = -90;
  const paths = sectores.map((nombre) => {
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
    const ok = esRepartoEquitativo(sectors);
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
    const nuevas = crearRondas(crearAzar(Math.floor(Math.random() * 1e9)));
    setRondas(nuevas);
    setIndice(0);
    setPuntos(0);
    setRacha(0);
    setAciertos(0);
    setElegida(null);
    setSectores(nuevas[0]?.sectores ?? []);
    setTerminada(false);
    registradaRef.current = false;
  };

  // Lo que se ve ahora mismo, para el texto de la ronda de construir.
  const repartoActual = COLORES
    .map((c) => `${casosDe(sectors, c.nombre)} ${c.nombre}`)
    .join(' y ');

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

          {ronda.visual === 'dados' && (
            <Visual>
              <Fichas>
                {ronda.tiradas.map((cara, i) => (
                  <Dado key={i} role="img" aria-label={`Dado ${i + 1}: ${cara}`}>
                    {cara}
                  </Dado>
                ))}
              </Fichas>
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
                Ahora mismo hay {repartoActual}.
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
                      ? '¡Lo has conseguido! Dos colores con 2 sectores cada uno.'
                      : `Ahora hay ${repartoActual}. Necesitas 2 y 2.`}
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
