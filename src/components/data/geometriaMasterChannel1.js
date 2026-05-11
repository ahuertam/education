const PI = 3.14;

function hashToUint(str) {
  const s = String(str ?? '');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function shuffleInPlace(rng, a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeNumberExercise({ id, prompt, answer, tolerance, unit, concept, explanation, meta }) {
  return {
    id,
    kind: 'number',
    prompt,
    answer,
    tolerance,
    unit,
    concept,
    explanation,
    meta,
  };
}

function makeChoiceExercise({ id, prompt, options, correctIndex, concept, explanation, meta }) {
  return {
    id,
    kind: 'choice',
    prompt,
    options,
    correctIndex,
    concept,
    explanation,
    meta,
  };
}

function uniqueId(prefix, used, base) {
  let id = `${prefix}-${base}`;
  let k = 2;
  while (used.has(id)) {
    id = `${prefix}-${base}-${k}`;
    k += 1;
  }
  used.add(id);
  return id;
}

function buildFixedExercises(rng, used) {
  const pool = [];

  pool.push(makeChoiceExercise({
    id: uniqueId('c1', used, 'concept-pi'),
    prompt: '¿Qué representa π (pi) en una circunferencia?',
    options: [
      'El cociente entre el radio y el diámetro',
      'El cociente entre la longitud de la circunferencia y su diámetro',
      'El área del círculo cuando el radio vale 1',
    ],
    correctIndex: 1,
    concept: 'π relaciona circunferencia y diámetro: L = π·d y también L = 2·π·r.',
    explanation: 'π es la razón constante L/d para cualquier circunferencia.',
    meta: { topic: 'circle', subtype: 'pi' },
  }));

  const d0 = randInt(rng, 8, 40);
  const d = d0 % 2 === 0 ? d0 : d0 + 1;
  const r = d / 2;
  pool.push(makeChoiceExercise({
    id: uniqueId('c1', used, `concept-radio-diametro-${d}`),
    prompt: `Si el diámetro de un círculo es ${d} cm, ¿cuánto mide su radio?`,
    options: [`${Math.max(1, r - 2)} cm`, `${r} cm`, `${d} cm`],
    correctIndex: 1,
    concept: 'El radio es la mitad del diámetro: r = d/2.',
    explanation: `d = ${d} → r = ${r}.`,
    meta: { topic: 'circle', subtype: 'radiusFromDiameter', d, r },
  }));

  const factor = pick(rng, [2, 3]);
  pool.push(makeChoiceExercise({
    id: uniqueId('c1', used, `escalado-radio-area-x${factor}`),
    prompt: `Si multiplicas el radio de un círculo por ${factor}, ¿qué ocurre con su área?`,
    options: [
      `Se multiplica por ${factor}`,
      `Se multiplica por ${factor * factor}`,
      `Se multiplica por ${factor + factor}`,
    ],
    correctIndex: 1,
    concept: 'A = π·r²: si r se multiplica por k, el área se multiplica por k².',
    explanation: `Como r está al cuadrado, el factor pasa a ${factor}² = ${factor * factor}.`,
    meta: { topic: 'circle', subtype: 'areaScaling', factor },
  }));

  pool.push(makeChoiceExercise({
    id: uniqueId('c1', used, 'altura-paralelogramo'),
    prompt: 'En un paralelogramo, ¿qué es la altura respecto a una base?',
    options: [
      'Un lado cualquiera del paralelogramo',
      'La distancia perpendicular entre la base y el lado opuesto',
      'La diagonal más larga del paralelogramo',
    ],
    correctIndex: 1,
    concept: 'La altura siempre es perpendicular a la base elegida.',
    explanation: 'La altura es un segmento perpendicular a la base que llega al lado opuesto (distancia entre rectas paralelas).',
    meta: { topic: 'parallelogram', subtype: 'heightDefinition' },
  }));

  pool.push(makeChoiceExercise({
    id: uniqueId('c1', used, 'alturas-paralelogramo'),
    prompt: 'En un paralelogramo, ¿todas las alturas miden lo mismo?',
    options: [
      'Sí, siempre',
      'No, depende de la base que elijas',
      'Solo si es un cuadrado',
    ],
    correctIndex: 1,
    concept: 'Cambias la base → cambia la perpendicular (altura).',
    explanation: 'La altura depende de la base elegida (la perpendicular a ese lado). Puede cambiar al cambiar de base.',
    meta: { topic: 'parallelogram', subtype: 'heightsVary' },
  }));

  pool.push(makeChoiceExercise({
    id: uniqueId('c1', used, 'corona-formula'),
    prompt: '¿Cómo se calcula el área de una corona circular (un “anillo”)?',
    options: [
      'A = π·(R + r)²',
      'A = π·R² − π·r²',
      'A = 2·π·R',
    ],
    correctIndex: 1,
    concept: 'Una corona circular es “círculo grande menos círculo pequeño”: A = π·(R² − r²).',
    explanation: 'Se resta el área del círculo interior al área del círculo exterior.',
    meta: { topic: 'annulus', subtype: 'formula' },
  }));

  pool.push(makeChoiceExercise({
    id: uniqueId('c1', used, 'escuadra-triangulo'),
    prompt: 'Una escuadra típica (de dibujo) tiene forma de…',
    options: [
      'Triángulo equilátero (tres lados iguales)',
      'Triángulo isósceles rectángulo (45°-45°-90°)',
      'Triángulo escaleno (tres lados distintos)',
    ],
    correctIndex: 1,
    concept: 'La escuadra suele ser un triángulo rectángulo con dos catetos iguales (45°-45°-90°).',
    explanation: 'Por eso se llama isósceles rectángulo: tiene un ángulo recto y dos lados iguales.',
    meta: { topic: 'triangle', subtype: 'setSquare' },
  }));

  shuffleInPlace(rng, pool);
  return pool.slice(0, 6);
}

function templateCircleArea(rng, used) {
  const unit = pick(rng, ['cm', 'm']);
  const given = pick(rng, ['radius', 'diameter']);
  const r = unit === 'cm' ? randInt(rng, 2, 18) : randInt(rng, 2, 14);
  const d = r * 2;
  const value = given === 'radius' ? r : d;
  const answer = round2(PI * r * r);
  const tol = unit === 'cm' ? 0.12 : 0.2;
  const prompt = given === 'radius'
    ? `Calcula el área de un círculo de radio ${value} ${unit}. Usa π = 3,14.`
    : `Calcula el área de un círculo de diámetro ${value} ${unit}. Usa π = 3,14.`;

  const explanation = given === 'radius'
    ? `A = π·r² = 3,14·${r}² = 3,14·${r * r} = ${answer} ${unit}².`
    : `d=${d} → r=${r}. A = π·r² = 3,14·${r}² = 3,14·${r * r} = ${answer} ${unit}².`;

  return makeNumberExercise({
    id: uniqueId('c1', used, `area-circulo-${given}-${value}${unit}`),
    prompt,
    answer,
    tolerance: tol,
    unit: `${unit}²`,
    concept: 'Área del círculo: A = π·r². Si te dan el diámetro, primero r = d/2.',
    explanation,
    meta: { topic: 'circle', subtype: 'area', given, unit, r, d },
  });
}

function templateCircumference(rng, used) {
  const unit = pick(rng, ['cm', 'm']);
  const given = pick(rng, ['radius', 'diameter']);
  const r = unit === 'cm' ? randInt(rng, 2, 22) : randInt(rng, 2, 16);
  const d = r * 2;
  const value = given === 'radius' ? r : d;
  const answer = given === 'radius' ? round2(2 * PI * r) : round2(PI * d);
  const tol = unit === 'cm' ? 0.12 : 0.2;
  const prompt = given === 'radius'
    ? `Calcula la longitud de una circunferencia de radio ${value} ${unit}. Usa π = 3,14.`
    : `Calcula la longitud de una circunferencia de diámetro ${value} ${unit}. Usa π = 3,14.`;

  const explanation = given === 'radius'
    ? `L = 2·π·r = 2·3,14·${r} = ${answer} ${unit}.`
    : `L = π·d = 3,14·${d} = ${answer} ${unit}.`;

  return makeNumberExercise({
    id: uniqueId('c1', used, `longitud-circ-${given}-${value}${unit}`),
    prompt,
    answer,
    tolerance: tol,
    unit,
    concept: 'Longitud de la circunferencia: L = π·d o L = 2·π·r.',
    explanation,
    meta: { topic: 'circle', subtype: 'circumference', given, unit, r, d },
  });
}

function templateRectangleSquare(rng, used) {
  const kind = pick(rng, ['rect', 'square']);
  const unit = pick(rng, ['cm', 'dm', 'm']);
  if (kind === 'square') {
    const side = unit === 'cm' ? randInt(rng, 3, 14) : unit === 'dm' ? randInt(rng, 2, 12) : randInt(rng, 2, 16);
    const answer = side * side;
    return makeNumberExercise({
      id: uniqueId('c1', used, `area-cuadrado-${side}${unit}`),
      prompt: `Un cuadrado tiene lado ${side} ${unit}. ¿Cuál es su área?`,
      answer,
      tolerance: 0,
      unit: `${unit}²`,
      concept: 'Área del cuadrado: A = lado².',
      explanation: `A = ${side}² = ${answer} ${unit}².`,
      meta: { topic: 'quadrilateral', subtype: 'squareArea', unit, side },
    });
  }

  const base = unit === 'cm' ? randInt(rng, 4, 18) : unit === 'dm' ? randInt(rng, 3, 14) : randInt(rng, 3, 24);
  const height = unit === 'cm' ? randInt(rng, 3, 14) : unit === 'dm' ? randInt(rng, 2, 12) : randInt(rng, 2, 18);
  const answer = base * height;
  return makeNumberExercise({
    id: uniqueId('c1', used, `area-rect-${base}x${height}${unit}`),
    prompt: `Un rectángulo tiene base ${base} ${unit} y altura ${height} ${unit}. ¿Cuál es su área?`,
    answer,
    tolerance: 0,
    unit: `${unit}²`,
    concept: 'Área del rectángulo: A = base·altura.',
    explanation: `A = ${base}·${height} = ${answer} ${unit}².`,
    meta: { topic: 'quadrilateral', subtype: 'rectangleArea', unit, base, height },
  });
}

function templateTriangle(rng, used) {
  const mode = pick(rng, ['area', 'height']);
  const unit = pick(rng, ['cm', 'm']);
  const base = unit === 'cm' ? randInt(rng, 8, 42) : randInt(rng, 6, 40);
  const height = unit === 'cm' ? randInt(rng, 6, 28) : randInt(rng, 4, 28);
  if (mode === 'height') {
    const area = (base * height) / 2;
    const prompt = `Un triángulo tiene área ${area} ${unit}² y base ${base} ${unit}. ¿Cuál es su altura?`;
    return makeNumberExercise({
      id: uniqueId('c1', used, `triangulo-altura-${area}${unit}2-${base}${unit}`),
      prompt,
      answer: height,
      tolerance: 0,
      unit,
      concept: 'En triángulos: A = (b·h)/2 → h = 2A/b.',
      explanation: `h = 2·A / b = (2·${area})/${base} = ${height} ${unit}.`,
      meta: { topic: 'triangle', subtype: 'heightFromArea', unit, base, height, area },
    });
  }

  const area = (base * height) / 2;
  const prompt = `Un triángulo tiene base ${base} ${unit} y altura ${height} ${unit}. ¿Cuál es su área?`;
  return makeNumberExercise({
    id: uniqueId('c1', used, `triangulo-area-${base}x${height}${unit}`),
    prompt,
    answer: area,
    tolerance: 0,
    unit: `${unit}²`,
    concept: 'Área del triángulo: A = (base·altura)/2.',
    explanation: `A = (${base}·${height})/2 = ${area} ${unit}².`,
    meta: { topic: 'triangle', subtype: 'area', unit, base, height, area },
  });
}

function templateParallelogram(rng, used) {
  const mode = pick(rng, ['area', 'height']);
  const unit = pick(rng, ['cm', 'dm', 'm']);
  const base = unit === 'cm' ? randInt(rng, 6, 26) : unit === 'dm' ? randInt(rng, 4, 18) : randInt(rng, 5, 30);
  const height = unit === 'cm' ? randInt(rng, 4, 18) : unit === 'dm' ? randInt(rng, 3, 14) : randInt(rng, 4, 20);
  const area = base * height;
  if (mode === 'height') {
    const prompt = `Un romboide (paralelogramo) tiene área ${area} ${unit}² y base ${base} ${unit}. ¿Cuál es su altura?`;
    return makeNumberExercise({
      id: uniqueId('c1', used, `romboide-altura-${area}${unit}2-${base}${unit}`),
      prompt,
      answer: height,
      tolerance: 0,
      unit,
      concept: 'Área del romboide: A = base·altura → altura = A/base.',
      explanation: `h = A/b = ${area}/${base} = ${height} ${unit}.`,
      meta: { topic: 'parallelogram', subtype: 'heightFromArea', unit, base, height, area },
    });
  }

  const prompt = `Halla el área de un romboide (paralelogramo) de base ${base} ${unit} y altura ${height} ${unit}.`;
  return makeNumberExercise({
    id: uniqueId('c1', used, `romboide-area-${base}x${height}${unit}`),
    prompt,
    answer: area,
    tolerance: 0,
    unit: `${unit}²`,
    concept: 'Área del romboide: A = base·altura (altura perpendicular a la base).',
    explanation: `A = ${base}·${height} = ${area} ${unit}².`,
    meta: { topic: 'parallelogram', subtype: 'area', unit, base, height, area },
  });
}

function templateComposite(rng, used) {
  const variant = pick(rng, ['L', 'garden']);
  if (variant === 'L') {
    const unit = pick(rng, ['m', 'cm']);
    const W = unit === 'm' ? randInt(rng, 4, 12) : randInt(rng, 30, 120);
    const H = unit === 'm' ? randInt(rng, 4, 10) : randInt(rng, 24, 90);
    const cutW = randInt(rng, 2, Math.max(2, Math.floor(W / 2)));
    const cutH = randInt(rng, 2, Math.max(2, Math.floor(H / 2)));
    const outer = W * H;
    const cut = cutW * cutH;
    const ans = outer - cut;
    return makeNumberExercise({
      id: uniqueId('c1', used, `compuesta-L-${W}x${H}-${cutW}x${cutH}${unit}`),
      prompt: `Una figura en forma de L se obtiene de un rectángulo de ${W} ${unit} × ${H} ${unit} al que se le quita un rectángulo de ${cutW} ${unit} × ${cutH} ${unit}. ¿Cuál es su área?`,
      answer: ans,
      tolerance: 0,
      unit: `${unit}²`,
      concept: 'Área compuesta: resta el área del trozo que quitas.',
      explanation: `Área = (${W}·${H}) - (${cutW}·${cutH}) = ${outer} - ${cut} = ${ans} ${unit}².`,
      meta: { topic: 'composite', subtype: 'L', unit, W, H, cutW, cutH },
    });
  }

  const W = randInt(rng, 20, 44);
  const H = randInt(rng, 14, 30);
  const houseW = randInt(rng, 8, 16);
  const houseH = randInt(rng, 6, 12);
  const poolW = randInt(rng, 5, 12);
  const poolH = randInt(rng, 3, 8);
  const total = W * H;
  const house = houseW * houseH;
  const pool = poolW * poolH;
  const free = total - house - pool;

  return makeNumberExercise({
    id: uniqueId('c1', used, `jardin-${W}x${H}-${houseW}x${houseH}-${poolW}x${poolH}`),
    prompt: `Un jardín rectangular mide ${W} m por ${H} m. Dentro hay una casa de ${houseW} m por ${houseH} m y una piscina de ${poolW} m por ${poolH} m. ¿Cuál es el área libre del jardín?`,
    answer: free,
    tolerance: 0,
    unit: 'm²',
    concept: 'Área libre = área total − área casa − área piscina.',
    explanation: `Total: ${W}·${H}=${total}. Casa: ${houseW}·${houseH}=${house}. Piscina: ${poolW}·${poolH}=${pool}. Libre: ${total}-${house}-${pool}=${free} m².`,
    meta: { topic: 'composite', subtype: 'garden', W, H, houseW, houseH, poolW, poolH },
  });
}

function templateMultiChoice(rng, used) {
  const type = pick(rng, ['diameterFromRadius', 'circumferenceScaling', 'triangleFormula', 'parallelogramFormula']);
  if (type === 'diameterFromRadius') {
    const r = randInt(rng, 2, 20);
    return makeChoiceExercise({
      id: uniqueId('c1', used, `diametro-desde-radio-${r}`),
      prompt: `Si el radio de una circunferencia es ${r} cm, ¿cuánto mide su diámetro?`,
      options: [`${r / 2} cm`, `${r} cm`, `${r * 2} cm`],
      correctIndex: 2,
      concept: 'El diámetro es el doble del radio: d = 2r.',
      explanation: `d = 2·${r} = ${r * 2} cm.`,
      meta: { topic: 'circle', subtype: 'diameterFromRadius' },
    });
  }

  if (type === 'circumferenceScaling') {
    return makeChoiceExercise({
      id: uniqueId('c1', used, 'circunferencia-escala-doble'),
      prompt: 'Si duplicas el diámetro de una circunferencia, ¿qué ocurre con su longitud?',
      options: ['Se duplica', 'Se cuadruplica', 'No cambia'],
      correctIndex: 0,
      concept: 'L = π·d: si d se multiplica por 2, L también.',
      explanation: 'La longitud depende linealmente del diámetro.',
      meta: { topic: 'circle', subtype: 'circScaling' },
    });
  }

  if (type === 'triangleFormula') {
    return makeChoiceExercise({
      id: uniqueId('c1', used, 'triangulo-formula'),
      prompt: '¿Cuál es la fórmula del área de un triángulo?',
      options: ['A = base·altura', 'A = (base·altura)/2', 'A = π·r²'],
      correctIndex: 1,
      concept: 'El triángulo ocupa la mitad de un paralelogramo de misma base y altura.',
      explanation: 'Por eso aparece el “/2”.',
      meta: { topic: 'triangle', subtype: 'formula' },
    });
  }

  return makeChoiceExercise({
    id: uniqueId('c1', used, 'romboide-formula'),
    prompt: '¿Cuál es la fórmula del área de un romboide (paralelogramo)?',
    options: ['A = base·altura', 'A = (base·altura)/2', 'A = base + altura'],
    correctIndex: 0,
    concept: 'La altura es perpendicular a la base.',
    explanation: 'Multiplica la base por la altura correspondiente a esa base.',
    meta: { topic: 'parallelogram', subtype: 'formula' },
  });
}

function templateSemicircle(rng, used) {
  const n = pick(rng, [2, 3, 4]);
  const d = randInt(rng, 6, 18);
  const answer = round2(n * (PI * d) / 2);
  return makeNumberExercise({
    id: uniqueId('c1', used, `semicirc-${n}-${d}cm`),
    prompt: `Una línea está formada por ${n} semicircunferencias iguales de diámetro ${d} cm. ¿Cuál es su longitud total? Usa π = 3,14.`,
    answer,
    tolerance: 0.25,
    unit: 'cm',
    concept: 'Longitud de semicircunferencia: (π·d)/2. Suma todas.',
    explanation: `Cada una: (3,14·${d})/2 = ${round2((PI * d) / 2)} cm. Total: ${n}·${round2((PI * d) / 2)} = ${answer} cm.`,
    meta: { topic: 'circle', subtype: 'semicircleLength', n, d },
  });
}

function templateAnnulus(rng, used) {
  const unit = pick(rng, ['cm', 'm']);
  const R = unit === 'cm' ? randInt(rng, 6, 20) : randInt(rng, 4, 14);
  const r = randInt(rng, Math.max(2, Math.floor(R / 3)), R - 2);
  const answer = round2(PI * (R * R - r * r));
  const tol = unit === 'cm' ? 0.2 : 0.35;

  return makeNumberExercise({
    id: uniqueId('c1', used, `corona-${R}-${r}${unit}`),
    prompt: `Calcula el área de una corona circular de radio exterior ${R} ${unit} y radio interior ${r} ${unit}. Usa π = 3,14.`,
    answer,
    tolerance: tol,
    unit: `${unit}²`,
    concept: 'Área de corona circular: A = π·R² − π·r² = π·(R² − r²).',
    explanation: `A = 3,14·(${R}² − ${r}²) = 3,14·(${R * R} − ${r * r}) = 3,14·${(R * R - r * r)} = ${answer} ${unit}².`,
    meta: { topic: 'annulus', subtype: 'area', unit, R, r },
  });
}

function templateCompositeWithHole(rng, used) {
  const unit = 'cm';
  const topW = randInt(rng, 3, 8);
  const topH = 1;
  const stemW = randInt(rng, 2, Math.max(2, topW - 1));
  const stemH = randInt(rng, 2, 6);
  const hole = randInt(rng, 1, Math.max(1, Math.min(3, stemW - 1, stemH - 1)));
  const areaTop = topW * topH;
  const areaStem = stemW * stemH;
  const areaHole = hole * hole;
  const answer = areaTop + areaStem - areaHole;

  return makeNumberExercise({
    id: uniqueId('c1', used, `compuesta-hueco-${topW}-${stemW}-${stemH}-${hole}`),
    prompt: `Una figura en forma de T se forma con un rectángulo de ${topW} ${unit} × ${topH} ${unit} y otro de ${stemW} ${unit} × ${stemH} ${unit}. En el rectángulo inferior hay un hueco cuadrado de lado ${hole} ${unit}. ¿Cuál es el área total?`,
    answer,
    tolerance: 0,
    unit: `${unit}²`,
    concept: 'Área compuesta: suma las partes y resta el hueco.',
    explanation: `Área = (${topW}·${topH}) + (${stemW}·${stemH}) − (${hole}²) = ${areaTop} + ${areaStem} − ${areaHole} = ${answer} cm².`,
    meta: { topic: 'composite', subtype: 'hole', unit, topW, topH, stemW, stemH, hole },
  });
}

function templateGridArea(rng, used) {
  const side = pick(rng, [1, 2]);
  const squares = randInt(rng, 6, 40);
  const unit = side === 1 ? 'cm' : 'cm';
  const answer = squares * side * side;
  return makeNumberExercise({
    id: uniqueId('c1', used, `cuadritos-${squares}-${side}`),
    prompt: `En un papel cuadriculado, cada cuadrito mide ${side} ${unit} × ${side} ${unit}. Una figura ocupa ${squares} cuadritos completos. ¿Qué área tiene?`,
    answer,
    tolerance: 0,
    unit: `${unit}²`,
    concept: 'Área por cuadritos: área = nº de cuadritos · área de cada cuadrito.',
    explanation: `Cada cuadrito: ${side}·${side} = ${side * side} cm². Total: ${squares}·${side * side} = ${answer} cm².`,
    meta: { topic: 'grid', subtype: 'countSquares', side, squares },
  });
}

export const buildGeometriaMasterChannel1 = (seed, { count = 24 } = {}) => {
  const rng = mulberry32(hashToUint(seed ?? Date.now()));
  const used = new Set();
  const out = [];

  const fixed = buildFixedExercises(rng, used);
  out.push(...fixed);

  const factories = [
    templateCircleArea,
    templateCircumference,
    templateRectangleSquare,
    templateTriangle,
    templateParallelogram,
    templateComposite,
    templateMultiChoice,
    templateSemicircle,
    templateAnnulus,
    templateCompositeWithHole,
    templateGridArea,
  ];

  let safety = 0;
  while (out.length < count && safety < 500) {
    safety += 1;
    const f = pick(rng, factories);
    const ex = f(rng, used);
    if (!ex) continue;
    out.push(ex);
  }

  shuffleInPlace(rng, out);
  return out.slice(0, count);
};

export const GEOMETRIA_MASTER_CHANNEL_1 = buildGeometriaMasterChannel1('default');
