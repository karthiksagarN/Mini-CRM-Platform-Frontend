// frontend/src/api/apiClient.js
import axios from 'axios';

// Vite uses import.meta.env.VITE_*, while CRA uses process.env.REACT_APP_*.
// Use Vite style primarily but keep a fallback to localhost.
const RAW_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || process.env.REACT_APP_API_BASE || 'http://localhost:4000';
const BASE = RAW_BASE.replace(/\/$/, ''); // strip trailing slash if any

const api = axios.create({
  baseURL: BASE + '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
};

export default api;
