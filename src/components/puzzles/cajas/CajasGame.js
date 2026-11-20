// Cajas y Números.
//
// Un sokoban con una aritmética: el niño empuja las cajas hasta sus marcas
// y para pasar al otro cuarto tiene que resolver la cuenta de la puerta.
//
// Los niveles salen de una semilla, así que hay siempre uno nuevo. La lógica
// está en ./logic.js; aquí solo se pinta y se controlan las teclas.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaRedo } from 'react-icons/fa';
import {
  Page, TopBar, Volver, Titulo, Tarjeta, Enunciado, Ayuda, Feedback, Explicacion,
  Accion, Pastilla, TEAL, NARANJA, NAVY, VERDE, ROJO, GRIS,
} from '../../ui/JuegoBase';
import {
  COLUMNAS, TECLAS, TIPOS,
  abrirPuerta, cajasPendientes, generarNivel, mover,
} from './logic';
import { cargarCajas, guardarCajas } from '../../../utils/cajas';

const Rejilla = styled.div`
  display: grid;
  grid-template-columns: repeat(${COLUMNAS}, 1fr);
  gap: 4px;
  max-width: 660px;
  margin: 0 auto;
  background: #7c5a3c;
  padding: 6px;
  border-radius: 14px;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.35);
`;

const Casilla = styled.div`
  aspect-ratio: 1;
  border-radius: 6px;
  background: ${(props) => (props.$pared ? '#4a3524' : '#a9714a')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => (props.$tipo === 'jugador' ? '1.5rem' : '1.4rem')};
  position: relative;
  user-select: none;
`;

const Marca = styled.span`
  width: 62%;
  height: 62%;
  border-radius: 50%;
  border: 3px dashed rgba(255, 255, 255, 0.55);
`;

const Puerta = styled.span`
  width: 78%;
  height: 78%;
  border-radius: 8px;
  background: ${(props) => (props.$abierta ? '#7ec8a9' : '#b4453c')};
  color: #fff;
  font-weight: 900;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Teclado = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
  max-width: 280px;
  margin: 0 auto;
`;

const BotonNumero = styled.button`
  background: #f7fafc;
  border: 2px solid rgba(11, 43, 69, 0.15);
  border-radius: 12px;
  padding: 0.8rem 0;
  font: inherit;
  font-size: 1.4rem;
  font-weight: 800;
  color: ${NAVY};
  cursor: pointer;

  &:hover { border-color: ${TEAL}; }
`;

const Cifra = styled.div`
  font-size: 2.4rem;
  font-weight: 900;
  color: ${NAVY};
  text-align: center;
  margin: 0.4rem 0 0.8rem;
`;

const CajasGame = ({ onBack }) => {
  // Al abrir se retoma el nivel guardado (si lo hay): el sokoban es un juego
  // de pensar y perder lo colocado al cerrar la pestaña es una burrada. Se
  // lee una sola vez: la semilla y el nivel tienen que ir juntos.
  const [guardado] = useState(() => cargarCajas());
  const [semilla, setSemilla] = useState(guardado?.semilla ?? 1);
  const [nivel, setNivel] = useState(() => guardado?.nivel ?? generarNivel(guardado?.semilla ?? 1));
  const [cuenta, setCuenta] = useState(null);   // { texto, tabla, resultado }
  const [escrito, setEscrito] = useState('');
  const [fallo, setFallo] = useState('');
  // El nivel actual en una ref: el manejador de teclas lo necesita siempre
  // al día y no puede depender de un estado que cambia.
  const nivelRef = useRef(nivel);
  const semillaRef = useRef(semilla);

  const aplicarNivel = useCallback((nuevo) => {
    nivelRef.current = nuevo;
    setNivel(nuevo);
    guardarCajas(semillaRef.current, nuevo);
  }, []);

  const moverJugador = useCallback((direccion) => {
    const actual = nivelRef.current;
    const siguiente = mover(actual, direccion);

    if (siguiente.chocaPuerta) {
      // Choca con la puerta: se abre el teclado de la cuenta y el jugador se
      // queda donde estaba.
      setCuenta({
        texto: actual.puerta.texto,
        tabla: actual.puerta.a,
        resultado: actual.puerta.resultado,
      });
      setEscrito('');
      setFallo('');
      return;
    }

    aplicarNivel(siguiente);
  }, [aplicarNivel]);

  // Teclado: flechas y WASD. Con el teclado de la cuenta abierto las flechas
  // no mueven al jugador (si no, se le borraría lo que lleva escrito).
  useEffect(() => {
    const alPulsar = (evento) => {
      if (cuenta) return;
      if (evento.target && evento.target.tagName === 'INPUT') return;
      const direccion = TECLAS[evento.key];
      if (!direccion) return;
      evento.preventDefault();
      moverJugador(direccion);
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [cuenta, moverJugador]);

  const comprobar = () => {
    const numero = Number(escrito);
    if (escrito === '' || Number.isNaN(numero)) return;
    if (numero === cuenta.resultado) {
      aplicarNivel(abrirPuerta(nivelRef.current, numero));
      setCuenta(null);
      setFallo('');
    } else {
      setFallo('No es esa. Repasa la tabla.');
      setEscrito('');
    }
  };

  const nuevoNivel = () => {
    const siguiente = semilla + 1;
    setSemilla(siguiente);
    semillaRef.current = siguiente;
    const nuevo = generarNivel(siguiente);
    nivelRef.current = nuevo;
    setNivel(nuevo);
    guardarCajas(siguiente, nuevo);
    setCuenta(null);
    setFallo('');
  };

  const reiniciar = () => {
    const nuevo = generarNivel(semilla);
    nivelRef.current = nuevo;
    setNivel(nuevo);
    guardarCajas(semilla, nuevo);
    setCuenta(null);
    setFallo('');
  };

  const pendientes = cajasPendientes(nivel);

  return (
    <Page>
      <TopBar>
        <Volver type="button" onClick={onBack}>
          <FaArrowLeft /> Volver
        </Volver>
        <Titulo>Cajas y Números</Titulo>
        <Pastilla $tono={TEAL}>Nivel {semilla}</Pastilla>
        <Pastilla $tono={pendientes === 0 ? VERDE : NARANJA}>
          Cajas: {nivel.resolucion}/{nivel.total}
        </Pastilla>
        <Pastilla>Movimientos: {nivel.movidas}</Pastilla>
      </TopBar>

      <Tarjeta>
        <Enunciado>
          {nivel.resuelto ? '🎉 ¡Nivel superado!' : 'Empuja las cajas hasta sus marcas'}
        </Enunciado>
        <Ayuda>
          {nivel.resuelto
            ? 'Has colocado todas las cajas.'
            : 'Muévete con las flechas o con WASD. La puerta del medio se abre con la cuenta.'}
        </Ayuda>

        <Rejilla>
          {nivel.celdas.map((fila, f) => fila.map((celda, c) => {
            const esJugador = nivel.jugador.f === f && nivel.jugador.c === c;
            const esPuerta = celda.tipo === TIPOS.puerta;
            return (
              <Casilla
                key={`${f}-${c}`}
                $pared={celda.tipo === TIPOS.pared}
                $tipo={esJugador ? 'jugador' : 'otro'}
              >
                {esPuerta && (
                  <Puerta $abierta={celda.puerta.abierta}>
                    {celda.puerta.abierta ? '✓' : celda.puerta.texto}
                  </Puerta>
                )}
                {!esPuerta && celda.marca && !celda.caja && <Marca />}
                {celda.caja && '📦'}
                {esJugador && '🧑'}
              </Casilla>
            );
          }))}
        </Rejilla>

        {nivel.resuelto && (
          <>
            <Feedback $color={VERDE}>¡Todas las cajas en su marca!</Feedback>
            <Explicacion>
              La puerta era {nivel.puerta.texto} = {nivel.puerta.resultado}.
            </Explicacion>
            <Accion type="button" onClick={nuevoNivel}>
              Siguiente nivel
            </Accion>
          </>
        )}
      </Tarjeta>

      {cuenta && (
        <Tarjeta style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Enunciado>🔒 La puerta está cerrada</Enunciado>
          <Ayuda>Resuelve la cuenta para abrirla.</Ayuda>
          <Cifra>
            {cuenta.texto} = {escrito || '?'}
          </Cifra>
          <Teclado>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <BotonNumero key={n} type="button" onClick={() => setEscrito((prev) => prev + n)}>
                {n}
              </BotonNumero>
            ))}
            <BotonNumero type="button" onClick={() => setEscrito((prev) => prev.slice(0, -1))}>
              ⌫
            </BotonNumero>
            <BotonNumero type="button" onClick={() => setEscrito((prev) => prev + '0')}>
              0
            </BotonNumero>
            <BotonNumero type="button" onClick={comprobar}>
              ✓
            </BotonNumero>
          </Teclado>
          {fallo && <Feedback $color={ROJO}>{fallo}</Feedback>}
          <Explicacion>Repasa la tabla del {cuenta.tabla}.</Explicacion>
          <Accion type="button" onClick={() => setCuenta(null)} style={{ background: GRIS }}>
            Ahora no
          </Accion>
        </Tarjeta>
      )}

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Accion type="button" onClick={reiniciar} style={{ background: NAVY }}>
          <FaRedo /> Empezar de nuevo
        </Accion>
      </div>
    </Page>
  );
};

export default CajasGame;
