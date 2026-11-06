// La interfaz común de los juegos de rondas.
//
// Ocho juegos (cuatro de fracciones y números, cuatro nuevos) tienen la misma
// estructura: una barra con el botón de volver, las pastillas de progreso, una
// tarjeta con el enunciado, el dibujo, las opciones y el feedback. Antes eso
// estaba copiado en cada fichero; aquí vive una vez.
//
// Cada juego sigue siendo dueña de su lógica: esto solo es el marco.

import React from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaRedo, FaTrophy } from 'react-icons/fa';
import { formatRankDate } from '../../utils/rankings';

export const TEAL = '#12b3b0';
export const NARANJA = '#ff8a2a';
export const NAVY = '#0b2b45';
export const VERDE = '#2e9e5b';
export const ROJO = '#e05555';
export const GRIS = '#5b7286';

export const Page = styled.div`
  min-height: 100vh;
  padding: 1rem 1rem 3rem;
  font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;
  color: ${NAVY};
  background:
    radial-gradient(900px 500px at 15% 0%, rgba(18, 179, 176, 0.18), transparent 60%),
    radial-gradient(800px 500px at 90% 10%, rgba(255, 138, 42, 0.16), transparent 60%),
    linear-gradient(160deg, #f2fbfb 0%, #ffffff 55%, #fff6ec 100%);
`;

export const TopBar = styled.header`
  max-width: 900px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
`;

export const Volver = styled.button`
  background: #ffffff;
  border: 2px solid rgba(11, 43, 69, 0.15);
  color: ${NAVY};
  padding: 0.55rem 1.1rem;
  border-radius: 30px;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;

  &:hover { border-color: ${TEAL}; color: ${TEAL}; }
`;

export const Titulo = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  flex: 1;
  min-width: 12rem;
`;

export const Pastilla = styled.span`
  background: ${(props) => props.$tono || 'rgba(11, 43, 69, 0.07)'};
  color: ${(props) => (props.$tono ? '#ffffff' : NAVY)};
  border-radius: 30px;
  padding: 0.4rem 0.9rem;
  font-weight: 700;
  font-size: 0.92rem;
  white-space: nowrap;
`;

export const Tarjeta = styled.section`
  max-width: 900px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 26px;
  padding: 1.6rem 1.4rem 1.8rem;
  box-shadow: 0 18px 40px rgba(11, 43, 69, 0.10);
  border: 1px solid rgba(11, 43, 69, 0.06);
`;

export const Enunciado = styled.h2`
  margin: 0 0 0.4rem;
  font-size: 1.35rem;
  font-weight: 800;
  text-align: center;
`;

export const Ayuda = styled.p`
  margin: 0 0 1.2rem;
  text-align: center;
  color: ${GRIS};
  font-size: 1rem;
  line-height: 1.5;
`;

export const Visual = styled.div`
  display: flex;
  justify-content: center;
  margin: 0.4rem 0 1.4rem;
`;

export const Opciones = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.9rem;
`;

export const Opcion = styled.button`
  background: ${(props) =>
    props.$acierto ? 'rgba(46, 158, 91, 0.16)' :
    props.$fallo ? 'rgba(224, 85, 85, 0.16)' : '#f7fafc'};
  border: 3px solid ${(props) =>
    props.$acierto ? VERDE :
    props.$fallo ? ROJO : 'rgba(11, 43, 69, 0.12)'};
  border-radius: 18px;
  padding: 1rem 0.6rem;
  cursor: pointer;
  font: inherit;
  color: ${NAVY};
  font-weight: 800;
  font-size: 1.5rem;
  min-height: 4.2rem;
  transition: transform 0.12s ease, border-color 0.12s ease;

  &:hover:not(:disabled) { border-color: ${TEAL}; transform: translateY(-2px); }
  &:disabled { cursor: default; }
`;

export const Feedback = styled.p`
  margin: 1.2rem 0 0;
  text-align: center;
  font-weight: 800;
  font-size: 1.05rem;
  min-height: 1.6rem;
  color: ${(props) => props.$color || VERDE};
`;

export const Explicacion = styled.p`
  margin: 0.4rem 0 0;
  text-align: center;
  color: ${GRIS};
  font-size: 0.98rem;
  line-height: 1.55;
`;

export const Accion = styled.button`
  display: block;
  margin: 1.2rem auto 0;
  background: ${TEAL};
  color: #ffffff;
  border: none;
  border-radius: 30px;
  padding: 0.75rem 1.8rem;
  font: inherit;
  font-weight: 800;
  font-size: 1.05rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover { background: #0f9a97; }
`;

export const Progreso = styled.div`
  max-width: 900px;
  margin: 0 auto 0.9rem;
  height: 10px;
  border-radius: 10px;
  background: rgba(11, 43, 69, 0.10);
  overflow: hidden;
`;

export const ProgresoBarra = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${TEAL}, ${NARANJA});
  border-radius: 10px;
  transition: width 0.35s ease;
`;

export const Campos = styled.form`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  align-items: flex-end;
`;

export const CampoGrupo = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
  font-size: 0.92rem;
  color: ${GRIS};
`;

export const Campo = styled.input`
  font: inherit;
  font-size: 1.6rem;
  font-weight: 800;
  text-align: center;
  width: min(260px, 70vw);
  padding: 0.5rem 0.8rem;
  border-radius: 16px;
  border: 3px solid ${(props) => (props.$fallo ? ROJO : TEAL)};
  color: ${NAVY};
  background: #f7fafc;
`;

export const Fichas = styled.div`
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  flex-wrap: wrap;
`;

export const Ficha = styled.button`
  background: ${(props) =>
    props.$puesta ? 'rgba(46, 158, 91, 0.16)' :
    props.$error ? 'rgba(224, 85, 85, 0.16)' : '#f7fafc'};
  border: 3px solid ${(props) =>
    props.$puesta ? VERDE :
    props.$error ? ROJO : 'rgba(11, 43, 69, 0.12)'};
  border-radius: 18px;
  padding: 1rem 1.2rem;
  cursor: pointer;
  font: inherit;
  color: ${NAVY};
  font-weight: 800;
  font-size: 1.6rem;
  min-height: 4.2rem;

  &:hover:not(:disabled) { border-color: ${TEAL}; transform: translateY(-2px); }
  &:disabled { cursor: default; }
`;

export const NumeroGrande = styled.div`
  font-size: clamp(3rem, 12vw, 5rem);
  font-weight: 900;
  letter-spacing: 0.04em;
  color: ${NAVY};
  background: #f7fafc;
  border: 2px solid rgba(11, 43, 69, 0.06);
  border-radius: 22px;
  padding: 0.5rem 1.6rem;
`;

export const Ranking = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0.6rem 0 0;
  display: grid;
  gap: 0.4rem;
`;

export const RankingFila = styled.li`
  display: flex;
  justify-content: space-between;
  background: #f7fafc;
  border-radius: 12px;
  padding: 0.55rem 0.9rem;
  font-weight: 700;
  font-size: 0.95rem;
`;

export const Vacio = styled.p`
  margin: 0.4rem 0 0;
  color: #7d93a5;
  font-size: 0.95rem;
`;

// La pantalla de fin de partida: la comparten todos los juegos.
export const PantallaFinal = ({ puntos, aciertos, rondas, mejorRacha, ranking, onReiniciar, onVolver }) => (
  <Tarjeta>
    <Enunciado>¡Partida terminada!</Enunciado>
    <Ayuda>
      Acertaste {aciertos} de {rondas} rondas. Tu mejor racha: {mejorRacha}.
    </Ayuda>
    <Visual>
      <Pastilla $tono={TEAL}>Puntos: {puntos}</Pastilla>
    </Visual>
    <Ranking>
      {(ranking?.top || []).length === 0 && (
        <Vacio>Todavía no hay partidas registradas. ¡Esta es la primera!</Vacio>
      )}
      {(ranking?.top || []).map((r, i) => (
        <RankingFila key={`${r.at}-${i}`}>
          <span>#{i + 1} — {r.score} pts</span>
          <span>{formatRankDate(r.at)}</span>
        </RankingFila>
      ))}
    </Ranking>
    <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
      <Accion type="button" onClick={onReiniciar}>
        <FaRedo /> Otra partida
      </Accion>
      <Accion type="button" onClick={onVolver} style={{ background: NAVY }}>
        <FaTrophy /> Volver al menú
      </Accion>
    </div>
  </Tarjeta>
);

// La barra de arriba, con las pastillas de progreso.
export const BarraJuego = ({ onBack, titulo, ronda, rondas, puntos, racha, extra }) => (
  <TopBar>
    <Volver type="button" onClick={onBack}>
      <FaArrowLeft /> Volver
    </Volver>
    <Titulo>{titulo}</Titulo>
    {extra}
    <Pastilla>Ronda {ronda}/{rondas}</Pastilla>
    <Pastilla $tono={TEAL}>Puntos: {puntos}</Pastilla>
    <Pastilla $tono={racha > 0 ? NARANJA : undefined}>Racha: {racha}</Pastilla>
  </TopBar>
);
