import { useState, useEffect } from 'react';
import { cartService } from '../services/cartService';

export function useCart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (product_id, quantity = 1) => {
    try {
      await cartService.addToCart({ product_id, quantity });
      await fetchCart();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return { cart, loading, error, addToCart, refreshCart: fetchCart };
}
