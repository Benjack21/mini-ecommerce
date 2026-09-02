import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import '../styles/Profile.css'

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
    api.get('/me/')
      .then(res => setUser(res.data))
      .catch(() => navigate('/login'))

    api.get('/cart/me/')
      .then(res => setCartCount(res.data.length))
      .catch(err => console.error('Error al obtener carrito:', err))
  }, [token, navigate])

  if (!user) return (
    <div className="profile-loading">
      <p className="profile-loading__text">Cargando perfil...</p>
    </div>
  )

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <h1 className="profile-title">Mi Perfil</h1>

        {/* Avatar y nombre */}
        <div className="profile-avatar-card">
          <div className="profile-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h2 className="profile-avatar-card__name">{user.username}</h2>
          <span className={user.is_staff ? 'profile-badge--staff' : 'profile-badge--client'}>
            {user.is_staff ? '⚙️ Administrador' : '🛍️ Cliente'}
          </span>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="profile-stat-card">
            <p className="profile-stat-card__value">{cartCount}</p>
            <p className="profile-stat-card__label">Items en carrito</p>
          </div>
          <div className="profile-stat-card">
            <p className="profile-stat-card__value">{user.is_staff ? '⚙️' : '🛍️'}</p>
            <p className="profile-stat-card__label">{user.is_staff ? 'Administrador' : 'Cliente'}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="profile-actions">
          <Link to="/cart" className="profile-action-link profile-action-link--border">
            <span className="profile-action-link__label">Ver mi carrito</span>
            <span className="profile-action-link__arrow">→</span>
          </Link>

          {user.is_staff && (
            <Link to="/admin-panel" className="profile-action-link profile-action-link--border">
              <span className="profile-action-link__label">Panel de administración</span>
              <span className="profile-action-link__arrow">→</span>
            </Link>
          )}

          <Link to="/orders" className="profile-action-link profile-action-link--border">
            <span className="profile-action-link__label">Mis órdenes</span>
            <span className="profile-action-link__arrow">→</span>
          </Link>

          <Link to="/" className="profile-action-link">
            <span className="profile-action-link__label">Ver tienda</span>
            <span className="profile-action-link__arrow">→</span>
          </Link>
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={() => {
            localStorage.removeItem('token')
            window.location.href = '/'
          }}
          className="profile-btn-logout"
        >
          Cerrar sesión
        </button>

      </div>
    </div>
  )
}

export default Profile