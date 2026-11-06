// La escena de combate es donde se ve si el juego se siente como una sala o
// como un menú con un dibujo. Estos tests comprueban que los sprites están
// plantados en el suelo y no en una barra de la interfaz.

import { render, screen } from '@testing-library/react';
import BattleScene from './BattleScene';
import { MONSTERS } from '../data/monsters';

const goblin = MONSTERS.goblin;

const estado = (extra = {}) => ({
  hero: { hp: 8, maxHp: 10 },
  monster: goblin,
  monsterHp: 2,
  monsterMaxHp: goblin.hp,
  currentWord: 'casa',
  config: { language: 'es', difficulty: 'normal', totalFloors: 5, timeLimit: 12, heroes: 1 },
  floor: 2,
  map: [{ type: 'monster', bg: 'battle', monster: goblin }],
  roomIndex: 0,
  phase: 'battle',
  ...extra,
});

describe('BattleScene', () => {
  it('dibuja al héroe y al monstruo en la misma sala', () => {
    render(<BattleScene state={estado()} dispatch={() => {}} />);
    // Los dos sprites están en la sala, con su nombre para el lector de
    // pantalla.
    expect(screen.getByRole('img', { name: 'El héroe' })).toBeTruthy();
    expect(screen.getByRole('img', { name: /El monstruo/ })).toBeTruthy();
  });

  it('muestra el nombre de la mazmorra en el HUD', () => {
    render(<BattleScene state={estado()} dispatch={() => {}} />);
    expect(screen.getByText(/Mazmorra 2 \/ 5/)).toBeTruthy();
    expect(screen.getByText(/El Pozo de las Brasas/)).toBeTruthy();
  });

  it('avisa del reloj compartido cuando se juega en equipo', () => {
    render(
      <BattleScene
        state={estado({
          config: { language: 'es', difficulty: 'normal', totalFloors: 5, timeLimit: 12, heroes: 2 },
        })}
        dispatch={() => {}}
      />
    );
    expect(screen.getByText(/reloj del equipo/)).toBeTruthy();
    expect(screen.getByText(/En equipo: 2/)).toBeTruthy();
  });

  it('el reloj en solitario es el de la palabra, no el del equipo', () => {
    render(<BattleScene state={estado()} dispatch={() => {}} />);
    expect(screen.queryByText(/reloj del equipo/)).toBeNull();
  });
});
