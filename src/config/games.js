// Catálogo de juegos y actividades.
//
// Esta es la ÚNICA lista que hay que tocar para añadir o quitar un juego.
// Antes el mismo catálogo estaba repartido en tres ficheros: el array
// `allGames` de GameSelector.js, los arrays `activities` y `categories` de
// Landing.js, y el `switch` de vistas de App.js. Añadir un juego obligaba a
// editar tres ficheros en tres carpetas distintas, y olvidar uno dejaba un
// juego inalcanzable o una tarjeta que no lleva a ningún sitio.
//
// El `switch` de App.js se queda aparte a propósito: es el que dice qué
// componente React se pinta para cada vista, y cada juego recibe props
// distintas. Eso no es un catálogo, es el montaje.
//
// Formato de cada juego:
//   id          → la vista de App.js y el id que usa el selector
//   icon        → el componente del icono; se pinta como <Icon />
//   title       → el nombre que ve el niño
//   color       → el color de la tarjeta
//   categories  → en qué categorías de la landing aparece
//   description → texto fijo, o una función si depende de la categoría activa

import {
  FaPlus, FaMinus, FaTimes, FaDivide, FaBrain, FaBook, FaPalette,
  FaProjectDiagram, FaCalculator, FaGlobe, FaPuzzlePiece, FaKeyboard,
  FaGamepad, FaRocket, FaFrog, FaRegCircle, FaMeteor, FaDragon, FaCar,
  FaBolt, FaMapMarkedAlt, FaClock, FaShieldAlt, FaTh, FaHourglassHalf,
  FaFlask, FaCoins, FaScroll, FaSkull, FaListUl, FaChartPie, FaThLarge,
  FaRulerHorizontal, FaCubes,
} from 'react-icons/fa';

// --- Categorías de la landing ---------------------------------------------
//
// `category` lleva a la pantalla del selector de juegos. `view` abre un juego
// directamente, saltándose el selector. La multiplicación pasa antes por la
// pantalla de configuración de tablas y cifras.
export const CATEGORIES = [
  {
    id: 1, icon: FaPlus, title: 'Práctica de Sumas', color: '#4CAF50',
    category: 'addition',
    description: 'Aprende y practica operaciones de suma de manera divertida con ejercicios interactivos.',
  },
  {
    id: 2, icon: FaMinus, title: 'Práctica de Restas', color: '#FF5722',
    category: 'subtraction',
    description: 'Domina las restas con ejercicios progresivos y entretenidos juegos matemáticos.',
  },
  {
    id: 3, icon: FaTimes, title: 'Tablas de Multiplicar', color: '#9C27B0',
    category: 'multiplication',
    description: 'Memoriza las tablas de multiplicar jugando y practicando de forma interactiva.',
  },
  {
    id: 4, icon: FaDivide, title: 'División Divertida', color: '#FF9800',
    category: 'division',
    description: 'Aprende división paso a paso con explicaciones claras y ejercicios prácticos.',
  },
  {
    id: 5, icon: FaBrain, title: 'Conocimientos Generales', color: '#2196F3',
    category: 'knowledge',
    description: 'Expande tu cultura general con preguntas sobre ciencia, historia y geografía.',
  },
  {
    id: 6, icon: FaBook, title: 'Vocabulario', color: '#795548',
    category: 'vocabulary',
    description: 'Enriquece tu vocabulario aprendiendo nuevas palabras y sus significados.',
  },
  {
    id: 7, icon: FaPalette, title: 'Colores y Formas', color: '#E91E63',
    category: 'shapes',
    description: 'Reconoce colores, formas geométricas y desarrolla habilidades visuales.',
  },
  {
    id: 12, icon: FaProjectDiagram, title: 'Geometría', color: '#845EF7',
    category: 'geometria',
    description: 'Área y perímetro: triángulos, rectángulos, paralelogramos y circunferencias con retos y bonus.',
  },
  {
    id: 8, icon: FaCalculator, title: 'Matemáticas Mixtas', color: '#607D8B',
    category: 'mixed_math',
    description: 'Combina todas las operaciones matemáticas en desafíos emocionantes.',
  },
  {
    id: 9, icon: FaGlobe, title: 'Inglés', color: '#E67E22',
    category: 'english',
    description: 'Aprende inglés formando frases y vocabulario con el Dragón Tragón.',
  },
  {
    id: 10, icon: FaBrain, title: 'Avanzado', color: '#16A085',
    category: 'advanced',
    description: 'Retos de lógica y matemáticas para subir de nivel con puzzles más difíciles.',
  },
  {
    id: 11, icon: FaPuzzlePiece, title: 'Puzzles', color: '#2D9CDB',
    category: 'puzzles',
    description: 'Puzzles cooperativos tipo Fireboy & Watergirl con niveles procedurales por semilla.',
  },
  {
    id: 13, icon: FaKeyboard, title: 'Mecanografía', color: '#8B4513',
    view: 'typerdungeon',
    description: 'Aprende a escribir correctamente en la Typer Dungeon. Derrota monstruos escribiendo palabras.',
  },
  {
    id: 14, icon: FaChartPie, title: 'Fracciones', color: '#C026D3',
    category: 'fracciones',
    description: 'Representa, compara y suma fracciones con modelos visuales de barra y círculo.',
  },
  {
    id: 15, icon: FaRulerHorizontal, title: 'Números', color: '#0284C7',
    category: 'numeros',
    description: 'Sentido numérico: rectas numéricas, valor posicional y comparación de números.',
  },
];

// La multiplicación pasa antes por la pantalla de configuración de tablas.
export const CATEGORY_NEEDS_CONFIG = 'multiplication';

// --- Juegos ---------------------------------------------------------------

const MATH_CATEGORIES = ['addition', 'subtraction', 'multiplication', 'division'];

export const GAMES = [
  // Matemáticas
  {
    id: 'memory', icon: FaGamepad, title: 'Memorama Matemático', color: '#4CAF50',
    categories: MATH_CATEGORIES,
    description: (a) => `Encuentra las parejas de operaciones y resultados ${a}.`,
  },
  {
    id: 'space', icon: FaRocket, title: 'Defensor Espacial', color: '#FF5722',
    categories: MATH_CATEGORIES,
    description: (a) => `Destruye asteroides resolviendo operaciones ${a}.`,
  },
  {
    id: 'frog', icon: FaFrog, title: 'El Salto de la Rana', color: '#8BC34A',
    categories: MATH_CATEGORIES,
    description: (a) => `Ayuda a la rana a cruzar el estanque ${a}.`,
  },
  {
    id: 'bubbles', icon: FaRegCircle, title: 'Pop de Burbujas', color: '#00BCD4',
    categories: MATH_CATEGORIES,
    description: (a) => `Explota las burbujas correctas mientras estás ${a}.`,
  },
  {
    id: 'mathlander', icon: FaRocket, title: 'Math Lander', color: '#FFFFFF',
    categories: MATH_CATEGORIES,
    description: (a) => `Aterriza en la respuesta correcta ${a}.`,
  },
  {
    id: 'mathsteroids', icon: FaMeteor, title: 'Mathsteroids', color: '#9C27B0',
    categories: MATH_CATEGORIES,
    description: (a) => `Destruye asteroides con la respuesta correcta ${a}.`,
  },
  {
    id: 'monsterfeeder', icon: FaDragon, title: 'Alimenta al Monstruo', color: '#9B59B6',
    categories: MATH_CATEGORIES,
    description: (a) => `Arrastra la comida correcta ${a}.`,
  },
  {
    id: 'carracing', icon: FaCar, title: 'Carrera de Coches', color: '#E74C3C',
    categories: MATH_CATEGORIES,
    description: (a) => `¡Acelera respondiendo correctamente ${a}!`,
  },
  {
    id: 'pokemonmaths', icon: FaBolt, title: 'PokemonMaths', color: '#FBBF24',
    // Sin 'multiplication': sus cuentas salen de las energies de las cartas de
    // la API de Pokémon TCG, no de la configuración de tablas.
    categories: ['addition', 'subtraction', 'division'],
    description: (a) => `Usa cartas Pokémon para resolver operaciones ${a}. Sin repetir preguntas y con ranking local.`,
  },

  // Conocimiento general
  {
    id: 'knowledgetower', icon: FaBrain, title: 'Torre del Saber', color: '#2196F3',
    categories: ['knowledge'],
    description: 'Construye la torre más alta respondiendo preguntas de cultura general.',
  },
  {
    id: 'spainrivers', icon: FaMapMarkedAlt, title: 'Ríos de España (Mapa)', color: '#1D4ED8',
    categories: ['knowledge'],
    description: 'Localiza 8 ríos principales en el mapa con clic/tap. Incluye modo Rápido y modo Orden.',
  },
  {
    id: 'ylahora', icon: FaClock, title: '¿Y la hora?', color: '#F59E0B',
    categories: ['knowledge'],
    description: 'Aprende a leer la hora y a sumar/restar 15, 30 y 60 minutos con un reloj grande y rondas rápidas.',
  },
  {
    id: 'inmnunodefender', icon: FaShieldAlt, title: 'InmnunoDefender', color: '#1abc9c',
    categories: ['knowledge'],
    description: 'Sé un glóbulo blanco y elimina virus y bacterias. Entre oleadas, responde preguntas pisando la respuesta correcta.',
  },

  // Avanzado
  {
    id: 'sudokumath', icon: FaTh, title: 'Sudoku Math', color: '#16A085',
    categories: ['advanced'],
    description: 'Puzzle tipo sudoku: usa cada número una sola vez y completa los huecos para que las operaciones sean correctas.',
  },
  {
    id: 'tsubasa', icon: FaGamepad, title: 'RPG Fútbol (Turnos)', color: '#1D4ED8',
    categories: ['advanced'],
    description: 'Estilo retro: elige Regate/Pase/Tiro y resuelve retos matemáticos para subir la probabilidad de éxito.',
  },

  // Facciones y sentido numérico
  //
  // Estos cuatro juegos son la versión jugable de las apps del Math Learning
  // Center (Fractions, Partial Product Finder, Number Line y Number Pieces).
  // Las apps son exploratorias; aquí cada una es una ronda con puntos, racha
  // y explicación de por qué la respuesta es la que es.
  {
    id: 'tallerfracciones', icon: FaChartPie, title: 'Taller de Fracciones', color: '#C026D3',
    categories: ['fracciones'],
    description: 'Lee, compara y suma fracciones con barras y círculos.',
  },
  {
    id: 'productosparciales', icon: FaThLarge, title: 'Buscador de Productos Parciales', color: '#F97316',
    categories: ['multiplication', 'mixed_math'],
    description: 'Multiplica con el modelo del rectángulo: las decenas por un lado y las unidades por otro.',
  },
  {
    id: 'rectanumerica', icon: FaRulerHorizontal, title: 'La Recta Numérica', color: '#0284C7',
    categories: ['numeros'],
    description: 'Sitúa, salta y ordena números en una recta que cambia de escala.',
  },
  {
    id: 'basediez', icon: FaCubes, title: 'Base Diez', color: '#7C3AED',
    categories: ['numeros'],
    description: 'Lee, descompone y compara números con piezas de base diez.',
  },

  // Vocabulario
  {
    id: 'accenthunter', icon: FaBook, title: 'Cazador de Acentos', color: '#795548',
    categories: ['vocabulary'],
    description: 'Identifica diptongos e hiatos explotando globos.',
  },
  {
    id: 'sintaxis', icon: FaProjectDiagram, title: 'Sintaxis', color: '#0EA5E9',
    categories: ['vocabulary'],
    description: 'Detective sintáctico: encuentra verbo, sujeto, predicado y complementos (CD y CI) en oraciones variadas.',
  },
  {
    id: 'tiemposverbales', icon: FaHourglassHalf, title: 'Tiempos Verbales', color: '#FBBF24',
    categories: ['vocabulary'],
    description: 'Reto rápido: elige la forma verbal correcta. Al acertar, se abre un mini “portal” motivador.',
  },
  {
    id: 'tiposverbos', icon: FaBook, title: 'Tipos de Verbos', color: '#34D399',
    categories: ['vocabulary'],
    description: 'Clasifica verbos en regulares, irregulares y defectivos. Si fallas, verás la norma y un ejemplo.',
  },
  {
    id: 'colgado', icon: FaSkull, title: 'El Colgado', color: '#8B4513',
    categories: ['vocabulary'],
    description: 'El ahorcado de toda la vida: lee la pista y adivina la palabra letra a letra. Con 7 fallos te cuelgan.',
  },
  {
    id: 'roscopalabras', icon: FaListUl, title: 'Rosco de Palabras', color: '#6D28D9',
    categories: ['vocabulary'],
    description: 'Escribe la palabra letra a letra contra el reloj. Cuanto más rápido, más puntos.',
  },

  // Repaso
  {
    id: 'jeopardy', icon: FaScroll, title: 'Jeopardy', color: '#1D4ED8',
    categories: ['knowledge'],
    description: 'Tablero de categorías y puntajes al estilo clásico: perfecto para repasar unidades completas.',
  },
  {
    id: 'apuesta', icon: FaCoins, title: 'Apuesta tu Respuesta', color: '#B45309',
    categories: ['addition', 'subtraction', 'multiplication', 'division'],
    description: 'Apuesta una, dos o tres veces tus puntos antes de responder. Si aciertas, ganas el triple; si fallas, lo pierdes.',
  },

  // Formas y geometría
  {
    id: 'shapegoalkeeper', icon: FaPalette, title: 'Portero de Formas', color: '#E91E63',
    categories: ['shapes'],
    description: 'Detén las formas y colores correctos en la portería.',
  },
  {
    id: 'geometriaMaster', icon: FaProjectDiagram, title: 'Geometría Master', color: '#845EF7',
    categories: ['geometria'],
    description: 'Ejercicios de geometría (Canal 1) + bonus tipo Flappy por cada acierto.',
  },

  // Mixto
  {
    id: 'kitchen', icon: FaFlask, title: 'La Cocina', color: '#607D8B',
    categories: ['mixed_math'],
    description: 'Prepara el antídoto mezclando ingredientes con fracciones y decimales.',
  },
  {
    id: 'hanoikitchen', icon: FaFlask, title: 'Hanoi Kitchen', color: '#16A085',
    categories: ['mixed_math'],
    description: 'Resuelve el puzzle tipo Torre de Hanoi con gancho y vierte la cantidad exacta al caldero.',
  },
  {
    id: 'digilike', icon: FaDragon, title: 'Digilike', color: '#22D3EE',
    categories: ['mixed_math', 'advanced'],
    description: 'Roguelike de caminos con Digimon: completa nodos, responde el portal y gestiona tu energía.',
  },
  {
    id: 'dragontragon', icon: FaDragon, title: 'Dragón Tragón', color: '#E67E22',
    categories: ['english'],
    description: 'Cóme las palabras correctas para formar la frase en inglés.',
  },
  {
    id: 'firewaterpuzzles', icon: FaGlobe, title: 'Fuego & Agua (Procedural)', color: '#2D9CDB',
    categories: ['puzzles'],
    description: 'Clon tipo Fireboy & Watergirl: coop local, puertas, botones y niveles por semilla.',
  },

  // Se abre directo desde la landing, sin pasar por el selector: por eso no
  // tiene categoría. Está aquí para que el catálogo conozca todos los juegos.
  {
    id: 'typerdungeon', icon: FaKeyboard, title: 'Typer Dungeon', color: '#8B4513',
    categories: [], direct: true,
    description: 'Mazmorra de mecanografía: derrota monstruos escribiendo sus palabras.',
  },
];

// --- Utilidades -----------------------------------------------------------

// Los juegos de una categoría, en el orden del catálogo.
export function gamesByCategory(category) {
  return GAMES.filter((g) => g.categories.includes(category));
}

// La descripción de un juego con la categoría activa ya resuelta.
export function gameDescription(game, action) {
  return typeof game.description === 'function' ? game.description(action) : game.description;
}
