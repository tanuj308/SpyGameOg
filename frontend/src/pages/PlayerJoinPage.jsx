import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const PlayerJoinPage = () => {
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!playerName || !gameId) {
      setError('Please fill all fields');
      return;
    }
    setError('');
    
    try {
      try {
        await authAPI.register({ username: playerName, password: 'password', role: 'Player' });
      } catch (err) {}
      
      const userRes = await authAPI.login({ username: playerName, password: 'password' });
      localStorage.setItem('token', userRes.data.token);
      localStorage.setItem('userId', userRes.data.user.id);
      localStorage.setItem('username', userRes.data.user.username);
      
      navigate(`/game/${gameId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to authenticate');
    }
  };

  return (
    <div className="card join-card">
      <h2>Join Game</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleJoin}>
        <div className="form-group">
          <label>Player Name:</label>
          <input 
            type="text" 
            value={playerName} 
            onChange={e => setPlayerName(e.target.value)} 
            placeholder="Enter your name"
          />
        </div>
        <div className="form-group">
          <label>Game ID:</label>
          <input 
            type="text" 
            value={gameId} 
            onChange={e => setGameId(e.target.value)} 
            placeholder="Enter Game ID"
          />
        </div>
        <button type="submit" className="btn-primary">Join Game</button>
      </form>
      
      <div className="admin-link" style={{marginTop:'1.5rem', textAlign:'center'}}>
        <a onClick={() => navigate('/admin')} style={{cursor: 'pointer', color: '#10b981', textDecoration: 'underline'}}>Go to Admin Dashboard</a>
      </div>
    </div>
  );
};

export default PlayerJoinPage;
