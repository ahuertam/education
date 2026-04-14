import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  color: white;
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.8rem 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  backdrop-filter: blur(6px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateX(-4px);
  }
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 2rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

export const Card = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
`;

export const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  gap: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.75rem;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const Label = styled.div`
  font-weight: 600;
  opacity: 0.95;
`;

export const Input = styled.input`
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  outline: none;

  &:focus {
    border-color: rgba(45, 156, 219, 0.8);
    box-shadow: 0 0 0 3px rgba(45, 156, 219, 0.2);
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
`;

export const Button = styled.button`
  background: ${p => (p.$variant === 'primary' ? '#2ED47A' : 'rgba(255, 255, 255, 0.18)')};
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: white;
  padding: 0.75rem 1.05rem;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-weight: 700;

  &:hover {
    transform: translateY(-1px);
    background: ${p => (p.$variant === 'primary' ? '#29c56f' : 'rgba(255, 255, 255, 0.26)')};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }
`;

export const Segmented = styled.div`
  display: inline-flex;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  overflow: hidden;
`;

export const Seg = styled.button`
  background: ${p => (p.$active ? 'rgba(45, 156, 219, 0.35)' : 'transparent')};
  border: none;
  color: white;
  padding: 0.65rem 0.9rem;
  cursor: pointer;
  font-weight: 700;

  &:hover {
    background: ${p => (p.$active ? 'rgba(45, 156, 219, 0.45)' : 'rgba(255, 255, 255, 0.10)')};
  }
`;

export const KeyGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
`;

export const KeyTable = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const KeyCard = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  padding: 1rem;
`;

export const KeyTitle = styled.div`
  font-weight: 800;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Chip = styled.span`
  font-size: 0.85rem;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: ${p => p.$bg};
  border: 1px solid rgba(255, 255, 255, 0.12);
`;

export const KeyRow = styled.div`
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.6rem;
`;

export const KeyButton = styled.button`
  width: 100%;
  text-align: center;
  background: ${p => (p.$capturing ? 'rgba(255, 59, 92, 0.25)' : 'rgba(255, 255, 255, 0.14)')};
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 800;
  transition: all 0.15s ease;

  &:hover {
    background: ${p => (p.$capturing ? 'rgba(255, 59, 92, 0.35)' : 'rgba(255, 255, 255, 0.22)')};
    transform: translateY(-1px);
  }
`;

export const Muted = styled.div`
  opacity: 0.85;
  line-height: 1.6;
`;

export const OverlayShade = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  z-index: 20;
`;

export const OverlayCard = styled.div`
  width: min(520px, 100%);
  background: rgba(18, 26, 51, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 18px;
  padding: 1.25rem;
  backdrop-filter: blur(14px);
  color: white;
`;

export const OverlayTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.4rem;
`;

export const Hud = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 0.85rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.25);
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);
`;

export const HudLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`;

export const HudTitle = styled.div`
  font-weight: 900;
`;

export const HudMeta = styled.div`
  font-size: 0.9rem;
  opacity: 0.85;
`;

export const GameStage = styled.div`
  min-height: 100vh;
  padding-top: 64px;
`;

export const CanvasPlaceholder = styled.div`
  max-width: 1200px;
  margin: 1rem auto 2rem;
  padding: 1.25rem;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.08);
  color: white;
`;

