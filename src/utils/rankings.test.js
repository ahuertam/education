import { loadGameRanking, recordGameRun, updateGameBestStreak } from './rankings';

describe('rankings', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(Date, 'now').mockReturnValue(1710000000000);
  });

  afterEach(() => {
    Date.now.mockRestore();
  });

  test('recordGameRun guarda top y mejor racha', () => {
    const r1 = recordGameRun('sintaxis', { score: 120, bestStreak: 7 });
    expect(r1.bestStreak).toBe(7);
    expect(r1.top[0].score).toBe(120);

    const r2 = recordGameRun('sintaxis', { score: 90, bestStreak: 4 });
    expect(r2.bestStreak).toBe(7);
    expect(r2.top.map(x => x.score)).toEqual([120, 90]);

    const loaded = loadGameRanking('sintaxis');
    expect(loaded.bestStreak).toBe(7);
    expect(loaded.top.map(x => x.score)).toEqual([120, 90]);
  });

  test('limita a top 5 y ordena por puntuación', () => {
    recordGameRun('tv', { score: 10, bestStreak: 1 });
    recordGameRun('tv', { score: 50, bestStreak: 2 });
    recordGameRun('tv', { score: 20, bestStreak: 3 });
    recordGameRun('tv', { score: 40, bestStreak: 4 });
    recordGameRun('tv', { score: 30, bestStreak: 5 });
    recordGameRun('tv', { score: 60, bestStreak: 6 });

    const loaded = loadGameRanking('tv');
    expect(loaded.top.map(x => x.score)).toEqual([60, 50, 40, 30, 20]);
  });

  test('updateGameBestStreak actualiza sin tocar el top', () => {
    recordGameRun('x', { score: 33, bestStreak: 2 });
    const before = loadGameRanking('x');
    expect(before.bestStreak).toBe(2);

    updateGameBestStreak('x', 9);
    const after = loadGameRanking('x');
    expect(after.bestStreak).toBe(9);
    expect(after.top.map(x => x.score)).toEqual([33]);
  });
});

