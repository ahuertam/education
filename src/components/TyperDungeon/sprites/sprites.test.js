// Tests de los sprites de Typer Dungeon.
//
// Los sprites salian mal recortados y el heroe con manchas blancas, y la
// suite estaba en verde porque ningun test miraba una imagen. Aqui se
// comprueba la hoja recortada (scripts/recortar-sprites.mjs): el fondo del
// panel tiene que estar transparente (alfa 0), el dibujo intacto y las
// figuras con forma (no un rectangulo opaco).

import path from 'node:path';
import { leer } from '../../../test-utils/leerPNG';
import { MONSTERS } from '../data/monsters';
import { HERO_SPRITE } from '../data/sprites';

const MAZMORRA = path.join(__dirname, '../../../../assets-originales/mazmorra');
const MONSTRUOS = leer(path.join(MAZMORRA, 'monsters-recortado.png'));
const HEROE = leer(path.join(MAZMORRA, 'uiElements-recortado.png'));

// El gris azulado del panel de los carteles.
const esPanel = (r, g, b) =>
  Math.abs(r - 121) <= 22 && Math.abs(g - 127) <= 22 && Math.abs(b - 133) <= 22;

/**
 * Cuenta lo que queda dentro de un rectangulo: los pixeles opacos que son
 * del color del panel (restos de fondo) y la silueta (caja de los pixeles
 * con dibujo), para ver que no es un bloque.
 *
 * Un resto de panel es un manchon: un pixel del color del panel con mas
 * vecinos tambien del panel. Los bordes del dibujo, suavizados, tambien son
 * del color del panel, pero van sueltos y no cuentan.
 */
function analizar(img, x0, y0, w, h) {
  let opacos = 0, panel = 0, blancos = 0;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const esPanelEn = (i, j) => {
    if (i < 0 || j < 0 || i >= w || j >= h) return false;
    const s = ((y0 + j) * img.ancho + (x0 + i)) * 4;
    if (img.rgba[s + 3] < 250) return false;
    return esPanel(img.rgba[s], img.rgba[s + 1], img.rgba[s + 2]);
  };
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const s = ((y0 + j) * img.ancho + (x0 + i)) * 4;
      const a = img.rgba[s + 3];
      if (a < 250) continue;
      opacos++;
      if (esPanel(img.rgba[s], img.rgba[s + 1], img.rgba[s + 2])) {
        let vecinos = 0;
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          if (esPanelEn(i + di, j + dj)) vecinos++;
        }
        if (vecinos >= 3) panel++;
      }
      if (img.rgba[s] > 200 && img.rgba[s + 1] > 200 && img.rgba[s + 2] > 200) blancos++;
      if (i < minX) minX = i;
      if (i > maxX) maxX = i;
      if (j < minY) minY = j;
      if (j > maxY) maxY = j;
    }
  }
  const bbox = maxX < 0 ? null : { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1 };
  return { opacos, panel, blancos, bbox, total: w * h };
}

describe('los monstruos', () => {
  it('cada rectángulo está dentro de la hoja', () => {
    for (const m of Object.values(MONSTERS)) {
      expect(m.x).toBeGreaterThanOrEqual(0);
      expect(m.y).toBeGreaterThanOrEqual(0);
      expect(m.x + m.w).toBeLessThanOrEqual(MONSTRUOS.ancho);
      expect(m.y + m.h).toBeLessThanOrEqual(MONSTRUOS.alto);
    }
  });

  it('el panel desaparece: las esquinas del recorte quedan transparentes', () => {
    // El recorte es por inundacion (el panel se quita desde fuera): si
    // queda panel alrededor de la figura, las esquinas siguen pintadas.
    for (const m of Object.values(MONSTERS)) {
      for (const [cx, cy] of [
        [m.x, m.y], [m.x + m.w - 1, m.y], [m.x, m.y + m.h - 1], [m.x + m.w - 1, m.y + m.h - 1],
      ]) {
        const s = (cy * MONSTRUOS.ancho + cx) * 4;
        expect(MONSTRUOS.rgba[s + 3]).toBe(0);
      }
    }
  });

  it('el recorte deja una silueta con forma (no un bloque)', () => {
    // Si el recorte fallara, el sprite seria un rectangulo opaco. Con el
    // recorte bien, menos de la mitad del rectangulo es dibujo.
    for (const m of Object.values(MONSTERS)) {
      const r = analizar(MONSTRUOS, m.x, m.y, m.w, m.h);
      expect(r.bbox).not.toBeNull();
      expect(r.opacos / r.total).toBeLessThan(0.8);
    }
  });

  it('fuera de las figuras no queda nada opaco', () => {
    // La hoja es una imagen nueva: solo hay dibujo dentro de los rectangulos.
    const dentro = new Uint8Array(MONSTRUOS.ancho * MONSTRUOS.alto);
    for (const m of Object.values(MONSTERS)) {
      for (let j = m.y; j < m.y + m.h; j++) {
        for (let i = m.x; i < m.x + m.w; i++) dentro[j * MONSTRUOS.ancho + i] = 1;
      }
    }
    let fuera = 0;
    for (let j = 0; j < MONSTRUOS.alto; j++) {
      for (let i = 0; i < MONSTRUOS.ancho; i++) {
        if (dentro[j * MONSTRUOS.ancho + i]) continue;
        const s = (j * MONSTRUOS.ancho + i) * 4;
        if (MONSTRUOS.rgba[s + 3] > 0) fuera++;
      }
    }
    expect(fuera).toBe(0);
  });
});

describe('el héroe', () => {
  const CELDA_W = HERO_SPRITE.frameW;
  const CELDA_H = HERO_SPRITE.frameH;

  it('la hoja tiene los 16 frames con la celda esperada', () => {
    expect(HEROE.ancho).toBe(CELDA_W * 8);
    expect(HEROE.alto).toBe(CELDA_H * 2);
  });

  it('el panel desaparece: el fondo de cada frame queda transparente', () => {
    for (let f = 0; f < 16; f++) {
      const x0 = (f % 8) * CELDA_W;
      const y0 = f < 8 ? 0 : CELDA_H;
      for (const [cx, cy] of [[x0, y0], [x0 + CELDA_W - 1, y0], [x0, y0 + CELDA_H - 1], [x0 + CELDA_W - 1, y0 + CELDA_H - 1]]) {
        const s = (cy * HEROE.ancho + cx) * 4;
        expect(HEROE.rgba[s + 3]).toBe(0);
      }
    }
  });

  it('no queda la línea blanca del separador entre frames', () => {
    // El separador era una columna blanca de arriba abajo al lado de la
    // figura. Ninguna columna de la celda puede estar llena de blanco.
    for (let f = 0; f < 16; f++) {
      const x0 = (f % 8) * CELDA_W;
      const y0 = f < 8 ? 0 : CELDA_H;
      for (let i = 0; i < CELDA_W; i++) {
        let blancos = 0, opacos = 0;
        for (let j = 0; j < CELDA_H; j++) {
          const s = ((y0 + j) * HEROE.ancho + x0 + i) * 4;
          if (HEROE.rgba[s + 3] < 250) continue;
          opacos++;
          if (HEROE.rgba[s] > 200 && HEROE.rgba[s + 1] > 200 && HEROE.rgba[s + 2] > 200) blancos++;
        }
        if (opacos / CELDA_H > 0.9) expect(blancos / opacos).toBeLessThan(0.9);
      }
    }
  });

  it('los frames de idle se alinean: la animación no baila', () => {
    // Los 8 frames de idle tienen que ocupar la misma caja, o el heroe
    // cambiaria de tamano y de sitio en cada tick.
    const cajas = [];
    for (let f = 0; f < 8; f++) {
      const r = analizar(HEROE, f * CELDA_W, 0, CELDA_W, CELDA_H);
      expect(r.bbox).not.toBeNull();
      cajas.push(r.bbox);
    }
    const alturas = cajas.map(c => c.h);
    const anchos = cajas.map(c => c.w);
    expect(Math.max(...alturas) - Math.min(...alturas)).toBeLessThanOrEqual(2);
    expect(Math.max(...anchos) - Math.min(...anchos)).toBeLessThanOrEqual(6);
    // Y todos pegados a la misma esquina.
    for (const c of cajas) {
      expect(Math.abs(c.minX - cajas[0].minX)).toBeLessThanOrEqual(3);
      expect(Math.abs(c.maxY - cajas[0].maxY)).toBeLessThanOrEqual(2);
    }
    // El ancho de la figura es el que usa el juego para escalarla: si la
    // hoja cambia, este dato tiene que cambiar con ella.
    expect(Math.abs(anchos[0] - HERO_SPRITE.figureW)).toBeLessThanOrEqual(6);
  });

  it('la armadura y el casco del heroe no se come', () => {
    // Si el recorte tratara el blanco (o el gris del casco, que es el mismo
    // que el del panel) como si fuera fondo, el heroe salia con agujeros.
    const r = analizar(HEROE, 0, 0, CELDA_W, CELDA_H);
    expect(r.blancos).toBeGreaterThan(50);
    // Y el casco (gris del panel, dentro de la silueta) se queda opaco.
    expect(r.panel).toBeGreaterThan(50);
  });
});
