import React from 'react';
import GameCanvas from './components/GameCanvas';
import Leaderboard from './components/Leaderboard';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="eye-logo">👁</span>
            <h1>RunnerX</h1>
          </div>
          <p className="subtitle">Intuition Eye Runner</p>
        </div>
      </header>
      
      <main className="main-content">
        <div className="game-section">
          <GameCanvas />
        </div>
        
        <div className="sidebar">
          <Leaderboard />
        </div>
      </main>
    </div>
  );
}

export default App;