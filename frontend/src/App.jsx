import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PlayerJoinPage from './pages/PlayerJoinPage';
import PlayerDashboard from './pages/PlayerDashboard';
import VotingPage from './pages/VotingPage';
import ResultPage from './pages/ResultPage';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="app-header">
          <h1>SpyGame</h1>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/join" />} />
            <Route path="/join" element={<PlayerJoinPage />} />
            <Route path="/game/:gameId" element={<PlayerDashboard />} />
            <Route path="/game/:gameId/vote" element={<VotingPage />} />
            <Route path="/game/:gameId/result" element={<ResultPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
