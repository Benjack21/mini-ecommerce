import api from '../api';

export const productService = {
  async getProducts() {
    const response = await api.get('/products/');
    return response.data;
  },
  async getProduct(id) {
    const response = await api.get(`/products/${id}/`);
    return response.data;
  },
  async getCategories() {
    const response = await api.get('/categories/');
    return response.data;
  },
  async getReviews(productId) {
    const response = await api.get(`/products/${productId}/reviews/`);
    return response.data;
  },
  async createReview(productId, reviewData) {
    const response = await api.post(`/products/${productId}/reviews/`, reviewData);
    return response.data;
  },
  async getImages(productId) {
    // Las imágenes vienen anidadas en el ProductSerializer,
    // pero si hay un endpoint específico se añade aquí.
    // Actualmente el backend las maneja en /api/products/<id>/images/
    const response = await api.get(`/products/${productId}/images/`);
    return response.data;
  },
};
