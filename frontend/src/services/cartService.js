import api from '../api';

export const cartService = {
  async getCart() {
    const response = await api.get('/cart/me/');
    return response.data;
  },
  async addToCart(productData) {
    const response = await api.post('/cart/add/', productData);
    return response.data;
  },
  async getCartItems() {
    // Para el CRUD de cartitems
    const response = await api.get('/cartitems/');
    return response.data;
  },
  async updateCartItem(id, data) {
    const response = await api.patch(`/cartitems/${id}/`, data);
    return response.data;
  },
  async deleteCartItem(id) {
    const response = await api.delete(`/cartitems/${id}/`);
    return response.data;
  },
};
