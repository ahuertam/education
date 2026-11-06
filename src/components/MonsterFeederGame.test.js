// Tests de "Alimenta al Monstruo".
//
// El juego estuvo roto mucho tiempo sin que ningún test lo notara: la lógica
// funcionaba, pero los sprites se recortaban con las medidas de una versión
// anterior de la imagen. El test clave es el de las dimensiones: si alguien
// vuelve a cambiar el PNG sin tocar el CSS, falla aquí.

import fs from 'node:fs';
import path from 'node:path';
import { render, screen, fireEvent, act } from '@testing-library/react';
import MonsterFeederGame, { CELDA_W, CELDA_H, COMIDAS } from './MonsterFeederGame';

// Las dimensiones reales del PNG, leídas de su cabecera IHDR.
const dimensionesPNG = () => {
  const buf = fs.readFileSync(path.join(__dirname, '../../public/moster2.png'));
  return { ancho: buf.readUInt32BE(16), alto: buf.readUInt32BE(20) };
};

const dataTransfer = () => ({
  effectAllowed: '',
  dropEffect: '',
  setData: () => {},
  getData: () => '',
});

const jugar = () => {
  render(<MonsterFeederGame onBack={() => {}} operation="addition" />);
  fireEvent.click(screen.getByText('¡Jugar!'));
};

// Las comidas se localizan por el número que llevan encima.
const comidaDe = (numero) => screen.getByText(String(numero)).parentElement;

// La cuenta que se está pidiendo, para saber qué comida es la buena.
const cuenta = () => {
  const texto = screen.getByText(/= \?/).textContent;
  const [, a, , b] = texto.match(/(\d+)\s*([+\-×÷])\s*(\d+)/);
  return Number(a) + Number(b);
};

// La boca del monstruo, que es donde se suelta la comida.
const boca = () => screen.getByAltText('Monster').parentElement;

describe('las medidas de los sprites', () => {
  it('coinciden con la imagen real', () => {
    const { ancho, alto } = dimensionesPNG();
    // La hoja es de 4 columnas y 3 filas.
    expect(ancho / 4).toBeCloseTo(CELDA_W, 2);
    expect(alto / 3).toBeCloseTo(CELDA_H, 2);
  });

  it('las seis comidas son casillas distintas de la hoja', () => {
    expect(COMIDAS).toHaveLength(6);
    const claves = COMIDAS.map((c) => `${c.col}-${c.row}`);
    expect(new Set(claves).size).toBe(6);
    // Ninguna sale de la hoja.
    for (const c of COMIDAS) {
      expect(c.col).toBeGreaterThanOrEqual(0);
      expect(c.col).toBeLessThan(4);
      expect(c.row).toBeGreaterThanOrEqual(1);
      expect(c.row).toBeLessThan(3);
    }
  });
});

describe('Alimenta al Monstruo', () => {
  it('pide la cuenta y muestra seis comidas distintas', () => {
    jugar();
    expect(screen.getByText(/= \?/)).toBeTruthy();
    const numeros = screen.getAllByText(/^\d+$/).map((n) => Number(n.textContent));
    expect(numeros).toHaveLength(6);
    expect(new Set(numeros).size).toBe(6);
  });

  it('arrastrar la comida correcta suma puntos y lo celebra', () => {
    jugar();
    const correcta = cuenta();

    const elemento = comidaDe(correcta);
    fireEvent.dragStart(elemento, { dataTransfer: dataTransfer() });
    fireEvent.drop(boca(), { dataTransfer: dataTransfer() });

    expect(screen.getByText('¡Correcto! 😋')).toBeTruthy();
    expect(screen.getByText(/⭐ 10/)).toBeTruthy();
  });

  it('arrastrar la comida equivocada avisa y no suma', () => {
    jugar();
    const correcta = cuenta();

    const numeros = screen.getAllByText(/^\d+$/).map((n) => Number(n.textContent));
    const mala = numeros.find((n) => n !== correcta);

    const elemento = comidaDe(mala);
    fireEvent.dragStart(elemento, { dataTransfer: dataTransfer() });
    fireEvent.drop(boca(), { dataTransfer: dataTransfer() });

    expect(screen.getByText('¡Ups! 😢')).toBeTruthy();
    expect(screen.getByText(/⭐ 0/)).toBeTruthy();
  });

  it('el mensaje de error no está en la pantalla hasta que hay error', () => {
    jugar();
    expect(screen.queryByText('¡Ups! 😢')).toBeNull();
    expect(screen.queryByText('¡Correcto! 😋')).toBeNull();
  });
});
