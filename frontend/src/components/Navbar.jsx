import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function Navbar() {
  const token = localStorage.getItem('token')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!token) return
    axios.get('http://127.0.0.1:8000/api/me/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setIsAdmin(res.data.is_staff))
    .catch(() => setIsAdmin(false))
  }, [token])

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">🛒 MiniShop</Link>
      <div className="flex gap-4 items-center">
        {token && <Link to="/cart" className="hover:text-gray-300">🛒 Carrito</Link>}
        {token && isAdmin && <Link to="/admin-panel" className="hover:text-yellow-400">⚙️ Admin</Link>}
        {!token && <Link to="/login" className="hover:text-gray-300">Login</Link>}
        {!token && <Link to="/register" className="bg-blue-600 px-4 py-1 rounded hover:bg-blue-700">Registro</Link>}
        {token && <button onClick={() => { localStorage.removeItem('token'); window.location.reload() }}
          className="bg-red-600 px-4 py-1 rounded hover:bg-red-700">Salir</button>}
        {token && <Link to="/profile" className="hover:text-gray-300">👤 Perfil</Link>}
      </div>
    </nav>
  )
}

export default Navbar