import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from '../game/GameEngine';
import './GameCanvas.css';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('runnerx-highscore') || '0');
  });

  const startGame = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.start();
      setGameState('playing');
    }
  }, []);

  const resetGame = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.reset();
      setGameState('menu');
      setScore(0);
    }
  }, []);

  // Handle keyboard input with useCallback to maintain stable reference
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
      event.preventDefault();
      
      if (gameEngineRef.current) {
        // Use a ref to get current game state
        const currentState = gameEngineRef.current.getGameState?.() || 
          (gameEngineRef.current as any).isRunning ? 'playing' : 
          (score > 0 ? 'gameOver' : 'menu');
        
        if (currentState === 'playing') {
          gameEngineRef.current.jump();
        } else {
          startGame();
        }
      }
    }
  }, [startGame, score]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 200;

    // Initialize game engine
    gameEngineRef.current = new GameEngine(ctx, {
      onScoreUpdate: (newScore: number) => {
        setScore(newScore);
      },
      onGameOver: (finalScore: number) => {
        setGameState('gameOver');
        if (finalScore > highScore) {
          setHighScore(finalScore);
          localStorage.setItem('runnerx-highscore', finalScore.toString());
        }
      }
    });


    return () => {
      gameEngineRef.current?.stop();
    };
  }, [highScore]);

  // Separate useEffect for keyboard handling
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="game-canvas-container">
      <div className="game-info">
        <div className="score-display">
          <span>Score: {score.toString().padStart(5, '0')}</span>
          <span>High: {highScore.toString().padStart(5, '0')}</span>
        </div>
      </div>
      
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="game-canvas"
          onClick={gameState !== 'playing' ? startGame : undefined}
        />
        
        {gameState === 'menu' && (
          <div className="game-overlay">
            <div className="game-message">
              <h2>👁 RunnerX</h2>
              <p>Press SPACE or click to start</p>
              <p className="controls">Use SPACE or ↑ to jump</p>
            </div>
          </div>
        )}
        
        {gameState === 'gameOver' && (
          <div className="game-overlay">
            <div className="game-message">
              <h2>Game Over!</h2>
              <p>Score: {score}</p>
              {score === highScore && <p className="new-record">🎉 New High Score!</p>}
              <button className="mint-button" onClick={() => console.log('Mint NFT:', score)}>
                🎨 Mint Score as NFT
              </button>
              <p>Press SPACE or click to restart</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCanvas;