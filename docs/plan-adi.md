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

**Decisiones:**

- **1.1** ¿Cómo se etiquetan los niveles? (6 cursos sueltos / 3 bandas / "ciclo inicial-medio-alto")
- **1.2** ¿Dónde vive el filtro? (solo en el selector / también en la landing / un "mi curso" global)
- **1.3** ¿El nivel solo etiqueta y filtra, o además **cambia la dificultad dentro del juego**
  (números de dos cifras, número de decimales, tiempo por ronda)?
- **1.4** ¿Se recuerda el nivel elegido entre visitas (`localStorage`)?

**Coste:** bajo. Un día. Es la base de los pasos 2 y 3.

---

## Paso 2 · El bucle ADI: curso → práctica → recompensa

**Qué:** hoy cada juego es un minijuego plano con puntuación. ADI hacía tres cosas:
explicar, practicar y **regalar juego**. Al terminar una ronda con aciertos, en vez de
"Siguiente", aparece un minijuego arcade de 20 segundos como premio. Fallar no resta
nada: solo suena la reacción de la mascota.

**Ficheros:**

| Fichero | Cambio |
|---|---|
| `src/components/ui/JuegoBase.js` | usar el `Explicacion` que ya existe + nuevo `PantallaRecompensa` |
| `src/components/ui/MiniRecompensa.js` | (nuevo) el arcade de premio, 20-30 s, reutilizando el `Page`/`BarraJuego` del marco común |
| los 8 juegos del marco `JuegoBase` | primer escalón: son los que ya tienen rondas, racha y explicación |

**Decisiones:**

- **2.1** ¿Por dónde se empieza? (los 8 juegos del `JuegoBase` son los baratos; después el resto)
- **2.2** ¿El premio es **un único minijuego compartido** por todos los juegos, o uno por familia?
- **2.3** ¿El premio **sustituye** al botón "Siguiente" o viene **después** de él?

**Coste:** medio. Es lo que más "`divertido`" aporta por el mismo código.

---

## Paso 3 · La Mansión de Adi

**Qué:** el hub de ADI aplicado a lo que ya existe. Una casa con una puerta por tema
(Números, Fracciones, Lengua, Mundo, Formas). Cada puerta abre un juego que ya existe;
cada ronda acertada da una llave y abre la siguiente. **Cero juegos nuevos**, pero le da
al sitio un eje de progreso y una razón para volver.

**Ficheros:**

| Fichero | Cambio |
|---|---|
| `src/components/MansionGame.js` | (nuevo) la casa, las puertas, las llaves |
| `src/utils/progreso.js` | (nuevo) estado en `localStorage` (claves abiertas por tema), al estilo de `src/utils/rankings.js` |
| `src/App.js` | una vista más en el `switch` + un `onTerminar` que los juegos puedan llamar |

**Decisiones:**

- **3.1** ¿La mansión es **un hub al que se entra** (la landing sigue ahí) o **sustituye** a la landing?
- **3.2** ¿Cómo sabe la mansión que un juego se ha superado? (los juegos tienen que avisar →
  toca tocar 41 ficheros, o se usa un evento global, o el progreso se guarda al volver)
- **3.3** ¿Las llaves son por juego o por tema? ¿Y el progreso se comparte entre niveles?

**Coste:** medio. Lo más rentable de la lista: reutiliza los 41 juegos.

---

## Paso 4 · Mi Huerta

**Qué:** el jardín de Adibou con la simulación que a Edutika le falta. La matemática es la
única forma de que el huerto funcione:

- siembras 5 semillas y riegas 3 veces al día → **15 plantas** (tablas de multiplicar);
- riegas con ½, ¼, ¾ de botella → el crecimiento depende de la **fracción exacta**;
- recoges y vendes en el mercado → **dinero** (reutiliza la lógica de "Dinero en euros");
- el paso de los días usa la **recta numérica**.

**Ficheros:** `src/components/HuertaGame.js` (nuevo) + datos propios. Reutiliza
`src/utils/matematicas.js` y lo que ya hay de fracciones, dinero y recta numérica.

**Decisiones:**

- **4.1** ¿Qué matemáticas son obligatorias para que la huerta crezca? (tablas, fracciones,
  dinero, tiempo) y cuáles son opcionales
- **4.2** ¿La huerta guarda el estado entre sesiones (`localStorage`) o cada partida empieza de cero?
- **4.3** ¿Arte con SVG/CSS propio, o sprites de `public/`?

**Coste:** medio-alto. Es el primer género nuevo (simulación) en el repo.

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
| 1 · Niveles | ☐ |
| 2 · Bucle ADI | ☐ |
| 3 · La Mansión | ☐ |
| 4 · Mi Huerta | ☐ |
| 5 · Cajas y Números | ☐ |
| 6 · Kicook | ☐ |
