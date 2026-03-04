import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (credentials) => api.post('/auth/register', credentials),
  getUsers: () => api.get('/auth/users'),
};

export const gameAPI = {
  create: () => api.post('/games'),
  addPlayers: (gameId, playerIds) => api.post(`/games/${gameId}/players`, { playerIds }),
  start: (gameId, payload) => api.put(`/games/${gameId}/start`, payload),
  getStatus: (gameId) => api.get(`/games/${gameId}/status`),
  getAdminStatus: (gameId) => api.get(`/games/${gameId}/admin/status`),
  getWord: (gameId) => api.get(`/games/${gameId}/word`),
};

export const voteAPI = {
  submit: (gameId, targetId) => api.post(`/votes/${gameId}/vote`, { targetId }),
  triggerTally: (gameId) => api.post(`/votes/${gameId}/tally`),
};

export default api;
