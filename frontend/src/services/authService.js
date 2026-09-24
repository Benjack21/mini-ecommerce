import api from '../api';

export const authService = {
  async login(credentials) {
    const response = await api.post('/token/', credentials);
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
