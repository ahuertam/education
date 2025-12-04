export const SHAPES = {
  circle: {
    id: 'circle',
    name: 'círculo',
    plural: 'círculos',
  },
  square: {
    id: 'square',
    name: 'cuadrado',
    plural: 'cuadrados',
  },
  triangle: {
    id: 'triangle',
    name: 'triángulo',
    plural: 'triángulos',
  },
  star: {
    id: 'star',
    name: 'estrella',
    plural: 'estrellas',
  },
};

export const COLORS = {
  red: {
    id: 'red',
    name: 'rojo',
    value: '#E74C3C',
  },
  blue: {
    id: 'blue',
    name: 'azul',
    value: '#3498DB',
  },
  green: {
    id: 'green',
    name: 'verde',
    value: '#2ECC71',
  },
  yellow: {
    id: 'yellow',
    name: 'amarillo',
    value: '#F39C12',
  },
};

export const WAVES = [
  // Color only waves
  { type: 'color', target: 'red', text: '¡Para todo lo ROJO!' },
  { type: 'color', target: 'blue', text: '¡Para todo lo AZUL!' },
  { type: 'color', target: 'green', text: '¡Para todo lo VERDE!' },
  
  // Shape only waves
  { type: 'shape', target: 'circle', text: '¡Para todos los CÍRCULOS!' },
  { type: 'shape', target: 'square', text: '¡Para todos los CUADRADOS!' },
  { type: 'shape', target: 'triangle', text: '¡Para todos los TRIÁNGULOS!' },
  
  // Combined waves
  { type: 'both', targetShape: 'circle', targetColor: 'red', text: '¡Para los CÍRCULOS ROJOS!' },
  { type: 'both', targetShape: 'square', targetColor: 'blue', text: '¡Para los CUADRADOS AZULES!' },
  { type: 'both', targetShape: 'star', targetColor: 'yellow', text: '¡Para las ESTRELLAS AMARILLAS!' },
  { type: 'both', targetShape: 'triangle', targetColor: 'green', text: '¡Para los TRIÁNGULOS VERDES!' },
];
