import React from 'react';
import styled from 'styled-components';
import DungeonBackground from './DungeonBackground';
import HeroSprite from '../sprites/HeroSprite';

// El mapa del piso: una tira con las salas que hay y por donde va el heroe.
//
// Antes el piso era una lista que se recorría sola y solo se veia un
// mensaje ("el heroe avanza por la oscuridad..."): no habia ninguna idea de
// lo que venia. Con el mapa se ve cuantas salas quedan, donde esta el
// tesoro y en que sala espera el proximo monstruo.

const Mapa = styled.div`
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: stretch;
  padding: 8px;
  background: rgba(0, 0, 0, 0.55);
  border: 2px solid #5a4020;
  border-radius: 6px;
  max-width: 100%;
  overflow-x: auto;
`;

const Sala = styled.div`
  position: relative;
  width: 82px;
  height: 54px;
  border: 2px solid ${props => (props.$actual ? '#f0d080' : '#3a2808')};
  border-radius: 4px;
  overflow: hidden;
  opacity: ${props => (props.$hecha ? 0.4 : 1)};
  filter: ${props => (props.$actual ? 'brightness(1.2)' : 'none')};
  box-shadow: ${props => (props.$actual ? '0 0 10px rgba(240,208,128,0.5)' : 'none')};
`;

const Marca = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #f0d080;
  text-shadow: 0 1px 3px #000;
  pointer-events: none;
`;

const HeroEnSala = styled.div`
  position: absolute;
  left: 50%;
  bottom: -2px;
  transform: translateX(-50%);
  pointer-events: none;
`;

const PisoBadge = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 0.6rem;
  color: #a08040;
  letter-spacing: 1px;
  text-transform: uppercase;
  white-space: nowrap;
  align-self: center;
  padding-right: 4px;
`;

// Lo que se ve en cada tipo de sala.
const MARCAS = {
  monster: '!',
  treasure: '★',
  stairs: '▼',
  empty: '',
};

export default function MapaPiso({ map = [], roomIndex = 0, floor = 1 }) {
  if (!map.length) return null;
  return (
    <Mapa aria-label={`Mapa del piso ${floor}`}>
      <PisoBadge>Piso {floor}</PisoBadge>
      {map.map((room, i) => (
        <Sala
          key={room.id ?? i}
          $actual={i === roomIndex}
          $hecha={i < roomIndex}
          title={room.type === 'monster' ? 'Un monstruo espera aqui' : room.type === 'treasure' ? 'Hay un tesoro' : room.type === 'stairs' ? 'Las escaleras' : 'Un pasillo'}
        >
          <DungeonBackground bgKey={room.bg} style={{ position: 'absolute', inset: 0 }} />
          {i === roomIndex
            ? <HeroEnSala><HeroSprite state="idle" size={34} label="El héroe en el mapa" /></HeroEnSala>
            : <Marca>{MARCAS[room.type] ?? ''}</Marca>}
        </Sala>
      ))}
    </Mapa>
  );
}
