import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 45000,
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
    // Fallback: If direct connection fails (e.g. CORS/network error), seamlessly retry via local Vite proxy
    if (config && !config._proxyRetry && (!error.response || error.code === 'ERR_NETWORK')) {
      config._proxyRetry = true;
      if (typeof config.baseURL === 'string' && config.baseURL.includes('localhost:8080')) {
        config.baseURL = '/api/v1';
        try {
          return await axios(config);
        } catch (proxyErr) {
          return Promise.reject(proxyErr);
        }
      }
    }
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
