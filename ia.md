# IA.md — Índice rápido de juegos (Education)

Este archivo existe para que cualquier agente de IA (o dev) pueda entender **qué juegos hay**, **cómo se navega entre pantallas**, y **dónde tocar** para añadir/modificar juegos, sin tener que recorrer todo el proyecto.

## Resumen de arquitectura (launcher)

- La app es React (CRA) y monta `App` desde [index.js](file:///Users/home/Desktop/proyects/education/src/index.js).
- No hay rutas por URL (no se usa `react-router`). La navegación interna se hace con un estado `currentView` y un `switch` en [App.js](file:///Users/home/Desktop/proyects/education/src/App.js#L20-L102).
- Flujo principal:
  - `landing` → [Landing.js](file:///Users/home/Desktop/proyects/education/src/components/Landing.js) (selección de categorías).
  - `game-selector` → [GameSelector.js](file:///Users/home/Desktop/proyects/education/src/components/GameSelector.js) (lista de juegos filtrada por categoría).
  - `<game id>` → componente del juego correspondiente (renderizado en [App.js](file:///Users/home/Desktop/proyects/education/src/App.js#L29-L101)).

### Categorías (landing)

El mapping “tarjeta → categoría” está en [Landing.js](file:///Users/home/Desktop/proyects/education/src/components/Landing.js#L131-L150):

- `addition`, `subtraction`, `multiplication`, `division`
- `knowledge`, `vocabulary`, `shapes`, `mixed_math`, `english`

### Catálogo de juegos (selector)

La lista fuente de juegos está en `allGames[]` dentro de [GameSelector.js](file:///Users/home/Desktop/proyects/education/src/components/GameSelector.js#L85-L202).

- `id` es la “ruta interna” (valor de `currentView`).
- `categories[]` determina en qué categoría aparece.
- Al pulsar un juego: `onNavigate(game.id, category)` (pasa `category` como segundo parámetro).

### Contrato de props por tipo de juego

En [App.js](file:///Users/home/Desktop/proyects/education/src/App.js#L29-L101):

- Juegos de matemáticas (suma/resta/multi/div): reciben `operation={selectedOperation}` y `onBack`.
- Juegos no-matemáticos actuales: reciben solo `onBack` (p. ej. `knowledgetower`, `accenthunter`, `shapegoalkeeper`, `kitchen`, `dragontragon`).

## Juegos existentes (IDs, categorías y archivos clave)

La columna “ID (view)” debe coincidir simultáneamente con:
- el `id` de [GameSelector.js](file:///Users/home/Desktop/proyects/education/src/components/GameSelector.js#L85-L202)
- el `case` del `switch` en [App.js](file:///Users/home/Desktop/proyects/education/src/App.js#L29-L101)

| Juego | ID (view) | Categorías | Componente | Datos / estilos | Assets |
|---|---|---|---|---|---|
| Memorama Matemático | `memory` | `addition`, `subtraction`, `multiplication`, `division` | [MemoryGame.js](file:///Users/home/Desktop/proyects/education/src/components/MemoryGame.js) | — | — |
| Defensor Espacial | `space` | `addition`, `subtraction`, `multiplication`, `division` | [SpaceDefenderGame.js](file:///Users/home/Desktop/proyects/education/src/components/SpaceDefenderGame.js) | — | `public/beep.mp3`, `public/explosion.mp3`, `public/stars.mp3` |
| El Salto de la Rana | `frog` | `addition`, `subtraction`, `multiplication`, `division` | [FrogJumpGame.js](file:///Users/home/Desktop/proyects/education/src/components/FrogJumpGame.js) | — | `public/beep.mp3` (y referencia a `splash.mp3`, ver “Detalles”) |
| Pop de Burbujas | `bubbles` | `addition`, `subtraction`, `multiplication`, `division` | [BubblePopGame.js](file:///Users/home/Desktop/proyects/education/src/components/BubblePopGame.js) | — | `public/beep.mp3` |
| Math Lander | `mathlander` | `addition`, `subtraction`, `multiplication`, `division` | [MathLanderGame.js](file:///Users/home/Desktop/proyects/education/src/components/MathLanderGame.js) | — | `public/explosion.mp3`, `public/stars.mp3` |
| Mathsteroids | `mathsteroids` | `addition`, `subtraction`, `multiplication`, `division` | [MathsteroidsGame.js](file:///Users/home/Desktop/proyects/education/src/components/MathsteroidsGame.js) | — | `public/explosion.mp3`, `public/stars.mp3` |
| Alimenta al Monstruo | `monsterfeeder` | `addition`, `subtraction`, `multiplication`, `division` | [MonsterFeederGame.js](file:///Users/home/Desktop/proyects/education/src/components/MonsterFeederGame.js) | — | `public/moster2.png` |
| Carrera de Coches | `carracing` | `addition`, `subtraction`, `multiplication`, `division` | [CarRacingGame.js](file:///Users/home/Desktop/proyects/education/src/components/CarRacingGame.js) | — | — |
| Torre del Saber | `knowledgetower` | `knowledge` | [KnowledgeTowerGame.js](file:///Users/home/Desktop/proyects/education/src/components/KnowledgeTowerGame.js) | [knowledgeTowerQuestions.json](file:///Users/home/Desktop/proyects/education/src/components/data/knowledgeTowerQuestions.json), [knowledgeTowerCategories.js](file:///Users/home/Desktop/proyects/education/src/components/data/knowledgeTowerCategories.js), [KnowledgeTowerStyles.js](file:///Users/home/Desktop/proyects/education/src/components/styles/KnowledgeTowerStyles.js) | `public/lab2.mp3` |
| Cazador de Acentos | `accenthunter` | `vocabulary` | [AccentHunterGame.js](file:///Users/home/Desktop/proyects/education/src/components/AccentHunterGame.js) | — | `public/lab2.mp3` |
| Portero de Formas | `shapegoalkeeper` | `shapes` | [ShapeGoalkeeperGame.js](file:///Users/home/Desktop/proyects/education/src/components/ShapeGoalkeeperGame.js) | [shapeGoalkeeperData.js](file:///Users/home/Desktop/proyects/education/src/components/data/shapeGoalkeeperData.js) | `public/lab2.mp3` |
| La Cocina | `kitchen` | `mixed_math` | [KitchenGame.js](file:///Users/home/Desktop/proyects/education/src/components/KitchenGame.js) | — | `public/lab1.mp3` |
| Dragón Tragón | `dragontragon` | `english` | [DragonTragonGame.js](file:///Users/home/Desktop/proyects/education/src/components/DragonTragonGame.js) | [dragonLessons.json](file:///Users/home/Desktop/proyects/education/src/components/data/dragonLessons.json) | — |

## Assets usados por juegos (carpeta public)

- Audio: [beep.mp3](file:///Users/home/Desktop/proyects/education/public/beep.mp3), [explosion.mp3](file:///Users/home/Desktop/proyects/education/public/explosion.mp3), [stars.mp3](file:///Users/home/Desktop/proyects/education/public/stars.mp3), [lab1.mp3](file:///Users/home/Desktop/proyects/education/public/lab1.mp3), [lab2.mp3](file:///Users/home/Desktop/proyects/education/public/lab2.mp3)
- Imagen: [moster2.png](file:///Users/home/Desktop/proyects/education/public/moster2.png)

## Cómo añadir un juego nuevo (mínimo viable)

1) Crear el componente del juego en `src/components/` (por ejemplo `MyNewGame.js`).
2) Registrarlo en el catálogo:
   - Añadir un item en `allGames[]` en [GameSelector.js](file:///Users/home/Desktop/proyects/education/src/components/GameSelector.js#L85-L202) con:
     - `id` único
     - `title`, `description`, `icon`, `color`
     - `categories: []` con una o varias categorías existentes
3) Cablearlo en el switch:
   - Importar el componente y añadir `case '<id>'` en [App.js](file:///Users/home/Desktop/proyects/education/src/App.js#L1-L101).
4) Si hace falta una categoría nueva:
   - Añadirla en el mapping `categories` de [Landing.js](file:///Users/home/Desktop/proyects/education/src/components/Landing.js#L131-L150).
   - Añadir el `case` correspondiente en `getCategoryInfo()` de [GameSelector.js](file:///Users/home/Desktop/proyects/education/src/components/GameSelector.js#L58-L81).

## Detalles / notas útiles

- `FrogJumpGame` referencia `splash.mp3` como placeholder pero no existe actualmente en `public/`: [FrogJumpGame.js](file:///Users/home/Desktop/proyects/education/src/components/FrogJumpGame.js#L298-L300).
- `MultiplicationSelector.js` parece no usarse (no está enlazado desde `App`/`Landing`/`GameSelector`): [MultiplicationSelector.js](file:///Users/home/Desktop/proyects/education/src/components/MultiplicationSelector.js).
- Scripts de ejecución y deploy: [package.json](file:///Users/home/Desktop/proyects/education/package.json#L18-L26).

