# Guía del repo — dónde está cada juego y cada pieza

Índice para cualquier persona (o agente) que necesite **qué juegos hay**, **cómo se
navega** y **dónde tocar** para añadir o modificar uno, sin recorrer el proyecto entero.

Datos a fecha de la última revisión: **26 juegos**, 30 vistas, 34 componentes.

---

## 1. Arranque rápido

```bash
npm install
npm start          # http://localhost:3000
npm run build      # genera build/
npm run deploy     # publica build/ en la rama gh-pages
```

Despliegue en <https://edutika.es>. La rama `gh-pages` se regenera entera desde
`build/` en cada `npm run deploy`; el dominio sale de `public/CNAME`, que CRA copia al
build. **No borres `public/CNAME`**, o el sitio pierde su dominio.

---

## 2. Cómo funciona la navegación

**No hay router.** No se usa `react-router`, ni URLs, ni history. Todo pasa por un
estado `currentView` y un `switch` en [`src/App.js`](../src/App.js).

```
Landing  ──►  game-selector  ──►  <juego>
   │               ▲
   │               └── MultiplicationConfig ◄─┘  (solo multiplicación)
   │
   └──────────►  typerdungeon        (abre directo, sin selector)
```

- `handleNavigate(view, operation)` fija la vista y, opcionalmente, la categoría.
- `selectedOperation` se reutiliza como la categoría que filtra el `GameSelector`.
- Para **volver atrás** desde un juego: `onBack={() => setCurrentView('game-selector')}`.
  Salvo los que vienen de la landing, que vuelven a `landing`.

---

## 3. Mapa completo: ruta → componente

| `currentView` | Componente | Fichero |
|---|---|---|
| `landing` | Landing | [`Landing.js`](../src/components/Landing.js) |
| `multiplication-config` | MultiplicationConfig | [`MultiplicationConfig.js`](../src/components/MultiplicationConfig.js) |
| `game-selector` | GameSelector | [`GameSelector.js`](../src/components/GameSelector.js) |
| `memory` | Memorama Matemático | [`MemoryGame.js`](../src/components/MemoryGame.js) |
| `space` | Defensor Espacial | [`SpaceDefenderGame.js`](../src/components/SpaceDefenderGame.js) |
| `frog` | El Salto de la Rana | [`FrogJumpGame.js`](../src/components/FrogJumpGame.js) |
| `bubbles` | Pop de Burbujas | [`BubblePopGame.js`](../src/components/BubblePopGame.js) |
| `mathlander` | Math Lander | [`MathLanderGame.js`](../src/components/MathLanderGame.js) |
| `mathsteroids` | Mathsteroids | [`MathsteroidsGame.js`](../src/components/MathsteroidsGame.js) |
| `monsterfeeder` | Alimenta al Monstruo | [`MonsterFeederGame.js`](../src/components/MonsterFeederGame.js) |
| `carracing` | Carrera de Coches | [`CarRacingGame.js`](../src/components/CarRacingGame.js) |
| `pokemonmaths` | PokemonMaths | [`PokemonMathsGame.js`](../src/components/PokemonMathsGame.js) |
| `knowledgetower` | Torre del Saber | [`KnowledgeTowerGame.js`](../src/components/KnowledgeTowerGame.js) |
| `spainrivers` | Ríos de España | [`SpainRiversLocatorGame.js`](../src/components/SpainRiversLocatorGame.js) |
| `ylahora` | ¿Y la hora? | [`YLaHoraGame.js`](../src/components/YLaHoraGame.js) |
| `inmnunodefender` | InmnunoDefender | [`InmnunoDefenderGame.js`](../src/components/InmnunoDefenderGame.js) |
| `sudokumath` | Sudoku Math | [`SudokuMathGame.js`](../src/components/SudokuMathGame.js) |
| `tsubasa` | RPG Fútbol (Turnos) | [`TsubasaRpgGame.js`](../src/components/TsubasaRpgGame.js) |
| `accenthunter` | Cazador de Acentos | [`AccentHunterGame.js`](../src/components/AccentHunterGame.js) |
| `sintaxis` | Sintaxis | [`SintaxisGame.js`](../src/components/SintaxisGame.js) |
| `tiemposverbales` | Tiempos Verbales | [`TiemposVerbalesGame.js`](../src/components/TiemposVerbalesGame.js) |
| `tiposverbos` | Tipos de Verbos | [`TiposDeVerbosGame.js`](../src/components/TiposDeVerbosGame.js) |
| `shapegoalkeeper` | Portero de Formas | [`ShapeGoalkeeperGame.js`](../src/components/ShapeGoalkeeperGame.js) |
| `geometriaMaster` | Geometría Master | [`GeometriaMasterGame.js`](../src/components/GeometriaMasterGame.js) |
| `kitchen` | La Cocina | [`KitchenGame.js`](../src/components/KitchenGame.js) |
| `hanoikitchen` | Hanoi Kitchen | [`HanoiKitchenGame.js`](../src/components/HanoiKitchenGame.js) |
| `digilike` | Digilike | [`DigilikeGame.js`](../src/components/DigilikeGame.js) |
| `dragontragon` | Dragón Tragón | [`DragonTragonGame.js`](../src/components/DragonTragonGame.js) |
| `firewaterpuzzles` | Fuego & Agua (Procedural) | [`FireWaterPuzzlesGame.js`](../src/components/FireWaterPuzzlesGame.js) |
| `typerdungeon` | Typer Dungeon | [`TyperDungeon/TyperDungeonGame.js`](../src/components/TyperDungeon/TyperDungeonGame.js) |

---

## 4. Categorías

Definidas en dos sitios, y ambos hay que tocarlos a la vez:

1. **Tarjetas de la landing** → arrays `activities` y `categories` en [`Landing.js`](../src/components/Landing.js).
2. **Juegos de cada categoría** → `categories: [...]` por juego en [`GameSelector.js`](../src/components/GameSelector.js).

| id landing | Tarjeta | Categoría |
|---|---|---|
| 1 | Práctica de Sumas | `addition` |
| 2 | Práctica de Restas | `subtraction` |
| 3 | Tablas de Multiplicar | `multiplication` *(pasa antes por la config)* |
| 4 | División Divertida | `division` |
| 5 | Conocimientos Generales | `knowledge` |
| 6 | Vocabulario | `vocabulary` |
| 7 | Colores y Formas | `shapes` |
| 12 | Geometría | `geometria` |
| 8 | Matemáticas Mixtas | `mixed_math` |
| 9 | Inglés | `english` |
| 10 | Avanzado | `advanced` |
| 11 | Puzzles | `puzzles` |
| 13 | Mecanografía | abre `typerdungeon` directo |

---

## 5. Componentes que no son juegos

| Componente | Para qué |
|---|---|
| [`Header.js`](../src/components/Header.js) | Cabecera y logo |
| [`ActivityCard.js`](../src/components/ActivityCard.js) | Cada tarjeta de la landing |
| [`GameSelector.js`](../src/components/GameSelector.js) | Lista de juegos filtrada por categoría |
| [`MultiplicationConfig.js`](../src/components/MultiplicationConfig.js) | Elección de tablas y cifras |
| [`SupportFab.js`](../src/components/SupportFab.js) | Botón de donación Ko-fi |
| [`FlappyBonusLevel.js`](../src/components/FlappyBonusLevel.js) | Nivel extra del juego Flappy |

---

## 6. Datos y utilidades

| Ruta | Contenido |
|---|---|
| [`src/utils/multiplicationProblem.js`](../src/utils/multiplicationProblem.js) | Generador compartido de cuentas de multiplicar |
| [`src/utils/rankings.js`](../src/utils/rankings.js) | Ranking local en `localStorage` |
| [`src/components/data/`](../src/components/data/) | Datasets: preguntas de conocimiento, sintaxis, ríos, geometría, formas |
| [`src/components/styles/`](../src/components/styles/) | Estilos sueltos de juegos grandes |
| [`src/components/rivers/`](../src/components/rivers/) | Mapa SVG de España y sus ríos |
| [`src/components/puzzles/firewater/`](../src/components/puzzles/firewater/) | Motor de Fuego & Agua |
| [`src/config/support.js`](../src/config/support.js) | Enlaces de soporte / donación |

---

## 7. Assets

Todo lo estático vive en `public/` y CRA lo copia tal cual a `build/`.

| Ruta | Qué es |
|---|---|
| [`public/games/tsubasa/`](../public/games/tsubasa/) | Juego de fútbol completo en **vanilla JS**, cargado en iframe |
| [`public/games/mazmorra/`](../public/games/mazmorra/) | Los tres spritesheets de Typer Dungeon (1268×832) |
| `public/*.png`, `public/*.mp3` | Logos, sprites sueltos y efectos de sonido |
| `public/CNAME` | Dominio de GitHub Pages — **no borrar** |

Rutas dentro del código: siempre con `${process.env.PUBLIC_URL}` delante. Es la
variable de Create React App; si el proyecto cambia de bundler hay que migrarla a
`import.meta.env.BASE_URL`.

---

## 8. Configuración de multiplicación

Los juegos de cuentas comparten un generador:

```js
import { generateMultiplicationProblem } from '../utils/multiplicationProblem';

const problema = generateMultiplicationProblem(multiplicationConfig, maxTable);
```

- `multiplicationConfig` viene de `App.js` y lo rellena `MultiplicationConfig`:
  `{ tables: number[], digitMode: 1 | 2 | 3 }`.
- `maxTable` es el tope de dificultad del juego (fácil 9, media 12, difícil 20).
  **Las tablas por encima del tope se descartan**, de modo que el selector de
  dificultad de cada juego sigue mandando sobre qué tablas entran.
- Devuelve `null` si no hay configuración utilizable: el juego cae entonces a su
  rango `min/max` de siempre.

`PokemonMaths` **no** recibe configuración: sus cuentas salen de las energies de las
cartas de la API de Pokémon TCG, por eso está fuera de la categoría `multiplication`.

---

## 9. Typer Dungeon

Único juego con estructura modular. Todo bajo
[`src/components/TyperDungeon/`](../src/components/TyperDungeon/):

```
TyperDungeonGame.js      selects la escena según state.phase
data/       monsters.js · words.js · sprites.js
hooks/      useDungeonMap.js (genera el piso) · useGameState.js (reducer)
scenes/     MenuScene · DungeonScene · BattleScene · VictoryScene · GameOverScene
sprites/    SpriteCanvas (recorte de croma + trim + caché) · HeroSprite · MonsterSprite
ui/         DungeonBackground · HeroHUD · TypingInput · WordBubble
```

Fases del reducer: `exploring` → `pre_battle` → `battle` → `monster_dying` →
`stairs_found` → `descend`, más `victory` y `game_over`.

El detalle de diseño está en [`TyperDungeon-plan.md`](TyperDungeon-plan.md).

---

## 10. Añadir un juego

1. Crea `src/components/MiJuegoGame.js` que exporte el componente y acepte `onBack`.
2. Añade el `case 'miJuego'` en el `switch` de [`src/App.js`](../src/App.js).
3. Añade la entrada al array de juegos de
   [`GameSelector.js`](../src/components/GameSelector.js) con sus `categories`.
4. Si es una categoría nueva, también la tarjeta en
   [`Landing.js`](../src/components/Landing.js) (arrays `activities` **y** `categories`).

Si el juego necesita datos, déjalos en `src/components/data/` como el resto.

---

## 11. Pendientes conocidos

- [`MultiplicationSelector.js`](../src/components/MultiplicationSelector.js) está
  muerto: no lo importa nadie. Sobró de la configuración de multiplicación.
- Hay styled-components copiados entre escenas de Typer Dungeon
  (`ControlPanel`/`HeroPanel`/`StatsPanel`) y entre `GameOverScene`/`VictoryScene`.
- `npm run build` emite warnings de `eslint` preexistentes en varios juegos
  (`useEffect` con dependencias faltantes, imports sin usar). No bloquean el build
  salvo que se ejecute con `CI=true`, que los convierte en errores.