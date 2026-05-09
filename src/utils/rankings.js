const STORAGE_KEY = 'education_rankings_v1';

const safeParse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const loadAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = safeParse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
};

const saveAll = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    return;
  }
};

const normalizeEntry = (entry) => {
  const score = Number(entry?.score ?? 0);
  const at = typeof entry?.at === 'number' ? entry.at : Date.now();
  return { score: Number.isFinite(score) ? score : 0, at };
};

export const loadGameRanking = (gameKey) => {
  const all = loadAll();
  const g = all?.[gameKey];
  const top = Array.isArray(g?.top) ? g.top.map(normalizeEntry) : [];
  const bestStreak = Number(g?.bestStreak ?? 0);
  return {
    top: top
      .filter(x => Number.isFinite(x.score))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5),
    bestStreak: Number.isFinite(bestStreak) ? bestStreak : 0,
  };
};

export const recordGameRun = (gameKey, { score, bestStreak } = {}) => {
  const all = loadAll();
  const prev = loadGameRanking(gameKey);
  const entry = normalizeEntry({ score, at: Date.now() });

  const nextTop = [entry, ...(prev.top || [])]
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const bs = Number(bestStreak ?? 0);
  const nextBestStreak = Math.max(prev.bestStreak || 0, Number.isFinite(bs) ? bs : 0);

  saveAll({
    ...all,
    [gameKey]: { top: nextTop, bestStreak: nextBestStreak }
  });

  return { top: nextTop, bestStreak: nextBestStreak };
};

export const updateGameBestStreak = (gameKey, streak) => {
  const all = loadAll();
  const prev = loadGameRanking(gameKey);
  const s = Number(streak ?? 0);
  const nextBestStreak = Math.max(prev.bestStreak || 0, Number.isFinite(s) ? s : 0);
  if (nextBestStreak === prev.bestStreak) return prev;

  saveAll({
    ...all,
    [gameKey]: { top: prev.top || [], bestStreak: nextBestStreak }
  });

  return { top: prev.top || [], bestStreak: nextBestStreak };
};

export const formatRankDate = (ts) => {
  try {
    return new Date(ts).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  } catch {
    return '';
  }
};
