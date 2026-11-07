// Lector de PNG mínimo para los tests, sin dependencias.
//
// Node ya trae zlib, así que solo hay que descomprimir los datos IDAT y
// deshacer los filtros de línea. Da justo lo que necesitan los tests de
// sprites: dimensiones y píxeles en RGBA.

import fs from 'node:fs';
import zlib from 'node:zlib';

export function leerPNG(ruta) {
  const buf = fs.readFileSync(ruta);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error(`${ruta} no es un PNG`);

  let pos = 8;
  let ancho = 0, alto = 0, profundidad = 0, tipoColor = 0, interlace = 0;
  let paleta = null, transparencia = null;
  const idat = [];

  while (pos < buf.length) {
    const largo = buf.readUInt32BE(pos);
    const tipo = buf.toString('ascii', pos + 4, pos + 8);
    const datos = buf.subarray(pos + 8, pos + 8 + largo);
    if (tipo === 'IHDR') {
      ancho = datos.readUInt32BE(0);
      alto = datos.readUInt32BE(4);
      profundidad = datos[8];
      tipoColor = datos[9];
      interlace = datos[12];
    } else if (tipo === 'PLTE') paleta = Buffer.from(datos);
    else if (tipo === 'tRNS') transparencia = Buffer.from(datos);
    else if (tipo === 'IDAT') idat.push(Buffer.from(datos));
    else if (tipo === 'IEND') break;
    pos += 12 + largo;
  }

  if (interlace) throw new Error('PNG entrelazado: no soportado');
  if (profundidad !== 8) throw new Error(`profundidad ${profundidad} no soportada`);

  const canales = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[tipoColor];
  if (!canales) throw new Error(`tipo de color ${tipoColor} no soportado`);

  const crudo = zlib.inflateSync(Buffer.concat(idat));
  const bpp = canales;
  const stride = ancho * bpp;
  const pix = Buffer.alloc(alto * stride);

  let p = 0;
  for (let y = 0; y < alto; y++) {
    const filtro = crudo[p++];
    const fila = crudo.subarray(p, p + stride);
    p += stride;
    const salida = pix.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? pix.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? salida[x - bpp] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= bpp ? prev[x - bpp] : 0;
      let v = fila[x];
      switch (filtro) {
        case 0: break;
        case 1: v += a; break;
        case 2: v += b; break;
        case 3: v += (a + b) >> 1; break;
        case 4: {
          const pp = a + b - c;
          const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
          v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          break;
        }
        default: throw new Error(`filtro ${filtro} no soportado`);
      }
      salida[x] = v & 0xff;
    }
  }

  // Todo a RGBA.
  const rgba = Buffer.alloc(ancho * alto * 4);
  for (let i = 0; i < ancho * alto; i++) {
    let r, g, b, a = 255;
    if (tipoColor === 6) {
      r = pix[i * 4]; g = pix[i * 4 + 1]; b = pix[i * 4 + 2]; a = pix[i * 4 + 3];
    } else if (tipoColor === 2) {
      r = pix[i * 3]; g = pix[i * 3 + 1]; b = pix[i * 3 + 2];
    } else if (tipoColor === 0) {
      r = g = b = pix[i];
    } else if (tipoColor === 4) {
      r = g = b = pix[i * 2]; a = pix[i * 2 + 1];
    } else if (tipoColor === 3) {
      const idx = pix[i];
      r = paleta[idx * 3]; g = paleta[idx * 3 + 1]; b = paleta[idx * 3 + 2];
      a = transparencia && idx < transparencia.length ? transparencia[idx] : 255;
    }
    rgba[i * 4] = r; rgba[i * 4 + 1] = g; rgba[i * 4 + 2] = b; rgba[i * 4 + 3] = a;
  }

  return { ancho, alto, rgba };
}
