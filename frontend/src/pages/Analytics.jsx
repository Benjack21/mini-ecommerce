import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Spinner from '../components/Spinner'
import '../styles/Analytics.css'

function Analytics() {
  const [data, setData] = useState(null)
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    api.get('/analytics/')
      .then(res => setData(res.data))
      .catch(() => navigate('/'))
  }, [token, navigate])

  if (!data) return <Spinner />

  return (
    <div className="analytics-wrapper">
      <div className="analytics-container">

        {/* Header */}
        <div className="analytics-header">
          <button onClick={() => navigate('/admin-panel')} className="analytics-header__back">
            ← Volver
          </button>
          <h1 className="analytics-header__title">Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="analytics-stats">
          {[
            { label: 'Productos', value: data.total_products, icon: '📦' },
            { label: 'Usuarios', value: data.total_users, icon: '👤' },
            { label: 'Órdenes', value: data.total_orders, icon: '🧾' },
            { label: 'Ingresos', value: `$${parseFloat(data.total_revenue).toFixed(2)}`, icon: '💰' },
          ].map(stat => (
            <div key={stat.label} className="analytics-stat-card">
              <p className="analytics-stat-card__icon">{stat.icon}</p>
              <p className="analytics-stat-card__value">{stat.value}</p>
              <p className="analytics-stat-card__label">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="analytics-panels">

          {/* Top productos */}
          <div className="analytics-panel">
            <h2 className="analytics-panel__title">🏆 Productos más vendidos</h2>
            {data.top_products.length === 0 ? (
              <p className="analytics-panel__empty">Aún no hay ventas</p>
            ) : (
              <div>
                {data.top_products.map((product, index) => (
                  <div key={index} className="analytics-row">
                    <div className="analytics-product__left">
                      <span className="analytics-product__rank">#{index + 1}</span>
                      <span className="analytics-product__name">{product.product__name}</span>
                    </div>
                    <span className="analytics-row__value">{product.total_sold} vendidos</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Órdenes recientes */}
          <div className="analytics-panel">
            <h2 className="analytics-panel__title">🕐 Órdenes recientes</h2>
            {data.recent_orders.length === 0 ? (
              <p className="analytics-panel__empty">Aún no hay órdenes</p>
            ) : (
              <div>
                {data.recent_orders.map(order => (
                  <div key={order.id} className="analytics-row">
                    <div>
                      <p className="analytics-order__user">{order.user}</p>
                      <p className="analytics-order__date">{order.created_at}</p>
                    </div>
                    <span className="analytics-row__value">${order.total}</span>
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