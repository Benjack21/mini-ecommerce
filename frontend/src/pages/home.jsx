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

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory
      ? product.category === parseInt(selectedCategory)
      : true
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-gray-950 text-white py-16 px-6 text-center">
        <h1 className="text-4xl font-bold mb-3 tracking-tight">Bienvenido a MiniShop</h1>
        <p className="text-gray-400 text-lg">Encuentra los mejores productos al mejor precio</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 w-full sm:w-2/3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 w-full sm:w-1/3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Productos */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-52 object-cover cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                />
                <div className="p-4">
                  <h2
                    className="text-base font-semibold mb-1 cursor-pointer hover:text-gray-600 transition-colors"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h2>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">${product.price}</span>
                    <button
                      onClick={() => addToCart(product.id)}
                      className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors"
                    >
                      + Agregar
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

export default Home