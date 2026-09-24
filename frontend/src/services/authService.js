import api, { saveSession } from '../api';

export const authService = {
  async login(credentials) {
    const response = await api.post('/token/', credentials);
    // Guarda access + refresh (los usa api.js para auto-refrescar el JWT).
    saveSession(response.data);
    return response.data;
  },
  async register(userData) {
    const response = await api.post('/register/', userData);
    return response.data;
  },
  async getMe() {
    const response = await api.get('/me/');
    return response.data;
  },
};
