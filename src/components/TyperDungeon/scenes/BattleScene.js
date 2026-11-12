import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import MonsterSprite from '../sprites/MonsterSprite';
import HeroSprite from '../sprites/HeroSprite';
import WordBubble from '../ui/WordBubble';
import TypingInput from '../ui/TypingInput';
import HeroHUD from '../ui/HeroHUD';
import DungeonBackground from '../ui/DungeonBackground';
import { monsterName } from '../data/monsters';
import { dungeonName } from '../data/dungeons';
import { getWordDifficultyLevel, timeLimitForLevel } from '../data/words';

const heroAttack = keyframes`
  0%   { transform: translateX(0); }
  30%  { transform: translateX(60px); }
  60%  { transform: translateX(40px); }
  100% { transform: translateX(0); }
`;

const screenFlash = keyframes`
  0%,100% { opacity:0; }
  50%     { opacity:0.35; }
`;

const victoryBurst = keyframes`
  0%   { transform: scale(0.6); opacity: 0; }
  60%  { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

const BattleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
`;

const DungeonView = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 24px;
`;

const MonsterArea = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

// La línea del suelo. Sin ella los sprites flotan en el aire y la escena se
// siente como un menú con un dibujo, no como una sala.
const FloorLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(120, 88, 40, 0.7) 18%,
    rgba(168, 130, 70, 0.9) 50%,
    rgba(120, 88, 40, 0.7) 82%,
    transparent 100%
  );
  z-index: 1;
  pointer-events: none;
`;

// La sombra bajo un sprite: es lo que lo planta en el suelo.
const Sombra = styled.div`
  width: ${(props) => props.$w}px;
  height: ${(props) => props.$h}px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 0.55) 0%,
    rgba(0, 0, 0, 0.25) 55%,
    rgba(0, 0, 0, 0) 75%
  );
  margin-top: -6px;
  flex-shrink: 0;
`;

// El héroe dentro de la sala, no en una barra de la interfaz. Al estar en el
// mismo plano que el monstruo, y más abajo y a la izquierda, se lee como
// "tú en primera persona".
const HeroEnSala = styled.div`
  position: absolute;
  left: 20px;
  bottom: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  ${(props) => props.$attacking && css`animation: ${heroAttack} 0.45s ease-in-out;`}
`;

const MonsterHPBar = styled.div`
  width: ${props => props.$monstW}px;
  height: 8px;
  background: #1a0a00;
  border: 1px solid #5a4020;
  border-radius: 2px;
  overflow: hidden;
`;

const MonsterHPFill = styled.div`
  height: 100%;
  width: ${props => props.$pct}%;
  background: #c03020;
  transition: width 0.3s ease;
`;

const FlashOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  background: ${props => props.$color};
  animation: ${screenFlash} 0.4s ease forwards;
  opacity: 0;
`;

const VictoryBanner = styled.div`
  position: relative;
  z-index: 3;
  font-family: 'Courier New', monospace;
  font-size: 1.4rem;
  font-weight: bold;
  color: #ffd700;
  letter-spacing: 3px;
  text-shadow: 0 0 15px #ffd700, 0 0 30px #a06000;
  margin-bottom: 8px;
  animation: ${victoryBurst} 0.6s ease-out;
`;

const ControlPanel = styled.div`
  height: 150px;
  background: #0f0a04;
  border-top: 3px solid #5a4020;
  display: flex;
  align-items: stretch;
  gap: 0;
`;

const StatsPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding: 10px 14px;
`;

const TimerTrack = styled.div`
  position: relative;
  height: 6px;
  background: #1a0a00;
  border: 1px solid #5a4020;
  border-radius: 2px;
  overflow: hidden;
`;

const TimerFill = styled.div`
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: ${props => props.$pct}%;
  background: ${props => {
    if (props.$pct > 50) return '#30c040';
    if (props.$pct > 25) return '#d0a020';
    return '#c03020';
  }};
  transition: width 0.1s linear;
`;

const TimerLabel = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 0.65rem;
  color: #a08040;
  text-align: right;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const HERO_ATTACK_MS  = 600; // 8 frames × 70ms + margen
const HERO_HURT_MS    = 600;
const TIMER_TICK_MS   = 100;

export default function BattleScene({ state, dispatch }) {
  const { hero, monster, monsterHp, monsterMaxHp, currentWord, config, floor, map, roomIndex, phase } = state;
  const room = map[roomIndex];
  const bgKey = room?.bg ?? 'battle';
  const monstPct = monsterMaxHp > 0 ? Math.max(0, Math.round((monsterHp / monsterMaxHp) * 100)) : 0;
  const isDying = phase === 'monster_dying';
  const heroes = config.heroes ?? 1;
  const enEquipo = heroes > 1;

  // El tiempo por palabra crece con la longitud de la palabra: las del nivel 1
  // tienen 3-5 letras y las del 5, unas 15. Con el mismo tiempo para todas, el
  // piso final es imposible de escribir.
  const nivelPalabra = getWordDifficultyLevel(config.difficulty, floor);
  const timeLimit = timeLimitForLevel(config.timeLimit ?? 0, nivelPalabra);
  // En equipo hay un único reloj para todo el combate. El presupuesto es el
  // mismo que si cada palabra tuviera su tiempo, pero compartido: eso es lo
  // que hace que turnarse el teclado tenga gracia.
  const relojTotal = enEquipo ? timeLimit * (monsterMaxHp || 1) : timeLimit;

  const [heroAnim, setHeroAnim] = useState('idle');
  const [monsterAnim, setMonsterAnim] = useState('idle');
  const [flash, setFlash] = useState(null); // { key, color }
  const [typed, setTyped] = useState('');
  const [timeLeft, setTimeLeft] = useState(relojTotal);

  // Track animation timers in refs so a fast follow-up action can cancel them
  // before the old one fires and snaps the hero/monster back to idle.
  const heroTimerRef    = useRef(null);
  const monsterTimerRef = useRef(null);
  // Momento en que arrancó el reloj del equipo (0 = todavía no ha empezado).
  const inicioEquipoRef = useRef(0);

  useEffect(() => () => {
    if (heroTimerRef.current)    clearTimeout(heroTimerRef.current);
    if (monsterTimerRef.current) clearTimeout(monsterTimerRef.current);
  }, []);

  // Stop any in-flight animation transitions when leaving the battle phase
  // (e.g. into monster_dying or game_over) so the hero/monster don't snap
  // back to idle on top of the dying animation.
  useEffect(() => {
    if (phase !== 'battle') {
      if (heroTimerRef.current)    clearTimeout(heroTimerRef.current);
      if (monsterTimerRef.current) clearTimeout(monsterTimerRef.current);
      heroTimerRef.current = null;
      monsterTimerRef.current = null;
    }
  }, [phase]);

  const clearAnimTimers = () => {
    if (heroTimerRef.current)    { clearTimeout(heroTimerRef.current);    heroTimerRef.current = null; }
    if (monsterTimerRef.current) { clearTimeout(monsterTimerRef.current); monsterTimerRef.current = null; }
  };

  const triggerFlash = (color) => {
    setFlash(f => ({ key: (f?.key ?? 0) + 1, color }));
  };

  const handleCorrect = useCallback(() => {
    const willKill = monsterHp - 1 <= 0;
    dispatch({ type: 'WORD_CORRECT' });
    setTyped('');

    clearAnimTimers();
    setHeroAnim('attack');
    triggerFlash(willKill ? 'rgba(255,180,40,0.7)' : 'rgba(255,220,50,0.6)');

    if (willKill) {
      // Monster death animation is 800ms and runs forwards; do not reset it
      // to idle — the reducer's monster_dying phase keeps us mounted.
      setMonsterAnim('dead');
      heroTimerRef.current = setTimeout(() => setHeroAnim('idle'), HERO_ATTACK_MS);
    } else {
      setMonsterAnim('hurt');
      monsterTimerRef.current = setTimeout(() => setMonsterAnim('idle'), HERO_ATTACK_MS);
      heroTimerRef.current    = setTimeout(() => setHeroAnim('idle'),    HERO_ATTACK_MS);
    }
  }, [dispatch, monsterHp]);

  const handleError = useCallback(() => {
    dispatch({ type: 'WORD_ERROR' });
    setTyped('');

    clearAnimTimers();
    setMonsterAnim('idle');
    setHeroAnim('hurt');
    triggerFlash('rgba(200,30,20,0.5)');
    heroTimerRef.current = setTimeout(() => setHeroAnim('idle'), HERO_HURT_MS);
  }, [dispatch]);

  // Word timer: one interval per word. Counts down while the word is on screen
  // and fires exactly one error when it hits zero.
  //
  // `fired` is per-interval closure state rather than a ref: typing the word
  // runs the cleanup below, which kills the interval immediately, so a word
  // completed on the same tick as the expiry can't also register a timeout.
  // handleError is stable ([dispatch]) so this effect only restarts per word.
  //
  // En equipo no se reinicia en cada palabra: el reloj es del combate entero.
  useEffect(() => {
    if (relojTotal <= 0 || phase !== 'battle' || isDying) return undefined;
    if (!enEquipo) {
      setTimeLeft(relojTotal);
      inicioEquipoRef.current = Date.now();
    } else if (!inicioEquipoRef.current) {
      inicioEquipoRef.current = Date.now();
      setTimeLeft(relojTotal);
    }
    const start = inicioEquipoRef.current;
    let fired = false;
    const id = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const remaining = Math.max(0, relojTotal - elapsed);
      setTimeLeft(remaining);
      if (remaining > 0 || fired) return;
      fired = true;
      clearInterval(id);
      handleError();
    }, TIMER_TICK_MS);
    return () => clearInterval(id);
  }, [currentWord, relojTotal, phase, isDying, handleError, enEquipo]);

  // Un combate nuevo pone el reloj del equipo a cero.
  useEffect(() => {
    if (phase !== 'battle' || !enEquipo) return;
    inicioEquipoRef.current = Date.now();
    setTimeLeft(relojTotal);
  }, [phase, monster, enEquipo, relojTotal]);

  const timerPct = relojTotal > 0 ? Math.max(0, Math.min(100, (timeLeft / relojTotal) * 100)) : 0;

  return (
    <BattleWrapper>
      <DungeonView>
        <DungeonBackground bgKey={bgKey} style={{ position: 'absolute', inset: 0 }} />
        {flash && <FlashOverlay key={flash.key} $color={flash.color} />}

        {isDying && <VictoryBanner>¡VICTORIA!</VictoryBanner>}

        <FloorLine />

        <HeroEnSala $attacking={heroAnim === 'attack'}>
          <HeroSprite state={heroAnim} size={112} />
          <Sombra $w={118} $h={13} />
        </HeroEnSala>

        <MonsterArea>
          {!isDying && (
            <WordBubble
              word={currentWord}
              typed={typed}
              monsterName={monster ? monsterName(monster, config.language) : ''}
            />
          )}
          <MonsterSprite monster={monster} animState={monsterAnim} />
          <Sombra $w={monster?.displayW ?? 200} $h={16} />
          <MonsterHPBar $monstW={monster?.displayW ?? 200}>
            <MonsterHPFill $pct={monstPct} />
          </MonsterHPBar>
        </MonsterArea>
      </DungeonView>

      <ControlPanel>
        <StatsPanel>
          <HeroHUD
            hp={hero.hp}
            maxHp={hero.maxHp}
            floor={floor}
            totalFloors={config.totalFloors}
            dungeon={dungeonName(floor, config.totalFloors)}
            team={heroes}
          />
          {relojTotal > 0 && !isDying && (
            <>
              <TimerLabel>
                ⏱ {timeLeft.toFixed(1)} s
                {enEquipo ? ' — reloj del equipo' : ''}
              </TimerLabel>
              <TimerTrack><TimerFill $pct={timerPct} /></TimerTrack>
            </>
          )}
          {!isDying && (
            <TypingInput
              targetWord={currentWord}
              onCorrect={handleCorrect}
              onError={handleError}
              active={true}
              onTypedChange={setTyped}
            />
          )}
        </StatsPanel>
      </ControlPanel>
    </BattleWrapper>
  );
}
