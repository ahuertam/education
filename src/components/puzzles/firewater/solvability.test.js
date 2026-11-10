import { generateLevel } from './levelGenerator';
import { validateLevel } from './solvability';
import { traceLaser } from './laser';

describe('FireWater procedural level', () => {
  test('generates deterministically by seed+difficulty', () => {
    const a = generateLevel({ seed: 'aula-7', difficulty: 'easy' });
    const b = generateLevel({ seed: 'aula-7', difficulty: 'easy' });
    const c = generateLevel({ seed: 'aula-7', difficulty: 'hard' });

    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  test('always validates for a set of seeds', () => {
    const cases = [
      { seed: 'demo1', difficulty: 'easy' },
      { seed: 'demo2', difficulty: 'medium' },
      { seed: 'demo3', difficulty: 'hard' },
      { seed: 'clase-2026', difficulty: 'medium' },
      { seed: 'x', difficulty: 'easy' }
    ];

    for (const t of cases) {
      const lvl = generateLevel(t);
      const v = validateLevel(lvl);
      if (!v.ok) {
        throw new Error(`Nivel inválido para ${t.seed}/${t.difficulty}: ${v.reasons.join(', ')}`);
      }
      expect(v.ok).toBe(true);
    }
  });

  // El test de antes miraba cinco semillas y por eso el juego fallaba en
  // uno de cada once niveles: el generador tiraba niveles que el validador
  // rechazaba (por ejemplo, con las escaleras encima del jugador) y el niño
  // se encontraba un cartel rojo en vez del juego.
  test('todos los niveles de un barrido son válidos', () => {
    const dificultades = ['easy', 'medium', 'hard'];
    const fallos = [];

    for (let i = 0; i < 300; i++) {
      for (const dificultad of dificultades) {
        const seed = `barrido-${i}-${dificultad}`;
        const lvl = generateLevel({ seed, difficulty: dificultad });
        const v = validateLevel(lvl);
        if (!v.ok) fallos.push(`${seed}: ${v.reasons.join(', ')}`);
      }
    }

    expect(fallos.slice(0, 8)).toEqual([]);
    expect(fallos.length).toBe(0);
  }, 60000);

  test('las salidas tienen suelo debajo y las gemas están en hueco libre', () => {
    const fallos = [];

    for (let i = 0; i < 60; i++) {
      const lvl = generateLevel({ seed: `salidas-${i}`, difficulty: 'medium' });
      const v = validateLevel(lvl);
      if (v.reasons.some((r) => r.startsWith('exit_unsupported'))) {
        fallos.push(`salidas-${i}: una salida sin suelo`);
      }
      if (v.reasons.some((r) => r.startsWith('collectible_blocked'))) {
        fallos.push(`salidas-${i}: una gema dentro de un muro`);
      }
    }

    expect(fallos.slice(0, 8)).toEqual([]);
  }, 60000);

  test('ninguna puerta se queda sin botón', () => {
    const fallos = [];

    for (let i = 0; i < 60; i++) {
      const lvl = generateLevel({ seed: `puertas-${i}`, difficulty: 'hard' });
      const botones = new Set(lvl.buttons.map((b) => b.doorId));
      for (const puerta of lvl.doors) {
        if ((puerta.activation || 'button') === 'button' && !botones.has(puerta.id)) {
          fallos.push(`puertas-${i}: ${puerta.id} sin botón`);
        }
      }
    }

    expect(fallos.slice(0, 8)).toEqual([]);
  }, 60000);

  test('el laser llega al sensor y abre su puerta', () => {
    // El rayo rebotaba en un espejo que lo mandaba hacia arriba y el sensor
    // estaba mas abajo y en otra x: la puerta del laser no abria nunca.
    const fallos = [];
    let conLaser = 0;

    for (let i = 0; i < 200; i++) {
      const lvl = generateLevel({ seed: `laser-${i}`, difficulty: 'hard' });
      if (!lvl.laserEmitters?.length) continue;
      conLaser++;
      const { sensores } = traceLaser(lvl);
      if (sensores.length === 0) fallos.push(`laser-${i}: el rayo no activa ningun sensor`);
      // Y ademas, el sensor debe ser el de la puerta del laser.
      const sensor = lvl.laserSensors[0];
      if (!sensores.includes(sensor.id)) fallos.push(`laser-${i}: no activa su sensor`);
    }

    expect(conLaser).toBeGreaterThan(0);
    expect(fallos.slice(0, 5)).toEqual([]);
  });
});
