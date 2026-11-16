// Tests de la mecánica de la partida: racha, puntos, vida extra y escudo.
// Son las reglas que hacen que escribir followed tenga una recompensa, asi
// que si se rompen el juego deja de tener sentido.

import { reducer } from './useGameState';
import { MONSTERS } from '../data/monsters';

const combate = (extra = {}) => ({
  phase: 'battle',
  config: { language: 'es', difficulty: 'normal', totalFloors: 5, timeLimit: 0, heroes: 1 },
  hero: { hp: 8, maxHp: 10 },
  floor: 1,
  map: [{ type: 'monster', bg: 'battle', monster: MONSTERS.goblin }],
  roomIndex: 0,
  monster: MONSTERS.goblin,
  monsterHp: 20,
  monsterMaxHp: 20,
  currentWord: 'casa',
  usedWords: ['casa'],
  streak: 0,
  bestStreak: 0,
  score: 0,
  shield: false,
  ...extra,
});

const palabras = (state, n) => {
  let s = state;
  for (let i = 0; i < n; i++) s = reducer(s, { type: 'WORD_CORRECT' });
  return s;
};

describe('racha y puntos', () => {
  it('cada palabra seguida suma mas que la anterior', () => {
    const s = palabras(combate(), 3);
    expect(s.streak).toBe(3);
    expect(s.bestStreak).toBe(3);
    // 12 + 14 + 16
    expect(s.score).toBe(42);
  });

  it('cada cinco palabras seguidas el heroe recupera un punto de vida', () => {
    const s = palabras(combate(), 5);
    expect(s.streak).toBe(5);
    expect(s.hero.hp).toBe(9);
  });

  it('fallar rompe la racha pero no los puntos', () => {
    const s = reducer(palabras(combate(), 3), { type: 'WORD_ERROR' });
    expect(s.streak).toBe(0);
    expect(s.score).toBe(42);
    expect(s.hero.hp).toBe(7);
  });
});

describe('escudo', () => {
  it('se come el golpe y se consume', () => {
    const s = reducer(combate({ shield: true }), { type: 'WORD_ERROR' });
    expect(s.shield).toBe(false);
    expect(s.hero.hp).toBe(8);
  });

  it('sin escudo el golpe hace dano', () => {
    const s = reducer(combate(), { type: 'WORD_ERROR' });
    expect(s.hero.hp).toBe(8 - MONSTERS.goblin.damage);
  });

  it('el cofre da un escudo, y vida si ya llevaba uno', () => {
    const conEscudo = reducer(combate(), { type: 'COLLECT_TREASURE' });
    expect(conEscudo.shield).toBe(true);
    expect(conEscudo.hero.hp).toBe(8);

    const conVida = reducer(combate({ shield: true, hero: { hp: 8, maxHp: 12 } }), { type: 'COLLECT_TREASURE' });
    expect(conVida.shield).toBe(false);
    expect(conVida.hero.hp).toBe(11);
  });
});
