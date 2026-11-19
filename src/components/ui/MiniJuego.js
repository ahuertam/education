// El minijuego de premio.
//
// Veinte segundos de arcade que el niño se gana al terminar una partida. Es
// el regalo de ADI: en vez de "otra cuenta", un momento de juego.
//
// El canvas solo dibuja. Las reglas están en ./minijuego/logic.js, que es lo
// que se puede testear.

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  DURACION,
  REGLAS,
  actualizar,
  crearJuego,
  estrellasDe,
  haTerminado,
  moverJugador,
  tocar,
} from './minijuego/logic';

const Contenedor = styled.div`
  position: relative;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  aspect-ratio: 16 / 10;
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(180deg, #123a5e 0%, #0b2b45 100%);
  border: 2px solid rgba(255, 255, 255, 0.15);
  touch-action: none;
  user-select: none;
`;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
`;

const Hud = styled.div`
  position: absolute;
  top: 0.6rem;
  left: 0.8rem;
  right: 0.8rem;
  display: flex;
  gap: 0.8rem;
  font-weight: 800;
  color: #fff;
  font-size: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  pointer-events: none;
`;

const Pildora = styled.span`
  background: rgba(0, 0, 0, 0.35);
  border-radius: 20px;
  padding: 0.2rem 0.7rem;
`;

const Ayuda = styled.p`
  position: absolute;
  bottom: 0.6rem;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;
  margin: 0;
  pointer-events: none;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const AYUDA = {
  atrapa: 'Mueve el ratón (o el dedo) para coger las estrellas y esquivar las bombas.',
  esquiva: 'Esquiva las bombas. ¡Cada segundo que aguantes es un punto!',
  golpea: 'Pincha las dianas 🦖 antes de que se vayan. Cuidado con los mosquitos.',
};

const JUGADOR = { atrapa: '🧺', esquiva: '🚀', golpea: '☝️' };

const MiniJuego = ({ variante, onFin }) => {
  const canvasRef = useRef(null);
  const estadoRef = useRef(null);
  const terminadoRef = useRef(false);
  const [hud, setHud] = useState({ puntos: 0, vidas: 3, tiempo: DURACION });

  // El estado del juego vive en una ref: cambia 60 veces por segundo y no
  // puede ir por el estado de React.
  if (!estadoRef.current) {
    estadoRef.current = crearJuego({ variante, ancho: 640, alto: 400 });
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let animacion = 0;
    let ultimo = performance.now();
    let cuadros = 0;

    const dimensionar = () => {
      const caja = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(caja.width * dpr);
      canvas.height = Math.round(caja.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const estado = estadoRef.current;
      estado.ancho = caja.width;
      estado.alto = caja.height;
    };

    const dibujar = () => {
      const estado = estadoRef.current;
      const regla = REGLAS[estado.variante];

      ctx.clearRect(0, 0, estado.ancho, estado.alto);

      estado.entidades.forEach((e) => {
        const emoji = e.tipo === 'bien' ? regla.bien.emoji : regla.mal.emoji;
        ctx.font = `${e.r * 2}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, e.x, e.y);
      });

      if (estado.variante !== 'golpea') {
        ctx.font = `${estado.jugador.r * 2}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = estado.invulnerable > 0 ? 0.4 : 1;
        ctx.fillText(JUGADOR[estado.variante], estado.jugador.x, estado.jugador.y);
        ctx.globalAlpha = 1;
      }
    };

    const paso = (ahora) => {
      const dt = Math.min(0.05, (ahora - ultimo) / 1000);
      ultimo = ahora;
      const estado = estadoRef.current;

      if (!haTerminado(estado)) {
        estadoRef.current = actualizar(estado, dt);
      }

      dibujar();

      // El HUD se refresca 10 veces por segundo: a 60 el navegador se pasa el
      // rato pintando texto que no ha cambiado.
      cuadros += 1;
      if (cuadros % 6 === 0) {
        setHud({
          puntos: estadoRef.current.puntos,
          vidas: estadoRef.current.vidas,
          tiempo: Math.ceil(estadoRef.current.tiempo),
        });
      }

      if (haTerminado(estadoRef.current) && !terminadoRef.current) {
        terminadoRef.current = true;
        const puntos = estadoRef.current.puntos;
        onFin?.({
          puntos,
          estrellas: estrellasDe(puntos, variante),
          variante,
        });
        return;
      }

      animacion = requestAnimationFrame(paso);
    };

    dimensionar();
    window.addEventListener('resize', dimensionar);
    animacion = requestAnimationFrame(paso);

    return () => {
      cancelAnimationFrame(animacion);
      window.removeEventListener('resize', dimensionar);
    };
  }, [variante, onFin]);

  // El ratón o el dedo mueven la mano; un toque pincha.
  const apuntar = (evento) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const caja = canvas.getBoundingClientRect();
    const x = evento.clientX - caja.left;
    const y = evento.clientY - caja.top;
    estadoRef.current = moverJugador(estadoRef.current, x, y);
    if (evento.type === 'pointerdown') {
      estadoRef.current = tocar(estadoRef.current);
    }
  };

  return (
    <Contenedor>
      <Canvas
        ref={canvasRef}
        onPointerMove={apuntar}
        onPointerDown={apuntar}
        aria-label={`Minijuego ${REGLAS[variante].nombre}`}
      />
      <Hud>
        <Pildora>⏱ {hud.tiempo}s</Pildora>
        <Pildora>⭐ {hud.puntos}</Pildora>
        {variante === 'esquiva' && <Pildora>❤️ {hud.vidas}</Pildora>}
      </Hud>
      <Ayuda>{AYUDA[variante]}</Ayuda>
    </Contenedor>
  );
};

export default MiniJuego;
