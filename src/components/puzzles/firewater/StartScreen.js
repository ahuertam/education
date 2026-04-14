import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackButton,
  Button,
  ButtonRow,
  Card,
  Chip,
  Input,
  KeyButton,
  KeyCard,
  KeyGrid,
  KeyRow,
  KeyTable,
  KeyTitle,
  Label,
  Muted,
  Row,
  Seg,
  Segmented,
  SectionTitle,
  Title,
  TopBar,
  TwoCol
} from './styles';
import { formatKeyLabel } from './keymap';
import { normalizeSeed } from './seed';

const StartScreen = ({
  onBack,
  difficulty,
  setDifficulty,
  seed,
  setSeed,
  onStart,
  onRandomSeed,
  keymap,
  setKeymap
}) => {
  const [capturing, setCapturing] = useState(null);
  const capturingRef = useRef(null);
  capturingRef.current = capturing;

  useEffect(() => {
    if (!capturing) return;
    const onKeyDown = (e) => {
      const current = capturingRef.current;
      if (!current) return;
      e.preventDefault();
      e.stopPropagation();
      const nextKey = e.key === 'Spacebar' ? ' ' : e.key;
      setKeymap(prev => {
        const next = {
          ...prev,
          [current.player]: {
            ...prev[current.player],
            [current.action]: nextKey
          }
        };
        return next;
      });
      setCapturing(null);
    };
    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, [capturing, setKeymap]);

  const conflicts = useMemo(() => {
    const fireKeys = Object.values(keymap.fire);
    const waterKeys = Object.values(keymap.water);
    const fireSet = new Set(fireKeys);
    const waterSet = new Set(waterKeys);
    return {
      fire: fireKeys.length !== fireSet.size,
      water: waterKeys.length !== waterSet.size
    };
  }, [keymap]);

  const canStart = useMemo(() => {
    const normalized = normalizeSeed(seed);
    return normalized.length === 0 || normalized.length >= 3;
  }, [seed]);

  return (
    <>
      <TopBar>
        <BackButton onClick={onBack}>Volver</BackButton>
        <Title>Puzzles — Fuego & Agua</Title>
        <div style={{ width: 96 }} />
      </TopBar>
      <TwoCol>
        <Card>
          <SectionTitle>Configura tu partida</SectionTitle>
          <Row>
            <Label>Dificultad</Label>
            <Segmented>
              <Seg $active={difficulty === 'easy'} onClick={() => setDifficulty('easy')}>Fácil</Seg>
              <Seg $active={difficulty === 'medium'} onClick={() => setDifficulty('medium')}>Medio</Seg>
              <Seg $active={difficulty === 'hard'} onClick={() => setDifficulty('hard')}>Difícil</Seg>
            </Segmented>
          </Row>
          <Row>
            <Label>Seed</Label>
            <Input
              value={seed}
              placeholder="ej: aula-7"
              onChange={(e) => setSeed(normalizeSeed(e.target.value))}
            />
          </Row>
          <Muted>
            Si dejas la seed vacía se generará una aleatoria. La misma seed + dificultad crea el mismo nivel.
          </Muted>
          <ButtonRow>
            <Button $variant="primary" onClick={onStart} disabled={!canStart}>
              Jugar
            </Button>
            <Button onClick={onRandomSeed}>Aleatoria</Button>
          </ButtonRow>
        </Card>
        <Card>
          <SectionTitle>Reglas rápidas</SectionTitle>
          <Muted>
            El personaje rojo resiste lava y muere en agua. El personaje azul resiste agua y muere en lava.
            Para ganar, ambos deben llegar a su salida.
            Hay puertas y botones: a veces uno abre el camino del otro.
          </Muted>
        </Card>
      </TwoCol>

      <Card style={{ marginTop: '1.5rem' }}>
        <SectionTitle>Controles</SectionTitle>
        <KeyGrid>
          <KeyTable>
            <KeyCard>
              <KeyTitle>
                <span>Fuego</span>
                <Chip $bg="rgba(255, 90, 60, 0.25)">Rojo</Chip>
              </KeyTitle>
              <KeyRow>
                <Label>Izq</Label>
                <KeyButton
                  $capturing={capturing?.player === 'fire' && capturing?.action === 'left'}
                  onClick={() => setCapturing({ player: 'fire', action: 'left' })}
                >
                  {formatKeyLabel(keymap.fire.left)}
                </KeyButton>
              </KeyRow>
              <KeyRow>
                <Label>Der</Label>
                <KeyButton
                  $capturing={capturing?.player === 'fire' && capturing?.action === 'right'}
                  onClick={() => setCapturing({ player: 'fire', action: 'right' })}
                >
                  {formatKeyLabel(keymap.fire.right)}
                </KeyButton>
              </KeyRow>
              <KeyRow>
                <Label>Saltar</Label>
                <KeyButton
                  $capturing={capturing?.player === 'fire' && capturing?.action === 'jump'}
                  onClick={() => setCapturing({ player: 'fire', action: 'jump' })}
                >
                  {formatKeyLabel(keymap.fire.jump)}
                </KeyButton>
              </KeyRow>
              {conflicts.fire && (
                <Muted style={{ color: '#FF3B5C' }}>Hay teclas repetidas en Fuego.</Muted>
              )}
            </KeyCard>

            <KeyCard>
              <KeyTitle>
                <span>Agua</span>
                <Chip $bg="rgba(60, 168, 255, 0.25)">Azul</Chip>
              </KeyTitle>
              <KeyRow>
                <Label>Izq</Label>
                <KeyButton
                  $capturing={capturing?.player === 'water' && capturing?.action === 'left'}
                  onClick={() => setCapturing({ player: 'water', action: 'left' })}
                >
                  {formatKeyLabel(keymap.water.left)}
                </KeyButton>
              </KeyRow>
              <KeyRow>
                <Label>Der</Label>
                <KeyButton
                  $capturing={capturing?.player === 'water' && capturing?.action === 'right'}
                  onClick={() => setCapturing({ player: 'water', action: 'right' })}
                >
                  {formatKeyLabel(keymap.water.right)}
                </KeyButton>
              </KeyRow>
              <KeyRow>
                <Label>Saltar</Label>
                <KeyButton
                  $capturing={capturing?.player === 'water' && capturing?.action === 'jump'}
                  onClick={() => setCapturing({ player: 'water', action: 'jump' })}
                >
                  {formatKeyLabel(keymap.water.jump)}
                </KeyButton>
              </KeyRow>
              {conflicts.water && (
                <Muted style={{ color: '#FF3B5C' }}>Hay teclas repetidas en Agua.</Muted>
              )}
            </KeyCard>
          </KeyTable>
          <Muted>
            Haz clic en una tecla para cambiarla y luego pulsa la nueva tecla.
          </Muted>
        </KeyGrid>
      </Card>
    </>
  );
};

export default StartScreen;

