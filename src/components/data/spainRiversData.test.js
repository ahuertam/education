import { ORDER_BASINS, ORDER_NORTH_SOUTH, SPAIN_RIVERS, buildRiversQuestionOrder } from './spainRiversData';

test('spain rivers catalog has 8 unique rivers', () => {
  const ids = SPAIN_RIVERS.map(r => r.id);
  expect(ids).toHaveLength(8);
  expect(new Set(ids).size).toBe(8);
});

test('order modes contain exactly the same 8 rivers', () => {
  const ids = new Set(SPAIN_RIVERS.map(r => r.id));
  expect(new Set(ORDER_NORTH_SOUTH)).toEqual(ids);
  expect(new Set(ORDER_BASINS)).toEqual(ids);
  expect(ORDER_NORTH_SOUTH).toHaveLength(8);
  expect(ORDER_BASINS).toHaveLength(8);
});

test('quick mode produces 10 questions and includes all rivers at least once', () => {
  const order = buildRiversQuestionOrder({ mode: 'quick' });
  expect(order).toHaveLength(10);
  const set = new Set(order);
  expect(set.size).toBeGreaterThanOrEqual(8);
  for (const r of SPAIN_RIVERS) expect(set.has(r.id)).toBe(true);
});

test('order mode produces 8 questions in the selected order', () => {
  const north = buildRiversQuestionOrder({ mode: 'order', orderType: 'northSouth' });
  expect(north).toEqual(ORDER_NORTH_SOUTH);
  const basins = buildRiversQuestionOrder({ mode: 'order', orderType: 'basins' });
  expect(basins).toEqual(ORDER_BASINS);
});

