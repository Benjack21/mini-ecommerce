import { Navigate } from 'react-router-dom'

function PrivateRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem('token')

  if (!token) return <Navigate to="/login" />

  if (adminOnly) {
    let isStaff = false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      isStaff = payload.is_staff
    } catch {
      return <Navigate to="/login" />
    }

    if (!isStaff) return <Navigate to="/" />
  }

  return children
}

export default PrivateRoute