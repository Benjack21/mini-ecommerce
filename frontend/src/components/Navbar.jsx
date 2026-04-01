import { Link } from 'react-router-dom'

function Navbar() {
  const token = localStorage.getItem('token')

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">🛒 MiniShop</Link>
      <div className="flex gap-4 items-center">
        {token && <Link to="/cart" className="hover:text-gray-300">🛒 Carrito</Link>}
        {!token && <Link to="/login" className="hover:text-gray-300">Login</Link>}
        {!token && <Link to="/register" className="bg-blue-600 px-4 py-1 rounded hover:bg-blue-700">Registro</Link>}
        {token && <button onClick={() => { localStorage.removeItem('token'); window.location.reload() }} className="bg-red-600 px-4 py-1 rounded hover:bg-red-700">Salir</button>}
      </div>
    </nav>
  )
}

export default Navbar