// El progreso en la landing.
//
// Un espejo de lo que el niño ha probado: cuántos de los juegos del catálogo
// y cuáles. No bloquea nada ni da puntos: solo muestra que quedan cosas por
// descubrir. Es la versión barata de la "mansión" de ADI, sin hub ni mapa.

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { GAMES } from '../config/games';
import { cargarProgreso, progresoPorCategoria } from '../utils/progreso';

const Panel = styled.div`
  max-width: 760px;
  margin: 0 auto 1.5rem;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1rem 1.3rem;
  color: white;
  text-align: left;
`;

const Titulo = styled.h2`
  font-size: 1.05rem;
  margin: 0 0 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Barra = styled.div`
  height: 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
  overflow: hidden;
`;

const Relleno = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #12b3b0, #ff8a2a);
  transition: width 0.4s ease;
`;

const Cifra = styled.p`
  margin: 0.5rem 0 0.8rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
`;

const Iconos = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  font-size: 1.5rem;
`;

const Vacio = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.75);
`;

const ProgresoPanel = () => {
  const [progreso, setProgreso] = useState(() => progresoPorCategoria(GAMES));

  // Al volver de un juego, el contador tiene que estar al día.
  useEffect(() => {
    setProgreso(progresoPorCategoria(GAMES));
  }, []);

  const jugados = new Set(cargarProgreso());
  const juegosProbados = GAMES.filter((g) => jugados.has(g.id));
  const porcentaje = progreso.total ? (progreso.jugados / progreso.total) * 100 : 0;

  return (
    <Panel>
      <Titulo>📈 Tu progreso</Titulo>
      <Barra>
        <Relleno style={{ width: `${porcentaje}%` }} />
      </Barra>
      <Cifra>
        Has probado {progreso.jugados} de {progreso.total} juegos.
      </Cifra>
      {juegosProbados.length === 0 ? (
        <Vacio>Juega a uno y aquí aparecerá su icono.</Vacio>
      ) : (
        <Iconos>
          {juegosProbados.map((g) => (
            <span key={g.id} title={g.title} aria-label={g.title}>
              <g.icon />
            </span>
          ))}
        </Iconos>
      )}
    </Panel>
  );
};

export default ProgresoPanel;
