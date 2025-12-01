import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  login: () => {
    window.location.href = `${API_BASE_URL}/auth/airtable`;
  },
  check: () => api.get('/auth/check'),
  logout: () => api.post('/auth/logout'),
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
