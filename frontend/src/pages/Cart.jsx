import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'

function Cart() {
  const [items, setItems] = useState([])
  const token = localStorage.getItem('token')

  const fetchCart = useCallback(() => {
    const headers = { Authorization: `Bearer ${token}` }
    axios.get('http://127.0.0.1:8000/api/cart/me/', { headers })
      .then(res => setItems(res.data))
      .catch(err => console.error(err))
  }, [token])

  useEffect(() => {
    if (!token) return
    fetchCart()
  }, [token, fetchCart])



  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return
    const headers = { Authorization: `Bearer ${token}` }
    await axios.patch(`http://127.0.0.1:8000/api/cartitems/${id}/`,
      { quantity },
      { headers }
    )
    fetchCart()
  }

  const removeItem = async (id) => {
    const headers = { Authorization: `Bearer ${token}` }
    await axios.delete(`http://127.0.0.1:8000/api/cartitems/${id}/`, { headers })
    fetchCart()
  }

  const total = items.reduce((sum, item) => sum + parseFloat(item.total), 0)

  if (!token) return (
    <p className="p-6 text-red-500">Debes iniciar sesión para ver tu carrito.</p>
  )

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🛒 Mi Carrito</h1>

      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-5xl mb-4">🛍️</p>
          <p className="text-lg">Tu carrito está vacío</p>
        </div>
      ) : (
        <div>
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between border rounded-lg p-4 mb-3 shadow-sm">
              
              <span className="font-semibold w-1/3">{item.product}</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full font-bold"
                >
                  −
                </button>
                <span className="w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full font-bold"
                >
                  +
                </button>
              </div>

              <span className="font-bold text-blue-600">${item.total}</span>

              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:text-red-700 text-xl"
              >
                🗑️
              </button>

            </div>
          ))}

          <div className="mt-6 border-t pt-4 flex justify-between items-center">
            <span className="text-gray-500">Total</span>
            <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
          </div>

          <button className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold">
            Proceder al pago
          </button>
        </div>
      )}
    </div>
  )
}

export default Cart