import React, { useState, useEffect } from 'react';
import {
  createGame,
  startGame,
  getAdminGameStatus,
  getAllUsers,
} from '../services/api.js';

const LOCAL_STORAGE_GAME_KEY = 'spyGame_adminGameId';

function AdminDashboard() {
  const [word1, setWord1] = useState('');
  const [word2, setWord2] = useState('');
  const [spyCount, setSpyCount] = useState(1);
  const [gameId, setGameId] = useState(
    () => window.localStorage.getItem(LOCAL_STORAGE_GAME_KEY) || ''
  );
  const [status, setStatus] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (gameId) {
      window.localStorage.setItem(LOCAL_STORAGE_GAME_KEY, gameId);
      fetchStatus(gameId);
    }
  }, [gameId]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await getAllUsers();
        setAllUsers(Array.isArray(res.data) ? res.data : []);
      } catch {
        setAllUsers([]);
      }
    };
    loadUsers();
  }, []);

  const handleCreateGame = async () => {
    setError('');
    setSuccessMessage('');

    setLoading(true);
    try {
      const response = await createGame();
      const newGameId =
        response.data?.gameId || response.data?.id || response.data?._id;
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
    if (!word1 || !word2) {
      setError('Please set Word 1 and Word 2 before starting.');
      return;
    }
    if (!selectedPlayerIds.length) {
      setError('Select at least one player before starting.');
      return;
    }
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      await startGame(gameId, {
        playerIds: selectedPlayerIds,
        word1,
        word2,
        spyCount: Number(spyCount),
      });
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
      const response = await getAdminGameStatus(id);
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

        <div className="section">
          <h3>Create Game</h3>
          <button
            type="button"
            className="btn primary"
            onClick={handleCreateGame}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Game'}
          </button>
        </div>

        <form className="form section" onSubmit={(e) => e.preventDefault()}>
          <h3>Lobby Setup</h3>
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
              value={spyCount}
              onChange={(e) => setSpyCount(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Players (registered users)</label>
            {allUsers.length === 0 ? (
              <p>No users found. Create player accounts first.</p>
            ) : (
              <div className="checkbox-list">
                {allUsers
                  .filter((u) => u.role !== 'Admin')
                  .map((u) => {
                    const id = u._id;
                    const checked = selectedPlayerIds.includes(id);
                    return (
                      <label key={id} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSelectedPlayerIds((prev) => {
                              if (prev.includes(id)) {
                                return prev.filter((x) => x !== id);
                              }
                              return [...prev, id];
                            });
                          }}
                        />
                        <span>{u.username}</span>
                      </label>
                    );
                  })}
              </div>
            )}
          </div>
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
            <strong>Game ID:</strong> {status._id || status.gameId || gameId}
          </p>
          <p>
            <strong>Status:</strong> {status.status}
          </p>
          <p>
            <strong>Current Round:</strong> {status.currentRound}
          </p>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Player ID</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Alive</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {(status.players || []).map((p) => (
                  <tr key={p.user?._id || p.user || p.id || p.playerId}>
                    <td>{p.user?._id || p.user || p.id || p.playerId}</td>
                    <td>{p.user?.username || '-'}</td>
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

