import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGameStatus, submitVote } from '../services/api.js';

const LOCAL_STORAGE_PLAYER_KEY = 'spyGame_playerId';
const LOCAL_STORAGE_GAME_KEY = 'spyGame_gameId';

function VotingPage() {
  const [alivePlayers, setAlivePlayers] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const storedPlayerId = window.localStorage.getItem(LOCAL_STORAGE_PLAYER_KEY);
    const storedGameId = window.localStorage.getItem(LOCAL_STORAGE_GAME_KEY);

    if (!storedPlayerId || !storedGameId) {
      navigate('/player/join', { replace: true });
      return;
    }

    const loadStatus = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getGameStatus(storedGameId);
        const status = res.data;
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
            'Failed to load voting data.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const storedPlayerId = window.localStorage.getItem(LOCAL_STORAGE_PLAYER_KEY);
    const storedGameId = window.localStorage.getItem(LOCAL_STORAGE_GAME_KEY);

    if (!storedPlayerId || !storedGameId) {
      navigate('/player/join', { replace: true });
      return;
    }

    if (!selectedTarget) {
      setError('Please select a player to vote for.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await submitVote(storedGameId, storedPlayerId, selectedTarget);
      navigate('/player/result');
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to submit vote.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading voting options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Voting</h2>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Select a player to eliminate</label>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
            >
              <option value="">-- Choose Player --</option>
              {alivePlayers.map((p) => {
                const id = p.id || p.user || p.playerId;
                return (
                  <option key={id} value={id}>
                    {id}
                  </option>
                );
              })}
            </select>
          </div>
          <button type="submit" className="btn primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Vote'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default VotingPage;

