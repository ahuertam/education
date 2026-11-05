// Estilos de Digilike. Estaban embebidos en el componente: 600 líneas de CSS
// que lo hacían ilegible.

import styled, { keyframes } from 'styled-components';
import { COLORS } from './data';

export const Page = styled.div`
  min-height: 100vh;
  padding: 1.4rem 1.1rem 3rem;
  color: ${COLORS.ink};
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  background:
    radial-gradient(900px 520px at 20% 30%, rgba(0, 130, 170, 0.18), transparent 60%),
    radial-gradient(850px 540px at 85% 25%, rgba(255, 152, 0, 0.18), transparent 62%),
    linear-gradient(180deg, ${COLORS.sky1} 0%, ${COLORS.sky2} 72%);

  @media (max-width: 980px) {
    padding: 1.1rem 0.95rem 2.4rem;
  }

  @media (max-width: 540px) {
    padding: 1rem 0.8rem 2rem;
  }
`;

export const Frame = styled.div`
  max-width: 1180px;
  margin: 0 auto;
`;

export const TopBar = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

export const BrandLogo = styled.img`
  height: 57px;
  width: auto;
  filter: drop-shadow(0 16px 26px rgba(0, 88, 112, 0.22));
  flex: 0 0 auto;
  justify-self: center;
  grid-column: 2;

  @media (max-width: 520px) {
    height: 48px;
  }
`;

export const BackButton = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.75);
  background: ${COLORS.glass};
  color: ${COLORS.ink};
  padding: 0.7rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-weight: 1000;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;
  justify-self: start;
  grid-column: 1;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.82);
    border-color: rgba(255, 255, 255, 0.9);
  }
`;

export const Shell = styled.div`
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  gap: 1rem;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const ColumnStack = styled.div`
  display: grid;
  gap: 1rem;
  align-content: start;
  align-items: stretch;
`;

export const MapShell = styled.div`
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  gap: 1rem;
  align-items: start;
  grid-template-areas:
    'node profile'
    'map map'
    'status status';

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'node'
      'map'
      'profile'
      'status';
  }
`;

export const MapAreaNode = styled(ColumnStack)`
  grid-area: node;
`;

export const MapAreaProfile = styled(ColumnStack)`
  grid-area: profile;
`;

export const MapAreaMap = styled(ColumnStack)`
  grid-area: map;
`;

export const MapAreaStatus = styled(ColumnStack)`
  grid-area: status;
`;

export const Card = styled.div`
  background: ${COLORS.glass};
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 26px;
  padding: 1.1rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 24px 70px rgba(0, 88, 112, 0.14);
  overflow: hidden;
  position: relative;

  @media (max-width: 980px) {
    border-radius: 22px;
    padding: 1rem;
  }

  @media (max-width: 540px) {
    border-radius: 20px;
    padding: 0.9rem;
  }
`;

export const CardTitle = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 0.9rem;

  @media (max-width: 540px) {
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 0.45rem 0.8rem;
  }
`;

export const H2 = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  letter-spacing: 0.2px;
  font-weight: 900;
`;

export const Sub = styled.div`
  color: ${COLORS.muted};
  font-weight: 800;
`;

export const PillRow = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

export const Pill = styled.div`
  border: 1px solid rgba(0, 88, 112, 0.16);
  background: rgba(255, 255, 255, 0.62);
  border-radius: 999px;
  padding: 0.45rem 0.7rem;
  font-weight: 1000;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: ${COLORS.muted};
`;

export const BarWrap = styled.div`
  display: grid;
  gap: 0.55rem;
  margin-top: 0.95rem;
`;

export const EnergyBar = styled.div`
  height: 14px;
  border-radius: 999px;
  border: 1px solid rgba(0, 88, 112, 0.16);
  background: rgba(255, 255, 255, 0.55);
  overflow: hidden;
`;

export const EnergyFill = styled.div`
  height: 100%;
  width: ${({ $pct }) => `${$pct}%`};
  background: ${({ $pct }) => ($pct >= 55 ? `linear-gradient(90deg, ${COLORS.good}, rgba(0, 130, 170, 0.9))` : $pct >= 25 ? `linear-gradient(90deg, ${COLORS.primary}, rgba(0, 130, 170, 0.85))` : `linear-gradient(90deg, ${COLORS.bad}, ${COLORS.primaryDeep})`)};
  transition: width 180ms ease;
`;

export const Hint = styled.div`
  color: ${COLORS.muted};
  font-weight: 850;
  line-height: 1.3;
`;

export const PrimaryButton = styled.button`
  border: none;
  background: ${COLORS.primary};
  color: #ffffff;
  padding: 0.95rem 1rem;
  border-radius: 18px;
  cursor: pointer;
  font-weight: 900;
  letter-spacing: 0.2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  transition: transform 120ms ease, filter 120ms ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(0.98);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }
`;

export const SubtleButton = styled.button`
  border: 1px solid rgba(0, 88, 112, 0.18);
  background: rgba(255, 255, 255, 0.62);
  color: ${COLORS.ink};
  padding: 0.75rem 0.9rem;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.78);
    border-color: rgba(0, 88, 112, 0.26);
  }
`;

export const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;

export const StarterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;

export const DigiCard = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.62);
  border-radius: 18px;
  padding: 0.75rem;
  cursor: pointer;
  color: ${COLORS.ink};
  display: grid;
  gap: 0.55rem;
  text-align: left;
  transition: transform 130ms ease, background 130ms ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.8);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

export const DigiImg = styled.img`
  width: 100%;
  height: 126px;
  object-fit: contain;
  filter: drop-shadow(0 14px 22px rgba(0, 0, 0, 0.45));
`;

export const DigiName = styled.div`
  font-weight: 1100;
  letter-spacing: 0.2px;
`;

export const DigiMeta = styled.div`
  color: ${COLORS.muted};
  font-weight: 900;
  font-size: 0.9rem;
`;

export const MapWrap = styled.div`
  display: grid;
  gap: 0.85rem;
`;

export const FloorsCanvas = styled.div`
  position: relative;
  overflow: auto;
  padding: 0.7rem 0.2rem 0.9rem;
  scroll-behavior: smooth;
`;

export const FloorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $floors }) => $floors}, minmax(160px, 1fr));
  gap: 1.7rem;
  padding: 0.35rem 0.6rem 0.5rem;
  position: relative;
  z-index: 2;
`;

export const FloorCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.15rem;
  min-width: 160px;
`;

export const FloorTitle = styled.div`
  font-weight: 1000;
  color: ${COLORS.muted};
  font-size: 0.85rem;
  letter-spacing: 0.2px;
  text-transform: uppercase;
`;

export const IconBadge = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  background: ${({ $tone }) => ($tone === 'action' ? COLORS.orangeSoft : $tone === 'map' ? COLORS.blueSoft : $tone === 'loot' ? COLORS.violetSoft : COLORS.blueSoft)};
  color: ${COLORS.ink};
  border: 1px solid rgba(0, 88, 112, 0.12);
`;

export const NodeButton = styled.button`
  border: none;
  background: transparent;
  padding: 0.2rem 0.35rem;
  cursor: ${({ $state }) => ($state === 'available' ? 'pointer' : 'default')};
  display: grid;
  place-items: center;
  gap: 0.55rem;
  text-align: center;
  color: ${COLORS.ink};
  transition: transform 120ms ease, filter 120ms ease;
  opacity: ${({ $state }) => ($state === 'locked' ? 0.55 : 1)};

  &:hover {
    transform: ${({ $state }) => ($state === 'available' ? 'translateY(-1px)' : 'none')};
    filter: ${({ $state }) => ($state === 'available' ? 'brightness(1.03)' : 'none')};
  }
`;

export const NodeCircle = styled.div`
  width: 62px;
  height: 62px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.78);
  border: 2px solid ${({ $state }) => ($state === 'current' ? 'rgba(0, 130, 170, 0.55)' : $state === 'available' ? 'rgba(255, 152, 0, 0.7)' : $state === 'cleared' ? 'rgba(46, 125, 50, 0.45)' : 'rgba(0, 88, 112, 0.16)')};
  box-shadow: 0 18px 46px rgba(0, 88, 112, 0.14);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform 130ms ease, box-shadow 130ms ease;

  ${NodeButton}:hover & {
    transform: ${({ $state }) => ($state === 'available' ? 'scale(1.03)' : 'none')};
    box-shadow: ${({ $state }) => ($state === 'available' ? '0 22px 56px rgba(0, 88, 112, 0.18)' : '0 18px 46px rgba(0, 88, 112, 0.14)')};
  }
`;

export const NodeTitle = styled.div`
  font-weight: 900;
  display: grid;
  gap: 0.1rem;
`;

export const NodeSub = styled.div`
  color: ${COLORS.muted};
  font-weight: 800;
  font-size: 0.85rem;
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 88, 112, 0.28);
  display: grid;
  place-items: center;
  z-index: 20;
  padding: 1rem;
`;

export const Modal = styled.div`
  width: min(680px, 100%);
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 26px;
  box-shadow: 0 30px 110px rgba(0, 88, 112, 0.22);
  padding: 1.1rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: ${fadeIn} 160ms ease both;
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.8rem;
`;

export const ModalTitle = styled.div`
  font-weight: 1200;
  letter-spacing: 0.2px;
  font-size: 1.2rem;
`;

export const Prompt = styled.div`
  border: 1px solid rgba(0, 88, 112, 0.16);
  background: rgba(255, 255, 255, 0.68);
  border-radius: 20px;
  padding: 0.95rem;
  line-height: 1.25;
  display: grid;
  gap: 0.6rem;
`;

export const Input = styled.input`
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(0, 88, 112, 0.18);
  background: rgba(255, 255, 255, 0.76);
  padding: 0.9rem 0.9rem;
  color: ${COLORS.ink};
  font-weight: 1000;
  font-size: 1.05rem;
  outline: none;
`;

export const ChoiceButton = styled.button`
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(0, 88, 112, 0.18);
  background: rgba(255, 255, 255, 0.76);
  padding: 0.85rem 0.85rem;
  color: ${COLORS.ink};
  cursor: pointer;
  font-weight: 1000;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  transition: transform 120ms ease, background 120ms ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.9);
  }
`;

export const Feedback = styled.div`
  font-weight: 1000;
  padding: 0.75rem 0.85rem;
  border-radius: 16px;
  border: 1px solid ${({ $tone }) => ($tone === 'good' ? 'rgba(46, 125, 50, 0.35)' : 'rgba(198, 40, 40, 0.35)')};
  background: ${({ $tone }) => ($tone === 'good' ? 'rgba(46, 125, 50, 0.10)' : 'rgba(198, 40, 40, 0.10)')};
  color: ${COLORS.ink};
`;

export const BattleGrid = styled.div`
  display: grid;
  gap: 0.85rem;
`;

export const FighterRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;

  @media (max-width: 580px) {
    grid-template-columns: 1fr;
  }
`;

export const FighterCard = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.62);
  border-radius: 22px;
  padding: 0.9rem;
  display: grid;
  gap: 0.55rem;
`;

export const FighterTop = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: center;
`;

export const FighterAvatar = styled.img`
  width: 82px;
  height: 82px;
  object-fit: contain;
  filter: drop-shadow(0 14px 22px rgba(0, 88, 112, 0.14));
`;

export const FighterName = styled.div`
  font-weight: 1200;
  letter-spacing: 0.2px;
`;

export const FighterMeta = styled.div`
  color: ${COLORS.muted};
  font-weight: 900;
  font-size: 0.9rem;
`;

export const SmallBar = styled.div`
  height: 12px;
  border-radius: 999px;
  border: 1px solid rgba(0, 88, 112, 0.16);
  background: rgba(255, 255, 255, 0.55);
  overflow: hidden;
`;

export const SmallFill = styled.div`
  height: 100%;
  width: ${({ $pct }) => `${$pct}%`};
  background: ${({ $pct }) => ($pct >= 55 ? `linear-gradient(90deg, ${COLORS.good}, rgba(0, 130, 170, 0.9))` : $pct >= 25 ? `linear-gradient(90deg, ${COLORS.primary}, rgba(0, 130, 170, 0.85))` : `linear-gradient(90deg, ${COLORS.bad}, ${COLORS.primaryDeep})`)};
  transition: width 180ms ease;
`;

export const Log = styled.div`
  border: 1px solid rgba(0, 88, 112, 0.16);
  background: rgba(255, 255, 255, 0.62);
  border-radius: 22px;
  padding: 0.85rem;
  color: ${COLORS.muted};
  font-weight: 850;
  line-height: 1.35;
  max-height: 220px;
  overflow: auto;
  display: grid;
  gap: 0.35rem;
`;
