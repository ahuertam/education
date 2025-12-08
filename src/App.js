import React, { useState } from 'react';
import { GlobalStyle } from './GlobalStyles';
import './App.css';
import Landing from './components/Landing';
import GameSelector from './components/GameSelector';
import MemoryGame from './components/MemoryGame';
import SpaceDefenderGame from './components/SpaceDefenderGame';
import FrogJumpGame from './components/FrogJumpGame';
import BubblePopGame from './components/BubblePopGame';
import MathLanderGame from './components/MathLanderGame';
import MathsteroidsGame from './components/MathsteroidsGame';
import MonsterFeederGame from './components/MonsterFeederGame';
import CarRacingGame from './components/CarRacingGame';
import AccentHunterGame from './components/AccentHunterGame';
import KnowledgeTowerGame from './components/KnowledgeTowerGame';
import ShapeGoalkeeperGame from './components/ShapeGoalkeeperGame';
import KitchenGame from './components/KitchenGame';
import DragonTragonGame from './components/DragonTragonGame';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [selectedOperation, setSelectedOperation] = useState(null);

  const handleNavigate = (view, operation = null) => {
    if (operation) setSelectedOperation(operation);
    setCurrentView(view);
  };

  const renderView = () => {
    switch(currentView) {
      case 'landing':
        return <Landing onNavigate={handleNavigate} />;
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
        />;
      case 'space':
        return <SpaceDefenderGame 
          onBack={() => setCurrentView('game-selector')} 
          operation={selectedOperation}
        />;
      case 'frog':
        return <FrogJumpGame 
          onBack={() => setCurrentView('game-selector')} 
          operation={selectedOperation}
        />;
      case 'bubbles':
        return <BubblePopGame 
          onBack={() => setCurrentView('game-selector')} 
          operation={selectedOperation}
        />;
      case 'mathlander':
        return <MathLanderGame 
          onBack={() => setCurrentView('game-selector')} 
          operation={selectedOperation}
        />;
      case 'mathsteroids':
        return <MathsteroidsGame 
          onBack={() => setCurrentView('game-selector')} 
          operation={selectedOperation}
        />;
      case 'monsterfeeder':
        return <MonsterFeederGame 
          onBack={() => setCurrentView('game-selector')} 
          operation={selectedOperation}
        />;
      case 'carracing':
        return <CarRacingGame 
          onBack={() => setCurrentView('game-selector')} 
          operation={selectedOperation}
        />;
      case 'accenthunter':
        return <AccentHunterGame 
          onBack={() => setCurrentView('game-selector')} 
        />;
      case 'knowledgetower':
        return <KnowledgeTowerGame 
          onBack={() => setCurrentView('game-selector')} 
        />;
      case 'shapegoalkeeper':
        return <ShapeGoalkeeperGame 
          onBack={() => setCurrentView('game-selector')} 
        />;
      case 'kitchen':
        return <KitchenGame 
          onBack={() => setCurrentView('game-selector')} 
        />;
      case 'dragontragon':
        return <DragonTragonGame 
          onBack={() => setCurrentView('game-selector')} 
        />;
      default:
        return <Landing onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="App">
      <GlobalStyle />
      {renderView()}
    </div>
  );
}

export default App;