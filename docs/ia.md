# Guía del repo — dónde está cada juego y cada pieza

Índice para cualquier persona (o agente) que necesite **qué juegos hay**, **cómo se
navega** y **dónde tocar** para añadir o modificar uno, sin recorrer el proyecto entero.

Datos a fecha de la última revisión: **43 juegos**, 46 vistas, 53 componentes.

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
   ├──────────►  typerdungeon        (abre directo, sin selector)
   └──────────►  coleccion            (el álbum de pegatinas)
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
| `coleccion` | Álbum de pegatinas | [`ColeccionGame.js`](../src/components/ColeccionGame.js) |
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
| `tallerfracciones` | Taller de Fracciones | [`FraccionesGame.js`](../src/components/FraccionesGame.js) |
| `productosparciales` | Buscador de Productos Parciales | [`ProductosParcialesGame.js`](../src/components/ProductosParcialesGame.js) |
| `rectanumerica` | La Recta Numérica | [`RectaNumericaGame.js`](../src/components/RectaNumericaGame.js) |
| `basediez` | Base Diez | [`BaseDiezGame.js`](../src/components/BaseDiezGame.js) |
| `tablanumeros` | La Tabla de Números | [`TablaNumerosGame.js`](../src/components/TablaNumerosGame.js) |
| `dinero` | Dinero en euros | [`DineroGame.js`](../src/components/DineroGame.js) |
| `geoboard` | El Geoboard | [`GeoboardGame.js`](../src/components/GeoboardGame.js) |
| `patrones` | Bloques de Patrones | [`PatronesGame.js`](../src/components/PatronesGame.js) |
| `numerofalta` | ¿Qué Número Falta? | [`NumeroFaltaGame.js`](../src/components/NumeroFaltaGame.js) |
| `algebra` | Los Números del Álgebra | [`AlgebraGame.js`](../src/components/AlgebraGame.js) |
| `ruleta` | La Ruleta y los Dados | [`RuletaDadosGame.js`](../src/components/RuletaDadosGame.js) |
| `huerta` | Mi Huerta | [`HuertaGame.js`](../src/components/HuertaGame.js) |
| `cajas` | Cajas y Números | [`puzzles/cajas/CajasGame.js`](../src/components/puzzles/cajas/CajasGame.js) |
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
| `colgado` | El Colgado | [`ElColgadoGame.js`](../src/components/ElColgadoGame.js) |
| `roscopalabras` | Rosco de Palabras | [`RoscoPalabrasGame.js`](../src/components/RoscoPalabrasGame.js) |
| `jeopardy` | Jeopardy | [`JeopardyGame.js`](../src/components/JeopardyGame.js) |
| `typerdungeon` | Typer Dungeon | [`TyperDungeon/TyperDungeonGame.js`](../src/components/TyperDungeon/TyperDungeonGame.js) |

---

## 4. Categorías

Todo el catálogo —los 43 juegos y las 17 tarjetas de la landing— está en un
único sitio: [`src/config/games.js`](../src/config/games.js). Antes estaba
repartido en tres ficheros y añadir un juego obligaba a tocarlos todos.

```js
// Un juego
{ id: 'memory', icon: FaGamepad, title: 'Memorama Matemático', color: '#4CAF50',
  categories: ['addition', 'subtraction', 'multiplication', 'division'],
  nivel: 'inicial',
  description: (accion) => `Encuentra las parejas de operaciones y resultados ${accion}.` }

// Una tarjeta de la landing
{ id: 1, icon: FaPlus, title: 'Práctica de Sumas', color: '#4CAF50',
  category: 'addition', description: 'Aprende y practica operaciones de suma...' }
```

`description` puede ser un texto fijo o una función de la categoría activa, que
es lo que cambia la frase ("sumando", "resolviendo...").

### Niveles

`nivel` dice en qué banda de Primaria se introduce el contenido del juego:
`inicial` (1º-2º), `medio` (3º-4º) u `alto` (5º-6º). El selector tiene pastillas
("Hasta 2º / Hasta 4º / Hasta 6º") que filtran la lista, y el nivel es un
**tope**: "Hasta 4º" muestra también los juegos de 1º-2º. La elección se guarda
en `localStorage` (`edutika:nivel`). Si una categoría no tiene juegos para el
nivel elegido, se enseñan todos y se avisa, para no dejar una pantalla vacía.

Los helpers están en `src/config/games.js`: `NIVELES`, `gamesByCategoryAndLevel`
y `nivelLabel`.

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
| 14 | Fracciones | `fracciones` |
| 15 | Números | `numeros` |
| 16 | Álgebra | `algebra` |
| 17 | Probabilidad | `probabilidad` |

Hay tests que comprueban la coherencia: que todo juego del catálogo tenga su
vista en `App.js`, que toda vista de juego esté en el catálogo y que cada
categoría tenga su juego y su tarjeta.

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
| [`ui/JuegoBase.js`](../src/components/ui/JuegoBase.js) | Marco común de los juegos de rondas: barra, tarjeta, opciones, feedback y pantalla final |
| [`ColeccionGame.js`](../src/components/ColeccionGame.js) | Álbum de pegatinas y logros (pantalla `coleccion`) |
| [`Ajustes.js`](../src/components/Ajustes.js) | Interruptores del aula, en la landing |
| [`ProgresoPanel.js`](../src/components/ProgresoPanel.js) | Barra de progreso: qué juegos se han probado |
| [`ui/MiniJuego.js`](../src/components/ui/MiniJuego.js) | Minijuego de premio en canvas (20 s, tres variantes) |

---

## 5b. El minijuego de premio y el álbum

El bucle de ADI: al terminar una partida, el niño se gana un juego de 20
segundos en vez de "otra cuenta".

```
PantallaFinal (ui/JuegoBase.js)
   └─ resumen ──"🎁 Minijuego de premio"──► premio ──► resultado
                                              │           │
                                       MiniJuego      3 estrellas
                                       (canvas)       → pegatina nueva
```

- La lógica del minijuego está en
  [`src/components/ui/minijuego/logic.js`](../src/components/ui/minijuego/logic.js)
  (puntos, choques, estrellas) y es lo único que se testea; el canvas solo
  dibuja. Variantes: `atrapa`, `esquiva`, `golpea`.
- El álbum y sus logros están en
  [`src/components/data/pegatinas.js`](../src/components/data/pegatinas.js);
  el estado, en [`src/utils/pegatinas.js`](../src/utils/pegatinas.js)
  (`localStorage`, clave `edutika:pegatinas`).
- **El educador puede apagarlo**: `src/utils/ajustes.js` (clave
  `edutika:ajustes`) y el panel de la landing. Apagado, los juegos no ofrecen
  el minijuego ni dan pegatinas.
- Solo los 11 juegos que usan `PantallaFinal` tienen el premio. Los que
  tienen su propia pantalla de fin hay que añadirlos a mano.

---

## 6. Datos y utilidades

| Ruta | Contenido |
|---|---|
| [`src/utils/multiplicationProblem.js`](../src/utils/multiplicationProblem.js) | Generador compartido de cuentas de multiplicar |
| [`src/utils/rankings.js`](../src/utils/rankings.js) | Ranking local en `localStorage` |
| [`src/utils/algebra.js`](../src/utils/algebra.js) | Fichas x², x y 1: multiconjuntos, expresiones y el modelo del área de (x+k)² |
| [`src/utils/probabilidad.js`](../src/utils/probabilidad.js) | Ruletas y dados: casos, fracciones y comparación por producto cruzado |
| [`src/utils/pegatinas.js`](../src/utils/pegatinas.js) | Álbum de pegatinas y contadores en `localStorage` |
| [`src/utils/ajustes.js`](../src/utils/ajustes.js) | Ajustes del aula en `localStorage` |
| [`src/utils/progreso.js`](../src/utils/progreso.js) | Qué juegos ha probado el niño, en `localStorage` |
| [`src/utils/matematicas.js`](../src/utils/matematicas.js) | Fracciones, modelo de área y valor posicional (funciones puras, con test) |
| [`src/components/data/`](../src/components/data/) | Datasets: preguntas de conocimiento, sintaxis, ríos, geometría, formas |
| [`src/components/huerta/`](../src/components/huerta/) | Lógica de Mi Huerta: cuentas del día, crecimiento y cosecha |
| [`src/utils/huerta.js`](../src/utils/huerta.js) | El estado del huerto en `localStorage` (sigue mañana) |
| [`src/components/data/ahorcadoPalabras.js`](../src/components/data/ahorcadoPalabras.js) | 69 palabras con pista, para El Colgado y Rosco de Palabras |
| [`src/components/styles/`](../src/components/styles/) | Estilos sueltos de juegos grandes |
| [`src/components/rivers/`](../src/components/rivers/) | Mapa SVG de España y sus ríos |
| [`src/components/puzzles/firewater/`](../src/components/puzzles/firewater/) | Motor de Fuego & Agua |
| [`src/components/puzzles/cajas/`](../src/components/puzzles/cajas/) | Sokoban con puertas de multiplicación |
| [`public/kikook.svg`](../public/kikook.svg) | El monstruo gruñón de La Cocina |
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

Los ocho juegos de cuentas comparten un generador, en
[`src/utils/problemGenerator.js`](../src/utils/problemGenerator.js):

```js
import { generateProblem as makeProblem, difficultyProfile } from '../utils/problemGenerator';

const { a, b, answer, operator } = makeProblem({
  operation,
  profile: difficultyProfile(difficulty),
  multiplicationConfig,
  maxTable: base.max,
});
```

- `multiplicationConfig` viene de `App.js` y lo rellena `MultiplicationConfig`:
  `{ tables: number[], digitMode: 1 | 2 | 3 }`.
- `profile` son los rangos de cada juego. Hay cuatro:
  `difficultyProfile(dificultad)` para los tres juegos con menú de dificultad,
  `SMALL_PROFILE`, `MEDIUM_PROFILE` y `memoryProfile(nivel)`.
- `maxTable` es el tope de dificultad (fácil 9, media 12, difícil 20). Las
  tablas por encima se descartan, así que el selector de dificultad sigue
  mandando sobre qué tablas entran. **Si ninguna de las tablas elegidas cabe en
  la dificultad, se usan las elegidas**: el niño pidió esos números.
- Sin configuración utilizable, el juego cae a su propio rango.

El test de [`problemGenerator.test.js`](../src/utils/problemGenerator.test.js) es
**diferencial**: mantiene las implementaciones antiguas de cada juego como
referencia y compara el conjunto de pares (a, b) alcanzables. Si un solo par
aparece o desaparece, el test falla.

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
2. Añade el `case 'miJuego'` en el `switch` de [`src/App.js`](../src/App.js), y
   el `lazy(() => import(...))` arriba. Los juegos se cargan bajo demanda: sin
   eso, el bundle principal se lleva los 26 juegos y Phaser.
3. Añade la entrada del juego en
   [`src/config/games.js`](../src/config/games.js) con sus `categories`.
4. Si es una categoría nueva, añade también su tarjeta en `CATEGORIES`, en el
   mismo fichero.

Son dos ficheros, no cuatro. Los tests de `src/config/games.test.js` avisan si
se te olvida alguno.

Si el juego necesita datos, déjalos en `src/components/data/` como el resto.

---

## 11. Estructura de los juegos grandes

Tres juegos ya no son un fichero monster:

- **Typer Dungeon** — [`src/components/TyperDungeon/`](../src/components/TyperDungeon/)
  ```
  TyperDungeonGame.js      selects la escena según state.phase
  data/       monsters.js · words.js · sprites.js
  hooks/      useDungeonMap.js (genera el piso) · useGameState.js (reducer)
  scenes/     MenuScene · DungeonScene · BattleScene · VictoryScene · GameOverScene
  sprites/    SpriteCanvas (recorte de croma + trim + caché) · HeroSprite · MonsterSprite
  ui/         DungeonBackground · HeroHUD · TypingInput · WordBubble
  ```
- **Digilike** — [`src/components/digilike/`](../src/components/digilike/)
  ```
  data.js     colores, starters, sagas y traducción de niveles
  styles.js   los 58 styled-components
  logic.js    generación del mapa, preguntas y stats (funciones puras, testeables)
  api.js      la búsqueda del Digimon con su caché
  ```
  El componente queda en [`DigilikeGame.js`](../src/components/DigilikeGame.js).
- **Fuego & Agua** — [`src/components/puzzles/firewater/`](../src/components/puzzles/firewater/)
  ```
  levelGenerator.js · solvability.js · prng.js · seed.js · keymap.js · puzzleScene.js
  ```

---

## 12. Pendientes conocidos

- Hay styled-components copiados entre escenas de Typer Dungeon
  (`ControlPanel`/`HeroPanel`/`StatsPanel`) y entre `GameOverScene`/`VictoryScene`.
- `npm run build` emite warnings de `eslint` preexistentes en varios juegos
  (`useEffect` con dependencias faltantes, imports sin usar). No bloquean el build
  salvo que se ejecute con `CI=true`, que los convierte en errores.
- Los fondos de los modales (`JeopardyGame.js`, `PokemonMathsGame.js`,
  `TiemposVerbalesGame.js`) se cierran con un clic fuera, pero no con
  `Escape`, y no atrapan el foco.