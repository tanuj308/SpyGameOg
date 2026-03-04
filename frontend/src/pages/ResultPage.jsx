import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameAPI } from '../services/api';

const ResultPage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);

  const loadData = async () => {
    try {
      const res = await gameAPI.getStatus(gameId);
      setStatus(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    loadData();
    const intv = setInterval(loadData, 3000);
    return () => clearInterval(intv);
  }, [gameId]);

  if (!status) return <div>Loading...</div>;

  const lastHistory = status.history && status.history.length > 0 
    ? status.history[status.history.length - 1] 
    : null;
    
  // If we advanced a round, the elimination history for currentRound-1 exists.
  // Unless we tie...
  const isRecentElimination = lastHistory && (lastHistory.round === status.currentRound - 1 || status.status === 'Finished');

  const me = status.players?.find(p => p.user._id === localStorage.getItem('userId'));

  return (
    <div className="card result-card">
      <h2>Round Results</h2>
      
      {status.status === 'Finished' ? (
        <div className="winner-banner">
          <h1>{status.winner} WIN!</h1>
        </div>
      ) : (
        <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
          <p>Game Continues... Advancing to Round {status.currentRound}</p>
        </div>
      )}

      {isRecentElimination && lastHistory ? (
        <div className="elimination-box shadow-box" style={{borderColor: 'var(--alert)'}}>
          <h3 style={{color:'var(--alert)'}}>Player Eliminated</h3>
          <p className="secret-word">{lastHistory.eliminatedPlayer?.username || 'Unknown'}</p>
          <p style={{textAlign:'center'}}>Role Revealed: <strong>{lastHistory.eliminatedRole}</strong></p>
        </div>
      ) : (
        <div className="elimination-box shadow-box" style={{borderColor: 'var(--text-muted)'}}>
          <h3 style={{textAlign:'center'}}>No Elimination (Tie or Safe)</h3>
        </div>
      )}

      <div className="points-box shadow-box">
        <h3>Your Updated Points</h3>
        <p className="points-display">{me?.points ?? '-'}</p>
      </div>

      <div className="action-buttons">
        {status.status === 'Finished' ? (
          <button onClick={() => navigate('/')} className="btn-secondary">Leave Game</button>
        ) : (
          <button onClick={() => navigate(`/game/${gameId}`)} className="btn-primary">Return to Dashboard</button>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
