import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Cart() {
  const [items, setItems] = useState([])
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

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
    await axios.patch(`http://127.0.0.1:8000/api/cartitems/${id}/`, { quantity }, { headers })
    fetchCart()
  }

  const removeItem = async (id) => {
    const headers = { Authorization: `Bearer ${token}` }
    await axios.delete(`http://127.0.0.1:8000/api/cartitems/${id}/`, { headers })
    fetchCart()
  }

  const total = items.reduce((sum, item) => sum + parseFloat(item.total), 0)

  if (!token) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">🔒</p>
        <p className="text-gray-400 mb-4">Debes iniciar sesión para ver tu carrito</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm hover:bg-gray-700 transition-colors"
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Mi Carrito</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20">
            <p className="text-5xl mb-4">🛍️</p>
            <p className="text-gray-400 mb-6">Tu carrito está vacío</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm hover:bg-gray-700 transition-colors"
            >
              Ver productos
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between px-6 py-4 ${
                    index !== items.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <span className="font-medium text-gray-900 w-1/3">{item.product}</span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-semibold text-gray-900">${item.total}</span>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors text-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Total</span>
                <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
              </div>
            </div>

            <button className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">
              Proceder al pago
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart