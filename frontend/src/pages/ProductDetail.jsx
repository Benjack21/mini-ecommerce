import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'

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
    axios.get(`http://127.0.0.1:8000/api/products/${id}/reviews/`)
      .then(res => setReviews(res.data))
      .catch(err => console.error(err))
  }, [id])

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/products/${id}/`)
      .then(res => {
        setProduct(res.data)
        setSelectedImage(res.data.image_url)
      })
      .catch(err => console.error(err))
    fetchReviews()
  }, [id, fetchReviews])

  useEffect(() => {
    if (!token) return
    axios.get('http://127.0.0.1:8000/api/wishlist/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const found = res.data.some(item => item.product_id === parseInt(id))
      setInWishlist(found)
    })
    .catch(err => console.error(err))
  }, [id, token])

  const addToCart = async () => {
    if (!token) { navigate('/login'); return }
    try {
      await axios.post('http://127.0.0.1:8000/api/cart/add/',
        { product_id: id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAdded(true)
      showToast('¡Agregado al carrito!')
      setTimeout(() => setAdded(false), 2000)
    } catch {
      showToast('Error al agregar al carrito', 'error')
    }
  }

  const toggleWishlist = async () => {
    if (!token) { navigate('/login'); return }
    try {
      if (inWishlist) {
        await axios.delete('http://127.0.0.1:8000/api/wishlist/',
          { data: { product_id: id }, headers: { Authorization: `Bearer ${token}` } }
        )
        setInWishlist(false)
        showToast('Eliminado de tu wishlist')
      } else {
        await axios.post('http://127.0.0.1:8000/api/wishlist/',
          { product_id: id },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setInWishlist(true)
        showToast('¡Agregado a tu wishlist!')
      }
    } catch {
      showToast('Error al actualizar wishlist', 'error')
    }
  }

  const submitReview = async () => {
    if (!token) { navigate('/login'); return }
    try {
      await axios.post(`http://127.0.0.1:8000/api/products/${id}/reviews/`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      showToast('¡Reseña publicada!')
      setForm({ rating: 5, comment: '' })
      fetchReviews()
    } catch (err) {
      showToast(err.response?.data?.error || 'Error al publicar reseña', 'error')
    }
  }

  if (!product) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Cargando producto...</p>
    </div>
  )

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/')}
          className="text-sm text-gray-400 hover:text-gray-900 transition-colors mb-8 flex items-center gap-1">
          ← Volver a productos
        </button>

        {/* Producto */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="flex flex-col sm:flex-row">

            {/* Galería con carrusel */}
            <div className="w-full sm:w-1/2 relative">
              <img
                src={selectedImage || product.image_url}
                alt={product.name}
                className="w-full h-80 object-cover"
              />
              {product.images && product.images.length > 0 && (
                <>
                  <button
                    onClick={() => {
                      const allImages = [product.image_url, ...product.images.map(img => img.url)]
                      const currentIndex = allImages.indexOf(selectedImage)
                      const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length
                      setSelectedImage(allImages[prevIndex])
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 w-8 h-8 rounded-full flex items-center justify-center shadow transition-all"
                  >←</button>
                  <button
                    onClick={() => {
                      const allImages = [product.image_url, ...product.images.map(img => img.url)]
                      const currentIndex = allImages.indexOf(selectedImage)
                      const nextIndex = (currentIndex + 1) % allImages.length
                      setSelectedImage(allImages[nextIndex])
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 w-8 h-8 rounded-full flex items-center justify-center shadow transition-all"
                  >→</button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {[product.image_url, ...product.images.map(img => img.url)].map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(img)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          selectedImage === img ? 'bg-white w-4' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-8 flex flex-col justify-between w-full">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                {avgRating && (
                  <p className="text-yellow-500 text-sm mb-3">
                    {'⭐'.repeat(Math.round(avgRating))} {avgRating} ({reviews.length} reseñas)
                  </p>
                )}
                <p className="text-gray-400 text-sm leading-relaxed mb-6">{product.description}</p>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    product.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                  }`}>
                    {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={toggleWishlist}
                  className={`px-4 py-3 rounded-xl text-sm font-medium border transition-colors ${
                    inWishlist
                      ? 'border-red-300 text-red-400 hover:bg-red-50'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {inWishlist ? '❤️' : '🤍'}
                </button>
                <button
                  onClick={addToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                    added ? 'bg-green-500 text-white'
                    : product.stock === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-700'
                  }`}
                >
                  {added ? '✓ Agregado al carrito' : 'Agregar al carrito'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reseñas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Reseñas</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm mb-6">Aún no hay reseñas. ¡Sé el primero!</p>
          ) : (
            <div className="flex flex-col gap-4 mb-6">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-gray-100 pb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm text-gray-900">{review.user}</span>
                    <span className="text-xs text-gray-400">{review.created_at}</span>
                  </div>
                  <p className="text-yellow-500 text-sm mb-1">{'⭐'.repeat(review.rating)}</p>
                  <p className="text-gray-500 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
          {token ? (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Escribir reseña</h3>
              <div className="flex gap-2 mb-3">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setForm({...form, rating: star})}
                    className={`text-2xl transition-transform hover:scale-110 ${
                      star <= form.rating ? 'text-yellow-400' : 'text-gray-200'
                    }`}>⭐</button>
                ))}
              </div>
              <textarea rows={3} placeholder="Escribe tu opinión..."
                value={form.comment}
                onChange={e => setForm({...form, comment: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 mb-3"
              />
              <button onClick={submitReview}
                className="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">
                Publicar reseña
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400 border-t border-gray-100 pt-4">
              <button onClick={() => navigate('/login')} className="text-gray-900 font-medium hover:underline">
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