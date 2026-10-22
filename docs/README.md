# Documentación

Todo lo que no sea el `README.md` de la raíz vive aquí.

## Punto de entrada

- **[`ia.md`](ia.md)** — la guía del repo. Qué juegos hay, cómo se navega, dónde está
  cada componente, cómo añadir uno nuevo y qué hay pendiente. **Empieza por aquí.**

## Planes de diseño

Documentos de trabajo que recogieron el diseño de cada juego. Describen el porqué;
el código es la foto del qué.

- [`TyperDungeon-plan.md`](TyperDungeon-plan.md) — diseño de la mazmorra de
  mecanografía: bucle de combate, los tres spritesheets, escalado por piso.
- [`digilike.md`](digilike.md) — plan del roguelike educativo con Digimon: nodos,
  energía, combate y motor de preguntas enchufable.

## Pendientes

- [`pendingsTsubasa.md`](pendingsTsubasa.md) — lista de mejoras pendientes del
  minijuego de fútbol: física del balón, porteros y progresión de partido.
- [`typer-plan-obsoleto.md`](typer-plan-obsoleto.md) — revisión de código de Typer
  Dungeon hecha **antes** de los commits que la arreglaron. **Obsoleto**: sus
  problemas graves ya están resueltos y menciona ficheros que ya no existen.
  Se conserva solo por historial.

## Convenciones

- Los enlaces entre documentos son **relativos**, para que funcionen desde GitHub y
  desde el editor.
- Las rutas de código se escriben en prosa respecto a la raíz del repo, y como
  enlaces `../src/...` cuando se quiere que sean navegables.
- Los documentos obsoletos se renombran con sufijo (`-obsoleto`) en vez de borrarse.