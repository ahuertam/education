// Tests de los 20 niveles propios de Fuego & Agua.
//
// Un nivel propio tiene que estar tan bien como uno procedural: que no tenga
// solapes, que se pueda llegar a las gemas, a las salidas y a los botones, y
// que el laser (si lo tiene) llegue a su sensor.

import { NIVELES, crearNivel } from './niveles';
import { validateLevel } from './solvability';
import { traceLaser } from './laser';
import { generateValidLevel } from './levelGenerator';

describe('los niveles propios', () => {
  it('hay veinte y todos tienen id y titulo', () => {
    expect(NIVELES).toHaveLength(20);
    for (const n of NIVELES) {
      expect(typeof n.id).toBe('string');
      expect(n.id.length).toBeGreaterThan(0);
      expect(typeof n.titulo).toBe('string');
      expect(n.titulo.length).toBeGreaterThan(0);
    }
    expect(new Set(NIVELES.map((n) => n.id)).size).toBe(20);
  });

  it('ninguno se repite', () => {
    // Si dos niveles fueran iguales, la partida seria la misma.
    const firmas = NIVELES.map((n) => JSON.stringify([
      n.ancho, n.charcos, n.plataformas, n.puertas, n.gemas, n.laser,
    ]));
    expect(new Set(firmas).size).toBe(20);
  });

  it('todos son validos y jugables', () => {
    const fallos = [];
    for (const definicion of NIVELES) {
      const nivel = crearNivel(definicion);
      const v = validateLevel(nivel);
      if (!v.ok) fallos.push(`${definicion.id}: ${v.reasons.join(', ')}`);
    }
    expect(fallos.slice(0, 8)).toEqual([]);
    expect(fallos.length).toBe(0);
  });

  it('cada nivel tiene salida para los dos personajes y gemas para los dos', () => {
    for (const definicion of NIVELES) {
      const nivel = crearNivel(definicion);
      expect(nivel.exits.fire).toBeTruthy();
      expect(nivel.exits.water).toBeTruthy();
      const duenios = new Set(nivel.collectibles.map((g) => g.owner));
      expect(duenios.has('fuego')).toBe(true);
      expect(duenios.has('agua')).toBe(true);
    }
  });

  it('el laser de los niveles que lo tienen llega a su sensor', () => {
    const conLaser = NIVELES.filter((n) => n.laser);
    expect(conLaser.length).toBeGreaterThan(0);
    for (const definicion of conLaser) {
      const nivel = crearNivel(definicion);
      const { sensores } = traceLaser(nivel);
      expect(sensores).toHaveLength(1);
      const sensor = nivel.laserSensors[0];
      expect(sensores).toContain(sensor.id);
      // Y el sensor abre una puerta de verdad.
      expect(nivel.doors.some((d) => d.id === sensor.doorId)).toBe(true);
    }
  });

  it('el juego los carga por su id', () => {
    for (const definicion of NIVELES) {
      const nivel = generateValidLevel({ seed: definicion.id, difficulty: 'easy' });
      expect(nivel.seed).toBe(definicion.id);
      expect(validateLevel(nivel).ok).toBe(true);
    }
  });

  it('una seed que no es un nivel propio da un nivel generado', () => {
    const nivel = generateValidLevel({ seed: 'aula-7', difficulty: 'easy' });
    // No es un nivel propio, pero conserva la seed para poder repetirlo.
    expect(nivel.difficulty).not.toBe('propio');
    expect(nivel.seed).toBe('aula-7');
    expect(validateLevel(nivel).ok).toBe(true);
  });
});
