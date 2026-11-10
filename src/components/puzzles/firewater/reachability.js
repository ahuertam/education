// Alcanzabilidad del nivel: que se pueda llegar a todo.
//
// El validador comprueba que el nivel no tenga solapes ni puertas sin boton,
// pero no que se pueda *llegar*: una gema encerrada en una isla o una salida
// detras de un charco imposible hacen el nivel incanterminable y el juego no
// dice nada.
//
// Aqui se modela lo que el personaje puede hacer: caminar por una superficie,
// saltar un charco y subir a una plataforma. Las puertas se cuentan como
// abiertas (el niño las abre pulsando el boton), pero se comprueba que el
// boton sea alcanzable.

const VELOCIDAD = 220;
const SALTO = 470;
const GRAVEDAD = 900;

// Lo que sube de alto y lo que avanza un salto (de la fisica de la escena).
const ALTO_SALTO = Math.floor((SALTO * SALTO) / (2 * GRAVEDAD));      // ~122 px
const LONGO_SALTO = Math.floor(2 * SALTO * (VELOCIDAD / GRAVEDAD));   // ~229 px

const sueloDe = (level) => {
  const suelo = level.platforms.find((p) => p.id === 'ground');
  if (!suelo) return null;
  return { top: suelo.y - suelo.h / 2, x0: suelo.x - suelo.w / 2, x1: suelo.x + suelo.w / 2 };
};

const solapaRango = (a0, a1, b0, b1, margen = 0) =>
  a1 >= b0 - margen && a0 <= b1 + margen;

/**
 * Devuelve la lista de problemas de alcanzabilidad (vacia si el nivel se
 * puede completar). Cada problema es un texto corto con su motivo.
 */
export function analyzeReachability(level) {
  const problemas = [];
  const suelo = sueloDe(level);
  if (!suelo) return ['sin_suelo'];

  // Los obstaculos del suelo: charcos que hay que saltar.
  const obstaculos = (level.hazards || [])
    .filter((hz) => hz.element === 'lava' || hz.element === 'water' || hz.element === 'acid')
    .map((hz) => ({ x0: hz.x - hz.w / 2, x1: hz.x + hz.w / 2 }))
    .sort((a, b) => a.x0 - b.x0);

  // Tramos de suelo separados por los charcos.
  const tramos = [];
  let cursor = suelo.x0;
  for (const ob of obstaculos) {
    if (ob.x0 > cursor) tramos.push({ id: `suelo_${tramos.length}`, x0: cursor, x1: ob.x0, top: suelo.top, suelo: true });
    cursor = Math.max(cursor, ob.x1);
  }
  if (cursor < suelo.x1) tramos.push({ id: `suelo_${tramos.length}`, x0: cursor, x1: suelo.x1, top: suelo.top, suelo: true });

  // Las plataformas: se puede estar encima.
  const plataformas = (level.platforms || [])
    .filter((p) => p.id !== 'ground' && p.kind === 'solid')
    .map((p, i) => ({ id: p.id || `plat_${i}`, x0: p.x - p.w / 2, x1: p.x + p.w / 2, top: p.y - p.h / 2, suelo: false }));

  const nodos = [...tramos, ...plataformas];

  // Vecinos: se pasa de un nodo a otro si se llega con un salto.
  const vecinos = new Map(nodos.map((n) => [n.id, []]));
  for (const a of nodos) {
    for (const b of nodos) {
      if (a === b) continue;
      const saltoVertical = a.top - b.top;                    // positivo = hacia abajo
      if (saltoVertical > ALTO_SALTO) continue;              // no llega tan abajo
      const separacion = Math.max(0, Math.max(a.x0, b.x0) - Math.min(a.x1, b.x1));
      // Dos superficies que se solapan no necesitan salto: se baja andando.
      const continuo = solapaRango(a.x0, a.x1, b.x0, b.x1, 4);
      if (!continuo && separacion > LONGO_SALTO) continue;
      if (!continuo && Math.abs(saltoVertical) > ALTO_SALTO) continue;
      vecinos.get(a.id).push(b.id);
    }
  }
  // Los tramos de suelo separados por un charco se conectan si el charco se
  // puede saltar (ya esta Todo el calculo de la separacion de arriba, pero
  // entre dos tramos del suelo la distancia horizontal es la del charco).
  for (const a of tramos) {
    for (const b of tramos) {
      if (a === b) continue;
      const gap = Math.max(0, Math.max(a.x0, b.x0) - Math.min(a.x1, b.x1));
      if (gap > 0 && gap <= LONGO_SALTO) vecinos.get(a.id).push(b.id);
    }
  }

  // Se llega desde donde aparecen los personajes.
  const arranque = nodos.filter((n) =>
    ['fire', 'water'].some((quien) => {
      const s = level.spawns?.[quien];
      return s && solapaRango(n.x0, n.x1, s.x - 20, s.x + 20, 8);
    })
  );
  if (!arranque.length) problemas.push('sin_salida_del_spawn');

  // Recorrido en anchura.
  const vistos = new Set();
  const cola = arranque.map((n) => n.id);
  for (const id of cola) vistos.add(id);
  while (cola.length) {
    const id = cola.shift();
    for (const v of vecinos.get(id) || []) {
      if (vistos.has(v)) continue;
      vistos.add(v);
      cola.push(v);
    }
  }

  const alcanzable = (x, y) => nodos.some((n) =>
    vistos.has(n.id) && solapaRango(n.x0, n.x1, x - 26, x + 26, 6) && Math.abs(n.top - y) < 70);

  // Las gemas: tiene que haber una superficie alcanzable debajo.
  for (const g of level.collectibles || []) {
    if (!alcanzable(g.x, g.y + 40)) problemas.push(`gema_inalcanzable:${g.id}`);
  }

  // Las salidas: mismo sitio.
  for (const quien of ['fire', 'water']) {
    const ex = level.exits?.[quien];
    if (!ex) {
      problemas.push(`salida_inexistente:${quien}`);
      continue;
    }
    if (!alcanzable(ex.x, ex.y + 30)) problemas.push(`salida_inalcanzable:${quien}`);
  }

  // Los botones de las puertas: tienen que ser alcanzables.
  for (const b of level.buttons || []) {
    if (!alcanzable(b.x, b.y + 20)) problemas.push(`boton_inalcanzable:${b.id}`);
  }

  return problemas;
}
