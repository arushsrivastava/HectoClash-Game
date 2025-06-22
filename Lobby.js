// src/components/Lobby.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Lobby.css';

const Lobby = () => {
  const [activeGames, setActiveGames] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [globalStats, setGlobalStats] = useState({});
  const [loading, setLoading] = useState(true);

  const { user, logout } = useAuth();
  const { 
    connected, 
    inQueue, 
    queuePosition, 
    joinQueue, 
    leaveQueue, 
    spectateGame,
    onGameStart 
  } = useSocket();

  const navigate = useNavigate();

  // Fetch lobby data
  const fetchLobbyData = useCallback(async () => {
    try {
      const [gamesRes, leaderboardRes, onlineRes, statsRes] = await Promise.all([
        axios.get('/api/games/active'),
        axios.get('/api/games/leaderboard?limit=10'),
        axios.get('/api/users/online?limit=10'),
        axios.get('/api/games/stats/global')
      ]);

      if (gamesRes.data.success) {
        setActiveGames(gamesRes.data.games);
      }

      if (leaderboardRes.data.success) {
        setLeaderboard(leaderboardRes.data.leaderboard);
      }

      if (onlineRes.data.success) {
        setOnlineUsers(onlineRes.data.users);
      }

      if (statsRes.data.success) {
        setGlobalStats(statsRes.data.stats);
      }
    } catch (error) {
      console.error('Error fetching lobby data:', error);
      toast.error('Failed to load lobby data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load lobby data on mount and set up refresh interval
  useEffect(() => {
    fetchLobbyData();

    // Refresh lobby data every 30 seconds
    const interval = setInterval(fetchLobbyData, 30000);

    return () => clearInterval(interval);
  }, [fetchLobbyData]);

  // Handle game start event
  useEffect(() => {
    const cleanup = onGameStart((gameData) => {
      console.log('Game started, navigating to game:', gameData.gameId);
      navigate(`/game/${gameData.gameId}`);
    });

    return cleanup;
  }, [onGameStart, navigate]);

  const handleQuickMatch = () => {
    if (!connected) {
      toast.error('Not connected to server. Please refresh the page.');
      return;
    }

    if (inQueue) {
      leaveQueue();
    } else {
      joinQueue();
    }
  };

  const handleSpectateGame = (gameId) => {
    spectateGame(gameId);
    navigate(`/game/${gameId}?spectate=true`);
  };

  const formatTime = (seconds) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeElapsed = (startTime) => {
    const elapsed = Math.floor((Date.now() - new Date(startTime)) / 1000);
    return formatTime(elapsed);
  };

  const getConnectionStatus = () => {
    if (!connected) return { text: 'Disconnected', class: 'status-error' };
    if (inQueue) return { text: `In Queue (Position ${queuePosition})`, class: 'status-warning' };
    return { text: 'Ready', class: 'status-success' };
  };

  const connectionStatus = getConnectionStatus();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading lobby...</p>
      </div>
    );
  }

  return (
    <div className="lobby-container">
      {/* Header */}
      <header className="lobby-header">
        <div className="header-content">
          <h1>HectoClash</h1>
          <div className="player-info">
            <span className="player-name">{user.username}</span>
            <span className="rating">Rating: {user.rating}</span>
            <span className={`connection-status ${connectionStatus.class}`}>
              {connectionStatus.text}
            </span>
            <div className="header-actions">
              <button
                className="btn btn--outline btn--sm"
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                Profile
              </button>
              <button
                className="btn btn--outline btn--sm"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="lobby-main">
        <div className="lobby-grid">
          {/* Quick Actions */}
          <section className="lobby-section">
            <div className="card">
              <div className="card__body">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button
                    className={`btn ${inQueue ? 'btn--secondary' : 'btn--primary'} btn--full-width`}
                    onClick={handleQuickMatch}
                    disabled={!connected}
                  >
                    {inQueue ? 'Cancel Matchmaking' : 'Find Quick Match'}
                  </button>

                  <button
                    className="btn btn--outline btn--full-width"
                    onClick={() => navigate('/practice')}
                  >
                    Practice Mode
                  </button>

                  <button
                    className="btn btn--outline btn--full-width"
                    onClick={() => navigate('/leaderboard')}
                  >
                    View Full Leaderboard
                  </button>
                </div>

                {inQueue && (
                  <div className="queue-info">
                    <p>🔍 Searching for opponent...</p>
                    <p>Position in queue: <strong>{queuePosition}</strong></p>
                    <div className="loading-spinner small"></div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Active Games */}
          <section className="lobby-section">
            <div className="card">
              <div className="card__body">
                <h3>Active Games</h3>
                <div className="games-list">
                  {activeGames.length === 0 ? (
                    <div className="empty-state">
                      <p>No active games right now.</p>
                      <p>Start a match to see games here!</p>
                    </div>
                  ) : (
                    activeGames.map((game) => (
                      <div key={game.gameId} className="game-item">
                        <div className="game-info">
                          <div className="game-players">
                            {game.players[0]?.username} ({game.players[0]?.rating})
                            <span className="vs">vs</span>
                            {game.players[1]?.username} ({game.players[1]?.rating})
                          </div>
                          <div className="game-details">
                            <span>Puzzle: {game.puzzle.sequence}</span>
                            <span>Time: {formatTimeElapsed(game.startTime)}</span>
                            <span>Spectators: {game.spectatorCount}</span>
                          </div>
                        </div>
                        <button
                          className="btn btn--sm btn--outline spectate-btn"
                          onClick={() => handleSpectateGame(game.gameId)}
                        >
                          Spectate
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Leaderboard */}
          <section className="lobby-section">
            <div className="card">
              <div className="card__body">
                <h3>Top Players</h3>
                <div className="leaderboard">
                  {leaderboard.map((player) => (
                    <div key={player.username} className="leaderboard-item">
                      <span className="leaderboard-rank">#{player.rank}</span>
                      <span 
                        className="leaderboard-name"
                        onClick={() => navigate(`/profile/${player.username}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        {player.username}
                      </span>
                      <span className="leaderboard-rating">{player.rating}</span>
                    </div>
                  ))}
                </div>
                {leaderboard.length === 0 && (
                  <div className="empty-state">
                    <p>No players on leaderboard yet.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Your Statistics */}
          <section className="lobby-section">
            <div className="card">
              <div className="card__body">
                <h3>Your Statistics</h3>
                <div className="stats-grid">
                  <div className="stat">
                    <span className="stat-value">{user.statistics.gamesPlayed}</span>
                    <span className="stat-label">Games Played</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">
                      {user.statistics.gamesPlayed > 0 
                        ? Math.round((user.statistics.gamesWon / user.statistics.gamesPlayed) * 100)
                        : 0}%
                    </span>
                    <span className="stat-label">Win Rate</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">
                      {user.statistics.averageSolveTime 
                        ? formatTime(Math.round(user.statistics.averageSolveTime))
                        : '--'}
                    </span>
                    <span className="stat-label">Avg Solve Time</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">
                      {user.statistics.fastestSolve 
                        ? formatTime(user.statistics.fastestSolve)
                        : '--'}
                    </span>
                    <span className="stat-label">Fastest Solve</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Online Players */}
          <section className="lobby-section">
            <div className="card">
              <div className="card__body">
                <h3>Online Players ({onlineUsers.length})</h3>
                <div className="online-users">
                  {onlineUsers.slice(0, 8).map((player) => (
                    <div 
                      key={player.id} 
                      className="online-user"
                      onClick={() => navigate(`/profile/${player.id}`)}
                    >
                      <span className="user-name">{player.username}</span>
                      <span className="user-rating">{player.rating}</span>
                    </div>
                  ))}
                </div>
                {onlineUsers.length === 0 && (
                  <div className="empty-state">
                    <p>No other players online.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Global Statistics */}
          <section className="lobby-section">
            <div className="card">
              <div className="card__body">
                <h3>Global Stats</h3>
                <div className="global-stats">
                  <div className="global-stat">
                    <span className="stat-value">{globalStats.totalGames || 0}</span>
                    <span className="stat-label">Total Games</span>
                  </div>
                  <div className="global-stat">
                    <span className="stat-value">{globalStats.activeUsers || 0}</span>
                    <span className="stat-label">Players Online</span>
                  </div>
                  <div className="global-stat">
                    <span className="stat-value">{globalStats.activeGames || 0}</span>
                    <span className="stat-label">Active Games</span>
                  </div>
                  <div className="global-stat">
                    <span className="stat-value">{globalStats.gamesLast24h || 0}</span>
                    <span className="stat-label">Games Today</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Lobby;
