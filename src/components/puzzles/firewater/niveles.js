// Los 20 niveles propios de Fuego & Agua.
//
// Se escriben en un formato corto (todo en pixeles, con la altura de las
// plataformas medida desde el suelo) y `crearNivel` los convierte al nivel
// completo que entiende el juego. Los niveles procedurales se quedan como
// alternativa, pero estos son los que se garantizan siempre.
//
// Formato de cada nivel:
//   charcos:     [[x, ancho], ...]              charcos de lava o de agua
//   plataformas: [[x, alto, ancho], ...]        alto = altura sobre el suelo
//   puertas:     [[x, 'button'|'lever'|'laser'], ...]
//   gemas:       [[x, 'fire'|'water'], ...]
//   laser:       true                            el nivel trae emisor y sensor
//   ancho:       pixeles                         ancho del campo

const ALTO = 900;
const SUELO_Y = ALTO - 40;
const SUELO_H = 40;
const SUELO_TOP = SUELO_Y - SUELO_H / 2;

// Los niveles, de facil a dificil.
export const NIVELES = [
  {
    id: 'n1-charco',
    titulo: 'El primer charco',
    ancho: 2200,
    charcos: [[700, 130]],
    gemas: [[420, 'fire'], [1200, 'water']],
  },
  {
    id: 'n2-plataforma',
    titulo: 'Un escalon',
    ancho: 2300,
    charcos: [[760, 140]],
    plataformas: [[1150, 110, 220]],
    gemas: [[420, 'fire'], [1260, 'water']],
  },
  {
    id: 'n3-dos-charcos',
    titulo: 'Dos charcos',
    ancho: 2500,
    charcos: [[600, 120], [1300, 120]],
    gemas: [[380, 'fire'], [950, 'water'], [1700, 'fire']],
  },
  {
    id: 'n4-puerta',
    titulo: 'La primera puerta',
    ancho: 2500,
    charcos: [[700, 130]],
    puertas: [[1300, 'button']],
    gemas: [[420, 'fire'], [900, 'water'], [1700, 'fire']],
  },
  {
    id: 'n5-gema-alta',
    titulo: 'Gema en alto',
    ancho: 2500,
    charcos: [[650, 130]],
    plataformas: [[1000, 100, 200]],
    gemas: [[400, 'fire'], [1100, 'water'], [1600, 'fire']],
  },
  {
    id: 'n6-puerta-y-charco',
    titulo: 'Puerta despues del charco',
    ancho: 2700,
    charcos: [[600, 130], [1500, 130]],
    puertas: [[1150, 'button']],
    gemas: [[380, 'fire'], [900, 'water'], [1900, 'fire']],
  },
  {
    id: 'n7-escalera',
    titulo: 'La escalera',
    ancho: 2700,
    plataformas: [[900, 95, 180], [1120, 190, 180], [1340, 285, 180]],
    gemas: [[500, 'fire'], [1430, 'water'], [1900, 'fire']],
  },
  {
    id: 'n8-dos-puertas',
    titulo: 'Dos puertas',
    ancho: 2800,
    charcos: [[750, 120]],
    puertas: [[1100, 'button'], [1700, 'button']],
    gemas: [[420, 'fire'], [1350, 'water'], [2100, 'fire']],
  },
  {
    id: 'n9-palanca',
    titulo: 'La palanca',
    ancho: 2700,
    charcos: [[900, 130]],
    puertas: [[1500, 'lever']],
    gemas: [[450, 'fire'], [1100, 'water'], [2000, 'fire']],
  },
  {
    id: 'n10-laser',
    titulo: 'El laser',
    ancho: 2900,
    charcos: [[800, 130]],
    puertas: [[1900, 'laser']],
    laser: true,
    gemas: [[450, 'fire'], [1200, 'water'], [2200, 'fire']],
  },
  {
    id: 'n11-dos-calles',
    titulo: 'Dos calles',
    ancho: 2800,
    plataformas: [[850, 100, 260], [1400, 200, 260]],
    charcos: [[600, 120]],
    gemas: [[400, 'fire'], [980, 'water'], [1520, 'fire'], [2100, 'water']],
  },
  {
    id: 'n12-puerta-alta',
    titulo: 'La puerta y la gems',
    ancho: 2900,
    charcos: [[700, 120]],
    plataformas: [[1300, 100, 220]],
    puertas: [[1800, 'button']],
    gemas: [[450, 'fire'], [1400, 'water'], [2200, 'fire']],
  },
  {
    id: 'n13-tres-charcos',
    titulo: 'Tres charcos',
    ancho: 3000,
    charcos: [[500, 110], [1100, 110], [1700, 110]],
    gemas: [[350, 'fire'], [900, 'water'], [1450, 'fire'], [2100, 'water']],
  },
  {
    id: 'n14-puente',
    titulo: 'El puente',
    ancho: 2900,
    charcos: [[900, 220]],
    plataformas: [[890, 80, 260]],
    gemas: [[450, 'fire'], [1350, 'water'], [2000, 'fire']],
  },
  {
    id: 'n15-dos-puertas-laser',
    titulo: 'Puertas y laser',
    ancho: 3000,
    charcos: [[750, 120]],
    puertas: [[1300, 'button'], [2100, 'laser']],
    laser: true,
    gemas: [[420, 'fire'], [1500, 'water'], [2400, 'fire']],
  },
  {
    id: 'n16-torre',
    titulo: 'La torre',
    ancho: 3000,
    plataformas: [[800, 95, 180], [1020, 190, 180], [1240, 285, 180], [1460, 380, 180]],
    charcos: [[550, 110]],
    gemas: [[380, 'fire'], [1540, 'water'], [2100, 'fire']],
  },
  {
    id: 'n17-palancas',
    titulo: 'Dos palancas',
    ancho: 3100,
    charcos: [[700, 120], [1500, 120]],
    puertas: [[1100, 'lever'], [1900, 'lever']],
    gemas: [[400, 'fire'], [1300, 'water'], [2200, 'fire'], [2600, 'water']],
  },
  {
    id: 'n18-calles-y-puertas',
    titulo: 'Calles y puertas',
    ancho: 3200,
    plataformas: [[900, 100, 240], [1600, 200, 240]],
    charcos: [[650, 120]],
    puertas: [[1350, 'button']],
    gemas: [[400, 'fire'], [1020, 'water'], [1720, 'fire'], [2300, 'water']],
  },
  {
    id: 'n19-laser-y-escalera',
    titulo: 'Laser y escalera',
    ancho: 3200,
    plataformas: [[1000, 95, 180], [1220, 190, 180]],
    charcos: [[650, 120]],
    puertas: [[2100, 'laser']],
    laser: true,
    gemas: [[400, 'fire'], [1320, 'water'], [2500, 'fire']],
  },
  {
    id: 'n20-final',
    titulo: 'La ultima sala',
    ancho: 3400,
    plataformas: [[800, 95, 180], [1020, 190, 180], [1240, 285, 180], [1800, 100, 200]],
    charcos: [[600, 120], [1500, 120], [2400, 120]],
    puertas: [[1600, 'button'], [2600, 'laser']],
    laser: true,
    gemas: [[400, 'fire'], [1340, 'water'], [1900, 'fire'], [2800, 'water']],
  },
];

export const NIVELES_POR_ID = Object.fromEntries(NIVELES.map((n) => [n.id, n]));

/**
 * Convierte un nivel escrito en el formato corto al nivel completo que
 * entiende el juego (plataformas, peligros, puertas, botones, gemas y
 * salidas).
 */
export function crearNivel(definicion) {
  const {
    id, titulo, ancho, charcos = [], plataformas = [], puertas = [], gemas = [], laser = false,
  } = definicion;

  const nivel = {
    seed: id,
    titulo,
    difficulty: 'propio',
    size: { width: ancho, height: ALTO },
    spawns: {
      fire: { x: 120, y: SUELO_TOP - 60 },
      water: { x: 200, y: SUELO_TOP - 60 },
    },
    platforms: [{
      id: 'ground', x: ancho / 2, y: SUELO_Y, w: ancho, h: SUELO_H, kind: 'solid',
    }],
    hazards: [],
    doors: [],
    buttons: [],
    crates: [],
    levers: [],
    mirrors: [],
    laserEmitters: [],
    laserSensors: [],
    collectibles: [],
    exits: {},
  };

  // El suelo libre: un charco ocupa su tramo y nadie (ni un boton, ni una
  // caja, ni el sensor del laser) puede colocarse encima.
  const enCharco = (x, margen = 110) =>
    charcos.some(([cx, cw]) => x >= cx - margen && x <= cx + cw + margen);

  // Busca el sitio libre mas cercano al wanted.
  const sitioLibre = (wanted, min = 300, max = ancho - 300) => {
    if (!enCharco(wanted)) return wanted;
    for (let x = wanted + 40; x < max; x += 40) if (!enCharco(x)) return x;
    for (let x = wanted - 40; x > min; x -= 40) if (!enCharco(x)) return x;
    return wanted;
  };

  // Una plataforma encima de este sitio: la caja que cae ahi se queda
  // arriba y no se puede empujar hasta el boton.
  const hayPlataformaEncima = (x) => nivel.platforms.some((p) =>
    p.id !== 'ground'
    && Math.abs(p.y - p.h / 2 - SUELO_TOP) < 260
    && x >= p.x - p.w / 2 - 50 && x <= p.x + p.w / 2 + 50);

  // Un sitio en el suelo: sin charco y sin plataforma encima.
  const sitioEnSuelo = (wanted) => {
    const vale = (x) => !enCharco(x) && !hayPlataformaEncima(x);
    if (vale(wanted)) return wanted;
    for (let x = wanted + 40; x < wanted + 320; x += 40) if (vale(x)) return x;
    for (let x = wanted - 40; x > wanted - 320; x -= 40) if (vale(x)) return x;
    return wanted;
  };

  // Un sitio antes de la puerta (para el boton o la palanca): en el suelo,
  // sin charco y sin plataforma encima, y nunca encima de la puerta.
  const sitioAntesDeLaPuerta = (puertaX) => {
    for (let x = puertaX - 500; x <= puertaX - 120; x += 40) {
      if (!enCharco(x) && !hayPlataformaEncima(x)) return x;
    }
    return puertaX - 200;
  };

  // Un sitio al lado del boton para la caja: en el suelo, sin charco, sin
  // plataforma encima y sin pisar el boton (si lo pisara, la puerta se
  // abriria sola y el nivel no tendria misterio).
  const sitioAlLadoDelBoton = (xBoton) => {
    const vale = (x) => !enCharco(x) && !hayPlataformaEncima(x) && Math.abs(x - xBoton) > 90;
    for (const d of [-130, 130, -200, 200, -280, 280, -350, 350]) {
      const x = xBoton + d;
      if (x > 120 && x < ancho - 320 && vale(x)) return x;
    }
    return xBoton + 130;
  };

  // La caja y el boton, juntos, antes de la puerta y en el suelo: el jugador
  // empuja la caja encima del boton y la puerta se queda abierta mientras
  // pasa. La caja va a la izquierda del boton para poder empujarla a la
  // derecha.
  const sitioCajaYBoton = (puertaX) => {
    for (let x = puertaX - 640; x <= puertaX - 200; x += 40) {
      const boton = x + 120;
      if (boton > puertaX - 120) continue;
      if (x < 200 || boton > ancho - 320) continue;
      if (enCharco(x) || enCharco(boton)) continue;
      if (hayPlataformaEncima(x) || hayPlataformaEncima(boton)) continue;
      return { caja: x, boton };
    }
    return null;
  };

  plataformas.forEach(([x, alto, w], i) => {
    nivel.platforms.push({
      id: `plat_${i}`, x, y: SUELO_TOP - alto, w, h: 20, kind: 'solid',
    });
  });

  charcos.forEach(([x, w], i) => {
    nivel.hazards.push({
      id: `charco_${i}`,
      x: x + w / 2,
      y: SUELO_TOP - 11,
      w,
      h: 22,
      // Se van alternando: el rojo no cruza el agua y el azul no cruza la lava.
      element: i % 2 === 0 ? 'lava' : 'water',
    });
  });

  puertas.forEach(([xOriginal, tipo], i) => {
    // La puerta tampoco puede caer en un charco.
    const x = sitioLibre(xOriginal);
    const puerta = {
      id: `puerta_${i}`,
      x,
      y: SUELO_TOP - 49,
      w: 84,
      h: 98,
      open: false,
      activation: tipo,
    };
    nivel.doors.push(puerta);
    if (tipo === 'button') {
      // El boton y la caja, antes de la puerta y en el suelo. La caja a la
      // izquierda del boton: se empuja a la derecha hasta encima.
      const sitio = sitioCajaYBoton(x);
      const xBoton = sitio ? sitio.boton : x - 200;
      const xCaja = sitio ? sitio.caja : sitioAlLadoDelBoton(xBoton);
      nivel.buttons.push({
        id: `boton_${i}`,
        x: xBoton,
        y: SUELO_TOP + 5,
        w: 70,
        h: 14,
        doorId: puerta.id,
      });
      nivel.crates.push({
        id: `caja_${i}`,
        // La caja tiene que estar en el suelo: si cae encima de una
        // plataforma no se puede empujar hasta el boton y la puerta no se
        // abre nunca.
        x: xCaja,
        y: SUELO_TOP - 140,
        w: 46,
        h: 46,
      });
    }
    if (tipo === 'lever') {
      nivel.levers.push({
        id: `palanca_${i}`,
        x: sitioAntesDeLaPuerta(x),
        y: SUELO_TOP - 60,
        w: 40,
        h: 28,
        doorId: puerta.id,
      });
    }
  });

  if (laser) {
    // El emisor dispara a la derecha, rebota en un espejo y baja hasta el
    // sensor, que es quien abre la puerta del laser.
    let emisorX = 520;
    while (emisorX + 260 < ancho - 400 && (enCharco(emisorX) || enCharco(emisorX + 260))) {
      emisorX += 60;
    }
    const espejoX = emisorX + 260;
    const puertaLaser = nivel.doors.find((d) => d.activation === 'laser');
    nivel.mirrors.push({
      id: 'espejo_a', x: espejoX, y: SUELO_TOP - 150, orientation: '\\',
    });
    nivel.laserEmitters.push({
      id: 'laser_0', x: emisorX, y: SUELO_TOP - 150, direction: 'right',
    });
    nivel.laserSensors.push({
      id: 'sensor_0',
      x: espejoX,
      y: SUELO_TOP - 52,
      w: 40,
      h: 44,
      doorId: puertaLaser ? puertaLaser.id : null,
    });
    nivel.platforms.push({
      id: 'estante_laser', x: espejoX, y: SUELO_TOP - 30, w: 200, h: 20, kind: 'solid',
    });
  }

  // La gema se apoya en el suelo o en la plataforma que tenga encima.
  gemas.forEach(([x, duenio], i) => {
    const encima = nivel.platforms.find((p) => p.id !== 'ground'
      && Math.abs(p.y - p.h / 2 - SUELO_TOP) < 200
      && x >= p.x - p.w / 2 - 30 && x <= p.x + p.w / 2 + 30);
    nivel.collectibles.push({
      id: `gema_${duenio}_${i}`,
      x,
      y: (encima ? encima.y - encima.h / 2 : SUELO_TOP) - 30,
      w: 18,
      h: 18,
      owner: duenio,
      kind: 'gem',
    });
  });

  // Las salidas, al final del campo, sobre una pasarela.
  const fin = ancho - 320;
  nivel.platforms.push({
    id: 'pasarela', x: fin + 60, y: SUELO_TOP - 100, w: 460, h: 20, kind: 'solid',
  });
  nivel.exits = {
    fire: { x: fin, y: SUELO_TOP - 140, w: 56, h: 86 },
    water: { x: fin + 80, y: SUELO_TOP - 140, w: 56, h: 86 },
  };

  return nivel;
}
