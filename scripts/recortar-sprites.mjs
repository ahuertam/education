// Recorta las hojas de sprites de la mazmorra con alfa real.
//
// Las hojas originales son carteles de concepto: cada figura va sobre un panel
// gris con degradado vertical, con una banda de cuadriculado arriba (el
// rotulo) y otra abajo (el nombre del frame). El runtime las recortaba por
// color, y como el panel tiene degradado y ruido eso fallaba: quedaban islas
// de gris dentro de las figuras y se comia el blanco de verdad (la armadura
// del heroe, el hueso de los esqueletos).
//
// Aqui se hace un matte: el alfa de cada pixel es lo lejos que queda del
// color del panel. Como el degradado es vertical, el color de referencia se
// toma por fila (la mediana de las columnas de al lado de la figura, que son
// del panel).
//
//   node scripts/recortar-sprites.mjs
//
// Escribe las hojas recortadas en assets-originales/ y de ahi las pasa el
// conversor a WebP.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { leerPNG, escribirPNG } from './png.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FUENTES = path.join(RAIZ, 'assets-originales', 'mazmorra');

// El ruido del PNG (el degradado del panel tiembla unos pixeles) y el punto en
// el que un pixel ya es claramente dibujo.
const RUIDO = 26;
const NETO = 90;

// Cuanto puede desviarse el color del panel de una fila a la siguiente antes
// de pensar que la muestra esta contaminada (el degradado es continuo).
const SALTO = 9;

// Los rectangulos de cada figura y los frames del heroe. Viven en los datos
// del juego; aqui se repiten porque el script corre por fuera del bundler.
const MONSTRUOS = {
  goblin: [11, 88, 128, 137],
  slime: [184, 131, 162, 99],
  skeleton: [370, 52, 165, 175],
  gnoll: [674, 46, 167, 191],
  gazer: [883, 54, 165, 153],
  ogre: [1098, 44, 159, 194],
  minotaur: [12, 321, 227, 226],
  medusa: [282, 330, 112, 217],
  beholder: [430, 331, 201, 177],
  lich: [56, 604, 164, 222],
  ettin: [457, 594, 345, 234],
  dragon: [837, 351, 431, 479],
};

// El heroe: 8 frames de idle y 8 de ataque, con las bandas de rotulo
// quitadas por geometria.
//
// Los frames NO estan en una rejilla uniforme: los separadores blancos estan
// en 155, 315, 476, 640... (van saltando), asi que el ancho de 158 del codigo
// se comia el separador del frame siguiente. Por eso se miden los tramos
// reales de cada figura.
const FRAMES_HEROE = [
  [0, 155], [158, 314], [318, 475], [479, 638],
  [642, 798], [802, 962], [966, 1122], [1125, 1268],
];

// Las dos filas de frames del heroe. Los limites son generosos: dentro de
// cada bloque se detectan las bandas de rotulo (las filas casi blancas).
const BLOQUES_HEROE = [
  { nombre: 'idle', y0: 0, y1: 268 },
  { nombre: 'ataque', y0: 268, y1: 557 },
];

const BORDE = 3; // el borde vertical del frame (el separador blanco)

const mediana = (valores) => {
  if (!valores.length) return null;
  const copia = [...valores].sort((a, b) => a - b);
  return copia[Math.floor(copia.length / 2)];
};

const pixel = (img, x, y) => {
  if (x < 0 || y < 0 || x >= img.ancho || y >= img.alto) return null;
  const s = (y * img.ancho + x) * 4;
  return [img.rgba[s], img.rgba[s + 1], img.rgba[s + 2]];
};

/**
 * El color del panel de cada fila: la mediana de las columnas de al lado de
 * la figura (que son del panel). Como el degradado del panel es continuo,
 * una fila que se sale de la tendencia de sus vecinas es una fila
 * contaminada (la de cierre del frame, que es casi blanca, o una figura que
 * invade las columnas de la muestra): en ese caso manda la tendencia.
 */
function referenciasFila(img, y0, h, muestras) {
  const crudo = [];
  for (let j = 0; j < h; j++) {
    const puntos = [];
    for (const [a, b] of muestras) {
      for (let x = a; x < b; x++) {
        const p = pixel(img, x, y0 + j);
        if (p) puntos.push(p);
      }
    }
    crudo.push([
      mediana(puntos.map(p => p[0])) ?? 121,
      mediana(puntos.map(p => p[1])) ?? 127,
      mediana(puntos.map(p => p[2])) ?? 133,
    ]);
  }
  const refs = [];
  for (let j = 0; j < h; j++) {
    const ventana = crudo.slice(Math.max(0, j - 2), Math.min(h, j + 3));
    const tendencia = [0, 1, 2].map(k => mediana(ventana.map(c => c[k])));
    refs.push(tendencia.some((v, k) => Math.abs(v - crudo[j][k]) > SALTO) ? tendencia : crudo[j]);
  }
  return refs;
}

/**
 * Calcula el alfa de una region: cuan lejos queda cada pixel del color del
 * panel de esa fila.
 */
function matteRegion(img, rect, refs) {
  const [x0, y0, w, h] = rect;
  const salida = Buffer.alloc(w * h * 4);
  for (let j = 0; j < h; j++) {
    const [br, bg, bb] = refs[j];
    for (let i = 0; i < w; i++) {
      const p = pixel(img, x0 + i, y0 + j);
      const dist = Math.abs(p[0] - br) + Math.abs(p[1] - bg) + Math.abs(p[2] - bb);
      const t = Math.max(0, Math.min(1, (dist - RUIDO) / (NETO - RUIDO)));
      const d = (j * w + i) * 4;
      salida[d] = p[0]; salida[d + 1] = p[1]; salida[d + 2] = p[2];
      salida[d + 3] = Math.round(t * 255);
    }
  }
  return salida;
}

// --- El heroe -------------------------------------------------------------

/**
 * Las filas del panel dentro de un bloque de frames: las bandas de rotulo
 * (casi blancas) se quitan por arriba y por abajo. Se mira el ancho entero
 * del bloque para que las etiquetas de titulo (que son oscuras) no falseen
 * la deteccion.
 */
function filasDelPanel(img, y0, y1) {
  const esBanda = (y) => {
    let claros = 0, total = 0;
    for (let x = 0; x < img.ancho; x += 3) {
      const p = pixel(img, x, y);
      total++;
      if (p[0] > 200 && p[1] > 200 && p[2] > 200) claros++;
    }
    // Las filas de transicion (mitad blancas) tambien son banda: si se
    // dejaran dentro, el recorte las dejaria como una linea gris.
    return claros / total >= 0.35;
  };
  let y = y0;
  while (y < y1 && esBanda(y)) y++;
  const inicio = y;
  while (y < y1 && !esBanda(y)) y++;
  // La primera y la ultima fila del panel son el borde del frame (una linea
  // clara que el matte dejaria opaca). Se quitan: la figura nunca las toca.
  return [inicio + 1, y - 1];
}

function recortarHeroe(img) {
  const figuras = [];

  for (const bloque of BLOQUES_HEROE) {
    const [yPanel, finPanel] = filasDelPanel(img, bloque.y0, bloque.y1);
    console.log(`  ${bloque.nombre}: panel de las filas ${yPanel} a ${finPanel - 1}`);
    for (const [x0, x1] of FRAMES_HEROE) {
      const region = [x0 + BORDE, yPanel, x1 - x0 - BORDE * 2, finPanel - yPanel];
      // Las columnas de al lado de la figura (dentro del frame) son del panel.
      const izq = [region[0], region[0] + 7];
      const der = [region[0] + region[2] - 8, region[0] + region[2] - 1];
      const refs = referenciasFila(img, region[1], region[3], [izq, der]);
      const alfa = matteRegion(img, region, refs);
      // La silueta de la figura, en coordenadas propias del frame.
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let j = 0; j < region[3]; j++) {
        for (let i = 0; i < region[2]; i++) {
          if (alfa[(j * region[2] + i) * 4 + 3] < 24) continue;
          if (i < minX) minX = i;
          if (i > maxX) maxX = i;
          if (j < minY) minY = j;
          if (j > maxY) maxY = j;
        }
      }
      figuras.push({ region, alfa, minX, minY, maxX, maxY });
    }
  }

  // La caja comun: el union de las siluetas, en coordenadas propias de
  // cada frame (si se usaran las absolutas, la caja abarcania la hoja
  // entera). Con esto todos los frames quedan alineados y la animacion
  // no baila.
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const f of figuras) {
    if (f.minX < minX) minX = f.minX;
    if (f.maxX > maxX) maxX = f.maxX;
    if (f.minY < minY) minY = f.minY;
    if (f.maxY > maxY) maxY = f.maxY;
  }
  const MARGEN = 4;
  const celdaW = maxX - minX + 1 + MARGEN * 2;
  const celdaH = maxY - minY + 1 + MARGEN * 2;

  // Se escribe la hoja nueva: ocho frames por fila, todos en su sitio.
  const salida = Buffer.alloc(celdaW * 8 * celdaH * 2 * 4);
  figuras.forEach((f, indice) => {
    const [, , w, h] = f.region;
    const col = indice % 8;
    const fila = indice < 8 ? 0 : 1;
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const s = (j * w + i) * 4;
        const a = f.alfa[s + 3];
        if (a === 0) continue;
        const dx = i - minX + MARGEN;
        const dy = j - minY + MARGEN;
        if (dx < 0 || dy < 0 || dx >= celdaW || dy >= celdaH) continue;
        const d = ((fila * celdaH + dy) * celdaW * 8 + col * celdaW + dx) * 4;
        salida[d] = f.alfa[s];
        salida[d + 1] = f.alfa[s + 1];
        salida[d + 2] = f.alfa[s + 2];
        salida[d + 3] = a;
      }
    }
  });

  console.log(`  heroe: celda de ${celdaW}x${celdaH}, 16 frames`);
  return { rgba: salida, ancho: celdaW * 8, alto: celdaH * 2 };
}

// --- Los monstruos --------------------------------------------------------

function recortarMonstruos(img) {
  const salida = Buffer.alloc(img.ancho * img.alto * 4);
  for (const [clave, [x, y, w, h]] of Object.entries(MONSTRUOS)) {
    // Las columnas de al lado de la figura: son del panel.
    const izq = [Math.max(0, x - 7), x - 1];
    const der = [x + w, Math.min(img.ancho, x + w + 7)];
    const refs = referenciasFila(img, y, h, [izq, der]);
    const alfa = matteRegion(img, [x, y, w, h], refs);
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const s = (j * w + i) * 4;
        const d = ((y + j) * img.ancho + (x + i)) * 4;
        salida[d] = alfa[s];
        salida[d + 1] = alfa[s + 1];
        salida[d + 2] = alfa[s + 2];
        salida[d + 3] = alfa[s + 3];
      }
    }
  }
  return salida;
}

// --- Programa -------------------------------------------------------------

const mon = leerPNG(path.join(FUENTES, 'monsters.png'));
const heroe = leerPNG(path.join(FUENTES, 'uiElements.png'));

console.log('Recortando los monstruos...');
escribirPNG(path.join(FUENTES, 'monsters-recortado.png'), mon.ancho, mon.alto, recortarMonstruos(mon));

console.log('Recortando el heroe...');
const hojaHeroe = recortarHeroe(heroe);
escribirPNG(path.join(FUENTES, 'uiElements-recortado.png'), hojaHeroe.ancho, hojaHeroe.alto, hojaHeroe.rgba);

console.log('Listo. Convierte a WebP con scripts/convertir-sprites-webp.mjs');
