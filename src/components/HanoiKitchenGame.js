import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';

const GameContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #140022 0%, #2c003e 100%);
  color: #fff;
  font-family: 'Courier New', Courier, monospace;
  position: relative;
  overflow: hidden;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.45);
  position: relative;
  z-index: 10;
`;

const BackButton = styled.button`
  background: transparent;
  border: 2px solid #00ffb3;
  color: #00ffb3;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
`;

const Score = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #00ffb3;
`;

const Layout = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1rem 2rem;
  display: grid;
  grid-template-columns: 330px 1fr;
  gap: 1rem;
`;

const Panel = styled.div`
  background: rgba(0, 0, 0, 0.45);
  border: 2px solid rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: 1rem;
`;

const Title = styled.h2`
  margin: 0 0 0.5rem;
  color: #ffd166;
`;

const ModeRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 0.75rem 0 0.25rem;
`;

const ModeButton = styled.button`
  flex: 1;
  padding: 0.45rem 0.65rem;
  border-radius: 8px;
  border: 2px solid ${props => props.$active ? 'rgba(0,255,179,0.75)' : 'rgba(255,255,255,0.2)'};
  background: ${props => props.$active ? 'rgba(0,255,179,0.18)' : 'rgba(255,255,255,0.08)'};
  color: white;
  font-weight: bold;
  cursor: pointer;
`;

const List = styled.ol`
  margin: 0.5rem 0 0 1.2rem;
  line-height: 1.35;
`;

const Hint = styled.p`
  margin: 0.7rem 0 0;
  line-height: 1.35;
  color: #d7d7d7;
`;

const Status = styled.div`
  margin-top: 0.8rem;
  padding: 0.6rem;
  border-radius: 8px;
  border: 2px solid ${props => props.$ok ? 'rgba(0,255,140,0.55)' : 'rgba(255,70,70,0.55)'};
  background: ${props => props.$ok ? 'rgba(0,255,140,0.15)' : 'rgba(255,70,70,0.15)'};
  font-weight: bold;
`;

const Arena = styled.div`
  background: rgba(0, 0, 0, 0.35);
  border: 2px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  position: relative;
  min-height: 560px;
  padding: 1rem;
`;

const HookContainer = styled.div`
  position: absolute;
  top: 0;
  left: ${props => props.$x}%;
  transform: translateX(-50%);
  width: 36px;
  height: ${props => props.$height}px;
  transition: left 0.28s ease, height 0.28s ease;
  pointer-events: none;
  z-index: 9;
`;

const HookLine = styled.div`
  width: 4px;
  height: calc(100% - 18px);
  margin: 0 auto;
  background: #aaa;
`;

const HookHead = styled.div`
  width: 36px;
  height: 18px;
  border: 3px solid ${props => props.$holding ? '#00ffb3' : '#aaa'};
  border-top: none;
  border-radius: 0 0 16px 16px;
  box-shadow: ${props => props.$holding ? '0 0 14px rgba(0, 255, 179, 0.55)' : 'none'};
`;

const HookHoldingBadge = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: calc(100% + 6px);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: rgba(0, 255, 179, 0.18);
  border: 2px solid rgba(0, 255, 179, 0.55);
  color: #fff;
  font-weight: bold;
  font-size: 0.85rem;
  white-space: nowrap;
`;

const TowersRow = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 30px;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
`;

const TowerCol = styled.div`
  width: 30%;
  text-align: center;
`;

const TowerName = styled.div`
  margin-bottom: 0.4rem;
  font-weight: bold;
  color: #ffd166;
`;

const TowerBase = styled.div`
  position: relative;
  width: 100%;
  height: 290px;
  background: rgba(255,255,255,0.06);
  border: 2px solid rgba(255,255,255,0.18);
  border-radius: 12px;
  cursor: pointer;
`;

const Pole = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 22px;
  width: 10px;
  height: 220px;
  border-radius: 6px;
  background: #8f8f8f;
`;

const Base = styled.div`
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: 10px;
  height: 14px;
  border-radius: 6px;
  background: #6d4c41;
`;

const Disc = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: ${props => props.$bottom}px;
  width: ${props => props.$width}px;
  height: 22px;
  border-radius: 8px;
  background: ${props => props.$color};
  border: 2px solid rgba(255,255,255,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.86rem;
  font-weight: bold;
  color: #fff;
  flex-direction: ${props => props.$easy ? 'column' : 'row'};
  height: ${props => props.$easy ? '34px' : '22px'};
  line-height: ${props => props.$easy ? 1.05 : 1.2};
  font-size: ${props => props.$easy ? '0.74rem' : '0.86rem'};
  padding-top: ${props => props.$easy ? '2px' : '0'};
`;

const TowerFooter = styled.div`
  margin-top: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const PourButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 0.5rem;
  background: #00a0ff;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
`;

const TowerAmount = styled.div`
  font-size: 0.95rem;
  color: #e7e7e7;
`;

const HOLDING_X = 50;
const TOWER_X = { A: 17, B: 50, C: 83 };
const DISC_INFO = {
  1: { ml: 12, label: '1/8', width: 72, color: '#00bcd4' },
  2: { ml: 25, label: '1/4', width: 104, color: '#8bc34a' },
  3: { ml: 50, label: '1/2', width: 136, color: '#ff9800' },
  4: { ml: 100, label: '1', width: 168, color: '#f44336' }
};
const TARGETS = [37, 62, 75, 87, 112, 125, 137, 150];

const HanoiKitchenGame = ({ onBack }) => {
  const [towers, setTowers] = useState({ A: [4, 3, 2, 1], B: [], C: [] });
  const [holdingDisc, setHoldingDisc] = useState(null);
  const [sourceTower, setSourceTower] = useState(null);
  const [hook, setHook] = useState({ x: HOLDING_X, height: 70 });
  const [targetMl, setTargetMl] = useState(TARGETS[Math.floor(Math.random() * TARGETS.length)]);
  const [usedTowers, setUsedTowers] = useState(new Set());
  const [status, setStatus] = useState('Selecciona una torre para agarrar el disco superior.');
  const [statusOk, setStatusOk] = useState(true);
  const [score, setScore] = useState(0);
  const [hookBusy, setHookBusy] = useState(false);
  const [moves, setMoves] = useState(0);
  const [mode, setMode] = useState('hard');

  const timeoutsRef = useRef([]);

  const addTimeout = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
  };

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  const totalInTower = (towerId) => towers[towerId].reduce((acc, d) => acc + DISC_INFO[d].ml, 0);

  const resetRound = () => {
    clearTimeouts();
    setTowers({ A: [4, 3, 2, 1], B: [], C: [] });
    setHoldingDisc(null);
    setSourceTower(null);
    setHook({ x: HOLDING_X, height: 70 });
    setUsedTowers(new Set());
    setMoves(0);
    setTargetMl(TARGETS[Math.floor(Math.random() * TARGETS.length)]);
    setStatus('Nueva ronda: usa el gancho y aplica reglas de Hanoi.');
    setStatusOk(true);
    setHookBusy(false);
  };

  const animateHook = (towerId, onMiddle) => {
    const targetX = TOWER_X[towerId];
    setHookBusy(true);
    setHook(prev => ({ ...prev, x: targetX, height: 70 }));
    addTimeout(() => {
      setHook(prev => ({ ...prev, x: targetX, height: 190 }));
      addTimeout(() => {
        onMiddle();
        setHook(prev => ({ ...prev, x: targetX, height: 70 }));
        addTimeout(() => {
          setHookBusy(false);
          if (holdingDisc === null) {
            setHook(prev => ({ ...prev, x: targetX }));
          } else {
            setHook(prev => ({ ...prev, x: HOLDING_X }));
          }
        }, 260);
      }, 260);
    }, 260);
  };

  const tryPickup = (towerId) => {
    const stack = towers[towerId];
    if (!stack.length) {
      setStatus('No hay discos en esa torre.');
      setStatusOk(false);
      return;
    }
    animateHook(towerId, () => {
      const top = stack[stack.length - 1];
      setTowers(prev => ({ ...prev, [towerId]: prev[towerId].slice(0, -1) }));
      setHoldingDisc(top);
      setSourceTower(towerId);
      setStatus(`Disco ${DISC_INFO[top].label} agarrado. Elige torre destino.`);
      setStatusOk(true);
    });
  };

  const tryDrop = (towerId) => {
    if (holdingDisc === null) return;
    const stack = towers[towerId];
    const top = stack[stack.length - 1];
    if (top && top < holdingDisc) {
      setStatus('Movimiento inválido: no puedes poner un disco grande sobre uno pequeño.');
      setStatusOk(false);
      return;
    }
    animateHook(towerId, () => {
      setTowers(prev => ({ ...prev, [towerId]: [...prev[towerId], holdingDisc] }));
      const nextUsed = new Set(usedTowers);
      nextUsed.add(sourceTower);
      nextUsed.add(towerId);
      setUsedTowers(nextUsed);
      setHoldingDisc(null);
      setSourceTower(null);
      setMoves(m => m + 1);
      setStatus(`Disco movido. Ahora puedes verter si alguna torre coincide con ${targetMl} ml.`);
      setStatusOk(true);
    });
  };

  const handleTowerClick = (towerId) => {
    if (hookBusy) return;
    if (holdingDisc === null) {
      tryPickup(towerId);
      return;
    }
    tryDrop(towerId);
  };

  const handlePour = (towerId) => {
    if (hookBusy || holdingDisc !== null) {
      setStatus('Termina primero el movimiento del gancho.');
      setStatusOk(false);
      return;
    }
    const total = totalInTower(towerId);
    const usedAll = usedTowers.has('A') && usedTowers.has('B') && usedTowers.has('C');
    if (total === targetMl && usedAll) {
      setScore(s => s + 150);
      setStatus(`✅ Perfecto. Vertiste ${targetMl} ml usando las 3 torres.`);
      setStatusOk(true);
      addTimeout(resetRound, 1800);
      return;
    }
    if (total !== targetMl) {
      setStatus(`❌ Esa torre tiene ${total} ml y necesitas ${targetMl} ml.`);
    } else {
      setStatus('❌ Debes usar exactamente las 3 torres antes de verter.');
    }
    setStatusOk(false);
    setScore(s => Math.max(0, s - 40));
  };

  return (
    <GameContainer>
      <Header>
        <BackButton onClick={onBack}>
          <FaArrowLeft /> Salir
        </BackButton>
        <Score>Hanoi Kitchen · Puntos: {score} · Movimientos: {moves}</Score>
      </Header>

      <Layout>
        <Panel>
          <Title>Hanoi Kitchen</Title>
          <div><strong>Objetivo:</strong> consigue <strong>{targetMl} ml</strong> en una torre y viértelo al caldero.</div>
          <ModeRow>
            <ModeButton $active={mode === 'easy'} onClick={() => setMode('easy')}>
              Fácil
            </ModeButton>
            <ModeButton $active={mode === 'hard'} onClick={() => setMode('hard')}>
              Difícil
            </ModeButton>
          </ModeRow>
          <List>
            <li>Mueve el disco superior con el gancho.</li>
            <li>Regla Hanoi: nunca pongas un disco grande sobre uno pequeño.</li>
            <li>Antes de verter, debes haber usado las 3 torres (A, B y C).</li>
            <li>Pulsa “VERTER AL CALDERO” en la torre correcta.</li>
          </List>
          <Hint>
            {mode === 'easy'
              ? 'Modo fácil: cada pieza muestra entre paréntesis su equivalencia en ml.'
              : 'Modo difícil: solo ves fracciones. Convierte mentalmente a ml.'}
          </Hint>
          <Status $ok={statusOk}>{status}</Status>
        </Panel>

        <Arena>
          <HookContainer $x={holdingDisc ? HOLDING_X : hook.x} $height={hook.height}>
            <HookLine />
            <HookHead $holding={holdingDisc !== null} />
            {holdingDisc !== null && (
              <HookHoldingBadge>
                {mode === 'easy'
                  ? `${DISC_INFO[holdingDisc].label} (${DISC_INFO[holdingDisc].ml} ml)`
                  : DISC_INFO[holdingDisc].label}
              </HookHoldingBadge>
            )}
          </HookContainer>

          <TowersRow>
            {['A', 'B', 'C'].map((towerId) => (
              <TowerCol key={towerId}>
                <TowerName>Torre {towerId}</TowerName>
                <TowerBase onClick={() => handleTowerClick(towerId)}>
                  <Pole />
                  <Base />
                  {towers[towerId].map((disc, idx) => {
                    const info = DISC_INFO[disc];
                    return (
                      <Disc
                        key={`${towerId}-${disc}-${idx}`}
                        $bottom={24 + (idx * 24)}
                        $width={info.width}
                        $color={info.color}
                        $easy={mode === 'easy'}
                      >
                        {mode === 'easy' ? (
                          <>
                            <div>{info.label}</div>
                            <div>({info.ml} ml)</div>
                          </>
                        ) : (
                          info.label
                        )}
                      </Disc>
                    );
                  })}
                </TowerBase>
                <TowerFooter>
                  <TowerAmount>{totalInTower(towerId)} ml</TowerAmount>
                  <PourButton onClick={() => handlePour(towerId)}>
                    VERTER AL CALDERO
                  </PourButton>
                </TowerFooter>
              </TowerCol>
            ))}
          </TowersRow>
        </Arena>
      </Layout>
    </GameContainer>
  );
};

export default HanoiKitchenGame;
