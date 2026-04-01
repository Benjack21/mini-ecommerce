import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

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

  if (!user) return <p className="p-6 text-gray-400">Cargando perfil...</p>

  return (
    <div className="max-w-md mx-auto p-6 mt-10">
      <div className="border rounded-lg shadow p-6 text-center">

        <div className="w-20 h-20 rounded-full bg-blue-600 text-white text-3xl flex items-center justify-center mx-auto mb-4">
          {user.username.charAt(0).toUpperCase()}
        </div>

        <h1 className="text-2xl font-bold mb-1">{user.username}</h1>
        <p className="text-gray-400 text-sm mb-6">
          {user.is_staff ? '⚙️ Administrador' : '🛍️ Cliente'}
        </p>

        <div className="flex justify-around border-t pt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{cartCount}</p>
            <p className="text-gray-500 text-sm">Items en carrito</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {user.is_staff ? 'Admin' : 'Cliente'}
            </p>
            <p className="text-gray-500 text-sm">Rol</p>
          </div>
        </div>

        <button
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/' }}
          className="mt-6 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          Cerrar sesión
        </button>

      </div>
    </div>
  )
}

export default Profile