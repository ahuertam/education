# Edutika — juegos educativos para Primaria

Web de juegos matemáticos, de lengua y de conocimiento general. **26 minijuegos** en
español, pensados para niños de Primaria.

🌐 **[edutika.es](https://edutika.es)**

![React](https://img.shields.io/badge/React-19-blue)
![Stack](https://img.shields.io/badge/stack-CRA%20%2B%20Phaser%20%2B%20Matter.js-blueviolet)
![Licencia](https://img.shields.io/badge/licencia-MIT-green)

> 📖 **La guía del repo está en [`docs/ia.md`](docs/ia.md)**: qué juegos hay, dónde está
> cada componente, cómo se navega entre pantallas y cómo añadir un juego nuevo.

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

### 🧠 Conocimiento general

| Juego | Qué hace |
|---|---|
| **Torre del Saber** | Construye la torre más alta respondiendo preguntas de cultura general. |
| **Ríos de España (Mapa)** | Localiza 8 ríos principales en el mapa. Modo Rápido y modo Orden. |
| **¿Y la hora?** | Lee la hora y suma o resta 15, 30 y 60 minutos con un reloj grande. |
| **InmnunoDefender** | Glóbulo blanco contra virus y bacterias, respondiendo preguntas entre oleadas. |

### 📚 Lengua y vocabulario

| Juego | Qué hace |
|---|---|
| **Cazador de Acentos** | Identifica diptongos e hiatos explotando globos. |
| **Sintaxis** | Detective sintáctico: verbo, sujeto, predicado y complementos (CD y CI). |
| **Tiempos Verbales** | Reto rápido para elegir la forma verbal correcta. |
| **Tipos de Verbos** | Clasifica verbos en regulares, irregulares y defectivos. |

### 🎨 Formas, color y geometría

| Juego | Qué hace |
|---|---|
| **Portero de Formas** | Detén las formas y colores correctos en la portería. |
| **Geometría Master** | Ejercicios de geometría + bonus tipo Flappy por cada acierto. |

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
- **Un generador compartido** para las cuentas de multiplicar
  ([`src/utils/multiplicationProblem.js`](src/utils/multiplicationProblem.js)), alimentado
  por la configuración de tablas y cifras que se elige antes de entrar. El selector de
  dificultad de cada juego manda sobre qué tablas entran.
- **Datasets** en [`src/components/data/`](src/components/data/): preguntas de conocimiento,
  sintaxis, ríos, geometría y formas.
- **Ranking local** en `localStorage` ([`src/utils/rankings.js`](src/utils/rankings.js)).
- **Typer Dungeon** es el único juego con estructura modular: escenas, hooks y un reducer
  de fases (`exploring → pre_battle → battle → monster_dying → stairs_found → descend`).
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
