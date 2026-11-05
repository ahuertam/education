// Tests de la lógica pura de Digilike.
//
// Antes de partir DigilikeGame.js esto no se podía testear: la lógica vivía
// dentro de un componente de 1.800 líneas. Ahora son funciones puras que
// reciben un PRNG con semilla, así que se puede comprobar que el mapa y las
// preguntas son correctos y que no cambian entre llamadas.

import { createRng } from '../puzzles/firewater/prng';
import {
  buildStats, clamp, generateMap, levelTier, makeQuestion, nodeLabel, shuffle,
} from './logic';

describe('generateMap', () => {
  it('es determinista: la misma semilla da el mismo mapa', () => {
    const a = generateMap({ seed: 'abc' });
    const b = generateMap({ seed: 'abc' });
    expect(a.nodes.map((n) => n.id)).toEqual(b.nodes.map((n) => n.id));
    expect(a.nodes.map((n) => n.edges)).toEqual(b.nodes.map((n) => n.edges));
  });

  it('semillas distintas dan mapas distintos', () => {
    // Los ids son posicionales; lo que cambia con la semilla es el tipo de
    // cada nodo y cómo se conectan.
    const a = generateMap({ seed: 'abc' });
    const b = generateMap({ seed: 'xyz' });
    expect(a.nodes.map((n) => n.kind)).not.toEqual(b.nodes.map((n) => n.kind));
    expect(a.nodes.map((n) => n.edges)).not.toEqual(b.nodes.map((n) => n.edges));
  });

  it('el nodo inicial existe y no tiene entradas', () => {
    const mapa = generateMap({ seed: 'semilla' });
    expect(mapa.startId).toBeTruthy();
    expect(mapa.byId[mapa.startId]).toBeTruthy();
    expect(mapa.byId[mapa.startId].edges.length).toBeGreaterThan(0);
  });

  it('todas las aristas apuntan a nodos que existen', () => {
    for (const semilla of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      const mapa = generateMap({ seed: semilla });
      for (const nodo of mapa.nodes) {
        for (const destino of nodo.edges) {
          expect(mapa.byId[destino]).toBeTruthy();
        }
      }
    }
  });

  it('ningún nodo se enlaza a sí mismo', () => {
    const mapa = generateMap({ seed: 'bucle' });
    for (const nodo of mapa.nodes) {
      expect(nodo.edges).not.toContain(nodo.id);
    }
  });

  it('byId y nodes cuentan lo mismo', () => {
    const mapa = generateMap({ seed: 'conteo' });
    expect(Object.keys(mapa.byId).length).toBe(mapa.nodes.length);
  });

  it('cada piso tiene el número de nodos que dice', () => {
    const mapa = generateMap({ seed: 'pisos' });
    for (let piso = 0; piso < mapa.floorsCount; piso++) {
      const enPiso = mapa.nodes.filter((n) => n.floor === piso);
      expect(enPiso.length).toBe(mapa.nodesPerFloor);
    }
  });
});

describe('makeQuestion', () => {
  it('la respuesta es un número y coincide con la operación', () => {
    for (let piso = 1; piso <= 8; piso++) {
      for (const dificultad of [1, 2, 3, 4, 5]) {
        const rng = createRng(`p${piso}d${dificultad}`);
        const q = makeQuestion({ rng, floor: piso });
        expect(Number.isFinite(q.answer)).toBe(true);
        expect(typeof q.prompt).toBe('string');
        expect(q.prompt.length).toBeGreaterThan(0);
      }
    }
  });

  it('en opción múltiple la correcta está entre las opciones', () => {
    const rng = createRng('opciones');
    for (let i = 0; i < 300; i++) {
      const q = makeQuestion({ rng, floor: 3 });
      if (q.type !== 'multiple_choice') continue;
      expect(q.options.length).toBeGreaterThan(1);
      expect(q.options[q.correctIndex]).toBe(q.answer);
      // La respuesta correcta aparece exactamente una vez.
      expect(q.options.filter((o) => o === q.answer).length).toBe(1);
    }
  });

  it('las opciones son distintas entre sí', () => {
    const rng = createRng('distintos');
    for (let i = 0; i < 300; i++) {
      const q = makeQuestion({ rng, floor: 4 });
      if (q.type !== 'multiple_choice') continue;
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  it('nunca divide por cero', () => {
    const rng = createRng('division');
    for (let i = 0; i < 500; i++) {
      const q = makeQuestion({ rng, floor: 5 });
      expect(Number.isFinite(q.answer)).toBe(true);
    }
  });

  it('el tipo de pregunta es uno de los dos previstos', () => {
    const rng = createRng('tipos');
    for (let i = 0; i < 200; i++) {
      const q = makeQuestion({ rng, floor: 2 });
      expect(['numeric_input', 'multiple_choice']).toContain(q.type);
    }
  });
});

describe('buildStats', () => {
  it('un jefe tiene más vida que un enemigo normal', () => {
    const rng = createRng('stats');
    const normal = buildStats({ tier: 2, floor: 3, isBoss: false, rng });
    const jefe = buildStats({ tier: 2, floor: 3, isBoss: true, rng });
    expect(jefe.hp).toBeGreaterThan(normal.hp);
  });

  it('un piso más alto da más vida', () => {
    const rng = createRng('pisos');
    const bajo = buildStats({ tier: 2, floor: 1, isBoss: false, rng });
    const alto = buildStats({ tier: 2, floor: 8, isBoss: false, rng });
    expect(alto.hp).toBeGreaterThan(bajo.hp);
  });

  it('las estadísticas son números enteros positivos', () => {
    const rng = createRng('positivas');
    for (const tier of [0, 1, 2, 3, 4]) {
      const s = buildStats({ tier, floor: 2, isBoss: false, rng });
      for (const clave of ['hp', 'atk', 'def']) {
        expect(Number.isInteger(s[clave])).toBe(true);
        expect(s[clave]).toBeGreaterThan(0);
      }
    }
  });
});

describe('utilidades', () => {
  it('clamp acota por arriba y por abajo', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(30, 0, 10)).toBe(10);
  });

  it('levelTier ordena las etapas de Digimon', () => {
    expect(levelTier('Digi-Huevo')).toBe(0);
    expect(levelTier('Rookie')).toBe(1);
    expect(levelTier('Champion')).toBe(2);
    expect(levelTier('Ultimate')).toBe(4);
    expect(levelTier('Mega')).toBe(4);
    // Lo que no se reconoce cae en el cuerpo maduro.
    expect(levelTier('raro')).toBe(2);
  });

  it('shuffle no pierde ni duplica elementos', () => {
    const rng = createRng('shuffle');
    const lista = [1, 2, 3, 4, 5, 6, 7, 8];
    const revuelta = shuffle(rng, lista);
    expect(revuelta.length).toBe(lista.length);
    expect([...revuelta].sort((a, b) => a - b)).toEqual(lista);
  });

  it('nodeLabel da título, icono y tono para cada tipo de nodo', () => {
    for (const kind of ['start', 'rest', 'loot', 'event', 'combat', 'boss']) {
      const etiqueta = nodeLabel(kind);
      expect(typeof etiqueta.title).toBe('string');
      expect(etiqueta.title.length).toBeGreaterThan(0);
      expect(etiqueta.icon).toBeTruthy();
      expect(typeof etiqueta.tone).toBe('string');
    }
  });
});
