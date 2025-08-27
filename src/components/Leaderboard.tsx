import React, { useState, useEffect } from 'react';
import './Leaderboard.css';

interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  timestamp: Date;
  nftMinted: boolean;
  nftUrl?: string;
}

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Load mock leaderboard data
    const mockData: LeaderboardEntry[] = [
      {
        id: '1',
        playerName: 'EyeMaster',
        score: 2847,
        timestamp: new Date('2024-01-15'),
        nftMinted: true,
        nftUrl: '#'
      },
      {
        id: '2',
        playerName: 'VisionRunner',
        score: 2156,
        timestamp: new Date('2024-01-14'),
        nftMinted: true,
        nftUrl: '#'
      },
      {
        id: '3',
        playerName: 'IntuitionPro',
        score: 1923,
        timestamp: new Date('2024-01-13'),
        nftMinted: false
      },
      {
        id: '4',
        playerName: 'EyeSeeker',
        score: 1745,
        timestamp: new Date('2024-01-12'),
        nftMinted: true,
        nftUrl: '#'
      },
      {
        id: '5',
        playerName: 'RunnerX_Fan',
        score: 1432,
        timestamp: new Date('2024-01-11'),
        nftMinted: false
      }
    ];
    
    setEntries(mockData);
  }, []);

  const connectWallet = async () => {
    // Mock wallet connection
    console.log('Connecting wallet...');
    setIsConnected(true);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
  };

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>🏆 Leaderboard</h2>
        <div className="wallet-section">
          {!isConnected ? (
            <button className="connect-wallet-btn" onClick={connectWallet}>
              🔗 Connect Wallet
            </button>
          ) : (
            <div className="wallet-connected">
              <span className="wallet-status">✅ Connected</span>
              <button className="disconnect-btn" onClick={disconnectWallet}>
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="leaderboard-list">
        {entries.map((entry, index) => (
          <div key={entry.id} className="leaderboard-entry">
            <div className="entry-rank">
              {index + 1 <= 3 ? (
                <span className={`medal medal-${index + 1}`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </span>
              ) : (
                <span className="rank-number">#{index + 1}</span>
              )}
            </div>
            
            <div className="entry-info">
              <div className="player-name">{entry.playerName}</div>
              <div className="entry-score">{entry.score.toLocaleString()}</div>
              <div className="entry-date">
                {entry.timestamp.toLocaleDateString()}
              </div>
            </div>
            
            <div className="entry-nft">
              {entry.nftMinted ? (
                <a href={entry.nftUrl} className="nft-link" title="View NFT">
                  🎨
                </a>
              ) : (
                <span className="no-nft" title="Not minted">⭕</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="leaderboard-footer">
        <p className="mint-info">
          🎨 Mint your high scores as NFTs to preserve them forever!
        </p>
        <p className="requirement">
          Minimum score of 1000 required to mint
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;