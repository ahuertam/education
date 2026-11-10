// Convierte las hojas de sprites a WebP.
//
// Las hojas originales son PNG de casi 2 MB cada una (salen de un generador de
// arte y no comprimen nada). En WebP pesan una décima parte y el juego dibuja
// exactamente igual: lo unico que cambia es la extension.
//
// Se hace con el propio Chrome (canvas -> toDataURL) para no anadir ninguna
// dependencia al proyecto.
//
//   node scripts/convertir-sprites-webp.mjs
//
// Los PNG de origen se quedan en public/ como material de trabajo; si algún dia
// se regenera una hoja hay que volver a pasar este script.

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLICO = path.join(RAIZ, 'public');

const FICHEROS = [
  'games/mazmorra/monsters.png',
  'games/mazmorra/uiElements.png',
  'games/mazmorra/mazmorra1.png',
  'games/tsubasa/assets/nuevo3.png',
  'games/tsubasa/assets/ui_elements.png',
  'games/tsubasa/assets/players_goalkeepers_spritesheet.png',
];

const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PUERTO = 9235;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PUERTO}`,
  '--user-data-dir=/tmp/chrome-webp-convert',
  '--no-first-run',
  '--disable-gpu',
  '--allow-file-access-from-files',
  'about:blank',
], { stdio: 'ignore' });

process.on('exit', () => chrome.kill());

let target = null;
for (let i = 0; i < 40; i++) {
  try {
    const lista = await (await fetch(`http://127.0.0.1:${PUERTO}/json/list`)).json();
    target = lista.find((t) => t.type === 'page');
    if (target) break;
  } catch { /* Chrome todavia no escucha */ }
  await sleep(500);
}
if (!target) {
  console.error('No se pudo arrancar Chrome.');
  process.exit(1);
}

const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pendientes = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pendientes.has(m.id)) { pendientes.get(m.id)(m); pendientes.delete(m.id); }
};
await new Promise((r) => { ws.onopen = r; });

const send = (method, params = {}) => new Promise((res) => {
  const i = ++id; pendientes.set(i, res);
  ws.send(JSON.stringify({ id: i, method, params }));
});
const evaluar = async (expr) => (await send('Runtime.evaluate', {
  expression: expr, returnByValue: true, awaitPromise: true,
})).result?.result?.value;

await send('Runtime.enable');
await send('Page.enable');
await send('Page.navigate', { url: `file://${PUBLICO}/games/mazmorra/` });
await sleep(1500);

for (const rel of FICHEROS) {
  const origen = path.join(PUBLICO, rel);
  const destino = origen.replace(/\.png$/, '.webp');
  const base64 = await evaluar(`(async () => {
    const img = new Image();
    img.src = 'file://${origen}';
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', 0.86).split(',')[1];
  })()`);
  if (!base64) {
    console.log(`x no se pudo convertir ${rel}`);
    continue;
  }
  const buf = Buffer.from(base64, 'base64');
  fs.writeFileSync(destino, buf);
  const antes = fs.statSync(origen).size;
  console.log(`${rel}: ${(antes / 1024).toFixed(0)} KB -> ${(buf.length / 1024).toFixed(0)} KB`);
}

ws.close();
chrome.kill();
process.exit(0);
