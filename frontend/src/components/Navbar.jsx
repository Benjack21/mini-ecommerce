import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'

function Navbar() {
  const token = localStorage.getItem('token')
  const [isAdmin, setIsAdmin] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const [notifCount, setNotifCount] = useState(0)


  useEffect(() => {
    if (!token) return
    axios.get('http://127.0.0.1:8000/api/me/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setIsAdmin(res.data.is_staff))
    .catch(() => setIsAdmin(false))

    axios.get('http://127.0.0.1:8000/api/cart/me/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setCartCount(res.data.length))
    .catch(() => setCartCount(0))

    axios.get('http://127.0.0.1:8000/api/notifications/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setNotifCount(res.data.filter(n => !n.read).length))
    .catch(() => setNotifCount(0))
  }, [token, location])

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

        {/* Links desktop */}
        <div className="hidden sm:flex items-center gap-6">
          <Link to="/" className={linkClass('/')}>Tienda</Link>
          {token && (
            <Link to="/cart" className={`${linkClass('/cart')} relative`}>
              Carrito
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-white text-gray-900 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          {token && <Link to="/wishlist" className={linkClass('/wishlist')}>Wishlist</Link>}
          {token && <Link to="/profile" className={linkClass('/profile')}>Perfil</Link>}
          {token && isAdmin && (
            <Link to="/admin-panel" className={linkClass('/admin-panel')}>Admin</Link>
          )}
          {token && (
            <Link to="/notifications" className={`${linkClass('/notifications')} relative`}>
              🔔
              {notifCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Acciones desktop */}
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
          {token && (
            <Link to="/cart" className="text-gray-400 hover:text-white text-sm flex items-center gap-2" onClick={() => setMenuOpen(false)}>
              Carrito
              {cartCount > 0 && (
                <span className="bg-white text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          {token && <Link to="/wishlist" className="text-gray-400 hover:text-white text-sm" onClick={() => setMenuOpen(false)}>Wishlist</Link>}
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