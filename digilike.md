# Digilike (roguelike educativo con Digimon) — Plan

## Objetivo
Crear un juego web tipo “pokelike” (roguelike de caminos con combates/encuentros) pero ambientado en Digimon, donde el avance por el mapa esté condicionado por resolver correctamente preguntas u operaciones. El sistema de preguntas debe ser modular para poder enchufar “baterías” (datasets) de operaciones, preguntas tipo test o preguntas abiertas.

## Referencia e identidad
- Referencia jugable: https://pokelike.xyz/ (mapa de nodos + progresión por encuentros + run corta repetible).
- Skin/tema: Digimon (criaturas, evolución por etapas, estética “digital”).
- Tono visual: interfaz “terminal digital” (fondo con rejilla/sutil ruido, acentos neón, tarjetas con bordes pixelados).

## Bucle principal (core loop)
1. El jugador elige Digimon inicial (starter) y el “modo de preguntas” (operaciones, test, mixto).
2. Se genera un mapa de nodos (camino ramificado) para una “run”.
3. En cada nodo:
   - Se resuelve el evento del nodo (encuentro/descanso/objeto/mini-boss).
   - Antes de poder elegir el siguiente nodo, aparece una pregunta:
     - Si acierta: recupera parte de energía (y/o obtiene un bonus).
     - Si falla: pierde energía; si llega a 0, termina la run.
4. Elige el siguiente nodo disponible y repite.
5. Al final: boss, pantalla de resultados y “semilla” para repetir.

## Reglas de energía (HP)
- Energía máxima: 100 (configurable).
- Fallo de pregunta: -10 a -20 (según dificultad).
- Acierto de pregunta: +5 a +15 (según dificultad), sin superar el máximo.
- Energía también se ve afectada por combates (si se implementan como en el pokelike).

## Nodos del mapa
Tipos propuestos (MVP → expandible):
- Encuentro (combat): combate 1v1 contra Digimon salvaje.
- Descanso (rest): recupera energía y/o cura estados.
- Botín (loot): elige una mejora (reliquia/ítem).
- Evento (event): elección narrativa con trade-offs (p.ej. más energía ahora vs debuff).
- Mini-boss / Boss: combate más duro con mejores recompensas.

Generación procedural:
- Mapa por “pisos” (floors) con 2–3 nodos por piso y conexiones tipo árbol.
- Semilla (`seed`) para reproducibilidad.
- Reglas: no encadenar demasiados bosses; garantizar al menos 1 descanso cada X pisos.

## Combate (alcance)
Dos capas (para ajustar complejidad):

### Opción A (MVP recomendado)
Combate por turnos simple:
- Player Digimon y Enemy Digimon con HP, ATK, DEF, SPD.
- Acciones: Atacar, Habilidad, Defender, Curar (si hay ítem).
- Daño basado en stats + variación pequeña (RNG con semilla).
- Recompensa: experiencia + opción de mejora.

### Opción B (más “pokelike”)
Sistema de movimientos con PP/energía, buffs/debuffs y “evolución” temporal:
- 3–4 movimientos por Digimon con tipos/efectos.
- Evolución al subir nivel o tras evento (Rookie → Champion → Ultimate), con cambio de sprite y stats.

## Gating de preguntas (requisito clave)
Después de completar un nodo, antes de mostrar el selector del siguiente nodo:
- Se muestra un “portal” (pregunta obligatoria).
- El jugador responde:
  - Correcta: el portal se abre + recuperación parcial de energía + bonus opcional.
  - Incorrecta: el portal “corrompe” energía; se puede permitir 1 reintento con penalización adicional (configurable).

Esto garantiza que el progreso por el mapa está siempre ligado al aprendizaje.

## Motor de preguntas (adaptable)
Diseño por interfaz (conceptual):
- `QuestionProvider`: fuente de preguntas.
  - `next(context)` devuelve `{ id, prompt, type, difficulty, options?, expectedAnswer, validator }`
  - `type`: `multiple_choice` | `numeric_input` | `text_input`
  - `difficulty`: escala 1–5 para ajustar daño/curación.
- `QuestionSession`:
  - controla repetición, evita duplicados, y registra aciertos/fallos.
  - permite “baterías” (datasets) por categoría o nivel.

Validación:
- Para numérico: tolerancia opcional (p.ej. perímetros/áreas con decimales).
- Para texto: normalización (trim, lower, quitar tildes) cuando aplique.
- Para test: índice de opción correcta.

Fuentes de preguntas (integración con el proyecto actual):
- Reutilizar datasets ya existentes en `src/components/data/` cuando encaje (p.ej. geometría o knowledge).
- Añadir datasets nuevos en JSON/JS con el mismo patrón del repo.
- Generadores procedurales para operaciones:
  - suma/resta/multi/división con rangos por dificultad.
  - mixto con prioridad a lo que el usuario más falla (adaptativo simple).

## Progresión y recompensas
- EXP por nodo + bonus por racha de respuestas correctas.
- Al subir de nivel: elegir 1 mejora (ATK/DEF/HP/crit) o aprender movimiento.
- Ítems/reliquias:
  - “Cable de Datos”: +curación por acierto.
  - “Firewall”: reduce penalización por fallo.
  - “Compilador”: +probabilidad de crítico.

## Contenido Digimon (imágenes y datos)
Requisito: usar APIs gratuitas para conseguir imágenes.

API recomendada (principal):
- Digi-API (gratuita): https://digi-api.com/
  - Proporciona fichas de Digimon y suele incluir imágenes en la respuesta.

API alternativa (fallback si faltan imágenes):
- Digimon API (lista por nombre/nivel): https://digimon-api.vercel.app/
  - Útil para nombres/niveles; si no trae imagen, usar un fallback visual (placeholder generado o “tarjeta” sin imagen).

Estrategia de assets:
- Fetch on-demand (cuando aparece un Digimon).
- Cache en memoria + `localStorage` por `digimonId` para evitar repetir descargas.
- UI con “skeleton” mientras carga la imagen.

## Pantallas / UI
MVP:
- Start: elegir starter + modo de preguntas + dificultad base.
- Map: vista del árbol de nodos con el nodo actual y conexiones habilitadas.
- Node result: resumen del evento + botón “Responder pregunta para continuar”.
- Question modal: prompt + input/opciones + feedback (correcto/incorrecto).
- Combat: panel 1v1 con HP bars, ataques y log.
- Run end: stats (aciertos, fallos, nodos, seed) + “Jugar otra run”.

Responsive:
- Mobile-first en el mapa (scroll horizontal/vertical con zoom simple).
- Controles grandes, input numérico optimizado para móvil.

Accesibilidad:
- Contraste suficiente en modo oscuro.
- Navegación por teclado en preguntas tipo test.
- Texto alternativo en imágenes.

## Integración con el proyecto (educación)
El proyecto actual:
- No usa router; navega por `currentView` en `src/App.js`.
- Los juegos viven como componentes en `src/components/*Game.js`.

Propuesta de integración:
- Nuevo componente: `src/components/DigilikeGame.js`.
- Registro en `App.js` como una nueva `currentView` (p.ej. `'digilike'`).
- Card en `GameSelector` para aparecer en categorías relevantes:
  - `mixed_math` y/o `advanced` (y opcionalmente `knowledge` si se habilita test).
- El “modo de preguntas” se selecciona dentro del propio juego para no duplicar categorías.

## Modelo de datos (estado de la run)
Estado mínimo:
- `runId`, `seed`, `floorIndex`, `nodeId`
- `energyCurrent`, `energyMax`
- `starterDigimon`, `currentDigimonStats`, `level`, `exp`
- `inventory` (ítems/reliquias)
- `map`: nodos + conexiones + estado (`locked`/`available`/`cleared`)
- `questionSession`: historial (últimos N), rachas, fallos por tipo

Persistencia:
- Guardado automático en `localStorage` (opcional): “Continuar run”.
- Botón “Nueva run” que limpia el estado.

## Ajuste de dificultad (balancing)
- Dificultad de preguntas escala por piso y por rendimiento:
  - si el jugador falla mucho, baja el rango o cambia a preguntas más sencillas.
  - si encadena aciertos, sube dificultad y también sube recompensa.
- Penalización/curación basadas en `difficulty`.

## Criterios de aceptación (MVP)
- Mapa de nodos jugable con al menos 10–12 nodos totales y ramificaciones.
- Energía baja con fallos y sube con aciertos; game over a 0.
- Gating: no se puede elegir siguiente nodo sin responder.
- Motor de preguntas enchufable con al menos:
  - operaciones numéricas (input)
  - preguntas tipo test (dataset)
- Integración de Digimon con imágenes vía API (con fallback visual si falta).
- Interfaz responsive y estable en móvil y desktop.

## Roadmap por fases
1. MVP (jugable): mapa + gating + operaciones + 6–10 Digimon + combate simple.
2. Expansión: reliquias, eventos, dificultad adaptativa, más datasets.
3. Evoluciones: cambios de forma por nivel y moveset más rico.
4. Metaprogresión: desbloqueos persistentes y logros educativos.

