// Genera los sonidos de la mazmorra (Typer Dungeon).
//
// Los sonidos se sintetizan aqui en vez de bajar un pack: son unos pocos
// efectos, pesan muy poco y quedan con el tono "chiptune" del juego. Sin
// dependencias y sin atribuciones.
//
//   node scripts/generar-sonidos.mjs
//
// Escribe WAV (PCM 16 bits mono) en public/games/mazmorra/sonidos/.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DESTINO = path.join(RAIZ, 'public', 'games', 'mazmorra', 'sonidos');
const FREC = 22050;

// --- Utilidades de audio ---------------------------------------------------

/** Escribe un WAV de 16 bits mono. */
function escribirWAV(ruta, muestras, frec = FREC) {
  const datos = Buffer.alloc(muestras.length * 2);
  for (let i = 0; i < muestras.length; i++) {
    const v = Math.max(-1, Math.min(1, muestras[i]));
    datos.writeInt16LE(Math.round(v * 32767), i * 2);
  }
  const cabecera = Buffer.alloc(44);
  cabecera.write('RIFF', 0, 'ascii');
  cabecera.writeUInt32LE(36 + datos.length, 4);
  cabecera.write('WAVE', 8, 'ascii');
  cabecera.write('fmt ', 12, 'ascii');
  cabecera.writeUInt32LE(16, 16);
  cabecera.writeUInt16LE(1, 20);          // PCM
  cabecera.writeUInt16LE(1, 22);          // mono
  cabecera.writeUInt32LE(frec, 24);
  cabecera.writeUInt32LE(frec * 2, 28);
  cabecera.writeUInt16LE(2, 32);
  cabecera.writeUInt16LE(16, 34);
  cabecera.write('data', 36, 'ascii');
  cabecera.writeUInt32LE(datos.length, 40);
  fs.writeFileSync(ruta, Buffer.concat([cabecera, datos]));
  return datos.length / 2 / frec;
}

/** Un oscilador con envolvente ADSR simplificada. */
function tono({
  dur = 0.2, frec = 440, fin = null, tipo = 'sino', ataque = 0.005, caida = 0.05,
  volumen = 0.5, vibrato = 0, detune = 0,
}) {
  const n = Math.round(dur * FREC);
  const out = new Float32Array(n);
  let fase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / FREC;
    const f = fin == null ? frec : frec + (fin - frec) * (t / dur);
    const vib = vibrato ? 1 + Math.sin(2 * Math.PI * 6 * t) * vibrato : 1;
    fase += (2 * Math.PI * f * vib) / FREC;
    let s;
    if (tipo === 'seno') s = Math.sin(fase);
    else if (tipo === 'cuad') s = Math.sign(Math.sin(fase)) * 0.6;
    else if (tipo === 'sierra') s = 2 * ((fase / (2 * Math.PI)) % 1) - 1;
    else s = Math.sin(fase) + 0.35 * Math.sin(2 * fase);   // 'sino' (algo de armónicos)
    if (detune) s += 0.5 * Math.sin(fase * (1 + detune));
    // Envolvente: ataque rapido, caida exponencial.
    const env = t < ataque ? t / ataque : Math.exp(-(t - ataque) / caida);
    out[i] = s * env * volumen;
  }
  return out;
}

/** Ruido blanco con un filtro de un polo (frecua de corte variable). */
function ruido({ dur = 0.2, corte = 0.5, corteFin = null, volumen = 0.4, ataque = 0.002 }) {
  const n = Math.round(dur * FREC);
  const out = new Float32Array(n);
  let y = 0;
  for (let i = 0; i < n; i++) {
    const t = i / FREC;
    const c = corteFin == null ? corte : corte + (corteFin - corte) * (t / dur);
    const a = Math.min(0.99, Math.max(0.001, c));
    const blanco = Math.random() * 2 - 1;
    y += a * (blanco - y);
    const env = t < ataque ? t / ataque : Math.exp(-(t - ataque) / (dur * 0.35));
    out[i] = y * env * volumen;
  }
  return out;
}

/** Concatena bloques de audio. */
const concat = (...partes) => {
  const total = partes.reduce((n, p) => n + p.length, 0);
  const out = new Float32Array(total);
  let pos = 0;
  for (const p of partes) { out.set(p, pos); pos += p.length; }
  return out;
};

/** Repite un bloque hasta llegar a `dur` segundos (para bucles). */
const repetir = (bloque, dur) => {
  const n = Math.round(dur * FREC);
  const out = new Float32Array(n);
  let pos = 0;
  while (pos < n) {
    const trozo = Math.min(bloque.length, n - pos);
    out.set(bloque.slice(0, trozo), pos);
    pos += trozo;
  }
  return out;
};

/** Pone un bloque en un instante (para el ambiente). */
const en = (out, bloque, segundo) => {
  const pos = Math.round(segundo * FREC);
  for (let i = 0; i < bloque.length && pos + i < out.length; i++) out[pos + i] += bloque[i];
};

// --- Los sonidos -----------------------------------------------------------

const sonidos = {};

// Al teclear: un clicito corto y seco. Es el sonido que mas se oye, asi que
// tiene que ser discreto.
sonidos['tecla'] = tono({ dur: 0.045, frec: 1500, fin: 1100, tipo: 'seno', caida: 0.012, volumen: 0.22 });

// La espada del heroe: un barrido de aire con un anillo metalico.
sonidos['espada'] = concat(
  ruido({ dur: 0.16, corte: 0.55, corteFin: 0.12, volumen: 0.3 }),
  tono({ dur: 0.22, frec: 2400, fin: 1500, tipo: 'sino', caida: 0.07, volumen: 0.16 }),
);

// El golpe al monstruo: un golpe seco con un cuerpo grave.
sonidos['impacto'] = concat(
  ruido({ dur: 0.09, corte: 0.8, corteFin: 0.2, volumen: 0.45 }),
  tono({ dur: 0.16, frec: 180, fin: 90, tipo: 'seno', caida: 0.05, volumen: 0.4 }),
);

// El heroe recibe dano: un tono que cae.
sonidos['dano'] = concat(
  tono({ dur: 0.3, frec: 320, fin: 110, tipo: 'cuad', caida: 0.12, volumen: 0.32 }),
  ruido({ dur: 0.12, corte: 0.6, corteFin: 0.1, volumen: 0.25 }),
);

// El monstruo aparece: un grunido grave con vibracion.
sonidos['monstruo'] = concat(
  tono({ dur: 0.55, frec: 130, fin: 95, tipo: 'sierra', caida: 0.3, volumen: 0.34, vibrato: 0.06 }),
  ruido({ dur: 0.5, corte: 0.09, corteFin: 0.05, volumen: 0.3 }),
);

// El monstruo muere: un quejido que cae y se apaga.
sonidos['muerte'] = concat(
  tono({ dur: 0.7, frec: 300, fin: 60, tipo: 'sierra', caida: 0.3, volumen: 0.32, vibrato: 0.05 }),
  ruido({ dur: 0.55, corte: 0.35, corteFin: 0.04, volumen: 0.22 }),
);

// El cofre del tesoro: un arpegio brillante.
sonidos['tesoro'] = concat(
  ...[784, 988, 1175, 1568].map((f, i) => tono({ dur: 0.16, frec: f, tipo: 'sino', caida: 0.09, volumen: 0.26 })),
);

// Las escaleras / la puerta de piedra: un rumor grave.
sonidos['puerta'] = concat(
  ruido({ dur: 0.7, corte: 0.05, corteFin: 0.03, volumen: 0.5 }),
  tono({ dur: 0.5, frec: 70, fin: 55, tipo: 'seno', caida: 0.25, volumen: 0.3 }),
);

// Piso superado: una fanfarria corta.
sonidos['victoria'] = concat(
  ...[[523, 0.12], [659, 0.12], [784, 0.12], [1046, 0.34]].map(([f, d]) =>
    tono({ dur: d, frec: f, tipo: 'sino', caida: d * 0.7, volumen: 0.3 })),
);

// Derrota: dos notas que caen.
sonidos['derrota'] = concat(
  tono({ dur: 0.22, frec: 392, tipo: 'cuad', caida: 0.12, volumen: 0.24 }),
  tono({ dur: 0.55, frec: 262, fin: 196, tipo: 'cuad', caida: 0.3, volumen: 0.24 }),
);

// --- El ambiente -----------------------------------------------------------

// La mazmorra: un rumor grave continuo (el viento de las galerias) con alguna
// gota que cae de vez en cuando. Son 8 segundos en bucle.
{
  const dur = 8;
  const out = new Float32Array(Math.round(dur * FREC));
  // El rumor: ruido muy filtrado, modulado despacio para que no suene plano.
  const base = ruido({ dur, corte: 0.012, volumen: 0.5 });
  for (let i = 0; i < out.length; i++) {
    const t = i / FREC;
    const mod = 0.75 + 0.25 * Math.sin(2 * Math.PI * t / 8) + 0.12 * Math.sin(2 * Math.PI * t / 2.7);
    out[i] = base[i] * mod;
  }
  // Un drone grave que da cuerpo.
  const drone = tono({ dur, frec: 55, tipo: 'seno', caida: 999, volumen: 0.1 });
  for (let i = 0; i < out.length; i++) out[i] += drone[i];
  // Gotas: pitidos cortos con reverberacion (una caida de tono).
  const gotas = [[1.3, 1500], [3.7, 1150], [6.1, 1350], [7.2, 980]];
  for (const [seg, f] of gotas) {
    en(out, tono({ dur: 0.22, frec: f, fin: f * 0.45, tipo: 'seno', caida: 0.05, volumen: 0.16 }), seg);
  }
  sonidos['ambiente'] = out;
}

// --- Escribir -------------------------------------------------------------

// Los WAV se quedan como original (fuera de public/, que es lo que se
// despliega) y de ahi se pasa a AAC, que pesa cinco veces menos y suena
// igual de bien en el navegador.
const ORIGINALES = path.join(RAIZ, 'assets-originales', 'mazmorra', 'sonidos');
fs.mkdirSync(ORIGINALES, { recursive: true });
fs.mkdirSync(DESTINO, { recursive: true });

for (const [nombre, muestras] of Object.entries(sonidos)) {
  const wav = path.join(ORIGINALES, `${nombre}.wav`);
  const seg = escribirWAV(wav, muestras);
  const kb = (fs.statSync(wav).size / 1024).toFixed(1);
  console.log(`${nombre.padEnd(10)} ${seg.toFixed(2)} s  ${kb} KB (wav)`);
}

// A WAV no lo sirve el navegador tan bien como el AAC y pesa mucho mas.
const convertir = process.platform === 'darwin' && fs.existsSync('/usr/bin/afconvert');
if (!convertir) {
  console.log('\n(afconvert no disponible: se copian los WAV tal cual)');
  for (const nombre of Object.keys(sonidos)) {
    fs.copyFileSync(path.join(ORIGINALES, `${nombre}.wav`), path.join(DESTINO, `${nombre}.wav`));
  }
} else {
  for (const nombre of Object.keys(sonidos)) {
    const entrada = path.join(ORIGINALES, `${nombre}.wav`);
    const salida = path.join(DESTINO, `${nombre}.m4a`);
    execFileSync('/usr/bin/afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '64000', entrada, salida]);
    console.log(`${nombre.padEnd(10)} ${(fs.statSync(salida).size / 1024).toFixed(1)} KB (m4a)`);
  }
}
console.log(`\nEn ${path.relative(RAIZ, DESTINO)}`);
