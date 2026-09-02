import { useEffect, useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'
import Spinner from '../components/Spinner'
import Pagination from '../components/Pagination'
import '../styles/Home.css'               // ← única línea nueva

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
      api.get('/products/'),
      api.get('/categories/')
    ])
    .then(([productsRes, categoriesRes]) => {
      setProducts(productsRes.data)
      setCategories(categoriesRes.data)
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false))
  }, [])

  const addToCart = async (productId) => {
    if (!token) {
      showToast('Debes iniciar sesión primero', 'warning')
      return
    }
    try {
      await api.post('/cart/add/', { product_id: productId, quantity: 1 })
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
    <div className="home-wrapper">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="home-hero">
        <h1 className="home-hero__title">Bienvenido a MiniShop</h1>
        <p className="home-hero__subtitle">Encuentra los mejores productos al mejor precio</p>
      </div>

      <div className="home-container">
        <div className="home-filters">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
            className="home-filters__input"
          />
          <select
            value={selectedCategory}
            onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1) }}
            className="home-filters__select"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setCurrentPage(1) }}
            className="home-filters__select"
          >
            <option value="">Ordenar por</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="name_asc">Nombre: A-Z</option>
            <option value="name_desc">Nombre: Z-A</option>
          </select>
        </div>

        {loading ? (
          <Spinner />
        ) : filteredProducts.length === 0 ? (
          <div className="home-empty">
            <p className="home-empty__icon">🔍</p>
            <p className="home-empty__text">No se encontraron productos</p>
          </div>
        ) : (
          <>
            <div className="home-grid">
              {paginatedProducts.map(product => (
                <div key={product.id} className="product-card">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="product-card__image"
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                  <div className="product-card__body">
                    <h2
                      className="product-card__title"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.name}
                    </h2>
                    <p className="product-card__description">{product.description}</p>
                    <div className="product-card__footer">
                      <span className="product-card__price">
                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(product.price)}
                      </span>
                      <button
                        onClick={() => addToCart(product.id)}
                        className="product-card__btn"
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