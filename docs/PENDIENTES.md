# Pendientes

Todo lo que salió de la auditoría y **no** entró en el tier 1, más lo que se
detectó al hacer el nuevo trabajo. Cada punto dice dónde está el problema y
cómo se arregla, para que no haya que volver a investigating el repo entero.

Prioridad: 🔴 urgente · 🟠 importante · 🟡 mejora · ⚪ decisión pendiente

---

## 🔴 Accesibilidad: las tarjetas no se pueden usar con teclado

**Dónde**: [`src/components/ActivityCard.js`](../src/components/ActivityCard.js) — el
`CardContainer` es un `styled.div` con `onClick`, sin `role`, sin `tabIndex` y
sin manejo de teclado. Pasa por todas las tarjetas de la landing y del selector
de juegos.

**Por qué importa**: **ninguno de los 26 juegos se puede abrir con el teclado**.
Es el fallo más grave de la lista porque afecta a la navegación entera, no a un
juego suelto.

**Cómo se arregla**: cambiar `CardContainer` a `styled.button` (con
`type="button"` y reset de estilos), o añadir `role="button"`, `tabIndex={0}` y
un `onKeyDown` que responda a Enter y Espacio.

**El patrón correcto ya está en el repo**, en
[`src/components/rivers/SpainRiversMap.js`](../src/components/rivers/SpainRiversMap.js):

```jsx
tabIndex={hoverable ? 0 : -1}
role="button"
aria-label={...}
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); }
}}
```

Otros sitios con el mismo problema: `MemoryGame.js` (las cartas del memorama),
`FrogJumpGame.js` (los nenúfares), `AccentHunterGame.js` (los globos),
`BubblePopGame.js` (las burbujas), `KitchenGame.js` (los botes) y
`styles/KnowledgeTowerStyles.js` (los bloques de respuesta).

---

## 🔴 Privacidad: se envían datos del niño a un tercero

**Dónde**: [`src/components/SupportFab.js`](../src/components/SupportFab.js), función
`buildSupportText`, y [`src/config/support.js`](../src/config/support.js).

**Qué se manda** a `https://formspree.io/f/xojbnrez`:

- El texto libre del niño, que puede incluir su nombre, su colegio o su clase.
- `window.location.href` completa, con la query string.
- Tamaño de pantalla, `navigator.language` y el `User-Agent`.

**Por qué importa**: el sitio es para niños de 6 a 12 años. Se manda a un SaaS
en Estados Unidos, sin aviso para menores y sin política de privacidad en
ningún sitio. El texto que acompaña al formulario ("El mensaje incluye
automáticamente: juego, URL, tamaño de pantalla, idioma, fecha y navegador") es
una nota de desarrollador, no un aviso para la familia.

**Cómo se arregla**:

1. Un aviso claro y en lenguaje de niño delante del botón de enviar, con enlace
   a una política de privacidad.
2. Preguntar por separado el consentimiento antes de enviar el texto libre.
3. Lo mínimo: dejar de mandar la URL completa, el `User-Agent` y el idioma.

---

## 🟠 Ningún `fetch` tiene timeout

**Dónde**:

| Fichero | Qué pide |
|---|---|
| `src/components/PokemonMathsGame.js` | API de Pokémon TCG |
| `src/components/DigilikeGame.js` | `digi-api.com` y `digimon-api.vercel.app` |
| `src/components/SupportFab.js` | Formspree |

**Por qué importa**: `fetch` no tiene timeout por defecto. En el wifi de un
cole, una petición que se queda colgada **nunca resuelve ni rechaza**: el niño
ve el spinner indefinidamente y el `.catch` no salta. En `PokemonMathsGame` el
mensaje de error ya es adecuado ("No se han podido cargar cartas Pokémon ahora
mismo. Prueba otra vez."), pero nunca llega a mostrarse.

**Cómo se arregla**: un `AbortController` con `setTimeout` en cada `fetch`, más
un reintento. La forma más limpia es un helper único, por ejemplo
`src/utils/fetchConTimeout.js`, que use el mismo en los cuatro sitios.

---

## 🟠 `lang="en"` en un sitio íntegramente en español

**Dónde**: [`public/index.html`](../public/index.html), línea 2.

**Por qué importa**: un lector de pantalla en español aplica reglas de
pronunciación y de silabeo del inglés, y la descripción que sale en los
buscadores y al compartir el enlace es la de CRA.

**Cómo se arregla**: `lang="es"`, y de paso la descripción, las etiquetas `og:`
y `twitter:card` (hoy no hay ninguna, así que al compartir un enlace en
WhatsApp no sale título ni imagen) y el `theme-color`, que sigue en `#000000`
cuando la marca es teal.

---

## 🟠 Cero `aria-live`: los aciertos no se anuncian

**Dónde**: en todo el repo, salvo Typer Dungeon.

**Por qué importa**: el bucle central de cada juego de preguntas —"¿acerté?"— no
llega a quien usa lector de pantalla. Ni el acierto, ni el fallo, ni la
puntuación.

**Cómo se arregla**: una región `aria-live="polite"` por juego, con el texto
del último acierto o error. En `TiemposVerbalesGame`, `GeometriaMasterGame`,
`KitchenGame` y `SudokuMathGame` ya existen los componentes `Feedback`,
`StatusBanner` y `Status` que muestran ese texto: basta con añadirles el
`aria-live`.

---

## 🟠 `prefers-reduced-motion` solo está en Typer Dungeon

**Dónde**: fuera de `src/components/TyperDungeon/` no hay ni una sola
ocurrencia. Las animaciones infinitas que quedan:

| Fichero | Animación |
|---|---|
| `src/components/SudokuMathGame.js` | `drift` y `gridmove`, a pantalla completa y en bucle |
| `src/components/BubblePopGame.js` | `wobble` en cada burbuja |
| `src/components/TiemposVerbalesGame.js` | `rewardSpin` y `starFall` |
| `src/components/AccentHunterGame.js` | `pop`, `deflate` y `rise` en los globos |

**Por qué importa**: para un niño con trastornos vestibulares o TDAH, un fondo
que se mueve sin parar más globos que flotan son un problema real, y pueden
provocar náuseas y fatiga visual.

**Cómo se arregla**: un bloque global en
[`src/GlobalStyles.js`](../src/GlobalStyles.js) que baje las animaciones
infinitas con `@media (prefers-reduced-motion: reduce)`. La forma correcta
ya está en `src/App.css` para el logo de CRA:
`@media (prefers-reduced-motion: no-preference)`.

---

## 🟡 Los tres juegos con canvas no usan `devicePixelRatio`

**Dónde**: `MathsteroidsGame.js`, `MathLanderGame.js` y `DragonTragonGame.js`
hacen `canvas.width = window.innerWidth`.

**Por qué importa**: en un iPad (DPR 2) el canvas se dibuja a la mitad de
resolución y se escala con CSS. El texto del HUD, que va dibujado en el canvas,
sale borroso.

**Cómo se arregla**: multiplying por `devicePixelRatio` y aplicando
`ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`. **El patrón correcto ya está en**
`src/components/InmnunoDefenderGame.js`, que lo hace bien.

---

## 🟡 Contraste insuficiente en dos juegos

**Dónde**:

- `src/components/SintaxisGame.js`: el título es blanco sobre un degradado
  `#0EA5E9 → #E0F2FE`. Abajo el ratio es de **1,15:1** — blanco sobre casi
  blanco, invisible.
- `src/components/ShapeGoalkeeperGame.js` y
  `src/components/styles/KnowledgeTowerStyles.js`: el botón "Salir" usa
  `#4A90E2` sobre un fondo de cielo `#87CEEB`, ratio **1,89:1**.

**Por qué importa**: el niño no encuentra el botón de salir en una tablet de
baja calidad con reflejos.

**Cómo se arregla**: oscurecer el azul del botón o subir el contraste del
fondo.

---

## 🟡 Los formularios solo tienen `placeholder`

**Dónde**: `src/components/SupportFab.js`, los tres campos del formulario.

**Por qué importa**: el `placeholder` no es un nombre accesible y desaparece al
escribir. El textarea además usa un ejemplo de 100 caracteres que se pierde al
enfocar.

**Cómo se arregla**: un `<label>` con `htmlFor`, o al menos `aria-label`.

---

## 🟡 Diálogos sin foco atrapado ni `Escape`

**Dónde**: `SupportFab.js`, `TiemposVerbalesGame.js`, `SudokuMathGame.js` y
`GeometriaMasterGame.js`.

**Cómo se arregla**: `role="dialog"`, `aria-modal="true"`, mover el foco al
abrir, atraparlo dentro y cerrar con Escape.

---

## ⚪ Decisiones que hay que tomar

- **Los styled-components copiados entre escenas de Typer Dungeon**:
  `ControlPanel`, `HeroPanel` y `StatsPanel` están duplicados en `BattleScene`
  y `DungeonScene`; `GameOverScene` y `VictoryScene` casi enteros. Son ~90
  líneas que se pueden extraer a `src/components/TyperDungeon/ui/`.
- **`public/index.html`**: falta `og:image`, `og:title`, `og:description` y
  `twitter:card`, así que al compartir un enlace no sale nada.
- **`public/manifest.json`**: `theme_color` en negro, `start_url` en `"."` y
  un `favicon.ico` que declara cuatro tamaños siendo un solo fichero.
- **`.gitignore`**: falta `.claude/`, que ahora aparece en `git status` y
  acabaría en cualquier `git add -A`.
- **`MultiplicationSelector.js`** ya no existe: se borró al centralizar el
  catálogo.
