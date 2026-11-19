# Plan ADI — lo que aprendemos de los juegos educativos de los 90

De dónde sale: los **ADI / Adibou** de Coktel Vision (1991-2003), la serie de software
escolar que en España se vendía como ADI (ADI Junior, ADI CE2, ADI Lengua Española…).

Lo que se quiere copiar **no es el software**, es la estructura:

- el material viene **partido por edad y por habilidad** (Leer 4-5 / Calcular 6-7);
- el bucle de cada actividad es **curso → ejercicios → minijuego de recompensa**;
- hay un **mundo** (casa, jardín) y no una lista de tests;
- **el error no castiga**: Kicook se come la tarta y sigues jugando;
- la **recompensa es juego**, nunca "otro ejercicio más".

Cada punto de abajo es un paso con sus decisiones. Se van tomando de uno en uno.

---

## Paso 1 · Niveles por juego

**Qué:** cada juego del catálogo declara para qué curso sirve. Un niño de 1º no debería
encontrarse "Sintaxis" ni "Álgebra" en su selector.

**Ficheros:**

| Fichero | Cambio |
|---|---|
| `src/config/games.js` | campo `nivel` en cada uno de los 41 juegos; exportar `NIVELES` y `gamesByNivel(nivel)` |
| `src/components/GameSelector.js` | fila de pastillas para filtrar por nivel; el filtro se aplica a `gamesByCategory(category)` |
| `src/components/ActivityCard.js` | distintivo opcional de nivel en la tarjeta (la usa también la landing) |

**Decisiones tomadas:**

- **1.1** Tres bandas: **1º-2º / 3º-4º / 5º-6º**. Cada juego declara la banda en la que se
  introduce su contenido.
- **1.2** El filtro vive **en el selector de juegos**, no en la landing.
- **1.3** El nivel **solo etiqueta y filtra**: no toca la dificultad interna de los juegos
  (los que ya tienen menú fácil/medio/difícil lo siguen teniendo).
- **1.4** Se recuerda el nivel elegido en `localStorage` (`edutika:nivel`).

**Lo que se decidió al implementar (no estaba en la lista):**

- El nivel es un **tope, no una casilla**: "Hasta 4º" muestra también los juegos de 1º-2º,
  porque un niño de 3º sigue jugando con el Dinero en euros. Por eso las pastillas son
  "Hasta 2º / Hasta 4º / Hasta 6º" y no una casilla por banda.
- La banda de cada juego es la en la que **se introduce su contenido**, no la más alta
  que admite.
- Si una categoría no tiene ningún juego para el nivel elegido (Álgebra en 1º-2º), se
  enseñan todos y se avisa, en vez de dejar una pantalla vacía.
- El Memorama entra también en "Matemáticas Mixtas": es el único juego de matemáticas
  mixtas que sirve desde 1º.

**Estado:** hecho. `src/config/games.js` (campo `nivel` en los 41 juegos, `NIVELES`,
`gamesByCategoryAndLevel`, `nivelLabel`), `src/components/GameSelector.js` (pastillas),
`src/components/ActivityCard.js` (distintivo) y tests en `src/config/games.test.js`.

---

## Paso 2 · El bucle ADI: curso → práctica → recompensa

**Qué:** hoy cada juego es un minijuego plano con puntuación. ADI hacía tres cosas:
explicar, practicar y **regalar juego**. Al terminar una ronda con aciertos, en vez de
"Siguiente", aparece un minijuego arcade de 20 segundos como premio. Fallar no resta
nada: solo suena la reacción de la mascota.

**Ficheros:**

| Fichero | Cambio |
|---|---|
| `src/components/ui/JuegoBase.js` | `PantallaFinal` gana el flujo del premio (resumen → minijuego → resultado) |
| `src/components/ui/MiniJuego.js` | (nuevo) el arcade de premio en canvas, 20 s, tres variantes |
| `src/components/ui/minijuego/logic.js` | (nuevo) la lógica pura: puntos, choques, estrellas |
| `src/components/data/pegatinas.js` | (nuevo) las pegatinas del álbum y los logros |
| `src/utils/pegatinas.js` | (nuevo) el estado del álbum en `localStorage` |
| `src/components/ColeccionGame.js` | (nuevo) la pantalla del álbum |
| `src/components/Ajustes.js` | (nuevo) el interruptor del aula: apagar el premio |
| `src/utils/ajustes.js` | (nuevo) los ajustes en `localStorage` |
| `src/components/Landing.js` | botón de la colección + panel de ajustes |
| `src/App.js` | una vista más: `coleccion` |

**Decisiones tomadas:**

- **2.1** El premio aparece **al final de cada partida**, en la pantalla final
  compartida: no hay que tocar el bucle de rondas de cada juego.
- **2.2** El premio es una **mezcla**: un minijuego de 20 segundos (el regalo)
  y una pegatina (el progreso). La pegatina solo cae con 3 estrellas.
- **2.3** El álbum se ve **desde la landing**, con un botón "Mi colección (N)".
- **2.4** El minijuego es **un motor con tres variantes** que salen al azar:
  atrapar estrellas, esquivar bombas y pinchar dianas.
- **2.5** El educador puede **apagar el minijuego de premio** desde "Ajustes
  del aula" en la landing. Apagado, los juegos ni lo ofrecen ni dan pegatinas.

**Lo que se decidió al implementar (no estaba en la lista):**

- La pegatina se gana **solo con 3 estrellas**. Hay un botón "Otra vez" para
  reintentar el minijuego sin perder la partida.
- El arte de las pegatinas son **emojis**: no hay ficheros que cargar.
- Las pegatinas son de 4 temas (animales, dinosaurios, espacio, universo) y
  hay 5 logros aparte.
- El ajuste se guarda en `localStorage` (`edutika:ajustes`), así que el
  educador lo toca una vez y dura para toda la sesión del alumno.

**Estado:** hecho para los 11 juegos que usan el marco `JuegoBase` (los de
rondas: fracciones, números, álgebra, ruleta...). Los demás juegos tienen su
propia pantalla de fin y quedan fuera: para ellos hay que añadir el botón
"Minijuego de premio" a mano.

---

## Paso 3 · El progreso (antes "La Mansión de Adi")

**Qué:** el hub de ADI aplicado a lo que ya existe, pero **sin hub**. En la landing se ve
una barra con los juegos que el niño ya ha probado y sus iconos. No bloquea nada y no da
puntos: es un espejo que enseña que quedan cosas por descubrir.

**Ficheros:**

| Fichero | Cambio |
|---|---|
| `src/components/ProgresoPanel.js` | (nuevo) la barra y los iconos de los juegos probados |
| `src/utils/progreso.js` | (nuevo) los ids jugados en `localStorage` |
| `src/App.js` | al abrir un juego se anota (aquí ya se sabe cuál es, sin tocar los 41 juegos) |
| `src/components/Landing.js` | el panel va en la landing |

**Decisiones tomadas:**

- **3.1** **No hay mansión ni hub.** Se eligió "solo progreso, sin hub": la navegación
  actual no se estorba y el panel se puede abrir y cerrar.
- **3.2** Se anota el juego **al abrirlo**, no al terminarlo. Así no hay que tocar los 41
  juegos para que informen de nada.
- **3.3** No hay llaves ni desbloqueos: el progreso no bloquea el acceso a ningún juego.

**Estado:** hecho. `src/utils/progreso.js`, `src/components/ProgresoPanel.js` y la
anotación en `src/App.js`. Tests en `src/utils/progreso.test.js`.

---

## Paso 4 · Mi Huerta

**Qué:** el jardín de Adibou con la simulación que a Edutika le falta. La matemática es la
única forma de que el huerto funcione:

- siembras 5 semillas y riegas 3 veces al día → **15 plantas** (tablas de multiplicar);
- riegas con ½, ¼, ¾ de botella → el crecimiento depende de la **fracción exacta**;
- recoges y vendes en el mercado → **dinero** (reutiliza la lógica de "Dinero en euros");
- el paso de los días usa la **recta numérica**.

**Ficheros:** `src/components/HuertaGame.js` (nuevo) + `src/components/huerta/logic.js`
(nuevo, con test) + `src/utils/huerta.js` (nuevo) + los sprites en `public/huerto/`.

**Decisiones tomadas:**

- **4.1** Las matemáticas obligatorias son **multiplicar para plantar** (filas × columnas
  de plantones) y **fracción por planta para regar** (N plantas × ½ = botellas). La
  cosecha es un conteo y cada planta da una moneda.
- **4.2** El huerto **guarda el estado**: se guarda en `localStorage` y sigue mañana.
- **4.3** El arte son **sprites propios en `public/huerto/`**, dibujados en SVG (semilla,
  brote, planta, planta con fruto, regadera, gota, sol y luna).

**Lo que se decidió al implementar (no estaba en la lista):**

- El día tiene **dos cuentas**: plantar y regar. Después llega la noche, las plantas
  crecen un paso y al día siguiente dan una moneda cada una.
- Las **opciones de respuesta** son cuatro botones, como en el resto del repo.
- El denominador de la fracción se elige de modo que **siempre salga un número entero
  de botellas**.
- La huerta dura **5 días** y el objetivo son 100 plantas y 50 monedas.

**Estado:** hecho. Aparte de los 42 juegos, es la primera simulación del repo.

---

## Paso 5 · Cajas y Números (Sokoban matemático)

**Qué:** de los minijuegos embebidos en *Adi 4* (Sokoban, Place Ball). Niveles generados
por semilla, reusando el patrón de `src/components/puzzles/firewater/` (`prng.js`,
`levelGenerator.js`, `solvability.js`), donde la aritmética es la puerta: hay que llegar
con X cajas a la meta y las paredes salen de operaciones.

**Ficheros:** `src/components/puzzles/cajas/` (nuevo) siguiendo la estructura de
`src/components/puzzles/firewater/`.

**Decisiones:**

- **5.1** ¿Qué papel tiene la operación matemática? (número de cajas que hay que mover /
  puertas que se abren según el resultado / el nivel se genera a partir de la cuenta)
- **5.2** ¿El generador valida que el nivel tiene solución (como `solvability.js`)?

**Coste:** medio.

---

## Paso 6 · Kicook en La Cocina

**Qué:** "La Cocina" ya existe (fracciones y decimales) y "Hanoi Kitchen" también. Añadir
horno con temperatura y tiempo, y **Kicook** como personaje que reacciona, convierte un
ejercicio en una escena. Es el paso 2 aplicado a un juego que ya está.

**Ficheros:** `src/components/KitchenGame.js` (modificar) + la mascota.

**Decisiones:**

- **6.1** ¿La mascota es un SVG/CSS propio o se reutiliza la de `public/logo22.png`?
- **6.2** ¿La mascota tiene texto (habla) o solo imagen y sonido?

**Coste:** bajo, pero depende del paso 2 para el marco de rondas.

---

## Orden recomendado

1. **Niveles** — barato y es la base de todo lo demás.
2. **Bucle curso→práctica→recompensa** — el mayor salto de diversión.
3. **La Mansión** — le da un eje de progreso a todo lo anterior.
4. **Mi Huerta** — género nuevo.
5. **Cajas y Números** — puzzle nuevo.
6. **Kicook** — detalle.

Los pasos 4 y 5 son independientes entre sí y de los demás: se pueden hacer en cualquier
momento o no hacerlos.

## Estado

| Paso | Estado |
|---|---|
| 1 · Niveles | ✅ hecho |
| 2 · Bucle ADI | ✅ hecho (en los 11 juegos del marco común) |
| 3 · Progreso | ✅ hecho (panel en la landing, sin hub) |
| 4 · Mi Huerta | ✅ hecho |
| 5 · Cajas y Números | ☐ |
| 6 · Kicook | ☐ |
