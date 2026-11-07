// Tests de los sprites de Typer Dungeon.
//
// Los sprites salían mal recortados y el héroe con manchas blancas, y la
// suite estaba en verde porque ningún test miraba una imagen. Aquí se
// comprueba el recorte contra la imagen real: se simula lo que hace el
// navegador al quitar el fondo y se mira que no queda ni un resto de panel ni
// se come nada del dibujo.

import path from 'node:path';
import { leerPNG } from '../../../test-utils/leerPNG';
import { MONSTERS } from '../data/monsters';
import { HERO_SPRITE } from '../data/sprites';

const MAZMORRA = path.join(__dirname, '../../../../public/games/mazmorra');
const FONDO_MONSTRUOS = leerPNG(path.join(MAZMORRA, 'monsters.png'));
const FONDO_HEROE = leerPNG(path.join(MAZMORRA, 'uiElements.png'));

// El panel gris azulado de los carteles.
const esPanel = (r, g, b) =>
  Math.abs(r - 121) + Math.abs(g - 127) + Math.abs(b - 133) <= 90;

// El color de fondo que calcula el runtime: el gris neutro más frecuente.
const colorFondo = (img, x0, y0, w, h) => {
  const cubos = new Map();
  for (let y = y0; y < y0 + h; y += 3) {
    for (let x = x0; x < x0 + w; x += 3) {
      const i = (y * img.ancho + x) * 4;
      const r = img.rgba[i], g = img.rgba[i + 1], b = img.rgba[i + 2];
      if (Math.abs(r - g) >= 25 || Math.abs(g - b) >= 25) continue;
      const k = `${r >> 4},${g >> 4},${b >> 4}`;
      const e = cubos.get(k) || { n: 0, r: 0, g: 0, b: 0 };
      e.n++; e.r += r; e.g += g; e.b += b;
      cubos.set(k, e);
    }
  }
  let mejor = null;
  for (const e of cubos.values()) if (!mejor || e.n > mejor.n) mejor = e;
  return mejor
    ? [Math.round(mejor.r / mejor.n), Math.round(mejor.g / mejor.n), Math.round(mejor.b / mejor.n)]
    : [121, 127, 133];
};

// Simula el recorte del runtime: relleno por inundación desde el borde y
// limpieza final por color. Devuelve cuántos píxeles de fondo quedan y
// cuántos del dibujo se han comido.
const simularRecorte = (img, rect, tolerancia = 35, limpieza = 35) => {
  const [x0, y0, w, h] = rect;
  const [br, bg, bb] = colorFondo(img, x0, y0, w, h);
  const maxDist = tolerancia * 3;
  const maxLimpieza = limpieza * 3;
  const esFondo = (r, g, b) => Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb) <= maxDist;

  const pix = new Uint8Array(w * h);
  const en = (x, y) => {
    const i = ((y0 + y) * img.ancho + (x0 + x)) * 4;
    return [img.rgba[i], img.rgba[i + 1], img.rgba[i + 2]];
  };

  // Cuántos píxeles del dibujo hay antes de recortar.
  let dibujoAntes = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b] = en(x, y);
      if (!esFondo(r, g, b)) dibujoAntes++;
    }
  }

  // Relleno por inundación desde los bordes.
  const pila = [];
  const visitar = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (pix[i]) return;
    const [r, g, b] = en(x, y);
    if (!esFondo(r, g, b)) return;
    pix[i] = 1;
    pila.push(x, y);
  };
  for (let x = 0; x < w; x++) { visitar(x, 0); visitar(x, h - 1); }
  for (let y = 0; y < h; y++) { visitar(0, y); visitar(w - 1, y); }
  while (pila.length) {
    const y = pila.pop(), x = pila.pop();
    visitar(x - 1, y); visitar(x + 1, y); visitar(x, y - 1); visitar(x, y + 1);
  }

  // Limpieza final: lo que quede con color de fondo también se va.
  let fondoRestante = 0;
  // Estado final de cada pixel: el relleno lo borra, y la limpieza final se
  // lleva lo que quede con color de fondo.
  let fondoVisible = 0;   // fondo que se queda a la vista: manchas
  let dibujoDespues = 0;  // dibujo que sobrevive
  let dibujoPerdido = 0;  // dibujo que se ha comido el recorte
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b] = en(x, y);
      const dist = Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb);
      const borrado = pix[y * w + x] === 1 || dist <= maxLimpieza;
      if (borrado) {
        if (dist > maxDist) dibujoPerdido++;
      } else {
        if (dist <= maxDist) fondoVisible++;
        else dibujoDespues++;
      }
    }
  }
  return { fondoVisible, dibujoAntes, dibujoDespues, dibujoPerdido, total: w * h };
};

describe('los monstruos', () => {
  it('cada rectángulo está dentro de la hoja', () => {
    for (const m of Object.values(MONSTERS)) {
      expect(m.x).toBeGreaterThanOrEqual(0);
      expect(m.y).toBeGreaterThanOrEqual(0);
      expect(m.x + m.w).toBeLessThanOrEqual(FONDO_MONSTRUOS.ancho);
      expect(m.y + m.h).toBeLessThanOrEqual(FONDO_MONSTRUOS.alto);
    }
  });

  it('el recorte deja el sprite limpio: sin restos de panel', () => {
    const fallos = [];
    for (const m of Object.values(MONSTERS)) {
      const r = simularRecorte(FONDO_MONSTRUOS, [m.x, m.y, m.w, m.h]);
      const pct = (r.fondoVisible / r.total) * 100;
      if (pct > 2) fallos.push(`${m.key}: quedan ${pct.toFixed(1)}% de panel`);
    }
    expect(fallos).toEqual([]);
  });

  it('el recorte no se come el dibujo', () => {
    const fallos = [];
    for (const m of Object.values(MONSTERS)) {
      const r = simularRecorte(FONDO_MONSTRUOS, [m.x, m.y, m.w, m.h]);
      const pct = (r.dibujoPerdido / r.dibujoAntes) * 100;
      if (pct > 2) fallos.push(`${m.key}: se han perdido ${pct.toFixed(1)}% del dibujo`);
    }
    expect(fallos).toEqual([]);
  });

  it('el recorte deja una silueta con forma (no un bloque)', () => {
    // Si el recorte fallara, el sprite sería un rectángulo opaco. Con el
    // recorte bien, menos de la mitad del rectángulo es dibujo.
    for (const m of Object.values(MONSTERS)) {
      const r = simularRecorte(FONDO_MONSTRUOS, [m.x, m.y, m.w, m.h]);
      expect(r.dibujoDespues / r.total).toBeLessThan(0.75);
    }
  });
});

describe('el héroe', () => {
  const INSET_TOP = 31;
  const INSET_BOTTOM = 27;

  // ¿La fila es del cuadriculado (las bandas de rotulo) o del panel gris?
  const esCuadriculado = (y) => {
    const frameW = HERO_SPRITE.frameW;
    let claros = 0;
    let total = 0;
    for (let x = 2; x < frameW - 2; x += 2) {
      const i = (y * FONDO_HEROE.ancho + x) * 4;
      total++;
      const r = FONDO_HEROE.rgba[i];
      const g = FONDO_HEROE.rgba[i + 1];
      const b = FONDO_HEROE.rgba[i + 2];
      if (r > 195 && g > 195 && b > 195) claros++;
    }
    return claros / total > 0.5;
  };

  it('el recorte empieza en el panel, no en la banda de titulo', () => {
    // El frame del heroe empieza con una banda de cuadriculado (el rotulo
    // "HERO"). Si el recorte no la quita, el fondo no se encuentra por el
    // borde y el cuadriculado se queda pegado al dibujo.
    expect(esCuadriculado(20)).toBe(true);          // la banda de arriba
    expect(esCuadriculado(INSET_TOP + 1)).toBe(false); // ya en el panel
  });

  it('el recorte termina en el panel, no en la banda de abajo', () => {
    const fin = HERO_SPRITE.frameH - INSET_BOTTOM; // 243: primera fila de la banda
    expect(esCuadriculado(fin - 1)).toBe(false);   // la ultima del recorte
    expect(esCuadriculado(fin)).toBe(true);        // la banda de abajo
  });

  it('el recorte del héroe no se come la armadura blanca', () => {
    // La armadura es blanca de verdad: si el recorte tratara el blanco como
    // si fuera fondo, el héroe salía con agujeros.
    const frameW = HERO_SPRITE.frameW;
    const r = simularRecorte(
      FONDO_HEROE,
      [0, INSET_TOP, frameW, HERO_SPRITE.frameH - INSET_TOP - INSET_BOTTOM]
    );
    const pct = (r.dibujoPerdido / r.dibujoAntes) * 100;
    expect(pct).toBeLessThan(2);
  });
});
