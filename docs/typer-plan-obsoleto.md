# Typer Dungeon — Plan de mejoras

> Generado a partir de la revisión de código del 2026-06-04.
> Aplica sobre `src/components/TyperDungeon/` salvo donde se indique.

---

## 1. Resumen de issues

| # | Prioridad | Archivo | Problema |
|---|---|---|---|
| 1 | 🔴 Alta | `sprites/SpriteCanvas.js` | El `useEffect` re-procesa el sprite (flood‑fill + trim) en cada frame de animación. 5–14 reg/s por sprite. |
| 2 | 🔴 Alta | `scenes/BattleScene.js` | Los `setTimeout` de animación no se cancelan: el nuevo `attack`/`hurt` se sobrescribe con el `idle` viejo. |
| 3 | 🟠 Media | `hooks/useGameState.js` | `nextWord` se añade a `usedWords` **antes** de que el jugador lo escriba. |
| 4 | 🟠 Media | `sprites/MonsterSprite.js` | La animación `dead` existe pero nadie dispara `animState === 'dead'`. |
| 5 | 🟡 Baja | `sprites/DungeonBgCanvas.js` | Componente entero sin importar (código muerto). |
| 6 | 🟡 Baja | `data/monsters.js` | `namePl` no se usa; nombres solo en español. |
| 7 | 🟡 Baja | `sprites/HeroSprite.js` | Coordenadas del spritesheet hard‑coded en JSX. |
| 8 | 🟢 Cosmético | `scenes/DungeonScene.js:155` | `isWalking ? 'idle' : 'idle'` — ternario muerto. |
| 9 | 🟢 Cosmético | `hooks/useDungeonMap.js` | Tesoro al 17% (plan dice 10%). |
| 10 | 🟢 a11y | `ui/TypingInput.js`, varios | Sin `aria-label`, animaciones sin `prefers-reduced-motion`. |

---

## 2. Plan de aplicación

### Paso 1 — Cachear el procesamiento de `SpriteCanvas` 🔴

**Problema:** `useEffect` re-corre el pipeline completo (carga de imagen + `removeBackground` con flood‑fill + `trim`) cada vez que cambia `sx` (que cambia cada 70–180 ms en `HeroSprite`).

**Solución:** introducir un `Map` cacheado por clave JSON de los parámetros **caros** (`src, sx, sy, sw, sh, pad, bgTolerance, clearTopLeft`). Los parámetros **baratos** (`trim, trimBgTolerance, dw, dh`) solo afectan al blit final, que se rehace en cada effect.

Estructura:
```js
const frameCache = new Map(); // key -> { tmp: HTMLCanvasElement, bgColor: number[] }

function processExpensiveFrame(img, opts) { /* carga + drawImage a tmp + flood fill */ }
function drawToOutput(ctx, tmp, bgColor, opts) { /* drawImage + opcional trim */ }
```

- Para `HeroSprite` (idle 5.5 fps, attack 14 fps): cada frame se procesa 1 vez, las siguientes 1–2 s solo blit.
- Para `MonsterSprite`: 1 proceso por monstruo (el frame no cambia).

### Paso 2 — Cancelar timeouts en `BattleScene` 🔴

**Problema:**
```js
setTimeout(() => { setHeroAnim('idle'); setMonsterAnim('idle'); }, 500);
```
Si el jugador acierta dos veces en <500 ms, el primer timeout se dispara durante el segundo `attack` y lo cancela.

**Solución:** refs para los timer ids, `clearTimeout` antes de programar uno nuevo, limpieza en unmount.

```js
const heroTimeoutRef    = useRef(null);
const monsterTimeoutRef = useRef(null);

useEffect(() => () => {
  clearTimeout(heroTimeoutRef.current);
  clearTimeout(monsterTimeoutRef.current);
}, []);
```

### Paso 3 — `usedWords` no se pre‑puebla 🟠

**Antes:**
```js
const nextWord = getWord(..., new Set(usedWords));
return { ..., currentWord: nextWord, usedWords: [...usedWords, nextWord] };
```

**Después:** añadir a `usedWords` solo la palabra **completada o fallada** (la `currentWord` previa), nunca `nextWord`. Si el jugador muere sin completar la palabra, no contamina el pool.

### Paso 4 — Animación de muerte del monstruo 🟠

**Problema:** `MonsterSprite` define `prevAnim === 'dead'`, pero `BattleScene` nunca fija `monsterAnim = 'dead'`.

**Solución:**
- Renombrar fase `monster_defeated` → `monster_dying` (semánticamente más claro).
- `BattleScene` se mantiene montado durante `monster_dying`. `TypingInput` no se renderiza; el monstruo muestra la animación `deathFade` (800 ms).
- `TyperDungeonGame.renderScene()`: si `phase === 'battle' || phase === 'monster_dying'` → `BattleScene`.
- `AUTO_ADVANCE.monster_dying = 1800` (800 ms muerte + 1 s pausa antes de avanzar).
- Eliminar mensaje de `monster_defeated` en `DungeonScene.PHASE_MESSAGES`.

### Paso 5 — Eliminar `DungeonBgCanvas.js` 🟡

Comprobado: ningún archivo lo importa. Borrar. Si en el futuro se quiere refactorizar el render del fondo, partir de este fichero nuevo (no del que está).

### Paso 6 — Internacionalizar monstruos 🟡

Reemplazar:
```js
{ key: 'goblin', name: 'Goblin', namePl: 'Goblin', … }
```
Por:
```js
{ key: 'goblin', name: { es: 'Goblin', en: 'Goblin' }, … }
```

Helper:
```js
export function monsterName(monster, lang) {
  return monster.name[lang] ?? monster.name.es;
}
```

Y en `BattleScene` y `WordBubble`, pasar `monsterName(monster, config.language)`.

### Paso 7 — Mover coordenadas del héroe a `data/` 🟡

Crear `data/sprites.js`:
```js
export const HERO_SPRITE = {
  src: '/games/mazmorra/uiElements.png',
  frameW: 158,
  frameH: 270,
  idleFrames: 8,
  attackFrames: 8,
  attackRowY: 278,
};
```

`HeroSprite.js` lo importa. Editable en un solo sitio.

### Paso 8 — Ternario muerto en `DungeonScene` 🟢

```diff
- <HeroSprite state={isWalking ? 'idle' : 'idle'} size={90} />
+ <HeroSprite state="idle" size={90} />
```

`isWalking` se sigue usando para el `walkPulse` CSS, solo que el prop no servía.

### Paso 9 — Probabilidad de tesoro 🟢

`useDungeonMap.js`:
```diff
- if (roll < 0.38)            rooms.push({ type: 'monster', … });
- else if (roll < 0.55 && …)  rooms.push({ type: 'treasure', … });
+ if (roll < 0.38)            rooms.push({ type: 'monster', … });
+ else if (roll < 0.48 && …)  rooms.push({ type: 'treasure', … });
```

Plan: monster 38 %, treasure 10 %, empty 52 %.

### Paso 10 — a11y básica 🟢

- `TypingInput`: añadir `aria-label="Escribe la palabra del monstruo para atacar"`.
- `MenuScene`, `BattleScene`: envolver animaciones `flicker` / `walkPulse` / `heroAttack` con `@media (prefers-reduced-motion: no-preference)`.
- `WordBubble`: `aria-live="polite"` y `aria-label={`${monsterName} dice: ${word}`}.

---

## 3. Orden de aplicación

1. `typer-plan-obsoleto.md` (este fichero).
2. 🔴 Cachear `SpriteCanvas`.
3. 🔴 Cancelar timeouts en `BattleScene`.
4. 🟠 Limpiar `usedWords` en el reducer.
5. 🟠 Implementar `monster_dying` (incluye rename de fase).
6. 🟡 Borrar `DungeonBgCanvas.js`.
7. 🟡 Internacionalizar monstruos.
8. 🟡 Mover coordenadas a `data/sprites.js`.
9. 🟢 Ternario muerto.
10. 🟢 Probabilidad de tesoro.
11. 🟢 a11y.

Después de cada cambio, comprobación manual en navegador (no hay tests Jest sobre este módulo; los del proyecto usan `@testing-library/react`).
