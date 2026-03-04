import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateGame, login, register } from '../services/api.js';

const LOCAL_STORAGE_PLAYER_KEY = 'spyGame_playerId';
const LOCAL_STORAGE_GAME_KEY = 'spyGame_gameId';

function PlayerJoin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gameId, setGameId] = useState(
    () => window.localStorage.getItem(LOCAL_STORAGE_GAME_KEY) || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login'); // login | register
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password || !gameId) {
      setError('Please enter username, password, and Game ID.');
      return;
    }

    setLoading(true);
    try {
      await validateGame(gameId);
      if (mode === 'register') {
        await register({ username, password, role: 'Player' });
      }
      const loginRes = await login({ username, password });
      const userId = loginRes.data?.user?.id;
      if (userId) {
        window.localStorage.setItem(LOCAL_STORAGE_PLAYER_KEY, userId);
      }
      window.localStorage.setItem(LOCAL_STORAGE_GAME_KEY, gameId);
      navigate('/player/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          (mode === 'register'
            ? 'Failed to register/join. Please try again.'
            : 'Failed to join. Please check credentials and Game ID.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Player Join</h2>
        <div className="button-row">
          <button
            type="button"
            className={`btn ${mode === 'login' ? 'primary' : ''}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`btn ${mode === 'register' ? 'primary' : ''}`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading
              ? mode === 'register'
                ? 'Registering...'
                : 'Logging in...'
              : mode === 'register'
                ? 'Register & Join'
                : 'Login & Join'}
          </button>
          {error && <div className="alert error">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default PlayerJoin;

