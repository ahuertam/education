import React, { useState } from 'react';
import { GlobalStyle } from './GlobalStyles';
import './App.css';
import Landing from './components/Landing';
import MultiplicationSelector from './components/MultiplicationSelector';
import MemoryGame from './components/MemoryGame';
import SpaceDefenderGame from './components/SpaceDefenderGame';
import FrogJumpGame from './components/FrogJumpGame';
import BubblePopGame from './components/BubblePopGame';

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
      case 'multiplication-selector':
        return <MultiplicationSelector 
          onNavigate={handleNavigate} 
          onBack={() => setCurrentView('landing')} 
          operation={selectedOperation}
        />;
      case 'memory':
        return <MemoryGame 
          onBack={() => setCurrentView('multiplication-selector')} 
          operation={selectedOperation}
        />;
      case 'space':
        return <SpaceDefenderGame 
          onBack={() => setCurrentView('multiplication-selector')} 
          operation={selectedOperation}
        />;
      case 'frog':
        return <FrogJumpGame 
          onBack={() => setCurrentView('multiplication-selector')} 
          operation={selectedOperation}
        />;
      case 'bubbles':
        return <BubblePopGame 
          onBack={() => setCurrentView('multiplication-selector')} 
          operation={selectedOperation}
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