import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'

function Analytics() {
  const [data, setData] = useState(null)
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    axios.get('http://127.0.0.1:8000/api/analytics/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setData(res.data))
    .catch(() => navigate('/'))
  }, [token, navigate])

  if (!data) return <Spinner />

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/admin-panel')}
            className="text-sm text-gray-400 hover:text-gray-900 transition-colors">
            ← Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Productos', value: data.total_products, icon: '📦' },
            { label: 'Usuarios', value: data.total_users, icon: '👤' },
            { label: 'Órdenes', value: data.total_orders, icon: '🧾' },
            { label: 'Ingresos', value: `$${parseFloat(data.total_revenue).toFixed(2)}`, icon: '💰' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-3xl mb-2">{stat.icon}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Top productos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">🏆 Productos más vendidos</h2>
            {data.top_products.length === 0 ? (
              <p className="text-gray-400 text-sm">Aún no hay ventas</p>
            ) : (
              <div>
                {data.top_products.map((product, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm font-medium w-5">#{index + 1}</span>
                      <span className="text-sm text-gray-700">{product.product__name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{product.total_sold} vendidos</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Órdenes recientes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">🕐 Órdenes recientes</h2>
            {data.recent_orders.length === 0 ? (
              <p className="text-gray-400 text-sm">Aún no hay órdenes</p>
            ) : (
              <div>
                {data.recent_orders.map(order => (
                  <div key={order.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.user}</p>
                      <p className="text-xs text-gray-400">{order.created_at}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">${order.total}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default Analytics