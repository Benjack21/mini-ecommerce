import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'

function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [added, setAdded] = useState(false)
  const token = localStorage.getItem('token')
  const navigate = useNavigate()
  const { toast, showToast, hideToast } = useToast()

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/products/${id}/`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err))
  }, [id])

  const addToCart = async () => {
    if (!token) {
      navigate('/login')
      return
    }
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

  if (!product) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Cargando producto...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-400 hover:text-gray-900 transition-colors mb-8 flex items-center gap-1"
        >
          ← Volver a productos
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full sm:w-1/2 h-80 object-cover"
            />
            <div className="p-8 flex flex-col justify-between w-full">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">{product.description}</p>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    product.stock > 0
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-500'
                  }`}>
                    {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
                  </span>
                </div>
              </div>
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className={`w-full py-3 rounded-xl text-sm font-medium transition-colors ${
                  added
                    ? 'bg-green-500 text-white'
                    : product.stock === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-700'
                }`}
              >
                {added ? '✓ Agregado al carrito' : 'Agregar al carrito'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail