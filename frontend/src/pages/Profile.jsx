import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

function Profile() {
  const [user, setUser] = useState(null)
  const [cartCount, setCartCount] = useState(0)
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    const headers = { Authorization: `Bearer ${token}` }

    axios.get('http://127.0.0.1:8000/api/me/', { headers })
      .then(res => setUser(res.data))
      .catch(() => navigate('/login'))

    axios.get('http://127.0.0.1:8000/api/cart/me/', { headers })
      .then(res => setCartCount(res.data.length))
      .catch(err => console.error(err))
  }, [token, navigate])

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Cargando perfil...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-md mx-auto">

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

        {/* Avatar y nombre */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gray-900 text-white text-3xl font-bold flex items-center justify-center mx-auto mb-4">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{user.username}</h2>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            user.is_staff
              ? 'bg-yellow-50 text-yellow-600'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {user.is_staff ? '⚙️ Administrador' : '🛍️ Cliente'}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">{cartCount}</p>
            <p className="text-gray-400 text-sm">Items en carrito</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {user.is_staff ? '⚙️' : '🛍️'}
            </p>
            <p className="text-gray-400 text-sm">
              {user.is_staff ? 'Administrador' : 'Cliente'}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <Link to="/cart" className="flex justify-between items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <span className="text-sm text-gray-700">Ver mi carrito</span>
            <span className="text-gray-400">→</span>
          </Link>
          {user.is_staff && (
            <Link to="/admin-panel" className="flex justify-between items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <span className="text-sm text-gray-700">Panel de administración</span>
              <span className="text-gray-400">→</span>
            </Link>
          )}
          <Link to="/" className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition-colors">
            <span className="text-sm text-gray-700">Ver tienda</span>
            <span className="text-gray-400">→</span>
          </Link>
          <Link to="/orders" className="flex justify-between items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <span className="text-sm text-gray-700">Mis órdenes</span>
            <span className="text-gray-400">→</span>
          </Link>
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/' }}
          className="w-full border border-red-200 text-red-400 py-3 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
        >
          Cerrar sesión
        </button>

      </div>
    </div>
  )
}

export default Profile