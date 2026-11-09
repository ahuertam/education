// Test de humo de todos los juegos.
//
// Cuatro juegos se rompieron seguidos (sprites que no se veian, un recorte que
// fallaba en silencio, niveles imposibles) y en los cuatro casos la suite
// estaba en verde: no habia ningun test que mirara lo que se ve. Este test
// monta cada juego del catalogo y comprueba que se pinta sin reventar.
//
// Los juegos con canvas (Phaser) no se pueden montar en jsdom y se comprueban
// por otra via: el test de assets del juego de futbol y el de los sprites de
// la mazmorra.

import { render } from '@testing-library/react';
import { GAMES } from '../config/games';

import MemoryGame from './MemoryGame';
import SpaceDefenderGame from './SpaceDefenderGame';
import FrogJumpGame from './FrogJumpGame';
import BubblePopGame from './BubblePopGame';
import MathLanderGame from './MathLanderGame';
import MathsteroidsGame from './MathsteroidsGame';
import MonsterFeederGame from './MonsterFeederGame';
import CarRacingGame from './CarRacingGame';
import PokemonMathsGame from './PokemonMathsGame';
import KnowledgeTowerGame from './KnowledgeTowerGame';
import SpainRiversLocatorGame from './SpainRiversLocatorGame';
import YLaHoraGame from './YLaHoraGame';
import InmnunoDefenderGame from './InmnunoDefenderGame';
import SudokuMathGame from './SudokuMathGame';
import TsubasaRpgGame from './TsubasaRpgGame';
import FraccionesGame from './FraccionesGame';
import ProductosParcialesGame from './ProductosParcialesGame';
import RectaNumericaGame from './RectaNumericaGame';
import BaseDiezGame from './BaseDiezGame';
import TablaNumerosGame from './TablaNumerosGame';
import DineroGame from './DineroGame';
import AccentHunterGame from './AccentHunterGame';
import SintaxisGame from './SintaxisGame';
import TiemposVerbalesGame from './TiemposVerbalesGame';
import TiposDeVerbosGame from './TiposDeVerbosGame';
import ElColgadoGame from './ElColgadoGame';
import RoscoPalabrasGame from './RoscoPalabrasGame';
import JeopardyGame from './JeopardyGame';
import ShapeGoalkeeperGame from './ShapeGoalkeeperGame';
import GeometriaMasterGame from './GeometriaMasterGame';
import KitchenGame from './KitchenGame';
import HanoiKitchenGame from './HanoiKitchenGame';
import DigilikeGame from './DigilikeGame';
import DragonTragonGame from './DragonTragonGame';
import FireWaterPuzzlesGame from './FireWaterPuzzlesGame';
import GeoboardGame from './GeoboardGame';
import PatronesGame from './PatronesGame';
import TyperDungeonGame from './TyperDungeon/TyperDungeonGame';

const COMPONENTES = {
  memory: MemoryGame,
  space: SpaceDefenderGame,
  frog: FrogJumpGame,
  bubbles: BubblePopGame,
  mathlander: MathLanderGame,
  mathsteroids: MathsteroidsGame,
  monsterfeeder: MonsterFeederGame,
  carracing: CarRacingGame,
  pokemonmaths: PokemonMathsGame,
  knowledgetower: KnowledgeTowerGame,
  spainrivers: SpainRiversLocatorGame,
  ylahora: YLaHoraGame,
  inmnunodefender: InmnunoDefenderGame,
  sudokumath: SudokuMathGame,
  tsubasa: TsubasaRpgGame,
  tallerfracciones: FraccionesGame,
  productosparciales: ProductosParcialesGame,
  rectanumerica: RectaNumericaGame,
  basediez: BaseDiezGame,
  tablanumeros: TablaNumerosGame,
  dinero: DineroGame,
  accenthunter: AccentHunterGame,
  sintaxis: SintaxisGame,
  tiemposverbales: TiemposVerbalesGame,
  tiposverbos: TiposDeVerbosGame,
  colgado: ElColgadoGame,
  roscopalabras: RoscoPalabrasGame,
  jeopardy: JeopardyGame,
  shapegoalkeeper: ShapeGoalkeeperGame,
  geometriaMaster: GeometriaMasterGame,
  kitchen: KitchenGame,
  hanoikitchen: HanoiKitchenGame,
  digilike: DigilikeGame,
  dragontragon: DragonTragonGame,
  firewaterpuzzles: FireWaterPuzzlesGame,
  geoboard: GeoboardGame,
  patrones: PatronesGame,
  typerdungeon: TyperDungeonGame,
};

// Los que dibujan en un canvas con Phaser: jsdom no tiene canvas.
const CON_CANVAS = new Set(['mathlander', 'mathsteroids', 'dragontragon', 'firewaterpuzzles']);

const props = {
  onBack: () => {},
  operation: 'addition',
  multiplicationConfig: { tables: [1, 2, 3, 4, 5], digitMode: 1 },
};

describe('test de humo del catálogo', () => {
  it('todo juego del catálogo tiene su componente en el test', () => {
    const idsCatalogo = GAMES.map((g) => g.id).sort();
    const idsTest = Object.keys(COMPONENTES).sort();
    expect(idsTest).toEqual(idsCatalogo);
  });

  for (const juego of GAMES) {
    if (CON_CANVAS.has(juego.id)) continue;
    it(`${juego.id} se monta y se pinta`, () => {
      const Componente = COMPONENTES[juego.id];
      const { container, unmount } = render(<Componente {...props} />);
      expect(container.firstChild).toBeTruthy();
      unmount();
    });
  }
});
