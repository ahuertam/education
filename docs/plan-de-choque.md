# Plan de choque: los cinco juegos que fallan

Cinco juegos marcados por el usuario, con el diagnóstico hecho (código, pantalla y
medidas) y el orden de arreglo. El plan va **de lo más barato a lo más caro**:
así cada paso deja un juego más funcionando y ninguno depende del siguiente.

## Estado

Los cinco están arreglados. Esto es lo que acabó siendo cada uno:

| # | Juego | Problema | Arreglo | Commit |
|---|---|---|---|---|
| 1 | Alimenta al Monstruo | La comida y el monstruo se dibujan mal | El CSS recortaba el PNG con las medidas de otra versión de la imagen | `fd63d18` |
| 2 | Sudoku Math | "Operaciones imposibles" | Generar la partida por construcción + decir qué operación falla + botón de pista | `333a8d7` |
| 3 | RPG Fútbol (Turnos) | El campo sale hecho pedazos | El fondo se detectaba solo en el borde de la hoja; ahora se mide en toda ella | `3307651` |
| 4 | Typer Dungeon | Monstruos recortados, héroe con manchas blancas | Rectángulos medidos sobre la imagen real + recorte que no se come el blanco del dibujo | `af7fb0b` |
| 5 | Fuego & Agua | El generador produce niveles imposibles | El generador deja de tirar niveles inválidos y el validador mira lo que no miraba | `b5e8aa2` |

## Segunda ronda: lo que volvio a fallar

El usuario reporto cinco cosas mas: la web iba lenta y el hover con retardo, el
juego de futbol seguia con huecos y descuadres, los sprites de la mazmorra
seguian viéndose mal, y el sudoku seguia con operaciones imposibles. Todo
arreglado:

| Queja | Causa | Arreglo |
|---|---|---|
| La web va lenta | Las hojas de sprites eran PNG de casi 2 MB: 10,9 MB para entrar en un juego | Las mismas hojas en WebP: **839 KB** (`6b4a33c`) |
| El hover va con retardo | Cada tarjeta pintaba dos sombras de 60-80 px de difuminado, y con quince en pantalla eso es repintar una capa enorme en cada paso del raton | Una sombra corta y un `transition` con las propiedades concretas (`8402b77`) |
| El futbol con huecos y descuadres | El recorte de sprites buscaba las figuras por color: el equipo blanco entraba entre los tonos de fondo y le comian el torso | Frames medidos sobre la imagen y fondo borrado frame a frame; ademas los paneles ya no tapan la cabeza del jugador (`8402b77`) |
| Los sprites de la mazmorra mal | El heroe arrastraba el separador blanco entre frames y no se recortaba a su figura | Se recorta el separador y la caja del heroe lleva su proporcion real (`f680d62`) |
| El sudoku con operaciones imposibles | Las tres plantillas fijas se quedaban sin resolver y el error no decia cual | Se generan por construccion y el error dice que operacion falla (`333a8d7`) |

## Tercera ronda: Fuego y Agua, que seguia roto

El juego arrancaba, pero no se podia terminar. Tres cosas distintas, todas
en el generador de niveles:

| Queja | Causa | Arreglo |
|---|---|---|
| El laser no existia | Los dos estantes del laser chocaban con las calles, asi que la colocacion fallaba siempre y no se generaba ni un nivel con laser | Los estantes van a ras de suelo y el rayo ya llega a su sensor (`940dcfb`) |
| La puerta del laser no abria nunca | El rayo rebotaba en un espejo en `/` (que lo manda hacia arriba) con el sensor mas abajo y en otra x | El sensor va en la misma x que el espejo y el espejo gira el rayo hacia abajo (`940dcfb`) |
| Los niveles no se podian terminar | Las calles estaban a 360 y 620 px del suelo (el salto llega a 122) y los charcos median hasta 320 px (el salto avanza 229) | Las escaleras suben desde el suelo en vez de bajar, y los charcos miden 110-185 (`7f50e70`) |

Se anade `reachability.js`: un analisis que comprueba que se puede llegar a
las gemas, a las salidas y a los botones (caminando, saltando un charco y
subiendo a una plataforma). El generador quita las gemas inalcanzables y el
juego busca semilla hasta que sale un nivel jugable.

**Lo que sigue pendiente**: las cajas que hay que empujar hasta el boton son
un Sokoban y el analizador no las tiene en cuenta (se asumen abiertas), asi
que un nivel puede tener una puerta que solo se abre empujando una caja a un
sitio imposible. Es el ultimo hueco de verdad.

Y el meta: `bb065de` monta **todos** los juegos del catálogo en un test, para
que esto no vuelva a pasar en verde.

Queda pendiente lo que no se ha hecho, y está en su propia sección al final.

---

## Diagnóstico y arreglo, uno por uno


---

## 1. Alimenta al Monstruo — lo más rápido y lo más visible

**Diagnóstico.** El juego no tiene errores: la lógica de arrastrar, comprobar y
sumar puntos funciona (lo he comprobado con tests). Lo que está roto son los
**sprites**. El CSS recorta `public/moster2.png` con los offsets de la versión de
**548×455**, pero esa imagen se encogió a **361×300** en el commit `bdbffb3`
("encoger cuatro logos") sin tocar `MonsterFeederGame.js`. Con la imagen nueva,
las celdas son de 90×100 px y los recortes piden 137×152: cada food sale con la
imagen de al lado, tres salen **en blanco**, y el monstruo nunca cambia de cara
(idle/open/happy/sad apuntan a frames equivocados). Es lo que se ve en pantalla:
seis números flotando sobre restos de sprite.

**Arreglo.**

- **A (15 min, la que recomiendo):** `git show 5b2b5f1:public/moster2.png > public/moster2.png`.
  Son 328 KB en vez de 149 KB, y el juego queda bien sin tocar código.
- **B (1 h, si el peso molesta):** recalcular los offsets para celdas de 90,25×100
  y corregir el mapeo de la comida, que además tiene un error aparte: el índice 3
  es `cookie2`, no `donut` (el comentario del código dice una cosa y el array otra).

**Limpieza que va en el mismo commit.**

- `MonsterFeederGame.js:189-201`: `Feedback` usa `show` e `isCorrect` sin el
  prefijo `$` → dos warnings de React en consola.
- El feedback "¡Ups! 😢" está siempre en el DOM (se oculta con `scale(0)`): hace
  que cualquier test que busque ese texto dé positivo en falso.
- `handleDrop` (304-336) y `handleTouchEnd` (349-381) tienen 30 líneas duplicadas.

**Se acepta cuando:** los seis alimentos se ven con su imagen, el monstruo cambia
de cara al acertar y al fallar, y hay un test que lo cubra (hoy no hay ninguno).
→ **Hecho**: las seis comidas salen con su imagen y el monstruo cambia de cara.
El PNG se encogió a 361×300 sin tocar el CSS, así que en vez de devolver el
original (328 KB) se han recalculado los recortes: la comida se recorta como
fondo escalado y así responde al ancho de la pantalla.

---

## 2. Sudoku Math — "operaciones imposibles"

**Diagnóstico.** Lo primero que hay que decir es que **las operaciones no son
imposibles**: he enumerado las 12! asignaciones de números a letras (con poda)
para las tres plantillas y las tres **tienen solución** (48, 16 y 24 soluciones
válidas respectivamente). El problema es de percepción y de diseño:

1. **Solo hay tres plantillas fijas** (`EASY_TEMPLATES` con `t1`, `t2`, y
   `HARD_TEMPLATES` con `h1`). El niño ve siempre la misma partida; "a veces" es
   "según qué plantilla toca".
2. **No es un sudoku.** Cada letra aparece en **una sola ecuación**: son seis
   puzles de dos números independientes atados solo por la regla de "no repetir
   números". De ahí salen los callejones sin salida: `A ÷ B = 4` admite (4,1),
   (8,2) o (12,3), y si el niño gasta el 1 y el 4, la ecuación `K × L = 7` ya no
   tiene solución con lo que queda.
3. **El feedback es global**: "Alguna operación no cuadra. Revisa los huecos.",
   sin decir **qué** ecuación falla. El niño ha hecho todo bien y el juego le
   dice que algo no cuadra: su conclusión inevitable es "esto es imposible".

**Arreglo, por fases.**

- **F1 (30 min):** validar ecuación por ecuación y decir cuál falla y por qué
  ("la 3.ª: 12 ÷ 4 = 3, pero pone 4"). Es un bucle sobre `puzzle.equations` que
  ya existe en `validate()` (línea 468) con un mensaje por ecuación.
- **F2 (30 min):** botón **Pista** que rellena una letra con su valor correcto.
- **F3 (1 h):** generar la partida en vez de usar plantillas: permutar 1..12,
  repartir entre A..L y **calcular los resultados desde esa asignación**. Así la
  partida es resoluble por construcción y hay infinitas. Con un test de
  propiedad: 10.000 partidas generadas, todas con al menos una solución (se
  comprueba con el enumerador de /tmp, que hay que dejar en el repo).
- **F4 (el rediseño, opcional):** acoplar las ecuaciones para que cada letra
  participe en dos y la solución sea **única**. Eso sí es un sudoku de verdad,
  pero cambia el juego entero: es una decisión de producto, no un arreglo.

**Se acepta cuando:** el mensaje de error dice qué ecuación falla, la pista
funciona, y ninguna partida generada es irresoluble. → **Hecho**: 5.000 partidas
generadas, todas con solución (`src/components/SudokuMathGame.test.js`).

---

## 3. RPG Fútbol (Turnos) — el campo hecho pedazos

**Diagnóstico.** El juego arranca y la lógica de turnos funciona, pero **el
recorte de sprites falla en silencio**. El commit `80020a4` sustituyó la clave
de croma (colores fijos con tolerancia) por un muestreo automático del fondo
(`_sampleBgColors`, `game.js:2074-2103`) que solo coge **12 colores del borde**.
El fondo de `nuevo3.png` es un gris **con degradado**: 168 cubos distintos, y
el muestreo cubre solo el **20 %** del fondo. El flood fill (`extractComponents`)
 fusiona el fondo con los sprites → sale **1 componente gigante** por cuadrante
(en vez de 10-20) → `mkPlayerSheet` hace `return null` **sin avisar**
(`game.js:2226` y `:2250`) → el juego cae al fallback de muñecos de palitos
(`game.js:603`, `_makeFallbackBodySheet`). En pantalla se ve el campo con trozos
del atlas y una cara de portero suelta.

La clave de croma **antigua** (6 colores con tolerancia ±5) sí funciona: con ella
el mismo flood fill da 11/11/20/18 componentes.

**Arreglo.**

- **A (2 h, la rápida):** volver a la detección por tolerancia y, mejor aún,
  muestrear el fondo en **toda** la imagen y agrupar por proximidad (no por cubo
  exacto de 5 bits), quedándose con los grupos más grandes.
- **B (medio día, la de fondo):** regenerar `nuevo3.png` **con alfa real**, igual
  que propongo para Typer Dungeon. Con transparencia, el recorte es trivial y
  esta clase de bug desaparece de raíz. De paso se pueden borrar los 7 PNG
  huérfanos (~13 MB) y el `.DS_Store` versionado.
- **C (obligatorio en ambos casos):** que el fallo **no sea silencioso**. Si las
  hojas no se extraen, hay que decirlo en pantalla, no dibujar muñecos de palitos
  como si nada.
- **D:** las dos fuentes del `@font-face` (`PressStart2P-Regular.woff2` y
  `Pixelade.woff2`) **no existen** → dos 404 y el texto del canvas sale con la
  fuente del sistema, que en un canvas pixelado se ve borroso y descuadra el
  `measureText` que usa el word-wrap. O se añaden las fuentes o se quitan las
  reglas y se usa una monoespaciada del sistema a propósito.
- **E:** test de assets: que cada ruta referenciada en `index.html` y `game.js`
  exista en disco. Habría detectado las fuentes que faltan.

**Se acepta cuando:** se ve un campo con jugador y portero recognescibles, el
recorte no deja restos de fondo, y un fallo de recorte se ve en pantalla.
→ **Hecho**: el campo se ve con los jugadores de verdad, y si el recorte falla
sale un aviso en pantalla en vez de los muñecos de palitos.

---

## 4. Typer Dungeon — monstruos recortados y héroe con manchas blancas

**Diagnóstico.** Los tres spritesheets (`monsters.png`, `uiElements.png`,
`mazmorra1.png`, 1268×832) **tienen canal alfa pero no lo usan**: lo he medido
pixel a pixel, **0 píxeles con alfa ≠ 255** en los tres. El fondo es un gris
con *dither* (121,126,132 / 119,124,130 / 120,125,131…, 7.499 colores distintos
en un solo frame).

De ahí los dos síntomas:

- **Monstruos recortados mal.** El recorte de `SpriteCanvas.js` decide de forma
  binaria "esto es fondo / esto es sprite" (`removeBackground`, líneas 72-174).
  Sobre un fondo con ruido, el flood fill deja **islas de gris encerradas**
  dentro del sprite: 4.364 px de fondo quedan atrapados detrás de una barrera de
  un píxel. El trim posterior no las quita, así que **8 de los 12 monstruos
  conservan el bbox al 100 % del frame** con manchas grises dentro.
- **Héroe con zonas blancas.** `uiElements.png` tiene **paneles de etiqueta
  blancos** encima y debajo del personaje (y=0..29 y y=244..269). El recorte
  de 22 px (`HeroSprite.js:76`) no llega a quitarlos, y además
  `isArtifactColor` (`SpriteCanvas.js:82-84`) se come el **blanco real del
  personaje** (armadura, pelo): 95.719 px borrados por frame y 1.518 px que
  sobreviven como manchas opacas. De ahí las zonas blancas.

**Arreglo.**

- **A (el grande):** regenerar los spritesheets **con alfa real**, con un script
  propio en el repo. No hace falta ningún servicio externo: se puede hacer
  offline con Node y `zlib` de serie (ya tengo un lector/escritor de PNG en Node
  puro funcionando y verificado sobre estos ficheros). El algoritmo es un
  *matte* por distancia al color de fondo (alfa proporcional en vez de 0/255,
  que es lo que deja el halo) y recorte de los paneles de etiqueta por geometría.
- **B:** cambiar el pipeline de runtime de binario a mate, para que los bordes
  suaves no dejen halos ni con la imagen vieja.
- **C:** subir `srcInsetTop` del héroe de 22 a ~32 px y ajustar `clearH`.
- **D (test de no-regresión):** un test que compruebe, para cada frame, que hay
  un porcentaje mínimo de píxeles transparentes en el borde y **cero** islas del
  color de fondo dentro de la silueta. Es el test que faltaba para que esto no
  vuelva a pasar en silencio.

**Sobre "rehacer los gráficos con algún servicio".** Con el arte actual se puede
llegar al 100 % **sin ningún servicio**: es un problema de transparencia, no de
dibujo, y se resuelve con el script anterior. Si lo que se quiere es **arte
nuevo** (monstruos distintos, un héroe rediseñado), eso sí necesita un
generador de imágenes, y con eso hace falta una clave de API o una cuenta: dímelo
y lo planteo con el servicio que prefieras.

**Lo que se hizo al final (y fue distinto de lo previsto).** No hizo falta
regenerar ninguna hoja: el problema eran dos cosas del recorte, no el arte.

- Los rectángulos de cada monstruo estaban estimados a ojo y cogían mucho panel
  de más. Se han **medido sobre la imagen real** (el contorno de cada figura),
  así que el recorte encuentra el fondo por el borde.
- El recorte borraba como si fueran fondo los píxeles blancos y grises claros.
  Ese blanco es el de verdad de la armadura del héroe y del hueso de los
  esqueletos, y al borrarlo dejaba agujeros y manchas. Ahora el recorte solo
  quita lo que está cerca del color del panel.
- El héroe lleva una banda de cuadriculado arriba (el rótulo) y otra abajo (el
  nombre del frame) que no se quitaban: al recortar 22 píxeles de arriba se
  quedaban 10 de cuadriculado, el fondo no se encontraba por el borde y la
  banda se pegaba al dibujo. Ahora se cortan las dos bandas enteras.

La regenerarte con alfa real sigue siendo la opción de fondo si el arte se
quiere rehacer, pero con estas tres cosas los sprites salen limpios.

**Se acepta cuando:** ningún monstruo tiene manchas grises dentro, el héroe no
tiene parches blancos, y el test de frames está en verde. → **Hecho**
(`src/components/TyperDungeon/sprites/sprites.test.js`).

---

## 5. Fuego & Agua — el generador produce niveles imposibles

**Diagnóstico.** Es el problema más profundo de los cinco, y no es de un archivo
sino de un **diseño a medias**. He barrido 1.500 niveles (500 semillas × 3
dificultades) con el generador real:

- **8,8 % de los niveles los rechaza el validador** → el niño ve el panel rojo
  "No se pudo generar un nivel válido: spawn_overlaps_platform..." y el juego no
  arranca. 126 de los 132 rechazos son del mismo tipo: las escaleras del modo
  "shelf" se colocan **sobre la zona de spawn** (`levelGenerator.js:534`, con `x`
  desde 360 → el primer escalón cae en 215.., y el spawn del agua está en 200).
- **El validador no valida resolubilidad** (`solvability.js`): comprueba
  solapamientos y correspondencia botón↔puerta, y nada más. Resultado:
  - **52,5 %** de las salidas no tienen ninguna plataforma debajo;
  - **4 %** de las gemas están incrustadas en un sólido → **imposibles de
    recoger** → `gemsComplete` nunca es true → la partida no se puede terminar;
  - 969 puertas se colocan **encima del corredor** de las salidas y lo bloquean;
  - 16 de 600 niveles se quedan **sin la plataforma** que lleva a las salidas.
- **`ensureButtonForDoor` agota sus 16 intentos** en rangos de x fijos que ya
  están ocupados → deja puertas **sin botón** → nivel im-completable, y el
  validador sí lo detecta pero solo en 1 caso de 1.500.
- El commit grande `6d99920` (lanes, rooms, escaleras, palancas) **añadió mucha
  geometría nueva sin ampliar el validador**: se quedó a medias justo en esa
  frontera.

**Lo que además falla en la experiencia de uso.**

- Al morir: pantalla de pausa sin información y `deathLocked = true`
  (`puzzleScene.js:260`) → el jugador queda atrapado dentro de la lava y no
  puede volver a morir ni reiniciar.
- La cámara solo sigue al fuego (`puzzleScene.js:351`): en niveles de hasta
  7.000 px de ancho, el personaje de agua se sale constantemente de la pantalla.
- El láser: `updateLasers` solo activa el sensor si el rayo no encuentra un
  espejo antes, y el espejo está a +260 px → el rayo rebota y **la puerta del
  láser no se abre nunca**.
- Las flechas hacen scroll de la página mientras se juega (falta
  `addCapture`).

**Arreglo, por fases.**

- **F1 (medio día) — que el nivel sea válido:**
  1. Proteger la zona de spawn (rango de botones desde x=700, y filtro que
     rechace cualquier plataforma sobre `x ∈ [60, 300]`).
  2. Si tras todos los intentos no se coloca el botón, **quitar la puerta** en
     vez de dejarla huérfana, y rotar la x en vez de sortearla siempre del mismo
     rango.
  3. Calcular el ancho del nivel **desde el final real de `gate_path`** y poner
     las salidas encima, no 900 px más allá.
  4. No generar gemas dentro de sólidos (con reintentos de x).
  5. Ampliar el validador con tres comprobaciones que ahora faltan: gema dentro
     de un sólido, salida sin plataforma de apoyo y salida dentro de un sólido.
  6. **Test de barrido**: 300 semillas × 3 dificultades, `expect(reasons).toEqual([])`.
     El test actual solo mira 5 semillas fijas (y se llama "always validates",
     que es falso).
- **F2 (1 día) — que el nivel sea resoluble:** BFS de alcanzabilidad real.
  Construir un grafo de celdas transitables con las plataformas estáticas como
  apoyo, simular la caída de cada personaje y comprobar que (a) cada gema la
  recoge su dueño, (b) las salidas se llegan, (c) el viaje de ida y vuelta cabe.
  Si no, se regenera con otra semilla en vez de tirar el nivel.
- **F3 (medio día) — experiencia de uso:** pantalla de muerte con reinicio y
  respawn, cámara que sigue a los dos personajes (con zoom adaptativo), láser
  con la trayectoria completa emisor→espejos→sensor, y `addCapture` de las teclas.
- **F4 (decisión de producto):** el generador procedural son 828 líneas con cinco
  subsistemas y una tasa de nivel inválido del 8,8 %. Aunque se arregle, es caro
  de mantener. La alternativa es **un nivel fijo curado** (que se puede diseñar a
  mano y garantizar jugable) y quedarse con el procedural como "nivel aleatorio"
  opcional. Eso reduce el arreglo de F1+F2 a una tarde.

---

## Meta: por qué la suite estaba en verde

Los cinco bugs han pasado 151 tests en verde porque **ningún test mira un
sprite**. Un test que monte el juego y compruebe que las hojas de sprites traen
píxeles (y que el canvas no es un color plano) habría cogido al menos tres de
los cinco.

Propuesta: un **test de humo por juego**, en `src/components/juegosHumo.test.js`,
que para cada juego:

1. lo monte y espere al primer render;
2. compruebe que el canvas tiene tamaño > 0 y **no es de un solo color**;
3. compruebe que las hojas de sprites generadas no están vacías
   (`hoja.width > 0` y un porcentaje de píxeles no transparentes);
4. para los juegos con assets en `public/`, compruebe que **cada ruta referenciada
   existe en disco**.

Con eso, "el juego arranca" deja de ser "el juego no revienta" y pasa a ser
"el juego enseña algo".

**Lo que se ha hecho de esto:**

- `src/components/juegosHumo.test.js` monta **los 38 juegos** del catálogo y
  comprueba que se pintan. Si se añade un juego sin meterlo en la lista, el
  test falla.
- `src/components/TyperDungeon/sprites/sprites.test.js` simula el recorte
  contra la imagen real: que no quedan restos de panel, que no se come el
  dibujo y que el héroe no pierde la armadura. Para leer el PNG hace falta
  `src/test-utils/leerPNG.js` (Node puro, sin dependencias: `zlib` ya viene de
  serie).
- `src/components/TsubasaRpgGame.test.js` comprueba que **todo fichero que
  pide el juego existe en disco** (es lo que habría gistido de las fuentes que
  no estaban).
- `src/components/MonsterFeederGame.test.js` compara las medidas del CSS con
  las del PNG real: es lo que habría gistido de que la imagen se encogiera.
- `src/components/juegosConstructivos.test.js` juega la partida entera de los
  cuatro juegos nuevos.
- El entorno de pruebas (`src/setupTests.js`) deja el audio como en un
  navegador: `play()` devuelve una promesa.

Falta el punto 2 del plan (comprobar que el canvas no es de un solo color): es
lo que más trabajo da y lo que menos ha dado de sí, porque para eso hace falta
leer píxeles de un canvas que en jsdom no existe.

---

## Lo que queda pendiente

- **Fuego & Agua, fase F2**: el BFS de alcanzabilidad real. El generador ya
  no produce niveles inválidos y el validador mira lo que no miraba, pero
  nadie ha comprobado todavía que **se pueda llegar** a cada gema y a las
  salidas. Es el hueco que queda: hoy el nivel es válido, no está demostrado
  que sea ganable.
- **Fuego & Agua, fase F4**: decidir el futuro del generador procedural (828
  líneas con cinco subsistemas) o pasarse a un nivel fijo curado.
- **El láser** de Fuego & Agua: el agente lo señalo como sospechoso, pero no
  se ha podido reproducir, así que no se ha tocado.
- **Regenerar los sprites con alfa real** (la opción de fondo del Typer
  Dungeon), si algún día se rehace el arte.
- **Unificar los cuatro juegos de fracciones y números** con
  `src/components/ui/JuegoBase.js`: ahora mismo cada uno tiene sus propios
  estilos.

---

## Orden de ejecución (el que se siguió)

1. **Alimenta al Monstruo** — 15 min, y es el que más llama la atención.
2. **Sudoku Math** — 1-2 h, lógica pura, riesgo cero.
3. **RPG Fútbol** — 2 h con la opción A (o medio día con la B).
4. **Typer Dungeon** — medio día, lo más caro por el arte.
5. **Fuego & Agua** — 1-2 días; primero F1, luego F3 (que es lo que el niño nota
   en los primeros 30 segundos), y F2/F4 solo si se decide seguir con el
   generador procedural.

Cada paso es un commit, con su test, y se despliega al final. Los pasos 1 y 2
caben en una tarde.
