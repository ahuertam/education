import { useState, lazy, Suspense } from 'react';
import { GlobalStyle } from './GlobalStyles';
import './App.css';
import Landing from './components/Landing';
import GameSelector from './components/GameSelector';
import MultiplicationConfig from './components/MultiplicationConfig';
import SupportFab from './components/SupportFab';

// Los juegos se cargan bajo demanda. Con imports estáticos el bundle principal
// se llevaba los 26 juegos, Phaser y Matter.js: 566 KB comprimidos que un niño
// tenía que bajar en una tablet del cole antes de ver la primera tarjeta. Así
// la landing y el selector pesan poco y cada juego baja su trozo al abrirlo.
const MemoryGame = lazy(() => import('./components/MemoryGame'));
const SpaceDefenderGame = lazy(() => import('./components/SpaceDefenderGame'));
const FrogJumpGame = lazy(() => import('./components/FrogJumpGame'));
const BubblePopGame = lazy(() => import('./components/BubblePopGame'));
const MathLanderGame = lazy(() => import('./components/MathLanderGame'));
const MathsteroidsGame = lazy(() => import('./components/MathsteroidsGame'));
const MonsterFeederGame = lazy(() => import('./components/MonsterFeederGame'));
const CarRacingGame = lazy(() => import('./components/CarRacingGame'));
const AccentHunterGame = lazy(() => import('./components/AccentHunterGame'));
const KnowledgeTowerGame = lazy(() => import('./components/KnowledgeTowerGame'));
const ShapeGoalkeeperGame = lazy(() => import('./components/ShapeGoalkeeperGame'));
const KitchenGame = lazy(() => import('./components/KitchenGame'));
const HanoiKitchenGame = lazy(() => import('./components/HanoiKitchenGame'));
const DragonTragonGame = lazy(() => import('./components/DragonTragonGame'));
const InmnunoDefenderGame = lazy(() => import('./components/InmnunoDefenderGame'));
const SudokuMathGame = lazy(() => import('./components/SudokuMathGame'));
const FireWaterPuzzlesGame = lazy(() => import('./components/FireWaterPuzzlesGame'));
const SpainRiversLocatorGame = lazy(() => import('./components/SpainRiversLocatorGame'));
const YLaHoraGame = lazy(() => import('./components/YLaHoraGame'));
const SintaxisGame = lazy(() => import('./components/SintaxisGame'));
const TiemposVerbalesGame = lazy(() => import('./components/TiemposVerbalesGame'));
const TiposDeVerbosGame = lazy(() => import('./components/TiposDeVerbosGame'));
const GeometriaMasterGame = lazy(() => import('./components/GeometriaMasterGame'));
const PokemonMathsGame = lazy(() => import('./components/PokemonMathsGame'));
const TsubasaRpgGame = lazy(() => import('./components/TsubasaRpgGame'));
const DigilikeGame = lazy(() => import('./components/DigilikeGame'));
const TyperDungeonGame = lazy(() => import('./components/TyperDungeon/TyperDungeonGame'));
const ElColgadoGame = lazy(() => import('./components/ElColgadoGame'));
const RoscoPalabrasGame = lazy(() => import('./components/RoscoPalabrasGame'));
const JeopardyGame = lazy(() => import('./components/JeopardyGame'));
const BetYourAnswerGame = lazy(() => import('./components/BetYourAnswerGame'));
const TallerFraccionesGame = lazy(() => import('./components/FraccionesGame'));
const ProductosParcialesGame = lazy(() => import('./components/ProductosParcialesGame'));
const RectaNumericaGame = lazy(() => import('./components/RectaNumericaGame'));
const BaseDiezGame = lazy(() => import('./components/BaseDiezGame'));

const DEFAULT_MULT_TABLES = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      fontFamily: 'Comic Sans MS, sans-serif',
      color: '#0b2b45',
      background: 'linear-gradient(135deg, #e0f2f7 0%, #ffffff 100%)',
    }}>
      Cargando…
    </div>
  );
}

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [multiplicationConfig, setMultiplicationConfig] = useState({
    tables: DEFAULT_MULT_TABLES,
    digitMode: 1,
  });

  const handleNavigate = (view, operation = null) => {
    if (operation) setSelectedOperation(operation);
    setCurrentView(view);
  };

  const renderView = () => {
    switch(currentView) {
      case 'landing':
        return <Landing onNavigate={handleNavigate} />;
      case 'multiplication-config':
        return <MultiplicationConfig
          config={multiplicationConfig}
          onChange={setMultiplicationConfig}
          onStart={() => setCurrentView('game-selector')}
          onBack={() => setCurrentView('landing')}
        />;
      case 'game-selector':
        return <GameSelector
          onNavigate={handleNavigate}
          onBack={() => setCurrentView('landing')}
          category={selectedOperation} // We reuse selectedOperation state for category
        />;
      case 'memory':
        return <MemoryGame
          onBack={() => setCurrentView('game-selector')}
          operation={selectedOperation}
          multiplicationConfig={multiplicationConfig}
        />;
      case 'space':
        return <SpaceDefenderGame
          onBack={() => setCurrentView('game-selector')}
          operation={selectedOperation}
          multiplicationConfig={multiplicationConfig}
        />;
      case 'frog':
        return <FrogJumpGame
          onBack={() => setCurrentView('game-selector')}
          operation={selectedOperation}
          multiplicationConfig={multiplicationConfig}
        />;
      case 'bubbles':
        return <BubblePopGame
          onBack={() => setCurrentView('game-selector')}
          operation={selectedOperation}
          multiplicationConfig={multiplicationConfig}
        />;
      case 'mathlander':
        return <MathLanderGame
          onBack={() => setCurrentView('game-selector')}
          operation={selectedOperation}
          multiplicationConfig={multiplicationConfig}
        />;
      case 'mathsteroids':
        return <MathsteroidsGame
          onBack={() => setCurrentView('game-selector')}
          operation={selectedOperation}
          multiplicationConfig={multiplicationConfig}
        />;
      case 'monsterfeeder':
        return <MonsterFeederGame
          onBack={() => setCurrentView('game-selector')}
          operation={selectedOperation}
          multiplicationConfig={multiplicationConfig}
        />;
      case 'carracing':
        return <CarRacingGame
          onBack={() => setCurrentView('game-selector')}
          operation={selectedOperation}
          multiplicationConfig={multiplicationConfig}
        />;
      case 'accenthunter':
        return <AccentHunterGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'knowledgetower':
        return <KnowledgeTowerGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'spainrivers':
        return <SpainRiversLocatorGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'ylahora':
        return <YLaHoraGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'inmnunodefender':
        return <InmnunoDefenderGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'shapegoalkeeper':
        return <ShapeGoalkeeperGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'geometriaMaster':
        return <GeometriaMasterGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'kitchen':
        return <KitchenGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'hanoikitchen':
        return <HanoiKitchenGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'dragontragon':
        return <DragonTragonGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'sudokumath':
        return <SudokuMathGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'firewaterpuzzles':
        return <FireWaterPuzzlesGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'sintaxis':
        return <SintaxisGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'tiemposverbales':
        return <TiemposVerbalesGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'tiposverbos':
        return <TiposDeVerbosGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'pokemonmaths':
        return <PokemonMathsGame
          onBack={() => setCurrentView('game-selector')}
          operation={selectedOperation}
        />;
      case 'tsubasa':
        return <TsubasaRpgGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'digilike':
        return <DigilikeGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'typerdungeon':
        return <TyperDungeonGame
          onBack={() => setCurrentView('landing')}
        />;
      case 'colgado':
        return <ElColgadoGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'roscopalabras':
        return <RoscoPalabrasGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'jeopardy':
        return <JeopardyGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'apuesta':
        return <BetYourAnswerGame
          onBack={() => setCurrentView('game-selector')}
          operation={selectedOperation}
          multiplicationConfig={multiplicationConfig}
        />;
      case 'tallerfracciones':
        return <TallerFraccionesGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'productosparciales':
        return <ProductosParcialesGame
          onBack={() => setCurrentView('game-selector')}
          multiplicationConfig={multiplicationConfig}
        />;
      case 'rectanumerica':
        return <RectaNumericaGame
          onBack={() => setCurrentView('game-selector')}
        />;
      case 'basediez':
        return <BaseDiezGame
          onBack={() => setCurrentView('game-selector')}
        />;
      default:
        return <Landing onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="App">
      <GlobalStyle />
      <Suspense fallback={<LoadingScreen />}>
        {renderView()}
      </Suspense>
      {currentView !== 'landing' && currentView !== 'game-selector' && (
        <SupportFab gameId={currentView} operation={selectedOperation} />
      )}
    </div>
  );
}

export default App;
