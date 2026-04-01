import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'

function Navbar() {
  const token = localStorage.getItem('token')
  const [isAdmin, setIsAdmin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (!token) return
    axios.get('http://127.0.0.1:8000/api/me/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setIsAdmin(res.data.is_staff))
    .catch(() => setIsAdmin(false))
  }, [token])

  const linkClass = (path) =>
    `text-sm font-medium transition-colors duration-200 ${
      location.pathname === path ? 'text-white' : 'text-gray-400 hover:text-white'
    }`

  return (
    <nav className="bg-gray-950 border-b border-gray-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="text-white text-xl font-bold tracking-tight">
          🛒 MiniShop
        </Link>

        {/* Links */}
        <div className="hidden sm:flex items-center gap-6">
          <Link to="/" className={linkClass('/')}>Tienda</Link>
          {token && <Link to="/cart" className={linkClass('/cart')}>Carrito</Link>}
          {token && <Link to="/profile" className={linkClass('/profile')}>Perfil</Link>}
          {token && isAdmin && (
            <Link to="/admin-panel" className={linkClass('/admin-panel')}>Admin</Link>
          )}
        </div>

        {/* Acciones */}
        <div className="hidden sm:flex items-center gap-3">
          {!token && (
            <>
              <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                Iniciar sesión
              </Link>
              <Link to="/register" className="text-sm bg-white text-gray-900 px-4 py-1.5 rounded-full font-medium hover:bg-gray-200 transition-colors">
                Registrarse
              </Link>
            </>
          )}
          {token && (
            <button
              onClick={() => { localStorage.removeItem('token'); window.location.reload() }}
              className="text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              Salir
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden text-gray-400 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden mt-4 flex flex-col gap-3 border-t border-gray-800 pt-4">
          <Link to="/" className="text-gray-400 hover:text-white text-sm" onClick={() => setMenuOpen(false)}>Tienda</Link>
          {token && <Link to="/cart" className="text-gray-400 hover:text-white text-sm" onClick={() => setMenuOpen(false)}>Carrito</Link>}
          {token && <Link to="/profile" className="text-gray-400 hover:text-white text-sm" onClick={() => setMenuOpen(false)}>Perfil</Link>}
          {token && isAdmin && <Link to="/admin-panel" className="text-gray-400 hover:text-white text-sm" onClick={() => setMenuOpen(false)}>Admin</Link>}
          {!token && <Link to="/login" className="text-gray-400 hover:text-white text-sm" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>}
          {!token && <Link to="/register" className="text-gray-400 hover:text-white text-sm" onClick={() => setMenuOpen(false)}>Registrarse</Link>}
          {token && <button onClick={() => { localStorage.removeItem('token'); window.location.reload() }} className="text-red-400 text-sm text-left">Salir</button>}
        </div>
      )}
    </nav>
  )
}

export default Navbar