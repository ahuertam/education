// El álbum de pegatinas.
//
// Cada vez que el niño termina una partida y se gana el minijuego de premio
// con buenas estrellas, cae una pegatina aquí. La colección vive en el
// navegador (localStorage), sin cuenta y sin backend.
//
// No es un juego: no está en el catálogo de src/config/games.js, es una
// pantalla de la landing.

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';
import { Page, TopBar, Volver, Titulo, Tarjeta, Pastilla, VERDE, GRIS, NARANJA } from './ui/JuegoBase';
import { LOGROS, PEGATINAS, TEMAS } from './data/pegatinas';
import { cargarPegatinas, limpiarNuevas, logrosDesbloqueados } from '../utils/pegatinas';

const Contenido = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const Resumen = styled.p`
  color: #5b7286;
  font-size: 1.05rem;
  margin: 0.5rem 0 1.5rem;
`;

const Tema = styled.h2`
  font-size: 1.3rem;
  margin: 2rem 0 0.8rem;
  color: #0b2b45;
  border-left: 6px solid ${(props) => props.$color};
  padding-left: 0.7rem;
`;

const Rejilla = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 0.8rem;
`;

const Casilla = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 0.8rem 0.4rem;
  text-align: center;
  border: 2px solid ${(props) => (props.$nueva ? NARANJA : 'rgba(11, 43, 69, 0.08)')};
  box-shadow: 0 3px 10px rgba(11, 43, 69, 0.08);
  position: relative;
`;

const Emoji = styled.div`
  font-size: 2.4rem;
  line-height: 1.2;
  filter: ${(props) => (props.$tiene ? 'none' : 'grayscale(1) opacity(0.25)')};
`;

const Nombre = styled.span`
  display: block;
  font-size: 0.75rem;
  color: ${(props) => (props.$tiene ? '#0b2b45' : GRIS)};
  margin-top: 0.3rem;
`;

const MarcaNueva = styled.span`
  position: absolute;
  top: -8px;
  right: -6px;
  background: ${NARANJA};
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  border-radius: 12px;
  padding: 0.1rem 0.45rem;
`;

const Logro = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: #ffffff;
  border-radius: 14px;
  padding: 0.7rem 1rem;
  margin-bottom: 0.6rem;
  border: 2px solid ${(props) => (props.$hecho ? VERDE : 'rgba(11, 43, 69, 0.08)')};
  opacity: ${(props) => (props.$hecho ? 1 : 0.55)};
`;

const ColeccionGame = ({ onBack }) => {
  const [estado, setEstado] = useState(() => cargarPegatinas());

  // Abrir el álbum es ver las pegatinas nuevas: dejan de estar "nuevas".
  useEffect(() => {
    limpiarNuevas();
  }, []);

  const logros = logrosDesbloqueados(estado);
  const porTema = TEMAS && Object.keys(TEMAS).map((clave) => ({
    clave,
    ...TEMAS[clave],
    pegatinas: PEGATINAS.filter((p) => p.tema === clave),
  }));

  return (
    <Page>
      <TopBar>
        <Volver type="button" onClick={onBack}>
          <FaArrowLeft /> Volver
        </Volver>
        <Titulo>Mi colección</Titulo>
        <Pastilla $tono={VERDE}>
          {estado.pegatinas.length} de {PEGATINAS.length} pegatinas
        </Pastilla>
      </TopBar>

      <Contenido>
        <Resumen>
          Las pegatinas se ganan jugando: termina una partida, llega al minijuego
          de premio y consigue tres estrellas.
        </Resumen>

        {porTema.map((tema) => (
          <div key={tema.clave}>
            <Tema $color={tema.color}>{tema.nombre}</Tema>
            <Rejilla>
              {tema.pegatinas.map((p) => {
                const tengo = estado.pegatinas.includes(p.id);
                const esNueva = estado.nuevas.includes(p.id);
                return (
                  <Casilla key={p.id} $nueva={esNueva}>
                    {esNueva && <MarcaNueva>¡NUEVA!</MarcaNueva>}
                    <Emoji $tiene={tengo}>{tengo ? p.emoji : '❔'}</Emoji>
                    <Nombre $tiene={tengo}>{tengo ? p.nombre : '???'}</Nombre>
                  </Casilla>
                );
              })}
            </Rejilla>
          </div>
        ))}

        <Tema $color={NARANJA}>Logros</Tema>
        {LOGROS.map((logro) => {
          const hecho = logros.some((l) => l.id === logro.id);
          return (
            <Logro key={logro.id} $hecho={hecho}>
              <span style={{ fontSize: '1.8rem', filter: hecho ? 'none' : 'grayscale(1) opacity(0.4)' }}>
                {hecho ? logro.emoji : '🔒'}
              </span>
              <span>
                <strong>{logro.nombre}</strong>
                <br />
                <small style={{ color: GRIS }}>{logro.descripcion}</small>
              </span>
            </Logro>
          );
        })}
      </Contenido>
    </Page>
  );
};

export default ColeccionGame;
