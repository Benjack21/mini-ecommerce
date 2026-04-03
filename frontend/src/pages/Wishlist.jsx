import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'
import Spinner from '../components/Spinner'

function Wishlist() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  const navigate = useNavigate()
  const { toast, showToast, hideToast } = useToast()

  const fetchWishlist = useCallback(() => {
    const headers = { Authorization: `Bearer ${token}` }
    axios.get('http://127.0.0.1:8000/api/wishlist/', { headers })
      .then(res => setItems(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchWishlist()
  }, [token, navigate, fetchWishlist])

  const removeFromWishlist = async (productId) => {
    const headers = { Authorization: `Bearer ${token}` }
    await axios.delete('http://127.0.0.1:8000/api/wishlist/',
      { data: { product_id: productId }, headers }
    )
    showToast('Eliminado de tu wishlist')
    fetchWishlist()
  }

  const addToCart = async (productId) => {
    const headers = { Authorization: `Bearer ${token}` }
    try {
      await axios.post('http://127.0.0.1:8000/api/cart/add/',
        { product_id: productId, quantity: 1 },
        { headers }
      )
      showToast('¡Agregado al carrito!')
    } catch {
      showToast('Error al agregar al carrito', 'error')
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div className="max-w-3xl mx-auto">

        <h1 className="text-2xl font-bold text-gray-900 mb-8">❤️ Mi Wishlist</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20">
            <p className="text-5xl mb-4">🤍</p>
            <p className="text-gray-400 mb-6">Tu wishlist está vacía</p>
            <button onClick={() => navigate('/')}
              className="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm hover:bg-gray-700 transition-colors">
              Ver productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => navigate(`/product/${item.product_id}`)}
                />
                <div className="p-4">
                  <h2
                    className="font-semibold text-gray-900 mb-1 cursor-pointer hover:text-gray-600"
                    onClick={() => navigate(`/product/${item.product_id}`)}
                  >
                    {item.name}
                  </h2>
                  <p className="text-blue-600 font-bold mb-3">${item.price}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(item.product_id)}
                      className="flex-1 bg-gray-900 text-white py-2 rounded-xl text-sm hover:bg-gray-700 transition-colors"
                    >
                      + Carrito
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.product_id)}
                      className="border border-red-200 text-red-400 px-4 py-2 rounded-xl text-sm hover:bg-red-50 transition-colors"
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