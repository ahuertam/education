// Digilike: roguelike de caminos con Digimon.
//
// Este fichero es solo el componente. Los datos están en digilike/data.js,
// los estilos en digilike/styles.js, la lógica de juego en digilike/logic.js
// y la capa de red en digilike/api.js.

import { useEffect, useMemo, useRef, useState } from 'react';
import { FaArrowLeft, FaBolt, FaCrown, FaSkullCrossbones, FaSyringe } from 'react-icons/fa';
import { createRng, rngInt, rngPick } from './puzzles/firewater/prng';
import { COLORS, STARTERS, ADVENTURE_SAGAS, FALLBACK_IMG } from './digilike/data';
import {
  buildStats, clamp, generateMap, levelTier, makeQuestion, nodeLabel, shuffle,
} from './digilike/logic';
import { fetchDigimon } from './digilike/api';
import {
  Page, Frame, TopBar, BrandLogo,
  BackButton, Shell, ColumnStack, MapShell,
  MapAreaNode, MapAreaProfile, MapAreaMap, MapAreaStatus,
  Card, CardTitle, H2, Sub,
  PillRow, Pill, BarWrap, EnergyBar,
  EnergyFill, Hint, PrimaryButton, SubtleButton,
  Grid2, StarterGrid, DigiCard, DigiImg,
  DigiName, DigiMeta, MapWrap, FloorsCanvas,
  FloorsGrid, FloorCol, FloorTitle, IconBadge,
  NodeButton, NodeCircle, NodeTitle, NodeSub,
  Overlay, Modal, ModalHeader, ModalTitle,
  Prompt, Input, ChoiceButton, Feedback,
  BattleGrid, FighterRow, FighterCard, FighterTop,
  FighterAvatar, FighterName, FighterMeta, SmallBar,
  SmallFill, Log,
} from './digilike/styles';

const DigilikeGame = ({ onBack }) => {
  const [seed, setSeed] = useState(() => String(Math.floor(Math.random() * 1e9)));
  const rngRef = useRef(createRng(seed));
  const floorsRef = useRef(null);
  const [screen, setScreen] = useState('start');
  const [starterPool, setStarterPool] = useState([]);
  const [starterLoading, setStarterLoading] = useState(true);
  const [starterError, setStarterError] = useState(null);
  const [saga, setSaga] = useState(() => ADVENTURE_SAGAS[0]);
  const sagaRef = useRef(saga);

  const [mapState, setMapState] = useState(null);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [energy, setEnergy] = useState({ cur: 100, max: 100 });
  const energyCurRef = useRef(100);
  const [player, setPlayer] = useState(null);
  const [runMeta, setRunMeta] = useState({ floor: 0, cleared: 0, correct: 0, wrong: 0 });

  const [pendingQuestion, setPendingQuestion] = useState(null);
  const [questionAnswer, setQuestionAnswer] = useState('');
  const [questionFeedback, setQuestionFeedback] = useState(null);

  const [lootChoices, setLootChoices] = useState(null);
  const [battle, setBattle] = useState(null);
  const [mapLines, setMapLines] = useState([]);
  const [mapCanvasSize, setMapCanvasSize] = useState({ w: 0, h: 0 });

  // Token de partida: se incrementa al empezar una run nueva. Las peticiones de
  // enemigo comparan contra él antes de escribir en el estado.
  const runTokenRef = useRef(0);
  // Nodos ya creditados en el contador "despejados". El efecto de fin de
  // batalla depende también de player.hp, así que sin esta guarda el +1 se
  // aplicaba dos veces al mismo nodo y el contador acababa por superar el
  // número de nodos del mapa.
  const clearedCreditedRef = useRef(new Set());

  const energyPct = useMemo(() => {
    if (!energy?.max) return 0;
    return clamp(Math.round((energy.cur / energy.max) * 100), 0, 100);
  }, [energy]);

  useEffect(() => {
    energyCurRef.current = energy.cur;
  }, [energy.cur]);

  useEffect(() => {
    sagaRef.current = saga;
  }, [saga]);

  useEffect(() => {
    let alive = true;
    setStarterLoading(true);
    setStarterError(null);

    Promise.all(STARTERS.map((n) => fetchDigimon(n)))
      .then((items) => {
        if (!alive) return;
        setStarterPool(items);
        setStarterLoading(false);
      })
      .catch((err) => {
        if (!alive) return;
        setStarterError(String(err?.message || err));
        setStarterLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    rngRef.current = createRng(seed);
  }, [seed]);

  const availableNodes = useMemo(() => {
    if (!mapState || !currentNodeId) return new Set();
    const node = mapState.byId[currentNodeId];
    if (!node) return new Set();
    if (!node.cleared) return new Set();
    return new Set(node.edges);
  }, [mapState, currentNodeId]);

  useEffect(() => {
    if (screen !== 'map') return;
    if (!currentNodeId) return;
    const el = floorsRef.current;
    if (!el) return;
    const target = el.querySelector(`[data-nodeid="${currentNodeId}"]`);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [screen, currentNodeId]);

  useEffect(() => {
    if (screen !== 'map') return;
    if (!mapState) return;
    const el = floorsRef.current;
    if (!el) return;

    const compute = () => {
      const base = el.getBoundingClientRect();
      const anchors = el.querySelectorAll('[data-anchorid]');
      const pos = new Map();

      anchors.forEach((a) => {
        const id = a.getAttribute('data-anchorid');
        if (!id) return;
        const r = a.getBoundingClientRect();
        const x = r.left - base.left + el.scrollLeft + r.width / 2;
        const y = r.top - base.top + el.scrollTop + r.height / 2;
        pos.set(id, { x, y });
      });

      const lines = [];
      for (const n of mapState.nodes) {
        const from = pos.get(n.id);
        if (!from) continue;
        for (const toId of n.edges || []) {
          const to = pos.get(toId);
          if (!to) continue;
          const isChoice = n.id === currentNodeId && availableNodes.has(toId);
          const isUnlocked = mapState.byId?.[toId]?.cleared || availableNodes.has(toId) || mapState.byId?.[n.id]?.cleared;

          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const cpx = from.x + dx * 0.5;
          const cpy = from.y + dy * 0.5 + (Math.abs(dy) < 2 ? -26 : 0);
          const d = `M ${from.x} ${from.y} Q ${cpx} ${cpy} ${to.x} ${to.y}`;

          lines.push({
            d,
            choice: isChoice,
            dashed: !isChoice && !isUnlocked,
          });
        }
      }

      setMapLines(lines);
      setMapCanvasSize({ w: el.scrollWidth, h: el.scrollHeight });
    };

    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        scrollRaf = 0;
        compute();
      });
    };

    const raf = window.requestAnimationFrame(compute);
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', compute);

    return () => {
      window.cancelAnimationFrame(raf);
      if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', compute);
    };
  }, [screen, mapState, currentNodeId, availableNodes]);

  const resetRun = async (pickedStarter, forcedSeed) => {
    const nextSeed = forcedSeed ?? seed;
    setSeed(nextSeed);
    const rng = createRng(nextSeed);
    rngRef.current = rng;
    // Cada partida nueva invalida las peticiones de enemigo que sigan en
    // vuelo: si el niño pulsa "Nueva run" mientras se descarga el Digimon, la
    // promesa vieja resolvía y pisaba el estado con el enemigo de la partida
    // anterior.
    runTokenRef.current += 1;
    clearedCreditedRef.current.clear();

    const map = generateMap({ seed: nextSeed });
    setMapState(map);
    setCurrentNodeId(map.startId);
    setEnergy({ cur: 100, max: 100 });
    setRunMeta({ floor: 0, cleared: 0, correct: 0, wrong: 0 });

    const starter = pickedStarter || (starterPool[0] ? starterPool[0] : await fetchDigimon(STARTERS[0]));
    const tier = levelTier(starter.level);
    const stats = buildStats({ tier, floor: 0, isBoss: false, rng });
    setPlayer({
      digimon: starter,
      hp: stats.hp,
      maxHp: stats.hp,
      atk: stats.atk,
      def: stats.def,
      healUsed: false,
      guard: false,
    });

    setLootChoices(null);
    setPendingQuestion(null);
    setBattle(null);
    setQuestionAnswer('');
    setQuestionFeedback(null);
    setScreen('node');
  };

  const startNewRun = async (pickedStarter) => {
    const nextSeed = String(Math.floor(Math.random() * 1e9));
    const rng = createRng(nextSeed);
    setSaga(ADVENTURE_SAGAS[rngInt(rng, 0, ADVENTURE_SAGAS.length - 1)]);
    await resetRun(pickedStarter, nextSeed);
  };

  const ensureQuestion = (floor) => {
    const rng = rngRef.current;
    const q = makeQuestion({ rng, floor });
    setPendingQuestion(q);
    setQuestionAnswer('');
    setQuestionFeedback(null);
    setScreen('question');
  };

  const applyEnergy = (delta) => {
    setEnergy((prev) => {
      const next = clamp(prev.cur + delta, 0, prev.max);
      return { ...prev, cur: next };
    });
  };

  const markNodeCleared = (nodeId) => {
    setMapState((prev) => {
      if (!prev) return prev;
      const node = prev.byId[nodeId];
      if (!node) return prev;
      if (node.cleared) return prev;
      return { ...prev, byId: { ...prev.byId, [nodeId]: { ...node, cleared: true } } };
    });
  };

  // Marca un nodo como despejado y lo cuenta UNA sola vez. markNodeCleared ya
  // era idempotente, pero el `+1` del contador no lo era.
  const creditNodeCleared = (nodeId) => {
    if (clearedCreditedRef.current.has(nodeId)) return;
    clearedCreditedRef.current.add(nodeId);
    markNodeCleared(nodeId);
    setRunMeta((m) => ({ ...m, cleared: m.cleared + 1 }));
  };

  const startNode = () => {
    if (!mapState || !currentNodeId) return;
    const node = mapState.byId[currentNodeId];
    if (!node) return;

    setLootChoices(null);
    setBattle(null);
    setPendingQuestion(null);
    setQuestionFeedback(null);

    if (node.kind === 'start') {
      applyEnergy(12);
      creditNodeCleared(node.id);
      ensureQuestion(node.floor);
      return;
    }

    if (node.kind === 'rest') {
      applyEnergy(16);
      creditNodeCleared(node.id);
      ensureQuestion(node.floor);
      return;
    }

    if (node.kind === 'loot') {
      const rng = rngRef.current;
      const choices = shuffle(rng, [
        { id: 'atk', title: '+ATK', sub: 'Tus ataques pegan más', apply: (p) => ({ ...p, atk: p.atk + 2 }) },
        { id: 'def', title: '+DEF', sub: 'Recibes menos daño', apply: (p) => ({ ...p, def: p.def + 2 }) },
        { id: 'hp', title: '+HP Máx', sub: 'Más aguante en combate', apply: (p) => ({ ...p, maxHp: p.maxHp + 10, hp: p.hp + 10 }) },
      ]).slice(0, 3);
      setLootChoices(choices);
      setScreen('loot');
      return;
    }

    const isBoss = node.kind === 'boss';
    setScreen('battle');
    const token = runTokenRef.current;
    void (async () => {
      const rng = rngRef.current;
      const sagaBoss = sagaRef.current?.bossFetchName;
      const enemyName = isBoss && sagaBoss
        ? sagaBoss
        : rngPick(rng, [...STARTERS, 'Greymon', 'Kabuterimon', 'Ikkakumon', 'Garurumon', 'Leomon', 'Ogremon']);
      const digimon = await fetchDigimon(enemyName);
      // La run pudo cambiar mientras descargábamos: el resultado ya no vale.
      if (token !== runTokenRef.current) return;
      const tier = levelTier(digimon.level);
      const stats = buildStats({ tier, floor: node.floor, isBoss, rng });
      setBattle({
        isBoss,
        enemy: {
          digimon,
          hp: stats.hp,
          maxHp: stats.hp,
          atk: stats.atk + (isBoss ? 2 : 0),
          def: stats.def + (isBoss ? 2 : 0),
          guard: false,
        },
        log: [`Aparece ${digimon.name}${isBoss ? ' (Jefe final)' : ''}.`],
        turn: 'player',
      });
    })();
  };

  useEffect(() => {
    if (screen === 'node') startNode();
  }, [screen]);

  const handlePickNode = (nodeId) => {
    if (!availableNodes.has(nodeId)) return;
    setCurrentNodeId(nodeId);
    setRunMeta((m) => ({ ...m, floor: mapState?.byId?.[nodeId]?.floor ?? m.floor }));
    setScreen('node');
  };

  const finishNode = (floor) => {
    if (energyCurRef.current <= 0) {
      setScreen('end');
      return;
    }
    ensureQuestion(floor);
  };

  const submitQuestion = ({ pickedIndex } = {}) => {
    if (!pendingQuestion) return;
    const raw = pendingQuestion.type === 'multiple_choice' ? pickedIndex : questionAnswer;
    const normalized = pendingQuestion.type === 'multiple_choice' ? raw : String(raw ?? '').trim();
    const isCorrect = pendingQuestion.type === 'multiple_choice'
      ? Number(pickedIndex) === pendingQuestion.correctIndex
      : Number(normalized) === pendingQuestion.answer;

    const delta = isCorrect ? pendingQuestion.heal : -pendingQuestion.hit;
    const nextEnergy = clamp(energyCurRef.current + delta, 0, energy.max);

    if (isCorrect) {
      applyEnergy(pendingQuestion.heal);
      setQuestionFeedback({ tone: 'good', text: `Correcto. +${pendingQuestion.heal} energía.` });
      setRunMeta((m) => ({ ...m, correct: m.correct + 1 }));
    } else {
      applyEnergy(-pendingQuestion.hit);
      setQuestionFeedback({ tone: 'bad', text: `Incorrecto. −${pendingQuestion.hit} energía. Respuesta: ${pendingQuestion.answer}` });
      setRunMeta((m) => ({ ...m, wrong: m.wrong + 1 }));
    }

    window.setTimeout(() => {
      setPendingQuestion(null);
      setQuestionFeedback(null);
      if (nextEnergy <= 0) {
        setScreen('end');
        return;
      }
      setScreen('map');
    }, 700);
  };

  const pickLoot = (choice) => {
    if (!choice) return;
    setPlayer((p) => (p ? choice.apply(p) : p));
    setLootChoices(null);
    creditNodeCleared(currentNodeId);
    const floor = mapState?.byId?.[currentNodeId]?.floor ?? 0;
    finishNode(floor);
  };

  const appendLog = (b, line) => {
    return { ...b, log: [...b.log, line].slice(-24) };
  };

  const applyDamage = ({ target, amount }) => {
    const dmg = Math.max(1, Math.floor(amount));
    if (target === 'enemy') {
      setBattle((b) => {
        if (!b) return b;
        const nextHp = clamp(b.enemy.hp - dmg, 0, b.enemy.maxHp);
        return { ...b, enemy: { ...b.enemy, hp: nextHp } };
      });
      return dmg;
    }
    setPlayer((p) => {
      if (!p) return p;
      const nextHp = clamp(p.hp - dmg, 0, p.maxHp);
      return { ...p, hp: nextHp, guard: false };
    });
    return dmg;
  };

  const resolveEnemyTurn = () => {
    setBattle((b) => {
      if (!b || b.turn !== 'enemy' || !player) return b;
      if (b.enemy.hp <= 0 || player.hp <= 0) return b;

      const rng = rngRef.current;
      const willGuard = !b.enemy.guard && rng() < 0.22;
      if (willGuard) {
        return appendLog({ ...b, enemy: { ...b.enemy, guard: true }, turn: 'player' }, `${b.enemy.digimon.name} se protege.`);
      }

      const raw = b.enemy.atk + rngInt(rng, 0, 3);
      const reduced = raw - Math.floor(player.def * 0.45);
      const guarded = player.guard ? Math.floor(reduced * 0.6) : reduced;
      const dealt = applyDamage({ target: 'player', amount: guarded });
      return appendLog({ ...b, turn: 'player', enemy: { ...b.enemy, guard: false } }, `${b.enemy.digimon.name} ataca y hace ${dealt} de daño.`);
    });
  };

  useEffect(() => {
    if (screen !== 'battle') return;
    if (!battle || !player) return;
    if (battle.turn !== 'enemy') return;
    const t = window.setTimeout(() => resolveEnemyTurn(), 520);
    return () => window.clearTimeout(t);
  }, [battle?.turn, screen]);

  useEffect(() => {
    if (screen !== 'battle') return;
    if (!battle || !player) return;
    const node = mapState?.byId?.[currentNodeId];
    if (!node) return;
    if (battle.enemy.hp <= 0) {
      creditNodeCleared(node.id);
      setBattle((b) => (b ? appendLog(b, 'Victoria.') : b));
      if (node.kind === 'boss') {
        window.setTimeout(() => setScreen('end'), 650);
      } else {
        window.setTimeout(() => finishNode(node.floor), 550);
      }
      return;
    }
    if (player.hp <= 0) {
      setEnergy((prev) => ({ ...prev, cur: 0 }));
      window.setTimeout(() => setScreen('end'), 450);
    }
  }, [battle?.enemy?.hp, player?.hp, screen]);

  const act = (action) => {
    if (screen !== 'battle') return;
    if (!battle || battle.turn !== 'player' || !player) return;

    const rng = rngRef.current;
    if (action === 'guard') {
      setPlayer((p) => (p ? { ...p, guard: true } : p));
      setBattle((b) => (b ? appendLog({ ...b, turn: 'enemy' }, `${player.digimon.name} se protege.`) : b));
      return;
    }

    if (action === 'heal') {
      if (player.healUsed || player.hp >= player.maxHp) return;
      const gain = 10 + rngInt(rng, 0, 6);
      setPlayer((p) => {
        if (!p) return p;
        return { ...p, hp: clamp(p.hp + gain, 0, p.maxHp), healUsed: true, guard: false };
      });
      setBattle((b) => (b ? appendLog({ ...b, turn: 'enemy' }, `${player.digimon.name} usa cura (+${gain} HP).`) : b));
      return;
    }

    const mult = action === 'skill' ? 1.25 : 1.0;
    const raw = Math.floor((player.atk + rngInt(rng, 0, 3)) * mult);
    const reduced = raw - Math.floor(battle.enemy.def * 0.4);
    const guarded = battle.enemy.guard ? Math.floor(reduced * 0.6) : reduced;
    const dealt = applyDamage({ target: 'enemy', amount: guarded });
    setBattle((b) => (b ? appendLog({ ...b, turn: 'enemy', enemy: { ...b.enemy, guard: false } }, `${player.digimon.name} ${action === 'skill' ? 'usa habilidad' : 'ataca'} e inflige ${dealt}.`) : b));
  };

  const mapView = () => {
    if (!mapState) return null;
    const floors = [];
    for (let f = 0; f < mapState.floorsCount; f += 1) {
      const col = [];
      for (let i = 0; i < mapState.nodesPerFloor; i += 1) {
        const node = mapState.byId[`${f}-${i}`];
        const label = nodeLabel(node.kind);
        const state = node.id === currentNodeId ? 'current' : node.cleared ? 'cleared' : availableNodes.has(node.id) ? 'available' : 'locked';
        const baseSub = node.kind === 'combat' ? 'Combate' : node.kind === 'rest' ? 'Recupera energía' : node.kind === 'loot' ? 'Mejora' : node.kind === 'boss' ? 'Combate duro' : 'Inicio';
        const sub = state === 'available' ? (
          <>
            <span style={{ color: COLORS.primaryDeep, fontWeight: 900 }}>Siguiente nodo</span>
            <span> · {baseSub}</span>
          </>
        ) : (
          baseSub
        );
        col.push(
          <NodeButton
            key={node.id}
            data-nodeid={node.id}
            $state={state}
            onClick={() => handlePickNode(node.id)}
            type="button"
          >
            <NodeCircle data-anchorid={node.id} $state={state}>
              <IconBadge $tone={label.tone}>{label.icon}</IconBadge>
            </NodeCircle>
            <NodeTitle>{label.title}</NodeTitle>
            <NodeSub>{sub}</NodeSub>
          </NodeButton>
        );
      }
      floors.push(
        <FloorCol key={f}>
          <FloorTitle>Piso {f + 1}</FloorTitle>
          {col}
        </FloorCol>
      );
    }

    return (
      <MapWrap>
        <Hint>Para avanzar: completa el nodo y responde al portal. Luego elige el siguiente nodo disponible.</Hint>
        <FloorsCanvas ref={floorsRef}>
          <svg
            width={mapCanvasSize.w}
            height={mapCanvasSize.h}
            viewBox={`0 0 ${mapCanvasSize.w} ${mapCanvasSize.h}`}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}
            aria-hidden="true"
          >
            {mapLines.map((l, idx) => (
              <path
                key={`${idx}-${l.d}`}
                d={l.d}
                fill="none"
                stroke={l.choice ? COLORS.primary : 'rgba(0, 130, 170, 0.35)'}
                strokeWidth={l.choice ? 3.25 : 2.35}
                strokeDasharray={l.dashed ? '7 7' : undefined}
                strokeLinecap="round"
              />
            ))}
          </svg>
          <FloorsGrid $floors={mapState.floorsCount}>{floors}</FloorsGrid>
        </FloorsCanvas>
      </MapWrap>
    );
  };

  const nodeCard = () => {
    if (!mapState || !currentNodeId) return null;
    const node = mapState.byId[currentNodeId];
    const label = nodeLabel(node.kind);
    const floor = node.floor;
    return (
      <Card>
        <CardTitle>
          <H2>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
              <IconBadge $tone={label.tone}>{label.icon}</IconBadge>
              {label.title}
            </span>
          </H2>
          <Sub>{saga?.title} · Piso {floor + 1}</Sub>
        </CardTitle>
        <Hint>
          {saga?.blurb ? `${saga.blurb} ` : ''}
          {node.kind === 'start' && 'Recibes un boost inicial de energía. Luego, portal obligatorio.'}
          {node.kind === 'rest' && 'Respira. Recuperas energía. Luego, portal obligatorio.'}
          {node.kind === 'loot' && 'Elige una mejora para tu Digimon. Luego, portal obligatorio.'}
          {node.kind === 'combat' && 'Encuentro: combate simple 1v1. Luego, portal obligatorio.'}
          {node.kind === 'boss' && 'Jefe final de la run. Si ganas, cierras la run.'}
        </Hint>
        <BarWrap>
          <EnergyBar>
            <EnergyFill $pct={energyPct} />
          </EnergyBar>
          <PillRow>
            <Pill><FaBolt /> Energía: {energy.cur}/{energy.max}</Pill>
            <Pill><FaCrown /> Aciertos: {runMeta.correct}</Pill>
            <Pill><FaSkullCrossbones /> Fallos: {runMeta.wrong}</Pill>
          </PillRow>
        </BarWrap>
      </Card>
    );
  };

  const profileCard = () => {
    if (!player) return null;
    const hpPct = clamp(Math.round((player.hp / player.maxHp) * 100), 0, 100);
    const showHeal = screen === 'battle';
    const healStatus = player.healUsed
      ? 'Gastada'
      : player.hp >= player.maxHp
        ? 'Al máximo'
        : battle?.turn !== 'player'
          ? 'En espera'
          : 'Disponible';
    return (
      <Card>
        <CardTitle>
          <H2>Tu Digimon</H2>
          <Sub>{player.digimon.level}</Sub>
        </CardTitle>
        <FighterTop>
          <FighterAvatar src={player.digimon.img} alt={player.digimon.name} />
          <div>
            <FighterName>{player.digimon.name}</FighterName>
            <FighterMeta>ATK {player.atk} · DEF {player.def}</FighterMeta>
          </div>
        </FighterTop>
        <SmallBar>
          <SmallFill $pct={hpPct} />
        </SmallBar>
        <PillRow>
          <Pill><FaBolt /> HP: {player.hp}/{player.maxHp}</Pill>
          {showHeal && <Pill><FaSyringe /> Cura: {healStatus}</Pill>}
        </PillRow>
      </Card>
    );
  };

  return (
    <Page>
      <Frame>
        <TopBar>
          <BackButton onClick={onBack} type="button">
            <FaArrowLeft /> Volver
          </BackButton>
          <BrandLogo src={`${process.env.PUBLIC_URL}/digilikelogo.png`} alt="Digilike" />
          <div aria-hidden="true" />
        </TopBar>

        {screen === 'start' && (
          <Shell>
            <Card>
              <CardTitle>
                <H2>Elige tu Digimon</H2>
                <Sub>{saga?.title}</Sub>
              </CardTitle>
              <Hint>
                {saga?.blurb ? `${saga.blurb} ` : ''}
                El mapa es procedural. Tras cada nodo, un portal de operaciones decide tu energía.
              </Hint>
              {starterLoading && <Hint>Cargando Digimon…</Hint>}
              {starterError && <Feedback $tone="bad">No se pudo cargar la API: {starterError}. Se usarán placeholders.</Feedback>}
              <StarterGrid>
                {(starterPool.length ? starterPool : STARTERS.map((n) => ({ name: n, img: FALLBACK_IMG, level: 'Desconocido', id: n }))).map((d) => (
                  <DigiCard key={d.name} onClick={() => startNewRun(d)} type="button" disabled={starterLoading}>
                    <DigiImg src={d.img || FALLBACK_IMG} alt={d.name} />
                    <DigiName>{d.name}</DigiName>
                    <DigiMeta>{d.level}</DigiMeta>
                  </DigiCard>
                ))}
              </StarterGrid>
            </Card>

            <Card>
              <CardTitle>
                <H2>Cómo se gana</H2>
                <Sub>Reglas rápidas</Sub>
              </CardTitle>
              <Hint>
                - Completa un nodo.<br />
                - Responde el portal correctamente para recuperar energía.<br />
                - Si fallas, pierdes energía. A 0: fin de run.<br />
                - La run termina en el Jefe final del último piso.
              </Hint>
              <BarWrap>
                <PrimaryButton onClick={() => startNewRun(starterPool[0])} type="button" disabled={starterLoading && !starterPool.length}>
                  Empezar run
                </PrimaryButton>
                <SubtleButton
                  onClick={() => {
                    const next = ADVENTURE_SAGAS[Math.floor(Math.random() * ADVENTURE_SAGAS.length)];
                    setSaga(next);
                  }}
                  type="button"
                >
                  Cambiar saga
                </SubtleButton>
              </BarWrap>
            </Card>
          </Shell>
        )}

        {screen !== 'start' && screen === 'map' && (
          <MapShell>
            <MapAreaNode>{nodeCard()}</MapAreaNode>
            <MapAreaProfile>{profileCard()}</MapAreaProfile>
            <MapAreaMap>
              <Card>
                <CardTitle>
                  <H2>Mapa</H2>
                  <Sub>{saga?.title} · Nodos despejados: {runMeta.cleared}</Sub>
                </CardTitle>
                {mapView()}
              </Card>
            </MapAreaMap>
            <MapAreaStatus>
              <Card>
                <CardTitle>
                  <H2>Estado</H2>
                  <Sub>Seed {seed}</Sub>
                </CardTitle>
                <Hint>Energía decide si sobrevives a la run. Los portales son obligatorios.</Hint>
                <Grid2>
                  <SubtleButton onClick={() => startNewRun(player?.digimon)} type="button">
                    Nueva run
                  </SubtleButton>
                  <SubtleButton onClick={() => setScreen('end')} type="button">
                    Abandonar run
                  </SubtleButton>
                </Grid2>
              </Card>
            </MapAreaStatus>
          </MapShell>
        )}

        {screen !== 'start' && screen !== 'map' && (
          <Shell>
            <ColumnStack>
              {nodeCard()}
              {screen === 'end' && (
                <Card>
                  <CardTitle>
                    <H2>Fin de run</H2>
                    <Sub>Seed {seed}</Sub>
                  </CardTitle>
                  <Hint>
                    Aciertos: {runMeta.correct} · Fallos: {runMeta.wrong} · Nodos: {runMeta.cleared}
                  </Hint>
                  <Grid2>
                    <PrimaryButton onClick={() => setScreen('start')} type="button">
                      Volver a inicio
                    </PrimaryButton>
                    <SubtleButton onClick={() => resetRun(player?.digimon)} type="button">
                      Reintentar run
                    </SubtleButton>
                  </Grid2>
                </Card>
              )}
            </ColumnStack>

            <ColumnStack>
              {profileCard()}

              {screen === 'battle' && (
                <Card>
                  <CardTitle>
                    <H2>Combate</H2>
                    <Sub>{battle?.isBoss ? `Jefe final · ${saga?.bossLabel || 'Amenaza'}` : 'Encuentro'}</Sub>
                  </CardTitle>
                  {!battle && <Hint>Preparando combate…</Hint>}
                  {battle && player && (
                    <BattleGrid>
                      <FighterRow>
                        <FighterCard>
                          <FighterTop>
                            <FighterAvatar src={player.digimon.img} alt={player.digimon.name} />
                            <div>
                              <FighterName>{player.digimon.name}</FighterName>
                              <FighterMeta>ATK {player.atk} · DEF {player.def}</FighterMeta>
                            </div>
                          </FighterTop>
                          <SmallBar>
                            <SmallFill $pct={clamp(Math.round((player.hp / player.maxHp) * 100), 0, 100)} />
                          </SmallBar>
                          <PillRow>
                            <Pill>HP {player.hp}/{player.maxHp}</Pill>
                          </PillRow>
                        </FighterCard>

                        <FighterCard>
                          <FighterTop>
                            <FighterAvatar src={battle.enemy.digimon.img} alt={battle.enemy.digimon.name} />
                            <div>
                              <FighterName>{battle.enemy.digimon.name}</FighterName>
                              <FighterMeta>ATK {battle.enemy.atk} · DEF {battle.enemy.def}</FighterMeta>
                            </div>
                          </FighterTop>
                          <SmallBar>
                            <SmallFill $pct={clamp(Math.round((battle.enemy.hp / battle.enemy.maxHp) * 100), 0, 100)} />
                          </SmallBar>
                          <PillRow>
                            <Pill>HP {battle.enemy.hp}/{battle.enemy.maxHp}</Pill>
                          </PillRow>
                        </FighterCard>
                      </FighterRow>

                      <Grid2>
                        <PrimaryButton onClick={() => act('attack')} type="button" disabled={battle.turn !== 'player'}>
                          Atacar
                        </PrimaryButton>
                        <SubtleButton onClick={() => act('skill')} type="button" disabled={battle.turn !== 'player'}>
                          Habilidad
                        </SubtleButton>
                        <SubtleButton onClick={() => act('guard')} type="button" disabled={battle.turn !== 'player'}>
                          Proteger
                        </SubtleButton>
                        <SubtleButton onClick={() => act('heal')} type="button" disabled={battle.turn !== 'player' || player.healUsed || player.hp >= player.maxHp}>
                          Curar
                        </SubtleButton>
                      </Grid2>

                      <Log>
                        {battle.log.map((l, idx) => (
                          <div key={`${idx}-${l}`}>{l}</div>
                        ))}
                      </Log>
                    </BattleGrid>
                  )}
                </Card>
              )}

              {screen === 'loot' && (
                <Card>
                  <CardTitle>
                    <H2>Botín</H2>
                    <Sub>Elige 1 mejora</Sub>
                  </CardTitle>
                  <Grid2>
                    {(lootChoices || []).map((c) => (
                      <SubtleButton key={c.id} onClick={() => pickLoot(c)} type="button">
                        {c.title}
                      </SubtleButton>
                    ))}
                  </Grid2>
                </Card>
              )}
            </ColumnStack>
          </Shell>
        )}

        {screen === 'question' && pendingQuestion && (
          <Overlay>
            <Modal>
              <ModalHeader>
                <ModalTitle>Portal obligatorio · {saga?.title} · Dificultad {pendingQuestion.difficulty}</ModalTitle>
                <Sub>Energía: {energy.cur}/{energy.max}</Sub>
              </ModalHeader>
              <Prompt>
                <div>{pendingQuestion.prompt}</div>
              </Prompt>
              <div style={{ height: '0.75rem' }} />
              {pendingQuestion.type === 'numeric_input' && (
                <Input
                  inputMode="numeric"
                  value={questionAnswer}
                  onChange={(e) => setQuestionAnswer(e.target.value)}
                  placeholder="Escribe el resultado"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitQuestion();
                  }}
                />
              )}
              {pendingQuestion.type === 'multiple_choice' && (
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  {pendingQuestion.options.map((opt, idx) => (
                    <ChoiceButton key={`${pendingQuestion.id}-${opt}`} onClick={() => submitQuestion({ pickedIndex: idx })} type="button">
                      <span>{opt}</span>
                      <span style={{ color: COLORS.muted, fontWeight: 900 }}>Elegir</span>
                    </ChoiceButton>
                  ))}
                </div>
              )}
              <div style={{ height: '0.75rem' }} />
              {questionFeedback && <Feedback $tone={questionFeedback.tone}>{questionFeedback.text}</Feedback>}
              {!questionFeedback && pendingQuestion.type === 'numeric_input' && (
                <Grid2>
                  <PrimaryButton onClick={() => submitQuestion()} type="button" disabled={String(questionAnswer).trim() === ''}>
                    Abrir portal
                  </PrimaryButton>
                </Grid2>
              )}
            </Modal>
          </Overlay>
        )}
      </Frame>
    </Page>
  );
};

export default DigilikeGame;
