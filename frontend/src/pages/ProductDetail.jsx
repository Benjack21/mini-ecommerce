import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/products/${id}/`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err))
  }, [id])

  const addToCart = async () => {
    if (!token) {
      alert('Debes iniciar sesión primero')
      return
    }
    try {
      await axios.post('http://127.0.0.1:8000/api/cart/add/',
        { product_id: id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('¡Agregado al carrito!')
    } catch {
      alert('Error al agregar al carrito')
    }
  }

  if (!product) return <p className="p-6 text-gray-400">Cargando producto...</p>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => navigate('/')}
        className="text-blue-600 hover:underline mb-6 block"
      >
        ← Volver a productos
      </button>

      <div className="flex flex-col sm:flex-row gap-8">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full sm:w-1/2 h-72 object-cover rounded-lg shadow"
        />
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-500 mb-4">{product.description}</p>
            <p className="text-3xl font-bold text-blue-600 mb-2">${product.price}</p>
            <p className="text-sm text-gray-400">Stock disponible: {product.stock}</p>
          </div>
          <button
            onClick={addToCart}
            className="mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail