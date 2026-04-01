import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function ProtectedRoute({ children, adminOnly = false }) {
  const [allowed, setAllowed] = useState(!adminOnly)
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    if (adminOnly) {
      axios.get('http://127.0.0.1:8000/api/me/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.data.is_staff) {
          setAllowed(true)
        } else {
          navigate('/')
        }
      })
      .catch(() => navigate('/login'))
    }
  }, [token, adminOnly, navigate])

  if (!allowed) return <p className="p-6 text-gray-400">Cargando...</p>
  return children
}

export default ProtectedRoute