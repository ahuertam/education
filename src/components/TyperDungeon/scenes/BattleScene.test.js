// La escena de combate es donde se ve si el juego se siente como una sala o
// como un menú con un dibujo. Estos tests comprueban que los sprites están
// plantados en el suelo y no en una barra de la interfaz.

import { render } from '@testing-library/react';
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
    const { container } = render(<BattleScene state={estado()} dispatch={() => {}} />);
    // Un canvas por sprite. Los dos tienen que estar dentro de la vista de la
    // mazmorra, no uno en la barra de la interfaz.
    const canvases = container.querySelectorAll('canvas');
    expect(canvases.length).toBeGreaterThanOrEqual(2);

    // La barra de control es la última franja; los canvas no deberían estar
    // dentro de ella.
    const barra = [...container.querySelectorAll('div')].find(
      (d) => getComputedStyle(d).borderTopStyle === 'solid'
    );
    if (barra) {
      expect(barra.querySelectorAll('canvas').length).toBe(0);
    }
  });

  it('muestra el nombre de la mazmorra en el HUD', () => {
    const { container } = render(<BattleScene state={estado()} dispatch={() => {}} />);
    expect(container.textContent).toMatch(/Mazmorra 2 \/ 5/);
    expect(container.textContent).toMatch(/El Pozo de las Brasas/);
  });

  it('avisa del reloj compartido cuando se juega en equipo', () => {
    const { container } = render(
      <BattleScene
        state={estado({
          config: { language: 'es', difficulty: 'normal', totalFloors: 5, timeLimit: 12, heroes: 2 },
        })}
        dispatch={() => {}}
      />
    );
    expect(container.textContent).toMatch(/reloj del equipo/);
    expect(container.textContent).toMatch(/En equipo: 2/);
  });

  it('el reloj en solitario es el de la palabra, no el del equipo', () => {
    const { container } = render(<BattleScene state={estado()} dispatch={() => {}} />);
    expect(container.textContent).not.toMatch(/reloj del equipo/);
  });
});
