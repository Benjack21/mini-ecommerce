import api from '../api';

export const chatService = {
  async sendMessage(messages) {
    const response = await api.post('/chat/', { messages });
    return response.data;
  }
};
