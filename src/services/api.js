import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

const adminApi = axios.create({ baseURL: BASE_URL });
const playerApi = axios.create({ baseURL: BASE_URL });

const ADMIN_TOKEN_KEY = 'spyGame_adminToken';
const PLAYER_TOKEN_KEY = 'spyGame_playerToken';
const ADMIN_USER_KEY = 'spyGame_adminUser';
const PLAYER_USER_KEY = 'spyGame_playerUser';

function getStoredJson(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getAdminToken() {
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getPlayerToken() {
  return window.localStorage.getItem(PLAYER_TOKEN_KEY);
}

export function getAdminUser() {
  return getStoredJson(ADMIN_USER_KEY);
}

export function getPlayerUser() {
  return getStoredJson(PLAYER_USER_KEY);
}

export function clearAdminSession() {
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_USER_KEY);
}

export function clearPlayerSession() {
  window.localStorage.removeItem(PLAYER_TOKEN_KEY);
  window.localStorage.removeItem(PLAYER_USER_KEY);
}

adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

playerApi.interceptors.request.use((config) => {
  const token = getPlayerToken();
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function adminLogin({ username, password }) {
  return adminApi.post('/api/auth/login', { username, password }).then((res) => {
    const token = res.data?.token;
    const user = res.data?.user;
    if (token) window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
    if (user) setStoredJson(ADMIN_USER_KEY, user);
    return res;
  });
}

export function playerLogin({ username, password }) {
  return playerApi.post('/api/auth/login', { username, password }).then((res) => {
    const token = res.data?.token;
    const user = res.data?.user;
    if (token) window.localStorage.setItem(PLAYER_TOKEN_KEY, token);
    if (user) setStoredJson(PLAYER_USER_KEY, user);
    return res;
  });
}

export function register({ username, password, role }) {
  // registration doesn't require auth, use plain axios instance
  return axios.post(`${BASE_URL}/api/auth/register`, { username, password, role });
}

export function getAllUsers() {
  // In your backend this route is public (no auth middleware)
  return axios.get(`${BASE_URL}/api/auth/users`);
}

// Admin APIs

export function createGame() {
  // Backend creates an empty game in Lobby and returns the game document
  return adminApi.post('/api/games');
}

export function startGame(gameId, { playerIds, word1, word2, spyCount }) {
  return adminApi.put(`/api/games/${encodeURIComponent(gameId)}/start`, {
    playerIds,
    word1,
    word2,
    spyCount,
  });
}

export function getGameStatus(gameId) {
  // Public status (no roles/words). Backend includes points, but UI can ignore it for players.
  return axios.get(`${BASE_URL}/api/games/${encodeURIComponent(gameId)}/status`);
}

export function getAdminGameStatus(gameId) {
  return adminApi.get(`/api/games/${encodeURIComponent(gameId)}/admin/status`);
}

// Player APIs

export function validateGame(gameId) {
  // Simple validation that the game exists and is accessible
  return getGameStatus(gameId);
}

export function getPlayerWord(gameId) {
  // JWT-protected. Returns { word, isAlive }
  return playerApi.get(`/api/games/${encodeURIComponent(gameId)}/word`);
}

export function submitVote(gameId, targetId) {
  // JWT-protected. Voter is derived from token.
  return playerApi.post(`/api/votes/${encodeURIComponent(gameId)}/vote`, {
    targetId,
  });
}

export function getRoundStatus(gameId) {
  // Reuse status endpoint for result page
  return getGameStatus(gameId);
}

export default axios;

