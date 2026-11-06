# De las apps del Math Learning Center a los juegos de Edutika

Cómo se ha traducido el catálogo de apps del [Math Learning Center](https://www.mathlearningcenter.org/apps)
en juegos de Edutika, y por qué se han descartado las que no se han traducido.

Las apps del MLC son **herramientas para explorar**: el niño mueve piezas, tira
gomas o llena rejillas hasta que la idea aparece sola. Son magníficas para el
alumno que ya sabe lo que busca, y en el aula. Edutika funciona al revés:
cada juego son rondas con puntos, racha y final de partida. El trabajo no fue
portar las apps, sino **convertir cada modelo visual en un bucle de juego**,
conservando el modelo y añadiendo una explicación de por qué la respuesta es la
que es.

---

## La regla de traducción

> Mismo modelo, con una pregunta, cuatro respuestas y un porqué.

Cada juego del MLC que se ha traducido da lugar a **cuatro tipos de ronda** que
se van turnando, de forma que el niño ve de todo y no solo repetir:

| Ronda | Qué hace el niño |
|---|---|
| **leer** | Interpreta el modelo y dice qué representa (la fracción, el número, las piezas). |
| **relacionar** | Usa el modelo para relacionar dos cosas (equivalentes, productos parciales, áreas). |
| **comparar** | Decide entre dos opciones usando el modelo (mayor, cambio, forma). |
| **construir** | **Crea** él la figura o el número y el juego comprueba si vale (Geoboard, Base Diez). |

Y siempre: **explicación después de responder**. "La respuesta correcta era 7,
porque la barra llega más lejos" enseña más que un acierto sin más.

---

## App por app

### Traducidas

| App del MLC | Juego en Edutika | Categoría | Qué aporta |
|---|---|---|---|
| **Fractions** | [Taller de Fracciones](../src/components/FraccionesGame.js) | `fracciones` | Los modelos de barra y círculo, que en Edutika solo existían dentro de "La Cocina" y sin dibujo. |
| **Partial Product Finder** | [Buscador de Productos Parciales](../src/components/ProductosParcialesGame.js) | `multiplication`, `mixed_math` | El modelo del rectángulo: multiplicar por partes en vez de solo calcular. |
| **Number Line** | [La Recta Numérica](../src/components/RectaNumericaGame.js) | `numeros` | Sentido numérico: ordenar, comparar y saltar. No había nada de esto en el repo. |
| **Number Pieces / Frames / Rack** | [Base Diez](../src/components/BaseDiezGame.js) | `numeros` | Valor posicional con piezas de 1, 10 y 100. |
| **Geoboard** | [El Geoboard](../src/components/GeoboardGame.js) | `geometria` | Área y perímetro construyendo la figura, no aplicando la fórmula. |
| **Pattern Shapes** | [Bloques de Patrones](../src/components/PatronesGame.js) | `geometria`, `shapes` | Las piezas de patrón y sus equivalencias (rombo = 2 triángulos, hexágono = 6). |
| **Number Chart** | [La Tabla de Números](../src/components/TablaNumerosGame.js) | `numeros` | Leer una serie en una rejilla y prever el número que sigue. |
| **Money Pieces** | [Dinero en euros](../src/components/DineroGame.js) | `numeros` | Combinar piezas de dinero. **Adaptada**: la app es en dólares y aquí es en euros, con los céntimos y los colores reales. |

### Descartadas

| App del MLC | Por qué no |
|---|---|
| **Math Clock** | Ya estaba cubierto por [¿Y la hora?](../src/components/YLaHoraGame.js), que además suma y resta 15, 30 y 60 minutos. |
| **Math Vocabulary Cards** | El vocabulario de lengua ya está muy cubierto; el matemático es un añadido menor. |
| **Colección de fichas sueltas** | Se ha traducido el juego de Pattern Shapes, no una galería de fichas para imprimir. |
| **Whiteboard App** | No es un juego: es un lienzo en blanco. |
| **Apps Launcher** | Es un lanzador de apps, no un juego. |

### La siguiente tanda

- **Geoboard** y **Pattern Shapes** ya están hechos: lo que queda abierto es
  **arrastrar** las piezas en vez de solo tocarlas.
- **Math Vocabulary Cards** en castellano: un mazo de tarjetas de vocabulario
  matemático (numerador, denominador, múltiplo, primo...) con su definición y su
  dibujo.
- **Dinero en euros**, segunda parte: pagar en un tienda (elegir monedas hasta
  llegar al precio) y calcular el cambio de un billete.

---

## Detalles que no son negociables

- **Castellano de España.** Decimales con coma (`3,45 €`), euros detrás
  (`19,55 €`), "casillas" y no "celdas", "goma" y no "banda elástica". Las
  cantidades de dinero nunca llevan punto decimal.
- **Los céntimos se ven.** En la app original las monedas son de un centavo y
  medio: aquí hay de 1 a 50 céntimos, 1 € y 2 €, con el color real de cada una.
- **La unidad de las piezas de patrón es el triángulo**, como en el aula: el
  rombo son 2, el trapecio 3 y el hexágono 6. Todas las piezas se dibujan a la
  misma escala, con las rayas de los triángulos dentro.
- **La rejilla del Geoboard va de 0 a 4**: cuatro casillas de lado, que es lo
  que cabe en una tablet sin que las gomas se crucen.
- **La tabla de números admite décimas** (de 0,25 en 0,25) porque en 5.º y 6.º
  es donde se trabaja la serie.

---

## Dónde está el código

| Qué | Fichero |
|---|---|
| La lógica matemática compartida (fracciones, modelo de área, base diez, polígonos) | [`src/utils/matematicas.js`](../src/utils/matematicas.js) |
| El marco común de los juegos de rondas (barra, tarjeta, opciones, final) | [`src/components/ui/JuegoBase.js`](../src/components/ui/JuegoBase.js) |
| El catálogo único de juegos y tarjetas | [`src/config/games.js`](../src/config/games.js) |
| Los tests de estos ocho juegos | [`juegosNumericos.test.js`](../src/components/juegosNumericos.test.js), [`juegosConstructivos.test.js`](../src/components/juegosConstructivos.test.js) |

La regla de geometría del Geoboard (área por la fórmula del cordón) y las
fracciones (simplificar, comparar por producto cruzado) están en funciones
puras en `utils/matematicas.js`, con su test en `matematicas.test.js`. Si se
tocan, el test avisa.

---

## Cómo se añade el siguiente

1. La lógica que se pueda dejar en funciones puras, en `src/utils/matematicas.js`
   (o en un `utils/` nuevo si es otra cosa), con su test.
2. El juego en `src/components/NuevoJuegoGame.js`, importando el marco de
   `ui/JuegoBase.js`.
3. La entrada en `src/config/games.js` (juego y, si es categoría nueva, su
   tarjeta) y el `case` en `src/App.js`.
4. Un test que juegue la partida entera: lo que se rompe en estos juegos es que
   una ronda deje al niño sin salida.
