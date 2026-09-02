import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'
import Spinner from '../components/Spinner'
import api from '../api'
import '../styles/Wishlist.css'

function Wishlist() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  const navigate = useNavigate()
  const { toast, showToast, hideToast } = useToast()

  const fetchWishlist = useCallback(() => {
    api.get('/wishlist/')
      .then(res => setItems(res.data))
      .catch(err => console.error('Error al obtener wishlist:', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchWishlist()
  }, [token, navigate, fetchWishlist])

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete('/wishlist/', { data: { product_id: productId } })
      showToast('Eliminado de tu wishlist')
      fetchWishlist()
    } catch (err) {
      console.error('Error al eliminar de wishlist:', err)
      showToast('Error al eliminar de wishlist', 'error')
    }
  }

  const addToCart = async (productId) => {
    try {
      await api.post('/cart/add/', { product_id: productId, quantity: 1 })
      showToast('¡Agregado al carrito!')
    } catch (err) {
      console.error('Error al agregar al carrito:', err)
      showToast('Error al agregar al carrito', 'error')
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="wishlist-wrapper">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="wishlist-container">
        <h1 className="wishlist-title">❤️ Mi Wishlist</h1>

        {items.length === 0 ? (
          <div className="wishlist-empty">
            <p className="wishlist-empty__icon">🤍</p>
            <p className="wishlist-empty__text">Tu wishlist está vacía</p>
            <button onClick={() => navigate('/')} className="wishlist-empty__btn">
              Ver productos
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map(item => (
              <div key={item.id} className="wishlist-card">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="wishlist-card__img"
                  onClick={() => navigate(`/product/${item.product_id}`)}
                />
                <div className="wishlist-card__body">
                  <h2
                    className="wishlist-card__name"
                    onClick={() => navigate(`/product/${item.product_id}`)}
                  >
                    {item.name}
                  </h2>
                  <p className="wishlist-card__price">${item.price}</p>
                  <div className="wishlist-card__actions">
                    <button
                      onClick={() => addToCart(item.product_id)}
                      className="wishlist-card__btn-cart"
                    >
                      + Carrito
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.product_id)}
                      className="wishlist-card__btn-remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist