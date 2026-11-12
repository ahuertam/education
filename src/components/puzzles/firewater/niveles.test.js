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
      // Los duenios son los que entiende el juego ('fire' y 'water'): con
      // otros nombres la gema del agua no la puede recoger nadie y el nivel
      // no se puede terminar.
      const duenios = new Set(nivel.collectibles.map((g) => g.owner));
      expect(duenios.has('fire')).toBe(true);
      expect(duenios.has('water')).toBe(true);
    }
  });

  it('cada puerta se puede abrir: su activador existe y es del tipo correcto', () => {
    // El juego abre una puerta segun su 'activation' ('button', 'lever' o
    // 'laser'). Si el nombre no es exactamente ese, la puerta se queda
    // cerrada para siempre.
    for (const definicion of NIVELES) {
      const nivel = crearNivel(definicion);
      for (const puerta of nivel.doors) {
        expect(['button', 'lever', 'laser']).toContain(puerta.activation);
        const tieneActivador =
          (puerta.activation === 'button' && nivel.buttons.some((b) => b.doorId === puerta.id)) ||
          (puerta.activation === 'lever' && nivel.levers.some((l) => l.doorId === puerta.id)) ||
          (puerta.activation === 'laser' && nivel.laserSensors.some((s) => s.doorId === puerta.id));
        expect(tieneActivador).toBe(true);
      }
    }
  });

  it('la caja de cada puerta se puede empujar hasta el boton', () => {
    // La caja tiene que estar en el suelo, al lado del boton y sin pisarlo:
    // si cae encima de una plataforma no se puede empujar hasta el boton y
    // la puerta no se abre nunca; si esta encima del boton, la puerta se
    // abre sola y el nivel no tiene misterio.
    for (const definicion of NIVELES) {
      const nivel = crearNivel(definicion);
      for (const puerta of nivel.doors.filter((d) => d.activation === 'button')) {
        const boton = nivel.buttons.find((b) => b.doorId === puerta.id);
        const caja = nivel.crates.find((c) => c.id === `caja_${puerta.id.split('_')[1]}`);
        expect(boton).toBeTruthy();
        expect(caja).toBeTruthy();
        expect(Math.abs(caja.x - boton.x)).toBeGreaterThan((boton.w + caja.w) / 2);
        // Y la caja no puede estar sobre el suelo de un charco.
        for (const hz of nivel.hazards) {
          const dentro = Math.abs(caja.x - hz.x) * 2 < hz.w + caja.w;
          expect(dentro).toBe(false);
        }
      }
    }
  });

  it('los charcos se pueden saltar (o tienen puente encima)', () => {
    // Un salto cubre unos 215 px, pero el personaje tiene que aterrizar
    // limpio: el charco no puede pasar de 90 px o hay que saltarlo con una
    // precision de 0,3 segundos (imposible para un niño).
    for (const definicion of NIVELES) {
      const nivel = crearNivel(definicion);
      for (const hz of nivel.hazards) {
        const puente = nivel.platforms.some((p) =>
          p.id !== 'ground'
          && Math.abs(p.x - hz.x) * 2 < p.w + hz.w
          && p.y < hz.y);
        if (puente) continue;
        expect(hz.w).toBeLessThanOrEqual(90);
      }
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
