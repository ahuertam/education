# Typer Dungeon — Plan de Desarrollo

> Juego de mecanografía para 3.º–6.º de Primaria (8–12 años)  
> Estilo: dungeon crawler en primera persona, inspirado en Eye of the Beholder  
> Plataforma: React (ya existente en el proyecto)

---

## 1. Concepto del juego

El jugador controla a un aventurero solitario que avanza por una mazmorra en vista de primera persona.  
Cada vez que encuentra un monstruo, éste muestra una **palabra en un bocadillo**. El jugador debe **escribirla correctamente** en el campo de texto:

- **Acierto** → el héroe ataca y hace daño al monstruo.  
- **Error** → el monstruo ataca y hace daño al héroe.  

Cuando el monstruo es derrotado, el héroe sigue avanzando por el mapa procedural hasta encontrar las **escaleras** al siguiente nivel. Cuantos más niveles se superen, más difíciles serán las palabras y más fuertes los monstruos.

---

## 2. Assets disponibles

Todos los archivos están en `/public/games/mazmorra/`. Los tres PNG miden **1268 × 832 px** con transparencia (RGBA).

### 2.1 `mazmorra1.png` — Fondos de mazmorra (grid 3×3)

| Col→ / Fila↓ | 0 (x=0) | 1 (x≈423) | 2 (x≈845) |
|---|---|---|---|
| **0** (y=0) | Dungeon Entrance | Straight Corridor | Standard Room |
| **1** (y≈277) | T-Junction | Lair | Treasure |
| **2** (y≈555) | Pitched Battle Screen | Deep Pit | Boss Door Screen |

Cada celda es **~422 × 277 px**. Se selecciona con `background-position` CSS o recortando con canvas.

Uso por tipo de sala:
- **Entrada** → Dungeon Entrance (solo nivel 1)
- **Corredor normal** → Straight Corridor o Standard Room
- **Sala de monstruo** → Pitched Battle Screen (combate normal) / Lair (guarida)
- **Sala de tesoro** → Treasure (recompensa de palabras cortas/bonus)
- **Sala de jefe** → Boss Door Screen
- **Escaleras** → Deep Pit (representan el descenso al siguiente nivel)

---

### 2.2 `uiElements.png` — Héroe, burbujas y UI (1268 × 832 px)

#### Héroe — Vista trasera (HERO-BACK): fila superior
- 8 frames de animación idle/walk
- Posición estimada: **y ≈ 0–270 px**
- Cada frame: **~158 × 270 px** (8 frames en 1268px)
- Frames: 1–8 de izquierda a derecha

#### Héroe — Animación de ataque (ATTACK ANIMATION): fila media
- 8–10 frames (numerados 1–3, 4–7, 10 con huecos)
- Posición estimada: **y ≈ 270–540 px**
- Mismas dimensiones aprox: **~158 × 270 px** por frame

#### UI Elements (zona inferior): **y ≈ 540–832 px**

| Elemento | Posición aproximada (x) | Uso |
|---|---|---|
| Speech bubble rectangular | x ≈ 0–115 | Bocadillo para palabra del monstruo |
| Speech bubble espiky | x ≈ 115–235 | Exclamación del monstruo |
| Speech bubble nube | x ≈ 235–355 | Pensamiento/ayuda |
| Oval bubble | x ≈ 0–115, fila baja | Palabra pronunciada héroe |
| Frame decorado | x ≈ 115–355, fila baja | Cuadro de texto/nombre |
| HP bars (PV/PM) | x ≈ 355–635 | Barra vida/maná héroe |
| Inventory grid | x ≈ 635–790 | No usado en v1 |
| Compass | x ≈ 790–950 | Mini-mapa opcional |
| Botones (Attack/Spell/Artice/Item) | x ≈ 635–950, fila baja | No usados (el "ataque" es el typing) |
| Iconos de items (moneda, llave, libro...) | x ≈ 950–1268 | Bonus/tesoros |

---

### 2.3 `monsters.png` — Monstruos por nivel (1268 × 832 px)

#### Monstruos Menores (Lesser) — zona superior izquierda (~y 0–300)
| Monstruo | Nivel sugerido | Palabras |
|---|---|---|
| **Goblin** | 1 | 3–4 letras simples |
| **Slime Mold** | 1–2 | 3–4 letras simples |
| **Skeleton Warrior** | 2–3 | 4–5 letras |

#### Monstruos Intermedios — zona superior derecha (~y 0–300, x 635+)
| Monstruo | Nivel sugerido | Palabras |
|---|---|---|
| **Gnoll Ranger** | 3–4 | 5 letras |
| **Gazer** | 4–5 | 5–6 letras |
| **Ogre** | 4–5 | 5–6 letras |

#### Monstruos Mayores (Greater) — zona media (~y 300–560)
| Monstruo | Nivel sugerido | Palabras |
|---|---|---|
| **Minotaur** | 5–6 | 6–7 letras |
| **Medusa** | 6–7 | 6–7 letras con tilde |
| **Beholder** | 7–8 | 7 letras |

#### Monstruos Elite — zona inferior (~y 560–832)
| Monstruo | Nivel sugerido | Palabras |
|---|---|---|
| **Lich / Death Knight** | 8–9 | 7–8 letras con tilde |
| **Ettin (doble ogro)** | 8–9 | 8 letras |
| **Dragon (rojo grande)** | 10 (BOSS FINAL) | 9–10 letras o frases cortas |

---

## 3. Motor recomendado

### Opción A: React + CSS Animations ✅ (RECOMENDADA)
- **Por qué**: El juego es principalmente estático (fondos fijos + sprites CSS). La interacción es 100% teclado. No hay física ni colisiones.
- **Cómo**: `background-position` para recortar spritesheets. `@keyframes` CSS para animaciones de ataque/impacto. `useState`/`useReducer` para la máquina de estados del juego.
- **Ventajas**: Sin overhead de Phaser, más fácil de mantener, consistente con el resto del proyecto.

### Opción B: Phaser 3 (ya instalado)
- **Cuándo usarla**: Si en el futuro se quieren efectos de partículas, movimiento de cámara, o animaciones complejas por tilemap.
- **Desventaja**: Mayor complejidad, necesita un wrapper React→Phaser, el DOM del juego queda fuera del árbol React.

**Decisión**: Empezar con **Opción A** (React puro). Si el rendimiento de animaciones resulta insuficiente, migrar las escenas de combate a un `<canvas>` o Phaser.

---

## 4. Arquitectura de componentes

```
src/components/TyperDungeon/
│
├── TyperDungeonGame.js          ← Entrada principal, orquesta el juego
│                                   Estado global: fase, héroe, mazmorra, monstruo
│
├── scenes/
│   ├── DungeonScene.js          ← Vista de primera persona (fondo + héroe + monstruo)
│   ├── BattleScene.js           ← Overlay de combate: monstruo, bocadillo, input
│   ├── VictoryScene.js          ← "Monstruo derrotado" → transición
│   ├── StairsScene.js           ← Escaleras encontradas → siguiente nivel
│   └── GameOverScene.js         ← Héroe muerto → pantalla de fin
│
├── sprites/
│   ├── HeroSprite.js            ← Héroe trasero con estados: idle, walk, attack, hurt
│   └── MonsterSprite.js         ← Monstruo con estados: idle, hurt, defeated
│
├── ui/
│   ├── HeroHUD.js               ← HP bar, nivel actual, número de piso
│   ├── WordBubble.js            ← Bocadillo con la palabra + campo de input
│   ├── TypingInput.js           ← Input controlado, validación, feedback visual
│   └── FloorMinimap.js          ← Mini-mapa 2D opcional (puntos)
│
├── data/
│   ├── words.js                 ← Listas de palabras por dificultad (1–5)
│   └── monsters.js              ← Definición de monstruos: nombre, tier, HP, daño,
│                                   coordenadas del sprite en el spritesheet
│
└── hooks/
    ├── useGameState.js          ← useReducer con la máquina de estados del juego
    └── useDungeonMap.js         ← Generación procedural del mapa
```

---

## 5. Máquina de estados del juego

```
IDLE_MENU
    ↓ [Start Game]
EXPLORING          ← héroe avanza por el corredor
    ↓ [encuentro aleatorio]
ENCOUNTER_INTRO    ← aparece el monstruo (animación entrada)
    ↓ [monstruo en campo]
BATTLE_TYPING      ← se muestra palabra, jugador escribe
    ├─ [correcto]  → HERO_ATTACKS → animar ataque → comprobar HP monstruo
    │                   ├─ [HP > 0]  → BATTLE_TYPING (nueva palabra)
    │                   └─ [HP ≤ 0]  → MONSTER_DEFEATED → EXPLORING
    └─ [incorrecto] → MONSTER_ATTACKS → animar daño héroe → comprobar HP héroe
                        ├─ [HP > 0]  → BATTLE_TYPING (misma o nueva palabra)
                        └─ [HP ≤ 0]  → GAME_OVER
EXPLORING
    └─ [encontrar escaleras]
STAIRS_FOUND       ← animación de descenso
    └─ [siguiente nivel]
EXPLORING          ← nuevo nivel generado
```

---

## 6. Sistema de palabras

### Estructura del fichero `data/words.js`
```js
export const wordsByDifficulty = {
  1: ['sol', 'mar', 'pan', 'luz', 'río'],          // 3 letras
  2: ['casa', 'luna', 'mesa', 'gato', 'perro'],     // 4–5 letras
  3: ['escudo', 'bosque', 'dragón', 'piedra'],      // 5–6 letras, posibles tildes
  4: ['castillo', 'aventura', 'espíritu'],          // 7–8 letras
  5: ['monstruoso', 'exploración', 'caballero'],   // 9–11 letras
};
```

### Progresión por nivel de mazmorra
| Planta | Dificultad de palabras | Monstruos disponibles |
|---|---|---|
| 1–2 | 1 (3 letras) | Goblin, Slime |
| 3–4 | 2 (4–5 letras) | Skeleton, Goblin |
| 5–6 | 3 (5–6 letras + tildes) | Gnoll, Gazer, Ogre |
| 7–8 | 4 (7–8 letras) | Minotaur, Medusa, Beholder |
| 9 | 5 (8–10 letras) | Lich, Ettin |
| 10 | 5 (boss) | Dragon |

### Feedback visual del typing
- Letras correctas escritas hasta ahora: **verde**
- Letra incorrecta: campo tiembla + color rojo
- Acierto completo: flash dorado + animación de espada
- Tolerancia: **0** (debe estar perfectamente escrita, sin errores acumulados)
  - Opcionalmente en niveles 1–2: una corrección permitida

---

## 7. Mapa procedural

### Algoritmo simple (no se necesita Phaser ni librerías externas)
Cada planta tiene una secuencia lineal de **N salas** (N = 5 + nivel × 2):

```
[ENTRADA] → [sala] → [sala] → ... → [sala jefe] → [ESCALERAS]
```

Cada sala se genera aleatoriamente:
- **60%** → Corredor normal (Straight Corridor / Standard Room)
- **20%** → Sala de monstruo (Pitched Battle / Lair)
- **10%** → Sala tesoro (Treasure) — sin combate, bonus de HP
- **10%** → T-Junction — cosmético, sin efecto mecánico

La última sala antes de las escaleras siempre tiene un monstruo élite del nivel.

### Representación en memoria
```js
// Array de objetos sala
[
  { type: 'entrance', background: 0 },
  { type: 'corridor', background: 1 },
  { type: 'monster', background: 6, monster: 'goblin' },
  { type: 'treasure', background: 5 },
  { type: 'stairs', background: 7 },
]
```

---

## 8. Coordenadas de sprites (estimadas, verificar con DevTools)

### Fondos — `mazmorra1.png` (422×277 por celda)
```js
export const BACKGROUNDS = {
  entrance:      { x: 0,   y: 0   },
  corridor:      { x: 422, y: 0   },
  room:          { x: 845, y: 0   },
  tjunction:     { x: 0,   y: 277 },
  lair:          { x: 422, y: 277 },
  treasure:      { x: 845, y: 277 },
  battle:        { x: 0,   y: 555 },
  deeppit:       { x: 422, y: 555 },
  bossdoor:      { x: 845, y: 555 },
};
```

### Héroe — `uiElements.png`
```js
// Hero back (idle/walk): 8 frames, ~158×270px cada uno, y=0
export const HERO_BACK_FRAMES = Array.from({ length: 8 }, (_, i) => ({
  x: i * 158, y: 0, w: 158, h: 270
}));

// Hero attack: 8 frames aprox, y~270
export const HERO_ATTACK_FRAMES = Array.from({ length: 8 }, (_, i) => ({
  x: i * 158, y: 270, w: 158, h: 270
}));
```

### Monstruos — `monsters.png` (coordenadas a ajustar)
```js
export const MONSTERS = {
  goblin:          { x: 0,   y: 0,   w: 200, h: 280, tier: 1, hp: 3,  damage: 1 },
  slime:           { x: 200, y: 0,   w: 200, h: 280, tier: 1, hp: 2,  damage: 1 },
  skeleton:        { x: 420, y: 0,   w: 200, h: 280, tier: 1, hp: 4,  damage: 1 },
  gnoll:           { x: 634, y: 0,   w: 200, h: 280, tier: 2, hp: 5,  damage: 2 },
  gazer:           { x: 845, y: 0,   w: 200, h: 280, tier: 2, hp: 5,  damage: 2 },
  ogre:            { x: 1050,y: 0,   w: 200, h: 280, tier: 2, hp: 6,  damage: 2 },
  minotaur:        { x: 0,   y: 300, w: 200, h: 260, tier: 3, hp: 8,  damage: 3 },
  medusa:          { x: 200, y: 300, w: 200, h: 260, tier: 3, hp: 7,  damage: 3 },
  beholder:        { x: 420, y: 300, w: 200, h: 260, tier: 3, hp: 9,  damage: 3 },
  lich:            { x: 0,   y: 560, w: 160, h: 270, tier: 4, hp: 12, damage: 4 },
  ettin:           { x: 350, y: 560, w: 300, h: 270, tier: 4, hp: 14, damage: 4 },
  dragon:          { x: 634, y: 430, w: 580, h: 380, tier: 5, hp: 20, damage: 5 },
};
```

> **Nota**: Estas coordenadas son aproximaciones visuales. Deben ajustarse usando las DevTools del navegador o un editor de imágenes durante la implementación.

---

## 9. Integración en el proyecto existente

### 9.1 Nuevo case en `App.js`
```jsx
case 'typerdungeon':
  return <TyperDungeonGame onBack={() => setCurrentView('game-selector')} />;
```

### 9.2 Nueva categoría en `Landing.js`
```jsx
{
  id: 13,
  icon: <FaKeyboard />,  // react-icons
  title: "Mecanografía",
  description: "Aprende a escribir con los dedos correctos aventurándote en la Typer Dungeon.",
}
```

```js
// En el objeto categories de Landing.js
13: 'typing'
```

### 9.3 Nueva categoría en `GameSelector.js`
```js
case 'typing':
  return { title: 'Mecanografía', action: 'escribiendo' };
```

Y en el array `allGames`:
```js
{
  id: 'typerdungeon',
  title: 'Typer Dungeon',
  description: 'Aventura de escritura en primera persona. ¡Derrota monstruos escribiendo palabras!',
  icon: <FaDungeon />,
  categories: ['typing'],
  difficulty: '3.º–6.º Primaria',
}
```

---

## 10. Plan de implementación por fases

### Fase 1 — Esqueleto funcional (MVP)
- [ ] Crear estructura de carpetas `TyperDungeon/`
- [ ] `data/words.js` — listas de palabras por dificultad
- [ ] `data/monsters.js` — definición de monstruos
- [ ] `hooks/useGameState.js` — máquina de estados con `useReducer`
- [ ] `hooks/useDungeonMap.js` — generador procedural de salas
- [ ] `TyperDungeonGame.js` — componente raíz con estado global
- [ ] `scenes/DungeonScene.js` — fondo de mazmorra (CSS background-position)
- [ ] `ui/TypingInput.js` — campo de texto con validación básica
- [ ] `ui/WordBubble.js` — bocadillo simple

### Fase 2 — Sprites y combate
- [ ] `sprites/HeroSprite.js` — héroe de espaldas con animación idle
- [ ] `sprites/MonsterSprite.js` — monstruos desde spritesheet
- [ ] `scenes/BattleScene.js` — layout de combate completo
- [ ] `ui/HeroHUD.js` — barra de HP pixel-art
- [ ] Animación de ataque del héroe (CSS keyframes)
- [ ] Animación de daño del monstruo (shake/flash)
- [ ] Animación de daño del héroe (screen flash rojo)

### Fase 3 — Flujo completo
- [ ] `scenes/VictoryScene.js` — monstruo derrotado
- [ ] `scenes/StairsScene.js` — transición entre plantas
- [ ] `scenes/GameOverScene.js` — muerte del héroe
- [ ] `ui/FloorMinimap.js` — mini-mapa opcional con puntos
- [ ] Integración en `App.js`, `Landing.js`, `GameSelector.js`

### Fase 4 — Polish
- [ ] Sonidos (Web Audio API, sin librerías extra): golpe, error, victoria
- [ ] Efectos de transición entre salas (fade negro)
- [ ] Feedback de tecla errónea (vibración input)
- [ ] Récord local (`localStorage`): mejor planta alcanzada
- [ ] Pantalla de instrucciones inicial

---

## 11. Consideraciones pedagógicas

| Aspecto | Decisión |
|---|---|
| **Sin penalización por borrar** | El jugador puede usar Backspace libremente |
| **Palabras en español** | Sin anglicismos, vocabulario del currículo escolar |
| **Tildes y ñ** | Introducidas a partir del nivel 3 (5.º Primaria) |
| **Tiempo límite** | No hay contador; se fomenta la precisión sobre la velocidad |
| **Retroalimentación** | Colores progresivos letra a letra (verde/rojo) |
| **Dificultad adaptativa** | Si el jugador falla 3 veces la misma palabra, se muestra más tiempo |
| **Violencia** | Abstracta (HP bars), sin gore, apropiada para la edad |

---

## 12. Estructura de ficheros final esperada

```
src/components/TyperDungeon/
├── TyperDungeonGame.js
├── scenes/
│   ├── DungeonScene.js
│   ├── BattleScene.js
│   ├── VictoryScene.js
│   ├── StairsScene.js
│   └── GameOverScene.js
├── sprites/
│   ├── HeroSprite.js
│   └── MonsterSprite.js
├── ui/
│   ├── HeroHUD.js
│   ├── WordBubble.js
│   ├── TypingInput.js
│   └── FloorMinimap.js
├── data/
│   ├── words.js
│   └── monsters.js
└── hooks/
    ├── useGameState.js
    └── useDungeonMap.js
```

**Total estimado: ~15 ficheros**, ninguno excede las 250 líneas de media.

---

## 13. Decisiones de diseño confirmadas

| Pregunta | Decisión |
|---|---|
| **Idioma** | Español + modo inglés — selector al inicio de partida |
| **Progreso** | Sin persistencia — cada partida empieza desde cero |
| **Tildes / ñ** | Se introducen a partir del nivel 3 (palabras de monstruos intermedios+) |
| **Dificultad** | Selector al inicio: Fácil (3.º), Normal (4.º–5.º), Difícil (6.º) — cada modo tiene su pool de palabras |
| **Duración** | El jugador elige al inicio: Partida Corta (5 plantas) o Partida Larga (10 plantas) |
| **Escritura** | Libre en v1 — estructura preparada para añadir teclado visual en v2 |

### Implicaciones en el código

- `data/words.js` exportará pools separados: `wordsByDifficulty` (es) + `wordsByDifficultyEn` (en)
- La pantalla de inicio del juego tendrá tres selectores: idioma, dificultad y duración
- El componente `TypingInput.js` dejará una prop `showKeyboardGuide={false}` lista para v2
- No se importará `localStorage` en ningún fichero
