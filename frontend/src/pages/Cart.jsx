import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'
import api from '../api'
import '../styles/Cart.css'

function Cart() {
  const [items, setItems] = useState([])
  const token = localStorage.getItem('token')
  const navigate = useNavigate()
  const { toast, showToast, hideToast } = useToast()

  const fetchCart = useCallback(() => {
    api.get('/cart/me/')
      .then(res => setItems(res.data))
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    if (!token) return
    fetchCart()
  }, [token, fetchCart])

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return
    try {
      await api.patch(`/cartitems/${id}/`, { quantity })
      fetchCart()
    } catch (err) {
      console.error('Error al actualizar cantidad:', err)
    }
  }

  const removeItem = async (id) => {
    try {
      await api.delete(`/cartitems/${id}/`)
      fetchCart()
    } catch (err) {
      console.error('Error al eliminar producto:', err)
    }
  }

  const total = items.reduce((sum, item) => sum + parseFloat(item.total), 0)

  if (!token) {
    return (
      <div className="cart-locked">
        <div className="cart-locked__inner">
          <p className="cart-locked__icon">🔒</p>
          <p className="cart-locked__text">Debes iniciar sesión para ver tu carrito</p>
          <button onClick={() => navigate('/login')} className="cart-locked__btn">
            Iniciar sesión
          </button>
        </div>
      </div>
    )
  }

  const handlePayment = async () => {
    try {
      const res = await api.post('/payment/create/', {})
      window.location.href = `${res.data.url}?token_ws=${res.data.token}`
    } catch (err) {
      console.error('Error al iniciar pago:', err)
      showToast('Error al iniciar el pago', 'error')
    }
  }

  return (
    <div className="cart-wrapper">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div className="cart-container">
        <h1 className="cart-title">Mi Carrito</h1>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p className="cart-empty__icon">🛍️</p>
            <p className="cart-empty__text">Tu carrito está vacío</p>
            <button onClick={() => navigate('/')} className="cart-empty__btn">
              Ver productos
            </button>
          </div>
        ) : (
          <div>
            <div className="cart-list">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`cart-item ${index !== items.length - 1 ? 'cart-item--border' : ''}`}
                >
                  <span className="cart-item__name">{item.product}</span>
                  <div className="cart-item__controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="cart-item__btn">−</button>
                    <span className="cart-item__quantity">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="cart-item__btn">+</button>
                  </div>
                  <span className="cart-item__total">${item.total}</span>
                  <button onClick={() => removeItem(item.id)} className="cart-item__remove">✕</button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="cart-summary__row">
                <span className="cart-summary__label">Total</span>
                <span className="cart-summary__total">${total.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={handlePayment} className="cart-btn-pay">
              Pagar con Webpay
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart