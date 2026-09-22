import { useState } from 'react';
import { chatService } from '../services/chatService';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (text) => {
    const newUserMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, newUserMessage];
    
    setMessages(updatedMessages);
    setIsTyping(true);
    setError(null);

    try {
      const response = await chatService.sendMessage(updatedMessages);
      const aiMessage = response.choices[0].message;
      setMessages([...updatedMessages, aiMessage]);
    } catch {
      setError('No se pudo contactar al asistente');
    } finally {
      setIsTyping(false);
    }
  };

  return { messages, setMessages, isTyping, error, sendMessage };
}
