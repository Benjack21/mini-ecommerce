import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import api from '../api'
import '../styles/Notifications.css'

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  const fetchNotifications = useCallback(() => {
    api.get('/notifications/')
      .then(res => setNotifications(res.data))
      .catch(err => console.error('Error al obtener notificaciones:', err))
      .finally(() => setLoading(false))
  }, [])

  const markAllRead = useCallback(() => {
    api.patch('/notifications/read/', {})
      .catch(err => console.error('Error al marcar notificaciones:', err))
  }, [])

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchNotifications()
    markAllRead()
  }, [token, navigate, fetchNotifications, markAllRead])

  if (loading) return <Spinner />

  return (
    <div className="notif-wrapper">
      <div className="notif-container">
        <h1 className="notif-title">🔔 Notificaciones</h1>

        {notifications.length === 0 ? (
          <div className="notif-empty">
            <p className="notif-empty__icon">🔕</p>
            <p className="notif-empty__text">No tienes notificaciones</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map((n, index) => (
              <div
                key={n.id}
                className={`notif-item ${index !== notifications.length - 1 ? 'notif-item--border' : ''} ${!n.read ? 'notif-item--unread' : ''}`}
              >
                <div className="notif-item__row">
                  <p className="notif-item__message">{n.message}</p>
                  <span className="notif-item__date">{n.created_at}</span>
                </div>
                {!n.read && (
                  <span className="notif-item__badge">Nueva</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications