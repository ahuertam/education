import { useReducer } from 'react';
import { generateFloor } from './useDungeonMap';
import { getWord } from '../data/words';

const HERO_HP = { easy: 15, normal: 10, hard: 7 };

function buildInitialState() {
  return {
    phase: 'menu',
    config: { language: 'es', difficulty: 'normal', totalFloors: 5, timeLimit: 0, heroes: 1 },
    hero: { hp: 10, maxHp: 10 },
    floor: 1,
    map: [],
    roomIndex: 0,
    monster: null,
    monsterHp: 0,
    monsterMaxHp: 0,
    currentWord: '',
    usedWords: [],
    // Racha de palabras seguidas, puntos, y el escudo del tesoro.
    streak: 0,
    bestStreak: 0,
    score: 0,
    shield: false,
  };
}

function phaseForRoom(room) {
  if (!room) return 'exploring';
  if (room.type === 'monster') return 'pre_battle';
  if (room.type === 'treasure') return 'treasure';
  if (room.type === 'stairs') return 'stairs_found';
  return 'exploring';
}

export function reducer(state, action) {
  switch (action.type) {
    case 'START_GAME': {
      const { language, difficulty, totalFloors, timeLimit = 0, heroes = 1 } = action.config;
      const map = generateFloor(1, totalFloors);
      const hp = HERO_HP[difficulty] ?? 10;
      return {
        ...buildInitialState(),
        phase: phaseForRoom(map[0]),
        config: { language, difficulty, totalFloors, timeLimit, heroes },
        hero: { hp, maxHp: hp },
        floor: 1,
        map,
        roomIndex: 0,
      };
    }

    case 'START_BATTLE': {
      const room = state.map[state.roomIndex];
      const monster = room?.monster;
      if (!monster) return state;
      let word = getWord(state.config.difficulty, state.config.language, state.floor, new Set());
      let usedWords = word ? [word] : [];
      // En equipo el monstruo tiene más vida: es lo que hace que dos niños
      // el teclado valga la pena en vez de estorbar.
      const heroes = state.config.heroes ?? 1;
      const vida = monster.hp * heroes;
      return {
        ...state,
        phase: 'battle',
        monster,
        monsterHp: vida,
        monsterMaxHp: vida,
        currentWord: word ?? '',
        usedWords,
      };
    }

    case 'WORD_CORRECT': {
      const newMonsterHp = state.monsterHp - 1;
      // Only mark the just-completed word as used; never pre-populate with nextWord.
      let usedWords = [...state.usedWords, state.currentWord];
      // La racha: cada palabra followed suma mas, y cada cinco seguidas el
      // heroe recupera un punto de vida (la "vida extra").
      const streak = state.streak + 1;
      const score = state.score + 10 + streak * 2;
      const bestStreak = Math.max(state.bestStreak, streak);
      const hero = streak % 5 === 0
        ? { ...state.hero, hp: Math.min(state.hero.maxHp, state.hero.hp + 1) }
        : state.hero;
      if (newMonsterHp <= 0) {
        const isFinalBoss = state.monster?.key === 'dragon';
        return {
          ...state,
          monsterHp: 0,
          usedWords,
          hero,
          streak,
          score,
          bestStreak,
          phase: isFinalBoss ? 'victory' : 'monster_dying',
        };
      }
      let nextWord = getWord(state.config.difficulty, state.config.language, state.floor, new Set(usedWords));
      if (nextWord === null) {
        usedWords = [];
        nextWord = getWord(state.config.difficulty, state.config.language, state.floor, new Set());
      }
      return { ...state, monsterHp: newMonsterHp, currentWord: nextWord, usedWords, hero, streak, score, bestStreak };
    }

    case 'WORD_ERROR': {
      const dmg = state.monster?.damage ?? 1;
      // Only mark the just-failed word as used; never pre-populate with nextWord.
      let usedWords = [...state.usedWords, state.currentWord];
      // El escudo del tesoro se come el golpe: por eso el cofre es util.
      if (state.shield) {
        let nextWord = getWord(state.config.difficulty, state.config.language, state.floor, new Set(usedWords));
        if (nextWord === null) {
          usedWords = [];
          nextWord = getWord(state.config.difficulty, state.config.language, state.floor, new Set());
        }
        return { ...state, shield: false, streak: 0, usedWords, currentWord: nextWord };
      }
      const newHp = state.hero.hp - dmg;
      if (newHp <= 0) {
        return { ...state, hero: { ...state.hero, hp: 0 }, usedWords, streak: 0, phase: 'game_over' };
      }
      let nextWord = getWord(state.config.difficulty, state.config.language, state.floor, new Set(usedWords));
      if (nextWord === null) {
        usedWords = [];
        nextWord = getWord(state.config.difficulty, state.config.language, state.floor, new Set());
      }
      return { ...state, hero: { ...state.hero, hp: newHp }, currentWord: nextWord, usedWords, streak: 0 };
    }

    case 'ADVANCE_ROOM': {
      const nextIndex = state.roomIndex + 1;
      const nextRoom = state.map[nextIndex];
      return { ...state, roomIndex: nextIndex, phase: phaseForRoom(nextRoom) };
    }

    case 'COLLECT_TREASURE': {
      // El cofre da algo util: un escudo que se come el siguiente golpe, o
      // vida si ya llevaba uno.
      const shield = !state.shield;
      const newHp = shield ? state.hero.hp : Math.min(state.hero.hp + 3, state.hero.maxHp);
      const nextIndex = state.roomIndex + 1;
      const nextRoom = state.map[nextIndex];
      return {
        ...state,
        hero: { ...state.hero, hp: newHp },
        shield,
        roomIndex: nextIndex,
        phase: phaseForRoom(nextRoom),
      };
    }

    case 'DESCEND_STAIRS': {
      const nextFloor = state.floor + 1;
      if (nextFloor > state.config.totalFloors) {
        return { ...state, phase: 'victory' };
      }
      const map = generateFloor(nextFloor, state.config.totalFloors);
      return { ...state, floor: nextFloor, map, roomIndex: 0, phase: phaseForRoom(map[0]), usedWords: [] };
    }

    case 'RESTART':
      return buildInitialState();

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);
  return { state, dispatch };
}
