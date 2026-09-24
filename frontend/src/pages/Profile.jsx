import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cartService } from '../services/cartService';
import { clearSession } from '../api';
import { useAuth } from '../hooks/useAuth';
import '../styles/Profile.css';

function Profile() {
  const [cartCount, setCartCount] = useState(0);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  // [FIX] Antes leía user.username: /api/me/ no lo devuelve y
  // user.username.charAt(0) lanzaba TypeError desmontando toda la app
  // (no hay ErrorBoundary en main.jsx).
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    cartService
      .getCart()
      .then((items) => setCartCount(Array.isArray(items) ? items.length : 0))
      .catch(() => setCartCount(0));
  }, [token, navigate]);

  if (!token) return null;

  if (loading || !user) {
    return (
      <div className="profile-loading">
        <p className="profile-loading__text">Cargando perfil...</p>
      </div>
    );
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
  const displayName = fullName || user.email || 'Mi cuenta';
  const initial = (user.first_name || user.email || '?').charAt(0).toUpperCase();

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <h1 className="profile-title">Mi Perfil</h1>

        {/* Avatar y nombre */}
        <div className="profile-avatar-card">
          <div className="profile-avatar">{initial}</div>
          <h2 className="profile-avatar-card__name">{displayName}</h2>
          {user.email && <p className="profile-avatar-card__email">{user.email}</p>}
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
            <p className="profile-stat-card__label">
              {user.is_staff ? 'Administrador' : 'Cliente'}
            </p>
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
            clearSession();
            window.location.href = '/';
          }}
          className="profile-btn-logout"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default Profile;
