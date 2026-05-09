import styled from 'styled-components';

export const GameContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

export const TopBar = styled.header`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  color: white;
`;

export const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.8rem 1.2rem;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  backdrop-filter: blur(6px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateX(-3px);
  }

  &:focus {
    outline: 3px solid rgba(255, 255, 255, 0.7);
    outline-offset: 3px;
  }
`;

export const Title = styled.h2`
  flex: 1;
  text-align: center;
  font-size: 2.2rem;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

export const Shell = styled.div`
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 1.5rem;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div`
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  padding: 1.25rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 18px 50px rgba(0,0,0,0.25);
`;

export const BigPrompt = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: white;
  letter-spacing: 0.2px;
  margin-bottom: 0.75rem;
`;

export const SubText = styled.div`
  color: rgba(255, 255, 255, 0.92);
  font-size: 1rem;
  line-height: 1.35;
`;

export const ControlsRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

export const PrimaryButton = styled.button`
  background: #22c55e;
  border: none;
  color: #06240f;
  padding: 0.9rem 1.1rem;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 800;
  font-size: 1rem;
  transition: transform 0.15s ease, filter 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.03);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }

  &:focus {
    outline: 3px solid rgba(255, 255, 255, 0.7);
    outline-offset: 3px;
  }
`;

export const SecondaryButton = styled.button`
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
  padding: 0.9rem 1.1rem;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  transition: transform 0.15s ease, background 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.22);
  }

  &:focus {
    outline: 3px solid rgba(255, 255, 255, 0.7);
    outline-offset: 3px;
  }
`;

export const BadgeRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
`;

export const Badge = styled.div`
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.95rem;
`;

export const Feedback = styled.div`
  margin-top: 1rem;
  border-radius: 16px;
  padding: 0.9rem 1rem;
  background: ${p => (p.$tone === 'good' ? 'rgba(34,197,94,0.18)' : p.$tone === 'bad' ? 'rgba(220,38,38,0.18)' : 'rgba(255,255,255,0.14)')};
  border: 1px solid ${p => (p.$tone === 'good' ? 'rgba(34,197,94,0.35)' : p.$tone === 'bad' ? 'rgba(220,38,38,0.35)' : 'rgba(255,255,255,0.20)')};
  color: white;
  font-size: 1.05rem;
  line-height: 1.35;
`;

export const SelectorRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 1rem;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

export const SelectButton = styled.button`
  background: ${p => (p.$active ? 'rgba(255,255,255,0.26)' : 'rgba(255,255,255,0.14)')};
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: white;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease, transform 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.22);
  }

  &:focus {
    outline: 3px solid rgba(255, 255, 255, 0.7);
    outline-offset: 3px;
  }
`;

export const Small = styled.div`
  font-size: 0.95rem;
  opacity: 0.92;
  margin-top: 0.25rem;
  line-height: 1.25;
`;

