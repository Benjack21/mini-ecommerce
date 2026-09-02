import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'
import api from '../api'
import '../styles/ProductDetail.css'

function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState({ rating: 5, comment: '' })
  const [added, setAdded] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [inWishlist, setInWishlist] = useState(false)

  const token = localStorage.getItem('token')
  const navigate = useNavigate()
  const { toast, showToast, hideToast } = useToast()

  const fetchReviews = useCallback(() => {
    api.get(`/products/${id}/reviews/`)
      .then(res => setReviews(res.data))
      .catch(err => console.error('Error al obtener reseñas:', err))
  }, [id])

  useEffect(() => {
    api.get(`/products/${id}/`)
      .then(res => {
        setProduct(res.data)
        setSelectedImage(res.data.image_url)
      })
      .catch(err => console.error('Error al obtener producto:', err))
    fetchReviews()
  }, [id, fetchReviews])

  useEffect(() => {
    if (!token) return
    api.get('/wishlist/')
      .then(res => {
        const found = res.data.some(item => item.product_id === parseInt(id))
        setInWishlist(found)
      })
      .catch(err => console.error('Error al obtener wishlist:', err))
  }, [id, token])

  const addToCart = async () => {
    if (!token) { navigate('/login'); return }
    try {
      await api.post('/cart/add/', { product_id: id, quantity: 1 })
      setAdded(true)
      showToast('¡Agregado al carrito!')
      setTimeout(() => setAdded(false), 2000)
    } catch (err) {
      console.error('Error al agregar al carrito:', err)
      showToast('Error al agregar al carrito', 'error')
    }
  }

  const toggleWishlist = async () => {
    if (!token) { navigate('/login'); return }
    try {
      if (inWishlist) {
        await api.delete('/wishlist/', { data: { product_id: id } })
        setInWishlist(false)
        showToast('Eliminado de tu wishlist')
      } else {
        await api.post('/wishlist/', { product_id: id })
        setInWishlist(true)
        showToast('¡Agregado a tu wishlist!')
      }
    } catch (err) {
      console.error('Error al actualizar wishlist:', err)
      showToast('Error al actualizar wishlist', 'error')
    }
  }

  const submitReview = async () => {
    if (!token) { navigate('/login'); return }
    try {
      await api.post(`/products/${id}/reviews/`, form)
      showToast('¡Reseña publicada!')
      setForm({ rating: 5, comment: '' })
      fetchReviews()
    } catch (err) {
      showToast(err.response?.data?.error || 'Error al publicar reseña', 'error')
    }
  }

  if (!product) return (
    <div className="product-loading">
      <p className="product-loading__text">Cargando producto...</p>
    </div>
  )

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const allImages = product.images?.length
    ? [product.image_url, ...product.images.map(img => img.url)]
    : []

  return (
    <div className="product-wrapper">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="product-container">
        <button onClick={() => navigate('/')} className="product-back">
          ← Volver a productos
        </button>

        {/* Card producto */}
        <div className="product-card">
          <div className="product-card__inner">

            {/* Galería */}
            <div className="product-gallery">
              <img
                src={selectedImage || product.image_url}
                alt={product.name}
                className="product-gallery__img"
              />
              {allImages.length > 0 && (
                <>
                  <button
                    className="product-gallery__prev"
                    onClick={() => {
                      const i = allImages.indexOf(selectedImage)
                      setSelectedImage(allImages[(i - 1 + allImages.length) % allImages.length])
                    }}
                  >←</button>
                  <button
                    className="product-gallery__next"
                    onClick={() => {
                      const i = allImages.indexOf(selectedImage)
                      setSelectedImage(allImages[(i + 1) % allImages.length])
                    }}
                  >→</button>
                  <div className="product-gallery__dots">
                    {allImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(img)}
                        className={`product-gallery__dot ${selectedImage === img ? 'product-gallery__dot--active' : ''}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Info */}
            <div className="product-info">
              <div>
                <h1 className="product-info__name">{product.name}</h1>
                {avgRating && (
                  <p className="product-info__rating">
                    {'⭐'.repeat(Math.round(avgRating))} {avgRating} ({reviews.length} reseñas)
                  </p>
                )}
                <p className="product-info__description">{product.description}</p>
                <div className="product-info__price-row">
                  <span className="product-info__price">
                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(product.price)}
                  </span>
                  <span className={product.stock > 0 ? 'product-info__stock--available' : 'product-info__stock--empty'}>
                    {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
                  </span>
                </div>
              </div>
              <div className="product-info__actions">
                <button
                  onClick={toggleWishlist}
                  className={`product-btn-wishlist ${inWishlist ? 'product-btn-wishlist--active' : 'product-btn-wishlist--inactive'}`}
                >
                  {inWishlist ? '❤️' : '🤍'}
                </button>
                <button
                  onClick={addToCart}
                  disabled={product.stock === 0}
                  className={`product-btn-cart ${
                    added ? 'product-btn-cart--added'
                    : product.stock === 0 ? 'product-btn-cart--disabled'
                    : 'product-btn-cart--default'
                  }`}
                >
                  {added ? '✓ Agregado al carrito' : 'Agregar al carrito'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reseñas */}
        <div className="reviews-card">
          <h2 className="reviews-card__title">Reseñas</h2>

          {reviews.length === 0 ? (
            <p className="reviews-card__empty">Aún no hay reseñas. ¡Sé el primero!</p>
          ) : (
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-item__header">
                    <span className="review-item__user">{review.user}</span>
                    <span className="review-item__date">{review.created_at}</span>
                  </div>
                  <p className="review-item__stars">{'⭐'.repeat(review.rating)}</p>
                  <p className="review-item__comment">{review.comment}</p>
                </div>
              ))}
            </div>
          )}

          {token ? (
            <div className="review-form">
              <h3 className="review-form__title">Escribir reseña</h3>
              <div className="review-form__stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setForm({...form, rating: star})}
                    className={`review-form__star ${star <= form.rating ? 'review-form__star--active' : 'review-form__star--inactive'}`}
                  >⭐</button>
                ))}
              </div>
              <textarea
                rows={3}
                placeholder="Escribe tu opinión..."
                value={form.comment}
                onChange={e => setForm({...form, comment: e.target.value})}
                className="review-form__textarea"
              />
              <button onClick={submitReview} className="review-form__btn">
                Publicar reseña
              </button>
            </div>
          ) : (
            <p className="review-login">
              <button onClick={() => navigate('/login')} className="review-login__link">
                Inicia sesión
              </button> para dejar una reseña.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail