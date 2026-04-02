import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    axios.get('http://127.0.0.1:8000/api/orders/me/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setOrders(res.data))
    .catch(err => console.error(err))
    .finally(() => setLoading(false))
  }, [token, navigate])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/')}
            className="text-sm text-gray-400 hover:text-gray-900 transition-colors">
            ← Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Mis Órdenes</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-gray-400 mb-6">Aún no tienes órdenes</p>
            <button onClick={() => navigate('/')}
              className="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm hover:bg-gray-700 transition-colors">
              Ver productos
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-900">Orden #{order.id}</p>
                    <p className="text-xs text-gray-400">{order.created_at}</p>
                  </div>
                  <span className="text-lg font-bold text-gray-900">${order.total}</span>
                </div>
                <div className="px-6 py-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 text-sm">
                      <span className="text-gray-700">{item.product}</span>
                      <span className="text-gray-400">x{item.quantity} — ${item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders