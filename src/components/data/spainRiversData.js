export const SPAIN_RIVERS = [
  { id: 'mino', name: 'Miño' },
  { id: 'duero', name: 'Duero' },
  { id: 'tajo', name: 'Tajo' },
  { id: 'guadiana', name: 'Guadiana' },
  { id: 'guadalquivir', name: 'Guadalquivir' },
  { id: 'ebro', name: 'Ebro' },
  { id: 'jucar', name: 'Júcar' },
  { id: 'segura', name: 'Segura' }
];

export const ORDER_NORTH_SOUTH = [
  'mino',
  'duero',
  'ebro',
  'tajo',
  'jucar',
  'guadiana',
  'guadalquivir',
  'segura'
];

export const ORDER_BASINS = [
  'mino',
  'duero',
  'tajo',
  'guadiana',
  'guadalquivir',
  'ebro',
  'jucar',
  'segura'
];

export function getRiverNameById(id) {
  const found = SPAIN_RIVERS.find(r => r.id === id);
  return found ? found.name : id;
}

export function buildRiversQuestionOrder({ mode, orderType }) {
  if (mode === 'order') {
    return (orderType === 'basins' ? ORDER_BASINS : ORDER_NORTH_SOUTH).slice();
  }

  const base = [...SPAIN_RIVERS.map(r => r.id)];
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  const order = [...base];
  while (order.length < 10) {
    const pick = base[Math.floor(Math.random() * base.length)];
    if (order[order.length - 1] !== pick) order.push(pick);
  }
  return order;
}

