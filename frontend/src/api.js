import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
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
