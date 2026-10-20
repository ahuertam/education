import React, { useMemo } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';

// Pantalla de selección de tablas y cifras para los juegos de multiplicación.
// El usuario marca qué tablas quiere practicar (1-20) y, para las tablas >= 10,
// elige si el multiplicando será de 1, 2 o 3 cifras.

const ALL_TABLES = Array.from({ length: 20 }, (_, i) => i + 1);

const BRAND_COLOR = '#9C27B0';

const Page = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #2D1B4E 0%, #4A148C 50%, #6A1B9A 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem 3rem;
  font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
  color: white;
`;

const Header = styled.header`
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  backdrop-filter: blur(5px);
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  text-align: center;
  margin: 0 0 0.5rem;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
`;

const Subtitle = styled.p`
  font-size: 1.05rem;
  margin: 0 0 2rem;
  text-align: center;
  opacity: 0.9;
`;

const Card = styled.section`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(8px);
  width: 100%;
  max-width: 800px;
  box-sizing: border-box;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QuickRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const QuickButton = styled.button`
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.4rem 0.9rem;
  border-radius: 50px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const TablesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0.5rem;

  @media (max-width: 600px) {
    grid-template-columns: repeat(5, 1fr);
  }
`;

const TableToggle = styled.button`
  aspect-ratio: 1;
  border-radius: 12px;
  border: 2px solid ${props => (props.$selected ? BRAND_COLOR : 'rgba(255,255,255,0.25)')};
  background: ${props => (props.$selected ? BRAND_COLOR : 'rgba(255,255,255,0.1)')};
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s;
  box-shadow: ${props => (props.$selected ? '0 4px 12px rgba(156,39,176,0.5)' : 'none')};

  &:hover {
    transform: translateY(-2px);
    background: ${props => (props.$selected ? BRAND_COLOR : 'rgba(255,255,255,0.2)')};
  }
`;

const DigitRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const DigitButton = styled.button`
  flex: 1 1 0;
  min-width: 130px;
  background: ${props => (props.$selected ? BRAND_COLOR : 'rgba(255,255,255,0.1)')};
  border: 2px solid ${props => (props.$selected ? BRAND_COLOR : 'rgba(255,255,255,0.25)')};
  color: white;
  padding: 0.9rem 1rem;
  border-radius: 14px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: bold;
  transition: all 0.2s;

  &:hover {
    background: ${props => (props.$selected ? BRAND_COLOR : 'rgba(255,255,255,0.2)')};
    transform: translateY(-2px);
  }
`;

const DigitNote = styled.p`
  margin: 0.75rem 0 0;
  font-size: 0.85rem;
  opacity: 0.8;
`;

const WarnText = styled.p`
  color: #ffb74d;
  font-size: 0.95rem;
  margin: 0.5rem 0 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
  margin-top: 0.5rem;
`;

const PrimaryButton = styled.button`
  flex: 2;
  background: ${props => (props.disabled ? 'rgba(255,255,255,0.15)' : BRAND_COLOR)};
  border: none;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 50px;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  font-size: 1.1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: ${props => (props.disabled ? 'none' : '0 6px 20px rgba(156,39,176,0.5)')};

  &:hover {
    transform: ${props => (props.disabled ? 'none' : 'translateY(-2px)')};
  }
`;

const SecondaryButton = styled.button`
  flex: 1;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1.05rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.22);
  }
`;

const MultiplicationConfig = ({ config, onChange, onStart, onBack }) => {
  const { tables, digitMode } = config;

  const toggleTable = (n) => {
    const next = tables.includes(n)
      ? tables.filter(t => t !== n)
      : [...tables, n].sort((a, b) => a - b);
    onChange({ tables: next, digitMode });
  };

  const selectRange = (from, to) => {
    const range = [];
    for (let i = from; i <= to; i++) range.push(i);
    onChange({ tables: range, digitMode });
  };

  const clearAll = () => onChange({ tables: [], digitMode });
  const selectAll = () => onChange({ tables: ALL_TABLES, digitMode });

  const setDigitMode = (m) => onChange({ tables, digitMode: m });

  const selectedCount = tables.length;
  const canStart = selectedCount > 0;

  const digitLabel = useMemo(() => {
    if (digitMode === 1) return '1 cifra (1-9)';
    if (digitMode === 2) return '2 cifras (10-99)';
    return '3 cifras (100-999)';
  }, [digitMode]);

  return (
    <Page>
      <Header>
        <BackButton onClick={onBack}>
          <FaArrowLeft /> Volver
        </BackButton>
      </Header>

      <Title>🧮 Configura tu práctica</Title>
      <Subtitle>Elige qué tablas practicar y cómo de grandes serán los números</Subtitle>

      <Card>
        <SectionTitle>📋 Tablas a practicar</SectionTitle>
        <QuickRow>
          <QuickButton onClick={() => selectRange(1, 10)}>Básicas 1-10</QuickButton>
          <QuickButton onClick={selectAll}>Todas</QuickButton>
          <QuickButton onClick={clearAll}>Limpiar</QuickButton>
        </QuickRow>

        <TablesGrid>
          {ALL_TABLES.map(n => {
            const selected = tables.includes(n);
            return (
              <TableToggle
                key={n}
                $selected={selected}
                onClick={() => toggleTable(n)}
                aria-pressed={selected}
                aria-label={`Tabla del ${n}`}
              >
                {n}
                {selected && (
                  <FaCheck
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      fontSize: '0.7rem',
                      opacity: 0.85,
                    }}
                  />
                )}
              </TableToggle>
            );
          })}
        </TablesGrid>

        {!canStart && (
          <WarnText>⚠️ Selecciona al menos una tabla para continuar</WarnText>
        )}
      </Card>

      <Card>
        <SectionTitle>🔢 Tamaño del número (tablas del 10 en adelante)</SectionTitle>
        <DigitRow>
          <DigitButton
            $selected={digitMode === 1}
            onClick={() => setDigitMode(1)}
            aria-pressed={digitMode === 1}
          >
            1 cifra
            <br />
            (1-9)
          </DigitButton>
          <DigitButton
            $selected={digitMode === 2}
            onClick={() => setDigitMode(2)}
            aria-pressed={digitMode === 2}
          >
            2 cifras
            <br />
            (10-99)
          </DigitButton>
          <DigitButton
            $selected={digitMode === 3}
            onClick={() => setDigitMode(3)}
            aria-pressed={digitMode === 3}
          >
            3 cifras
            <br />
            (100-999)
          </DigitButton>
        </DigitRow>
        <DigitNote>
          Esto solo afecta a las tablas del 10 en adelante. Las tablas del 1 al 9 siempre
          usan números de 1 cifra. Modo actual: <strong>{digitLabel}</strong>.
        </DigitNote>
      </Card>

      <Actions>
        <SecondaryButton onClick={onBack}>Atrás</SecondaryButton>
        <PrimaryButton disabled={!canStart} onClick={onStart}>
          <FaCheck /> Empezar ({selectedCount} {selectedCount === 1 ? 'tabla' : 'tablas'})
        </PrimaryButton>
      </Actions>
    </Page>
  );
};

export default MultiplicationConfig;
