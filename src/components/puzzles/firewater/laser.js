// El recorrido del laser.
//
// Vive en su propio fichero (y no en la escena) por dos razones: la escena
// arrastra Phaser, que el test no puede cargar, y porque el recorrido es una
// funcion pura que se puede comprobar: si el rayo no llega a su sensor, la
// puerta del laser no abre nunca y el nivel no se puede terminar.

function directionVector(dir) {
  if (dir === 'left') return { x: -1, y: 0 };
  if (dir === 'up') return { x: 0, y: -1 };
  if (dir === 'down') return { x: 0, y: 1 };
  return { x: 1, y: 0 };
}

function reflectDirection(dir, orientation) {
  if (orientation === '/') {
    if (dir === 'right') return 'up';
    if (dir === 'left') return 'down';
    if (dir === 'up') return 'right';
    if (dir === 'down') return 'left';
  }
  if (dir === 'right') return 'down';
  if (dir === 'left') return 'up';
  if (dir === 'up') return 'left';
  return 'right';
}

/**
 * Traza el recorrido del laser sobre un nivel y devuelve los tramos dibujados
 * y los sensores que quedan activados.
 */
export function traceLaser(level) {
  const segmentos = [];
  const sensores = new Set();
  const emitters = level.laserEmitters || [];
  const mirrors = level.mirrors || [];
  const laserSensors = level.laserSensors || [];

  for (const emitter of emitters) {
    let dir = emitter.direction || 'right';
    let x = emitter.x;
    let y = emitter.y;

    for (let bounce = 0; bounce < 6; bounce += 1) {
      const vec = directionVector(dir);
      let endX = x + vec.x * 900;
      let endY = y + vec.y * 900;
      let nearestMirror = null;
      let nearestMirrorDist = Infinity;

      for (const mirror of mirrors) {
        const dx = mirror.x - x;
        const dy = mirror.y - y;
        const aligned = vec.x !== 0 ? Math.abs(dy) < 16 : Math.abs(dx) < 16;
        const forward = vec.x !== 0 ? dx * vec.x > 0 : dy * vec.y > 0;
        if (!aligned || !forward) continue;
        const dist = vec.x !== 0 ? Math.abs(dx) : Math.abs(dy);
        if (dist < nearestMirrorDist) {
          nearestMirror = mirror;
          nearestMirrorDist = dist;
        }
      }

      let nearestSensor = null;
      let nearestSensorDist = Infinity;
      for (const sensor of laserSensors) {
        const dx = sensor.x - x;
        const dy = sensor.y - y;
        const halfW = (sensor.w || 40) / 2;
        const halfH = (sensor.h || 44) / 2;
        const aligned = vec.x !== 0 ? Math.abs(dy) <= halfH : Math.abs(dx) <= halfW;
        const forward = vec.x !== 0 ? dx * vec.x > 0 : dy * vec.y > 0;
        if (!aligned || !forward) continue;
        const dist = vec.x !== 0 ? Math.abs(dx) : Math.abs(dy);
        if (dist < nearestSensorDist) {
          nearestSensor = sensor;
          nearestSensorDist = dist;
        }
      }

      if (nearestSensor && nearestSensorDist < nearestMirrorDist) {
        endX = vec.x !== 0 ? nearestSensor.x : x;
        endY = vec.y !== 0 ? nearestSensor.y : y;
        sensores.add(nearestSensor.id);
        segmentos.push({ x1: x, y1: y, x2: endX, y2: endY });
        break;
      }

      if (nearestMirror) {
        endX = nearestMirror.x;
        endY = nearestMirror.y;
        segmentos.push({ x1: x, y1: y, x2: endX, y2: endY });
        dir = reflectDirection(dir, nearestMirror.orientation);
        x = nearestMirror.x;
        y = nearestMirror.y;
        continue;
      }

      segmentos.push({ x1: x, y1: y, x2: endX, y2: endY });
      break;
    }
  }

  return { segmentos, sensores: [...sensores] };
}
