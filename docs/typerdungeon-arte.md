# Rehacer el arte de Typer Dungeon, paso a paso

El problema de fondo: `monsters.png` y `uiElements.png` no son hojas de sprites,
son **carteles de concepto**. Cada figura va sobre un panel gris, con una banda
de cuadriculado arriba (el rótulo "HERO") y otra abajo (el nombre del frame), y
los dos primeros monstruos de la fila van dentro de una casilla clara con borde
oscuro.

De ahí viene todo lo que se veía mal:

- El recorte tiene que adivinar qué es fondo por color, porque la imagen no
  tiene transparencia (0 píxeles con alfa distinto de 255 en las tres hojas).
- Como el panel tiene degradado y ruido, el relleno por inundación deja islas
  de gris encerradas dentro de las figuras: 8 de los 12 monstruos conservaban
  el bbox entero con manchas dentro.
- El blanco y el gris claro se trataban como "basura" y se borraban, así que la
  armadura del héroe y los huesos de los esqueletos salían con agujeros.
- El separador blanco entre frames (las tres últimas columnas) se colaba en el
  dibujo del héroe como una línea vertical.

El plan es rehacer las hojas **de una en una**, empezando por lo que más se ve,
y comprobando cada paso con un test y una captura.

---

## La técnica: matte en vez de recorte binario

Hoy el recorte decide "esto es fondo / esto es dibujo" y borra de golpe. El
problema es que no hay término medio: o se queda un halo de gris, o se come el
blanco del dibujo.

El matte calcula, para cada píxel, **cuánto de fondo le queda**:

```
distancia = |r - fondoR| + |g - fondoG| + |b - fondoB|
alfa      = distancia que se pasa de 0 (ruido del PNG) a 255 (dibujo)
```

El fondo de cada figura es el color más frecuente de su marco (el gris azulado
del panel). Con la tolerancia justa:

- el ruido del degradado (unos ±3 por canal) se queda en alfa 0;
- los bordes del dibujo quedan a medio alfa (sin halo duro);
- la armadura plateada, el hueso, el pelo y las telas van a alfa 255.

Las bandas de rótulo y las casillas claras **no se pueden quitar con color**
(son de otro tono y están cerradas por un borde), así que se cortan **por
geometría**, que ya está medida:

- el héroe: 31 px arriba y 27 abajo (las bandas de rótulo) y 4 a la derecha
  (el separador entre frames);
- los monstruos: el rectángulo justo de cada figura, ya medido sobre la imagen.

## Herramientas que hay

- `scripts/png.mjs`: **lee y escribe** PNG en Node puro (sin dependencias;
  `zlib` viene de serie). El escritor arma IHDR, IDAT con `zlib.deflateSync` y
  el CRC32 de cada trozo.
- `src/test-utils/leerPNG.js`: reexporta el lector para los tests.
- `scripts/recortar-sprites.mjs`: el recorte con matte (el héroe y los
  monstruos).
- `scripts/convertir-sprites-webp.mjs`: convierte las hojas a WebP con el
  propio Chrome.

---

## El orden

### Paso 1 — El héroe (16 frames) — HECHO

Es lo que más se ve (está en cada pantalla de combate) y es el que tiene la
línea blanca.

1. Escribir el escritor de PNG. → `scripts/png.mjs` (lee y escribe).
2. Script `scripts/recortar-sprites.mjs` que:
   - lee `assets-originales/mazmorra/uiElements.png`;
   - para cada uno de los 16 frames (8 de idle y 8 de ataque), recorta con el
     matte y lo guarda en una hoja nueva `public/games/mazmorra/heroe.webp`;
   - mide el marco de cada figura (no el del frame) para que todos los frames
     ocupen el mismo sitio y la animación no baile.
3. Cambiar `data/sprites.js` para que apunte a la hoja nueva y usar los
   rectángulos ya medidos. → celda de 149×239 (la figura, 120 de ancho).
4. En `SpriteCanvas`, si la imagen **ya tiene alfa**, no hacer el recorte por
   color (es decir: si el frame tiene más de un 5 % de píxeles transparentes,
   se usa tal cual). Así el runtime no toca lo que ya viene limpio.
5. **Comprobar:**
   - test: cada frame del héroe tiene alfa 0 en el fondo y alfa 255 en la
     armadura, y no queda ni un píxel del color del panel;
   - captura: entrar en combate y mirar al héroe y al esqueleto.

Lo que salió del camino al hacerlo:

- las bandas de rótulo **no están donde se suponía**: la fila de idle va de
  la 31 a la 242 y la de ataque de la 279 a la 513 (la de ataque tiene el
  rótulo 7 filas más arriba, y por eso la espada salía cortada). Ahora se
  detectan solas: una fila es banda si es casi blanca.
- el color del panel hay que tomarlo **por fila** (el degradado es vertical) y
  de las **columnas de al lado** de la figura: si se toma de toda la fila, la
  mediana la contaminan los píxeles de la propia figura (la medusa, que es
  verde, se colaba y dejaba bandas grises detrás).
- la primera y la última fila del panel son el borde del frame (una línea
  clara) y se quedan como una raya: se quitan.
- **el casco y las hombreras del héroe están pintados con el mismo gris que
  el panel** (121,127,133), así que ningún recorte por color puede
  salvarlos: se los come y el héroe sale con agujeros (parece translúcido).
  Lo que los separa del fondo es el **contorno negro**, así que el recorte
  final es **por inundación**: el panel se quita desde fuera y el casco se
  queda porque no hay manera de llegar a él.
- la fila de ataque está dibujada 34 px más abajo que la de idle: si no se
  corrige, el héroe da un salto al atacar. Se alinean por los pies.

### Paso 2 — Los 12 monstruos — HECHO

1. El mismo script, con los rectángulos que ya están medidos en
   `data/monsters.js` (son el contorno real de cada figura).
2. Una hoja `public/games/mazmorra/monsters.webp` con los 12, cada uno en su
   sitio y con el alfa ya resuelto. La hoja conserva el tamaño y las
   posiciones de la original, así que `data/monsters.js` no cambia.
3. **Comprobar:** el test de `sprites.test.js` se adapta para leer la hoja
   nueva y exigir que no quede fondo dentro de la silueta; y una captura con
   los doce monstruos en fila.

### Paso 3 — El fondo (mazmorra1.png)

La hoja del fondo son nueve casillas con su rótulo arriba (`labelH: 52` ya lo
corta). Aquí el recorte no hace falta: son fondos, se quedan opacos. Solo
conviene pasarlos a WebP (2,3 MB → 210 KB, ya está hecho) y quitar el rótulo
con un recorte de 52 px en el generador, que ya lo hace.

### Paso 4 — Limpieza

- borrar `public/games/mazmorra/uiElements.webp` (la hoja vieja del heroe, ya
  sin usar) → **hecho** (`258d08b`);
- borrar `assets-originales/mazmorra/` (5,8 MB) cuando los nuevos artefacts
  estén en su sitio → **pendiente**: los recortes se quedan porque el test los
  lee;
- el recorte por color del runtime (`removeBackground`, `sampleBackground`)
  se queda solo para las imágenes que no traigan alfa → **hecho**.

---

## Cómo se va comprobando

Cada paso termina con:

1. `npm test` en verde (el test del sprite concreta lo que se acaba de rehacer);
2. una captura del juego en el navegador (con la misma receta de Chrome
   headless + CDP que se ha usado para el resto de comprobaciones);
3. un commit que diga qué se rehizo y qué se comprobó.

Si un paso no sale bien, se para ahí: el arte anterior sigue sirviendo, porque
las hojas nuevas se añaden con nombre nuevo y solo se cambia la referencia
cuando están listas.

## Lo que NO se va a hacer

- **No se va a generar arte nuevo con una IA.** El recorte con matte arregla
  los symptoms (islas, agujeros, línea blanca) sin tocar el estilo. Rehacer el
  arte de verdad es otro trabajo, y el actual es utilizable.
- **No se va a rehacer el fondo del juego.** El fondo es un cartel, pero se
  ve bien.
