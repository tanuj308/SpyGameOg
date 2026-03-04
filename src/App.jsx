import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard.jsx';
import PlayerJoin from './pages/PlayerJoin.jsx';
import PlayerDashboard from './pages/PlayerDashboard.jsx';
import VotingPage from './pages/VotingPage.jsx';
import ResultPage from './pages/ResultPage.jsx';
import Login from './pages/Login.jsx';

function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-inner">
          <h1 className="app-title">Spy Game</h1>
          <nav className="nav">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/admin" className="nav-link">
              Admin
            </Link>
            <Link to="/player/join" className="nav-link">
              Player
            </Link>
            <Link to="/login" className="nav-link">
              Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={
              <div className="container">
                <div className="card">
                  <h2>Welcome to Spy Game</h2>
                  <p>Select your role to continue.</p>
                  <div className="button-row">
                    <Link to="/admin" className="btn primary">
                      Go to Admin Dashboard
                    </Link>
                    <Link to="/player/join" className="btn">
                      Join as Player
                    </Link>
                  </div>
                </div>
              </div>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/player/join" element={<PlayerJoin />} />
          <Route path="/player/dashboard" element={<PlayerDashboard />} />
          <Route path="/player/vote" element={<VotingPage />} />
          <Route path="/player/result" element={<ResultPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

