// Las fichas de base diez.
//
// Estaban dentro de BaseDiezGame.js. Quinzet Derive construye números con las
// mismas piezas, así que la mesa vive aquí: los dos juegos usan el mismo
// material y solo se mantiene una copia.
//
// Las piezas se dibujan con un patrón SVG: un bloque de 100 es un cuadrado
// rayado en 10×10 y una barra de 10 es una columna de 10 casillas. Pinta igual
// que la libreta del niño y no son 900 rectos.

import React from 'react';
import styled from 'styled-components';

export const CELDA = 10;
export const COLOR_CIEN = '#845ef7';
export const COLOR_DIEZ = '#12b3b0';
export const COLOR_UNO = '#ff8a2a';

const NAVY = '#0b2b45';

// Bloque de 100: un cuadrado con la cuadrícula de 10×10.
const BloqueCien = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x={0} y={0} width={CELDA * 10} height={CELDA * 10} fill={COLOR_CIEN} rx="2" />
    <rect x={0} y={0} width={CELDA * 10} height={CELDA * 10} fill="url(#cuadricula-base-diez)" rx="2" />
    <rect x={0} y={0} width={CELDA * 10} height={CELDA * 10} fill="none" stroke={NAVY} strokeWidth="1" rx="2" />
  </g>
);

// Barra de 10: una columna de 10 casillas.
const BarraDiez = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x={0} y={0} width={CELDA} height={CELDA * 10} fill={COLOR_DIEZ} rx="2" />
    <rect x={0} y={0} width={CELDA} height={CELDA * 10} fill="url(#cuadricula-base-diez)" rx="2" />
    <rect x={0} y={0} width={CELDA} height={CELDA * 10} fill="none" stroke={NAVY} strokeWidth="1" rx="2" />
  </g>
);

// Cubo de 1.
const Cubo = ({ x, y }) => (
  <rect
    x={x}
    y={y}
    width={CELDA}
    height={CELDA}
    fill={COLOR_UNO}
    stroke={NAVY}
    strokeWidth="1"
    rx="1.5"
  />
);

// Una columna de la mesa: los bloques y, debajo, el nombre de la posición.
const Columna = ({ titulo, ancho, alto, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}>
    <div style={{ minWidth: ancho, display: 'flex', justifyContent: 'center' }}>
      <svg
        width={ancho}
        height={alto}
        viewBox={`0 0 ${ancho} ${alto}`}
        style={{ maxWidth: '100%', height: 'auto' }}
        aria-hidden="true"
      >
        {children}
      </svg>
    </div>
    {titulo && (
      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#5b7286', whiteSpace: 'nowrap' }}>
        {titulo}
      </div>
    )}
  </div>
);

// La cuadrícula de 10×10 con la que se rayan los bloques de 100 y las barras
// de 10. Es un patrón, así que un bloque de 100 son dos rectos y no cien.
const Cuadricula = () => (
  <defs>
    <pattern id="cuadricula-base-diez" width={CELDA} height={CELDA} patternUnits="userSpaceOnUse">
      <path
        d={`M ${CELDA} 0 L 0 0 0 ${CELDA}`}
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="0.9"
      />
    </pattern>
  </defs>
);

// La mesa entera: columnas de centenas, decenas y unidades, todas apoyadas en
// la misma base para que se lean como una tabla de valor posicional.
export const Mesa = ({ partes, titulos = true }) => {
  const { centenas, decenas, unidades } = partes;
  const porFila = 4;
  const filasCien = Math.ceil(centenas / porFila);
  const anchoCien = Math.min(centenas, porFila) * CELDA * 10;
  const anchoDiez = decenas * CELDA;
  const anchoUno = unidades * CELDA;
  const alto = Math.max(filasCien * CELDA * 10, CELDA * 10, CELDA);

  return (
    <div
      style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-end', justifyContent: 'center' }}
      role="img"
      aria-label={`${centenas} centenas, ${decenas} decenas y ${unidades} unidades`}
    >
      <Columna titulo={titulos ? 'Centenas' : ''} ancho={Math.max(anchoCien, CELDA)} alto={alto}>
        <Cuadricula />
        {Array.from({ length: centenas }, (_, i) => (
          <BloqueCien
            key={`c${i}`}
            x={(i % porFila) * CELDA * 10}
            y={alto - (filasCien - Math.floor(i / porFila)) * CELDA * 10}
          />
        ))}
      </Columna>

      <Columna titulo={titulos ? 'Decenas' : ''} ancho={Math.max(anchoDiez, CELDA)} alto={alto}>
        <Cuadricula />
        {Array.from({ length: decenas }, (_, i) => (
          <BarraDiez key={`d${i}`} x={i * CELDA} y={alto - CELDA * 10} />
        ))}
      </Columna>

      <Columna titulo={titulos ? 'Unidades' : ''} ancho={Math.max(anchoUno, CELDA)} alto={alto}>
        {Array.from({ length: unidades }, (_, i) => (
          <Cubo key={`u${i}`} x={i * CELDA} y={alto - CELDA} />
        ))}
      </Columna>
    </div>
  );
};

// El número que hay debajo de la mesa.
export const MesaLeyenda = styled.div`
  text-align: center;
  font-weight: 800;
  font-size: 1.35rem;
  margin-top: 0.4rem;
`;
