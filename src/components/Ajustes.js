// El panel de ajustes del aula.
//
// Vive en la landing, arriba del todo, junto al botón de la colección. Es lo
// que un educador toca antes de empezar una sesión: si no quiere el minijuego
// de premio, lo apaga y los juegos lo saltan.
//
// No es un juego ni una cuenta: es un interruptor en el navegador del alumno.

import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCog } from 'react-icons/fa';
import { cargarAjustes, guardarAjustes } from '../utils/ajustes';

const Zona = styled.div`
  max-width: 560px;
  margin: 0 auto 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
`;

const Boton = styled.button`
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.85);
  font: inherit;
  font-size: 0.95rem;
  padding: 0.45rem 1.1rem;
  border-radius: 30px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;

  &:hover { background: rgba(255, 255, 255, 0.22); }
`;

const Panel = styled.div`
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 0.9rem 1.2rem;
  color: white;
`;

const Fila = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  cursor: pointer;
  font-size: 1rem;
`;

const Explicacion = styled.small`
  display: block;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.2rem;
`;

const Interruptor = styled.input`
  width: 1.5rem;
  height: 1.5rem;
  accent-color: #ff8a2a;
  cursor: pointer;
  flex-shrink: 0;
`;

const Ajustes = () => {
  const [abierto, setAbierto] = useState(false);
  const [ajustes, setAjustes] = useState(() => cargarAjustes());

  const cambiarPremio = (activo) => {
    setAjustes((prev) => guardarAjustes({ ...prev, premio: activo }));
  };

  return (
    <Zona>
      <Boton type="button" onClick={() => setAbierto((prev) => !prev)} aria-expanded={abierto}>
        <FaCog /> Ajustes del aula
      </Boton>

      {abierto && (
        <Panel>
          <Fila>
            <span>
              Minijuego de premio
              <Explicacion>
                Al terminar una partida se ofrece un juego de 20 segundos y una
                pegatina para la colección. Desactívalo si prefieres que la
                sesión sea solo de práctica.
              </Explicacion>
            </span>
            <Interruptor
              type="checkbox"
              checked={ajustes.premio}
              onChange={(e) => cambiarPremio(e.target.checked)}
              aria-label="Activar el minijuego de premio"
            />
          </Fila>
        </Panel>
      )}
    </Zona>
  );
};

export default Ajustes;
