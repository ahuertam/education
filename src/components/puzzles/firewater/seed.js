export function normalizeSeed(value) {
  return value
    .trim()
    .slice(0, 32)
    .replace(/[^a-zA-Z0-9-_]/g, '');
}

export function createRandomSeed() {
  return Math.random().toString(36).slice(2, 10);
}

