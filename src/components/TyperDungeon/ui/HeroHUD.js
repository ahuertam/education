import React from 'react';
import styled, { keyframes, css } from 'styled-components';

const pulse = keyframes`
  0%,100% { opacity:1; }
  50%      { opacity:0.5; }
`;

const HUD = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  background: rgba(0,0,0,0.6);
  border: 2px solid #5a4020;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: #f0d080;
  font-size: 0.75rem;
  user-select: none;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Label = styled.span`
  min-width: 24px;
  font-weight: bold;
  color: #c08030;
`;

const BarTrack = styled.div`
  flex: 1;
  height: 10px;
  background: #1a0a00;
  border: 1px solid #5a4020;
  border-radius: 2px;
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  width: ${props => props.$pct}%;
  background: ${props => props.$pct > 50 ? '#30c040' : props.$pct > 25 ? '#d0a020' : '#c03020'};
  transition: width 0.3s ease;
  ${props => props.$pct <= 25 && css`animation: ${pulse} 0.8s infinite;`}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const HpText = styled.span`
  min-width: 36px;
  text-align: right;
  font-size: 0.7rem;
  color: #e0b060;
`;

const FloorBadge = styled.div`
  font-size: 0.65rem;
  color: #a08040;
  text-align: right;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

export default function HeroHUD({ hp, maxHp, floor, totalFloors }) {
  const pct = Math.max(0, Math.round((hp / maxHp) * 100));
  return (
    <HUD>
      <Row>
        <Label>PV</Label>
        <BarTrack>
          <BarFill $pct={pct} />
        </BarTrack>
        <HpText>{hp}/{maxHp}</HpText>
      </Row>
      <FloorBadge>Piso {floor} / {totalFloors}</FloorBadge>
    </HUD>
  );
}
