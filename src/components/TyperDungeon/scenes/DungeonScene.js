import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import HeroSprite from '../sprites/HeroSprite';
import HeroHUD from '../ui/HeroHUD';
import DungeonBackground from '../ui/DungeonBackground';

const fadeIn = keyframes`
  from { opacity:0; } to { opacity:1; }
`;

const walkPulse = keyframes`
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const DungeonView = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.5s ease;
  overflow: hidden;
`;

const MessageBox = styled.div`
  position: relative;
  z-index: 2;
  background: rgba(0,0,0,0.72);
  border: 2px solid #a08040;
  border-radius: 4px;
  padding: 12px 24px;
  color: #f0d080;
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  text-align: center;
  text-shadow: 0 0 8px rgba(240,208,128,0.4);
  max-width: 80%;
`;

const TreasureGlow = styled.div`
  color: #ffd700;
  font-size: 2.5rem;
  display: block;
  margin-bottom: 8px;
`;

const ControlPanel = styled.div`
  height: 150px;
  background: #0f0a04;
  border-top: 3px solid #5a4020;
  display: flex;
  align-items: stretch;
`;

const HeroPanel = styled.div`
  width: 110px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 8px;
  background: #080501;
  border-right: 2px solid #5a4020;
  flex-shrink: 0;
  ${props => props.$walking && css`animation: ${walkPulse} 0.5s infinite;`}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const StatsPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding: 10px 14px;
`;

const StairsButton = styled.button`
  background: #3a2010;
  border: 2px solid #a08040;
  color: #f0d080;
  padding: 8px 20px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  letter-spacing: 1px;
  &:hover { background: #5a3018; }
`;

const PHASE_MESSAGES = {
  exploring: '…el héroe avanza por la oscuridad…',
  pre_battle: '¡Un enemigo aparece!',
  treasure: '¡Has encontrado un tesoro! +2 PV',
  stairs_found: '¡Unas escaleras descienden a las profundidades!',
};

export default function DungeonScene({ state, dispatch }) {
  const { hero, phase, config, floor, map, roomIndex } = state;
  const room = map[roomIndex] ?? {};
  const msg = PHASE_MESSAGES[phase] ?? '';
  const isWalking = phase === 'exploring';

  return (
    <Wrapper>
      <DungeonView key={room.id}>
        <DungeonBackground bgKey={room.bg} style={{ position: 'absolute', inset: 0 }}>
          <MessageBox>
            {phase === 'treasure' && <TreasureGlow>★</TreasureGlow>}
            {msg}
            {phase === 'stairs_found' && (
              <div style={{ marginTop: 12 }}>
                <StairsButton onClick={() => dispatch({ type: 'DESCEND_STAIRS' })}>
                  ▼ Bajar al siguiente piso
                </StairsButton>
              </div>
            )}
          </MessageBox>
        </DungeonBackground>
      </DungeonView>

      <ControlPanel>
        <HeroPanel $walking={isWalking}>
          <HeroSprite state="idle" size={90} />
        </HeroPanel>
        <StatsPanel>
          <HeroHUD
            hp={hero.hp}
            maxHp={hero.maxHp}
            floor={floor}
            totalFloors={config.totalFloors}
          />
        </StatsPanel>
      </ControlPanel>
    </Wrapper>
  );
}