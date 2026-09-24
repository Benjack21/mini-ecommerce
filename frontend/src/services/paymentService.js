import api from '../api';

export const paymentService = {
  async createPayment() {
    const response = await api.post('/payment/create/');
    return response.data;
  },
  async confirmPayment(token) {
    const response = await api.post('/payment/confirm/', { token_ws: token });
    return response.data;
  },
};
