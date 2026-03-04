import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateGame } from '../services/api.js';

const LOCAL_STORAGE_PLAYER_KEY = 'spyGame_playerId';
const LOCAL_STORAGE_GAME_KEY = 'spyGame_gameId';

function PlayerJoin() {
  const [playerId, setPlayerId] = useState(
    () => window.localStorage.getItem(LOCAL_STORAGE_PLAYER_KEY) || ''
  );
  const [gameId, setGameId] = useState(
    () => window.localStorage.getItem(LOCAL_STORAGE_GAME_KEY) || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!playerId || !gameId) {
      setError('Please enter both Player ID and Game ID.');
      return;
    }

    setLoading(true);
    try {
      await validateGame(gameId);
      window.localStorage.setItem(LOCAL_STORAGE_PLAYER_KEY, playerId);
      window.localStorage.setItem(LOCAL_STORAGE_GAME_KEY, gameId);
      navigate('/player/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to join game. Please check Game ID.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Player Join</h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Player ID</label>
            <input
              type="text"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Game ID</label>
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
            />
          </div>
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Joining...' : 'Join Game'}
          </button>
          {error && <div className="alert error">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default PlayerJoin;

