import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: () => {
    window.location.href = `${API_BASE_URL}/auth/airtable`;
  },
  check: () => api.get('/auth/check'),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
  setToken: (token) => localStorage.setItem('token', token),
  getToken: () => localStorage.getItem('token'),
};

// Airtable API
export const airtableAPI = {
  getBases: () => api.get('/api/bases'),
  getTables: (baseId) => api.get(`/api/tables/${baseId}`),
  getFields: (baseId, tableId) => api.get(`/api/fields/${tableId}?baseId=${baseId}`),
};

// Forms API
export const formsAPI = {
  create: (data) => api.post('/f/createForm', data),
  list: () => api.get('/f/forms'),
  get: (formId) => api.get(`/f/${formId}`),
  delete: (formId) => api.delete(`/f/${formId}`),
  submit: (formId, answers) => api.post(`/f/${formId}/submit`, { answers }),
};

export default api;
