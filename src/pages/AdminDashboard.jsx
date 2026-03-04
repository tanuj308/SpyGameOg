import React, { useState, useEffect } from 'react';
import { createGame, startGame, getGameStatus } from '../services/api.js';

const LOCAL_STORAGE_GAME_KEY = 'spyGame_adminGameId';

function AdminDashboard() {
  const [playerIdsInput, setPlayerIdsInput] = useState('');
  const [word1, setWord1] = useState('');
  const [word2, setWord2] = useState('');
  const [numSpies, setNumSpies] = useState(1);
  const [gameId, setGameId] = useState(
    () => window.localStorage.getItem(LOCAL_STORAGE_GAME_KEY) || ''
  );
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (gameId) {
      window.localStorage.setItem(LOCAL_STORAGE_GAME_KEY, gameId);
      fetchStatus(gameId);
    }
  }, [gameId]);

  const handleCreateGame = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const trimmed = playerIdsInput.trim();
    if (!trimmed || !word1 || !word2 || !numSpies) {
      setError('Please fill in all fields.');
      return;
    }

    const playerIds = trimmed
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (playerIds.length === 0) {
      setError('Please provide at least one player ID.');
      return;
    }

    setLoading(true);
    try {
      const response = await createGame({
        playerIds,
        word1,
        word2,
        numSpies: Number(numSpies),
      });
      const newGameId = response.data.gameId || response.data.id;
      setGameId(newGameId || '');
      setSuccessMessage(
        newGameId
          ? `Game created. Game ID: ${newGameId}`
          : 'Game created successfully.'
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to create game.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!gameId) {
      setError('No Game ID found. Create a game first.');
      return;
    }
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      await startGame(gameId);
      setSuccessMessage('Game started.');
      await fetchStatus(gameId);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to start game.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async (id = gameId) => {
    if (!id) return;
    try {
      const response = await getGameStatus(id);
      setStatus(response.data);
    } catch (err) {
      // Silent status fetch failure to avoid constant alerts
    }
  };

  const handleRefreshStatus = async () => {
    setError('');
    setSuccessMessage('');
    await fetchStatus();
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Admin Dashboard</h2>

        <form onSubmit={handleCreateGame} className="form">
          <div className="form-group">
            <label>Player IDs (comma separated)</label>
            <input
              type="text"
              value={playerIdsInput}
              onChange={(e) => setPlayerIdsInput(e.target.value)}
              placeholder="player1, player2, player3"
            />
          </div>
          <div className="form-group">
            <label>Word 1 (Citizens)</label>
            <input
              type="text"
              value={word1}
              onChange={(e) => setWord1(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Word 2 (Spy)</label>
            <input
              type="text"
              value={word2}
              onChange={(e) => setWord2(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Number of Spies</label>
            <input
              type="number"
              min="1"
              value={numSpies}
              onChange={(e) => setNumSpies(e.target.value)}
            />
          </div>
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Game'}
          </button>
        </form>

        <div className="section">
          <h3>Game Controls</h3>
          <div className="form-group">
            <label>Current Game ID</label>
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Game ID"
            />
          </div>
          <button
            type="button"
            className="btn"
            onClick={handleStartGame}
            disabled={loading || !gameId}
          >
            Start Game
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={handleRefreshStatus}
            disabled={!gameId}
          >
            Refresh Status
          </button>
        </div>

        {error && <div className="alert error">{error}</div>}
        {successMessage && (
          <div className="alert success">{successMessage}</div>
        )}
      </div>

      {status && (
        <div className="card">
          <h3>Current Game Status</h3>
          <p>
            <strong>Game ID:</strong> {status.gameId || gameId}
          </p>
          <p>
            <strong>Status:</strong> {status.status}
          </p>
          <p>
            <strong>Current Round:</strong> {status.currentRound}
          </p>
          {typeof status.numSpies !== 'undefined' && (
            <p>
              <strong>Number of Spies:</strong> {status.numSpies}
            </p>
          )}

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Player ID</th>
                  <th>Role</th>
                  <th>Alive</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {(status.players || []).map((p) => (
                  <tr key={p.id || p.user || p.playerId}>
                    <td>{p.id || p.user || p.playerId}</td>
                    <td>{p.role}</td>
                    <td>{p.isAlive ? 'Yes' : 'No'}</td>
                    <td>{typeof p.points !== 'undefined' ? p.points : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {Array.isArray(status.history) && status.history.length > 0 && (
            <div className="section">
              <h4>Elimination History</h4>
              <ul className="list">
                {status.history.map((h) => (
                  <li key={h.round}>
                    Round {h.round}: Player {h.eliminatedPlayer} (
                    {h.eliminatedRole})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {status.winner && (
            <div className="alert info">
              Winner: <strong>{status.winner}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

