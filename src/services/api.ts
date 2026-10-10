import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // Retry idempotent GET requests once on network hiccup
    if (config && config.method === 'get' && !config._retry) {
      config._retry = true;
      try {
        return await api(config);
      } catch (retryErr) {
        return Promise.reject(retryErr);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
