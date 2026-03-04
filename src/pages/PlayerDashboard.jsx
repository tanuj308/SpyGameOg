import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlayerWord, getGameStatus } from '../services/api.js';

const LOCAL_STORAGE_PLAYER_KEY = 'spyGame_playerId';
const LOCAL_STORAGE_GAME_KEY = 'spyGame_gameId';

function PlayerDashboard() {
  const [word, setWord] = useState('');
  const [numSpies, setNumSpies] = useState(null);
  const [alivePlayers, setAlivePlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const storedPlayerId = window.localStorage.getItem(LOCAL_STORAGE_PLAYER_KEY);
    const storedGameId = window.localStorage.getItem(LOCAL_STORAGE_GAME_KEY);

    if (!storedPlayerId || !storedGameId) {
      navigate('/player/join', { replace: true });
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const [wordRes, statusRes] = await Promise.all([
          getPlayerWord(storedGameId, storedPlayerId),
          getGameStatus(storedGameId),
        ]);

        setWord(wordRes.data.word);

        const status = statusRes.data;
        if (typeof status.numSpies !== 'undefined') {
          setNumSpies(status.numSpies);
        } else if (Array.isArray(status.players)) {
          const spyCount = status.players.filter((p) => p.role === 'Spy').length;
          setNumSpies(spyCount || null);
        }

        if (Array.isArray(status.players)) {
          const alive = status.players.filter((p) => p.isAlive);
          setAlivePlayers(alive);
        } else {
          setAlivePlayers([]);
        }
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            'Failed to load player dashboard.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleGoToVoting = () => {
    navigate('/player/vote');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Player Dashboard</h2>
        {error && <div className="alert error">{error}</div>}
        {!error && (
          <>
            <p>
              <strong>Your Word:</strong> {word || 'Unknown'}
            </p>
            {numSpies !== null && (
              <p>
                <strong>Number of Spies:</strong> {numSpies}
              </p>
            )}
            <div className="section">
              <h3>Alive Players</h3>
              {alivePlayers.length === 0 ? (
                <p>No alive players listed.</p>
              ) : (
                <ul className="list">
                  {alivePlayers.map((p) => (
                    <li key={p.id || p.user || p.playerId}>
                      {p.id || p.user || p.playerId}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button className="btn primary" onClick={handleGoToVoting}>
              Go to Voting Page
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default PlayerDashboard;

