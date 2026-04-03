import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  const fetchNotifications = useCallback(() => {
    axios.get('http://127.0.0.1:8000/api/notifications/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setNotifications(res.data))
    .catch(err => console.error(err))
    .finally(() => setLoading(false))
  }, [token])

  const markAllRead = useCallback(() => {
    axios.patch('http://127.0.0.1:8000/api/notifications/read/', {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(err => console.error(err))
  }, [token])

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchNotifications()
    markAllRead()
  }, [token, navigate, fetchNotifications, markAllRead])

  if (loading) return <Spinner />

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">🔔 Notificaciones</h1>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20">
            <p className="text-5xl mb-4">🔕</p>
            <p className="text-gray-400">No tienes notificaciones</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {notifications.map((n, index) => (
              <div
                key={n.id}
                className={`px-6 py-4 ${index !== notifications.length - 1 ? 'border-b border-gray-100' : ''} ${
                  !n.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <p className="text-sm text-gray-700">{n.message}</p>
                  <span className="text-xs text-gray-400 shrink-0">{n.created_at}</span>
                </div>
                {!n.read && (
                  <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    Nueva
                  </span>
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