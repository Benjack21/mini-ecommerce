import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'
import Spinner from '../components/Spinner'
import Pagination from '../components/Pagination'

function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  const navigate = useNavigate()
  const { toast, showToast, hideToast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const PRODUCTS_PER_PAGE = 6
  const [sortBy, setSortBy] = useState('')
  useEffect(() => {
    Promise.all([
      axios.get('http://127.0.0.1:8000/api/products/'),
      axios.get('http://127.0.0.1:8000/api/categories/')
    ])
    .then(([productsRes, categoriesRes]) => {
      setProducts(productsRes.data)
      setCategories(categoriesRes.data)
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false))
  }, [token])

  const addToCart = async (productId) => {
    if (!token) {
      showToast('Debes iniciar sesión primero', 'warning')
      return
    }
    try {
      await axios.post('http://127.0.0.1:8000/api/cart/add/',
        { product_id: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      showToast('¡Agregado al carrito!')
    } catch {
      showToast('Error al agregar al carrito', 'error')
    }
  }
  
  
  const filteredProducts = products
  .filter(product => {
    const matchesCategory = selectedCategory
      ? product.category === parseInt(selectedCategory)
      : true
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })
  .sort((a, b) => {
    if (sortBy === 'price_asc') return parseFloat(a.price) - parseFloat(b.price)
    if (sortBy === 'price_desc') return parseFloat(b.price) - parseFloat(a.price)
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name)
    if (sortBy === 'name_desc') return b.name.localeCompare(a.name)
    return 0
  })

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

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
            onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
            className="border border-gray-200 rounded-xl px-4 py-3 w-full sm:w-1/2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <select
            value={selectedCategory}
            onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1) }}
            className="border border-gray-200 rounded-xl px-4 py-3 w-full sm:w-1/4 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setCurrentPage(1) }}
            className="border border-gray-200 rounded-xl px-4 py-3 w-full sm:w-1/4 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="">Ordenar por</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="name_asc">Nombre: A-Z</option>
            <option value="name_desc">Nombre: Z-A</option>
          </select>
        </div>

        {/* Productos */}
        {loading ? (
          <Spinner />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {paginatedProducts.map(product => (
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default Home