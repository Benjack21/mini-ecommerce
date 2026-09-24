import axios from 'axios';

// Endpoints que NO deben llevar el access token ni disparar el redirect
// global a /login: si el token guardado está expirado, un 401 aquí
// (o un Authorization caducado) impediría volver a iniciar sesión.
const AUTH_PATHS = ['/token/', '/token/refresh/', '/register/'];

const api = axios.create({
  baseURL: '/api',
});

const isAuthPath = (config = {}) => AUTH_PATHS.some((path) => (config.url || '').includes(path));

export function saveSession({ access, refresh }) {
  localStorage.setItem('token', access);
  if (refresh) localStorage.setItem('refresh', refresh);
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh');
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem('token'));
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !isAuthPath(config)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Serializa un solo refresh concurrente (varias llamadas 401 a la vez).
let refreshing = null;

async function refreshAccessToken() {
  const refresh = localStorage.getItem('refresh');
  if (!refresh) return null;

  try {
    // axios plano para no reentrar en este mismo interceptor.
    const res = await axios.post('/api/token/refresh/', { refresh });
    localStorage.setItem('token', res.data.access);
    return res.data.access;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const status = error.response?.status;

    if (status === 401 && !isAuthPath(config) && !config._retried) {
      if (!refreshing) refreshing = refreshAccessToken();
      const access = await refreshing;
      refreshing = null;

      if (access) {
        config._retried = true;
        config.headers.Authorization = `Bearer ${access}`;
        return api(config);
      }

      clearSession();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (status === 403) {
      // Sin permisos
      window.location.href = '/';
    }

    if (status === 500) {
      // Error del servidor
      console.error('Error del servidor:', error.response?.data);
    }

    return Promise.reject(error);
  }
);

export default api;
