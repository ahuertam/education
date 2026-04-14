export function formatKeyLabel(key) {
  if (key === ' ') return 'Space';
  if (key === 'Escape') return 'Esc';
  if (key === 'ArrowUp') return '↑';
  if (key === 'ArrowDown') return '↓';
  if (key === 'ArrowLeft') return '←';
  if (key === 'ArrowRight') return '→';
  return key.length === 1 ? key.toUpperCase() : key;
}

export function loadKeymap() {
  try {
    const raw = localStorage.getItem('fw_puzzles_keymap');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.fire || !parsed?.water || !parsed?.system) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveKeymap(keymap) {
  try {
    localStorage.setItem('fw_puzzles_keymap', JSON.stringify(keymap));
  } catch {
    return;
  }
}

