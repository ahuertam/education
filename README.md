# Edutika — juegos educativos para Primaria

Web de juegos matemáticos, de lengua y de conocimiento general. **38 minijuegos**
en español, pensados para niños de Primaria. Gratis y sin cuenta ni descargas.

🌐 **[edutika.es](https://edutika.es)**

![React](https://img.shields.io/badge/React-19-blue)
![Stack](https://img.shields.io/badge/stack-CRA%20%2B%20Phaser%20%2B%20Matter.js-blueviolet)
![Licencia](https://img.shields.io/badge/licencia-MIT-green)

> 📖 **La guía del repo está en [`docs/ia.md`](docs/ia.md)**: qué juegos hay, dónde está
> cada componente, cómo se navega entre pantallas y cómo añadir un juego nuevo.
> Los juegos salidos de las apps del Math Learning Center se cuentan en
> [`docs/mlc.md`](docs/mlc.md).

---

## Los juegos

Agrupados por la categoría desde la que se alcanzan. Un mismo juego puede entrar en
varias: los de matemáticas sirven para las cuatro operaciones, por ejemplo.

### ➕➖✖️➗ Matemáticas

| Juego | Qué hace |
|---|---|
| **Memorama Matemático** | Encuentra las parejas de operaciones y resultados. |
| **Defensor Espacial** | Destruye asteroides resolviendo operaciones. |
| **El Salto de la Rana** | Ayuda a la rana a cruzar el estanque. |
| **Pop de Burbujas** | Explota las burbujas correctas. |
| **Math Lander** | Aterriza en la respuesta correcta. |
| **Mathsteroids** | Destruye asteroides con la respuesta correcta. |
| **Alimenta al Monstruo** | Arrastra la comida correcta. |
| **Carrera de Coches** | ¡Acelera respondiendo correctamente! |
| **PokemonMaths** | Usa cartas Pokémon para resolver operaciones, sin repetir preguntas y con ranking local. |
| **Buscador de Productos Parciales** | Multiplica con el modelo del rectángulo: las decenas por un lado y las unidades por otro. |

### 🍕 Fracciones y números

| Juego | Qué hace |
|---|---|
| **Taller de Fracciones** | Lee, compara y suma fracciones con barras y círculos. |
| **La Recta Numérica** | Sitúa, salta y ordena números en una recta que cambia de escala. |
| **Base Diez** | Lee, descompone y compara números con piezas de base diez. |
| **La Tabla de Números** | Lee una rejilla de números, prevé el siguiente y descubre de cuánto en cuánto avanza. |
| **Dinero en euros** | Suma monedas y billetes, calcula el cambio y combina piezas para pagar. |

### 🧠 Conocimiento general

| Juego | Qué hace |
|---|---|
| **Torre del Saber** | Construye la torre más alta respondiendo preguntas de cultura general. |
| **Ríos de España (Mapa)** | Localiza 8 ríos principales en el mapa. Modo Rápido y modo Orden. |
| **¿Y la hora?** | Lee la hora y suma o resta 15, 30 y 60 minutos con un reloj grande. |
| **InmnunoDefender** | Glóbulo blanco contra virus y bacterias, respondiendo preguntas entre oleadas. |
| **Jeopardy** | Tablero de categorías y puntajes al estilo clásico para repasar unidades. |

### 📚 Lengua y vocabulario

| Juego | Qué hace |
|---|---|
| **Cazador de Acentos** | Identifica diptongos e hiatos explotando globos. |
| **El Colgado** | El ahorcado de toda la vida: lee la pista y adivina la palabra letra a letra. |
| **Rosco de Palabras** | Escribe la palabra letra a letra contra el reloj. |
| **Sintaxis** | Detective sintáctico: verbo, sujeto, predicado y complementos (CD y CI). |
| **Tiempos Verbales** | Reto rápido para elegir la forma verbal correcta. |
| **Tipos de Verbos** | Clasifica verbos en regulares, irregulares y defectivos. |

### 🎨 Formas, color y geometría

| Juego | Qué hace |
|---|---|
| **Portero de Formas** | Detén las formas y colores correctos en la portería. |
| **Geometría Master** | Ejercicios de geometría + bonus tipo Flappy por cada acierto. |
| **El Geoboard** | Tira gomas entre clavos: mide el área, el borde y construye figuras. |
| **Bloques de Patrones** | Cuenta piezas de patrón y descubre cuántas piezas forman cada una. |

### 🧩 Mixto, puzzles y avanzado

| Juego | Qué hace |
|---|---|
| **La Cocina** | Prepara el antídoto mezclando ingredientes con fracciones y decimales. |
| **Hanoi Kitchen** | Torre de Hanoi: vierte la cantidad exacta en el caldero. |
| **Digilike** | Roguelike de caminos: completa nodos, responde el portal y gestiona tu energía. |
| **Sudoku Math** | Sudoku donde cada número se usa una vez para que las operaciones cuadren. |
| **RPG Fútbol (Turnos)** | Regate, pase o tiro: resuelve retos matemáticos para subir la probabilidad de éxito. |

### 🇬🇧 Inglés

| Juego | Qué hace |
|---|---|
| **Dragón Tragón** | Cómete las palabras correctas para formar la frase en inglés. |

### 🔥 Puzzles

| Juego | Qué hace |
|---|---|
| **Fuego & Agua (Procedural)** | Fireboy & Watergirl: coop local, puertas, botones y niveles generados por semilla. |

### ⌨️ Mecanografía

| Juego | Qué hace |
|---|---|
| **Typer Dungeon** | RPG de tecleo por turnos: explorar, combatir escribiendo y bajar escaleras. Se abre directo desde la portada, sin pasar por el selector. |

---

## Arranque rápido

```bash
npm install
npm start          # http://localhost:3000
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo con recarga en caliente. |
| `npm run build` | Build de producción en `build/`. |
| `npm test` | Tests en modo watch. |
| `npm run deploy` | Publica `build/` en la rama `gh-pages` (ejecuta `build` antes). |

## Cómo está montado

- **Sin router.** No hay `react-router` ni URLs: la navegación es un `currentView` en el
  estado de `App.js` y un `switch` que decide el componente a pintar.
- **Los juegos se cargan bajo demanda** (`React.lazy`): la landing pesa 94 KB comprimidos
  y cada juego baja su trozo al abrirlo, en vez de bajar los 38 de golpe.
- **Un catálogo único** en [`src/config/games.js`](src/config/games.js): los 38 juegos y las
  15 tarjetas de la landing. Añadir un juego son dos ficheros, no cuatro.
- **Un generador compartido** para las cuentas de multiplicar
  ([`src/utils/problemGenerator.js`](src/utils/problemGenerator.js)), alimentado
  por la configuración de tablas y cifras que se elige antes de entrar. El selector de
  dificultad de cada juego manda sobre qué tablas entran.
- **Datasets** en [`src/components/data/`](src/components/data/): preguntas de conocimiento,
  sintaxis, ríos, geometría y formas.
- **Ranking local** en `localStorage` ([`src/utils/rankings.js`](src/utils/rankings.js)).
- **Ocho juegos salidos de las apps del Math Learning Center** (Fractions, Partial Product
  Finder, Number Line, Number Pieces, Geoboard, Pattern Shapes, Number Chart y Money
  Pieces): allí son herramientas para explorar; aquí son rondas con puntos, racha y
  explicación de por qué la respuesta es la que es. La lógica compartida está en
  [`src/utils/matematicas.js`](src/utils/matematicas.js) y el marco de la interfaz en
  [`src/components/ui/JuegoBase.js`](src/components/ui/JuegoBase.js).
- **Tres juegos con estructura modular**: Typer Dungeon (escenas, hooks y un reducer de
  fases `exploring → pre_battle → battle → monster_dying → stairs_found → descend`),
  Digilike (datos, estilos, lógica pura testeable y capa de red) y Fuego & Agua
  (generador de niveles con semilla y validación de solubilidad).
- **Recursos** en `public/`: el juego de fútbol va en **vanilla JS** dentro de un iframe y
  los spritesheets de Typer Dungeon son PNG con recorte de croma.

## Stack

- **React 19** + Create React App
- **Phaser 3** y **Matter.js** para los juegos con física
- **styled-components** para el estilo de cada juego
- **react-icons** para la iconografía
- **Sin backend**: el estado y las puntuaciones viven en el navegador

## Despliegue

El sitio se publica en <https://edutika.es> con GitHub Pages:

```bash
npm run deploy
```

La rama `gh-pages` se regenera entera desde `build/` en cada despliegue. El dominio sale de
`public/CNAME`, que CRA copia al build — **no lo borres** o el sitio pierde su dominio.

## Licencia

MIT. Ver [`LICENSE`](LICENSE).
