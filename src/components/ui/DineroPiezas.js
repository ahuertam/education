// Las piezas de dinero de euro.
//
// Vivían dentro de DineroGame.js. El Mercadillo Quinzet también paga con
// monedas y billetes, así que están aquí: los dos juegos usan las mismas
// piezas de verdad y solo se mantiene una lista.

import React from 'react';
import styled from 'styled-components';
import { numeroES } from '../../utils/matematicas';

// Las monedas de euro, con su color de verdad.
export const MONEDAS = [
  { valor: 0.01, etiqueta: '1 c', color: '#b87333', texto: '#ffffff' },
  { valor: 0.02, etiqueta: '2 c', color: '#b87333', texto: '#ffffff' },
  { valor: 0.05, etiqueta: '5 c', color: '#b87333', texto: '#ffffff' },
  { valor: 0.1, etiqueta: '10 c', color: '#d9b310', texto: '#0b2b45' },
  { valor: 0.2, etiqueta: '20 c', color: '#d9b310', texto: '#0b2b45' },
  { valor: 0.5, etiqueta: '50 c', color: '#d9b310', texto: '#0b2b45' },
  { valor: 1, etiqueta: '1 €', color: '#c3c9cf', texto: '#0b2b45' },
  { valor: 2, etiqueta: '2 €', color: '#d9b310', texto: '#0b2b45' },
];

// Los billetes de euro, con el color que tienen de verdad.
export const BILLETES = [
  { valor: 5, etiqueta: '5 €', color: '#b5b9b4' },
  { valor: 10, etiqueta: '10 €', color: '#d4655a' },
  { valor: 20, etiqueta: '20 €', color: '#4a83b0' },
  { valor: 50, etiqueta: '50 €', color: '#e08b2e' },
  { valor: 100, etiqueta: '100 €', color: '#5b9e6f' },
  { valor: 200, etiqueta: '200 €', color: '#d9b310' },
];

const Moneda = styled.div`
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: ${(props) => props.$color};
  border: 3px solid rgba(11, 43, 69, 0.35);
  color: ${(props) => props.$texto};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.95rem;
  box-shadow: 0 3px 8px rgba(11, 43, 69, 0.22);
`;

const Billete = styled.div`
  padding: 0.55rem 0.9rem;
  border-radius: 8px;
  background: ${(props) => props.$color};
  border: 2px solid rgba(11, 43, 69, 0.3);
  color: #0b2b45;
  font-weight: 800;
  font-size: 1.05rem;
  box-shadow: 0 3px 8px rgba(11, 43, 69, 0.18);
  min-width: 78px;
  text-align: center;
`;

// El dinero en castellano: coma para los céntimos y el euro detrás.
export const euros = (valor) => `${numeroES(Math.round(valor * 100) / 100)} €`;

// Una moneda suelta o un billete suelto.
export const Pieza = ({ tipo, indice }) => {
  if (tipo === 'moneda') {
    const m = MONEDAS[indice];
    return <Moneda $color={m.color} $texto={m.texto}>{m.etiqueta}</Moneda>;
  }
  const b = BILLETES[indice];
  return <Billete $color={b.color}>{b.etiqueta}</Billete>;
};

// El dinero de una cantidad, en las piezas menos posibles: primero los
// billetes y, para lo que queda, las monedas.
export const descomponer = (cantidad) => {
  let queda = Math.round(cantidad);
  const piezas = [];
  for (let i = BILLETES.length - 1; i >= 0; i--) {
    while (queda >= BILLETES[i].valor) {
      piezas.push({ tipo: 'billete', indice: i });
      queda -= BILLETES[i].valor;
    }
  }
  for (let i = MONEDAS.length - 1; i >= 0; i--) {
    while (queda >= MONEDAS[i].valor) {
      piezas.push({ tipo: 'moneda', indice: i });
      queda -= MONEDAS[i].valor;
    }
  }
  return piezas;
};
