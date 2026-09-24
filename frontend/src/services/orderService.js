import api from '../api';

export const orderService = {
  async placeOrder() {
    const response = await api.post('/orders/place/');
    return response.data;
  },
  async getOrders() {
    const response = await api.get('/orders/me/');
    return response.data;
  },
};
