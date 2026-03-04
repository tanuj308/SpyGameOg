import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoundStatus } from '../services/api.js';

const LOCAL_STORAGE_GAME_KEY = 'spyGame_gameId';

function ResultPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const storedGameId = window.localStorage.getItem(LOCAL_STORAGE_GAME_KEY);
    if (!storedGameId) {
      navigate('/player/join', { replace: true });
      return;
    }

    const loadStatus = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getRoundStatus(storedGameId);
        setStatus(res.data);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            'Failed to load round result.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [navigate]);

  const handleNextRound = () => {
    navigate('/player/dashboard');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading result...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <h2>Round Result</h2>
          <div className="alert error">{error}</div>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const lastHistoryEntry =
    Array.isArray(status.history) && status.history.length > 0
      ? status.history[status.history.length - 1]
      : null;

  let eliminatedPlayerLabel = 'No elimination yet.';
  if (lastHistoryEntry) {
    const eliminatedId = lastHistoryEntry.eliminatedPlayer;
    let displayName = eliminatedId;
    if (Array.isArray(status.players)) {
      const found = status.players.find(
        (p) =>
          p.id === eliminatedId ||
          p.user === eliminatedId ||
          p.playerId === eliminatedId
      );
      if (found && (found.name || found.username)) {
        displayName = found.name || found.username;
      }
    }
    eliminatedPlayerLabel = `${displayName} (${lastHistoryEntry.eliminatedRole})`;
  }

  const gameEnded = status.status === 'Finished' && status.winner;

  return (
    <div className="container">
      <div className="card">
        <h2>Round Result</h2>
        <p>
          <strong>Eliminated Player:</strong> {eliminatedPlayerLabel}
        </p>
        {gameEnded ? (
          <div className="alert info">
            Game Over. Winner: <strong>{status.winner}</strong>
          </div>
        ) : (
          <button className="btn primary" onClick={handleNextRound}>
            Next Round
          </button>
        )}
      </div>
    </div>
  );
}

export default ResultPage;

