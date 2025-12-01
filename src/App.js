import React, { useState } from 'react';
import { GlobalStyle } from './GlobalStyles';
import './App.css';
import Landing from './components/Landing';
import MultiplicationSelector from './components/MultiplicationSelector';
import MemoryGame from './components/MemoryGame';
import SpaceDefenderGame from './components/SpaceDefenderGame';

function App() {
  const [currentView, setCurrentView] = useState('landing');

  const renderView = () => {
    switch(currentView) {
      case 'landing':
        return <Landing onNavigate={setCurrentView} />;
      case 'multiplication-selector':
        return <MultiplicationSelector onNavigate={setCurrentView} onBack={() => setCurrentView('landing')} />;
      case 'memory':
        return <MemoryGame onBack={() => setCurrentView('multiplication-selector')} />;
      case 'space':
        return <SpaceDefenderGame onBack={() => setCurrentView('multiplication-selector')} />;
      default:
        return <Landing onNavigate={setCurrentView} />;
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