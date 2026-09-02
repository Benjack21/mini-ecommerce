import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import '../styles/Orders.css'

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
    api.get('/orders/me/')
      .then(res => setOrders(res.data))
      .catch(err => console.error('Error al obtener órdenes:', err))
      .finally(() => setLoading(false))
  }, [token, navigate])

  if (loading) return (
    <div className="orders-loading">
      <div className="orders-loading__spinner"></div>
    </div>
  )

  return (
    <div className="orders-wrapper">
      <div className="orders-container">

        <div className="orders-header">
          <button onClick={() => navigate('/')} className="orders-header__back">
            ← Volver
          </button>
          <h1 className="orders-header__title">Mis Órdenes</h1>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <p className="orders-empty__icon">📦</p>
            <p className="orders-empty__text">Aún no tienes órdenes</p>
            <button onClick={() => navigate('/')} className="orders-empty__btn">
              Ver productos
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="orders-card">
                <div className="orders-card__header">
                  <div>
                    <p className="orders-card__id">Orden #{order.id}</p>
                    <p className="orders-card__date">{order.created_at}</p>
                  </div>
                  <span className="orders-card__total">${order.total}</span>
                </div>
                <div className="orders-card__body">
                  {order.items.map((item, index) => (
                    <div key={index} className="orders-card__item">
                      <span className="orders-card__item-name">{item.product}</span>
                      <span className="orders-card__item-meta">x{item.quantity} — ${item.price}</span>
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