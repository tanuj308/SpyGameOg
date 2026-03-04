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

// Admin APIs

export function createGame({ playerIds, word1, word2, numSpies }) {
  // Expects backend to create a game, assign roles/words, and return a unique gameId
  return api.post('/api/games', {
    playerIds,
    word1,
    word2,
    numSpies,
  });
}

export function startGame(gameId) {
  // Starts the game (e.g. change status to InProgress)
  return api.put(`/api/games/${encodeURIComponent(gameId)}/start`);
}

export function getGameStatus(gameId) {
  // Returns full game state. Admin can see roles and scores.
  return api.get(`/api/games/${encodeURIComponent(gameId)}/status`);
}

// Player APIs

export function validateGame(gameId) {
  // Simple validation that the game exists and is accessible
  return api.get(`/api/games/${encodeURIComponent(gameId)}/status`);
}

export function getPlayerWord(gameId, playerId) {
  // Backend should return { word, isAlive, numSpies?, alivePlayers? }
  // If backend still uses JWT, it can ignore playerId and rely on auth instead.
  return api.get(`/api/games/${encodeURIComponent(gameId)}/word`, {
    params: { playerId },
  });
}

export function submitVote(gameId, voterId, targetId) {
  return api.post(`/api/games/${encodeURIComponent(gameId)}/vote`, {
    voterId,
    targetId,
  });
}

export function getRoundStatus(gameId) {
  // Reuse status endpoint for result page
  return getGameStatus(gameId);
}

export default api;

