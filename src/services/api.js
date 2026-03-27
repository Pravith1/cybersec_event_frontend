import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──
export const signup = (data) => api.post('/api/auth/signup', data);
export const login = (data) => api.post('/api/auth/login', data);
export const logout = () => api.post('/api/auth/logout');

// ── Questions ──
export const getRoundSummary = () => api.get('/api/questions/round');
export const getCurrentSubQuestion = (questionId) =>
  api.get(`/api/questions/${questionId}/current`);

// ── Submissions ──
export const submitAnswer = (body) => api.post('/api/submissions/submit', body);

// ── User Profile ──
export const getUserProfile = (userId) => api.get(`/api/users/${userId}`);

export default api;
