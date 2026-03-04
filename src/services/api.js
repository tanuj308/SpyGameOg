import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

const TOKEN_KEY = 'spyGame_token';

export function getAuthToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearAuthToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function login({ username, password }) {
  return api.post('/api/auth/login', { username, password }).then((res) => {
    const token = res.data?.token;
    if (token) {
      setAuthToken(token);
    }
    return res;
  });
}

export function register({ username, password, role }) {
  return api.post('/api/auth/register', { username, password, role });
}

export function getAllUsers() {
  return api.get('/api/auth/users');
}

// Admin APIs

export function createGame() {
  // Backend creates an empty game in Lobby and returns the game document
  return api.post('/api/games');
}

export function startGame(gameId, { playerIds, word1, word2, spyCount }) {
  return api.put(`/api/games/${encodeURIComponent(gameId)}/start`, {
    playerIds,
    word1,
    word2,
    spyCount,
  });
}

export function getGameStatus(gameId) {
  // Public status (no roles/words). Backend includes points, but UI can ignore it for players.
  return api.get(`/api/games/${encodeURIComponent(gameId)}/status`);
}

export function getAdminGameStatus(gameId) {
  return api.get(`/api/games/${encodeURIComponent(gameId)}/admin/status`);
}

// Player APIs

export function validateGame(gameId) {
  // Simple validation that the game exists and is accessible
  return api.get(`/api/games/${encodeURIComponent(gameId)}/status`);
}

export function getPlayerWord(gameId) {
  // JWT-protected. Returns { word, isAlive }
  return api.get(`/api/games/${encodeURIComponent(gameId)}/word`);
}

export function submitVote(gameId, targetId) {
  // JWT-protected. Voter is derived from token.
  return api.post(`/api/votes/${encodeURIComponent(gameId)}/vote`, {
    targetId,
  });
}

export function getRoundStatus(gameId) {
  // Reuse status endpoint for result page
  return getGameStatus(gameId);
}

export default api;

