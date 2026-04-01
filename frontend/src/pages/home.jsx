import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [search, setSearch] = useState('')
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/products/')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))

    axios.get('http://127.0.0.1:8000/api/categories/')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err))
  }, [])

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

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory
      ? product.category === parseInt(selectedCategory)
      : true
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="p-6">

      {/* Búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full sm:w-1/2"
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full sm:w-1/4"
        >
          <option value="">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <p className="text-gray-400 col-span-3 text-center py-12">No se encontraron productos.</p>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="border rounded-lg p-4 shadow hover:shadow-md">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover rounded mb-3 cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              />
              <h2
                className="text-lg font-semibold cursor-pointer hover:text-blue-600"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {product.name}
              </h2>
              <p className="text-gray-500 text-sm mb-2">{product.description}</p>
              <p className="text-blue-600 font-bold mb-3">${product.price}</p>
              <button
                onClick={() => addToCart(product.id)}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Agregar al carrito
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Home