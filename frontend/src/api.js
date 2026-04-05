import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({ baseURL: API_BASE });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('leadflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercept handling for global errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // 401 redirection has been disabled since the login page is removed
    return Promise.reject(err);
  }
);

export default api;
