import { useEffect, useState } from 'react'
import axios from 'axios'

function Home() {
  const [products, setProducts] = useState([])
  const token = localStorage.getItem('token')

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/products/')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))
  }, [token])

  const addToCart = async (productId) => {
    if (!token) {
      alert('Debes iniciar sesión primero')
      return
    }
    try {
      await axios.post('http://127.0.0.1:8000/api/cart/add/',
        { product_id: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('¡Agregado al carrito!')
    } catch {
      alert('Error al agregar al carrito')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Productos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="border rounded-lg p-4 shadow hover:shadow-md">
            <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover rounded mb-3" />
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-gray-500 text-sm mb-2">{product.description}</p>
            <p className="text-blue-600 font-bold mb-3">${product.price}</p>
            <button
              onClick={() => addToCart(product.id)}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home