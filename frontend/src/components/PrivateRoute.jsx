import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function PrivateRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem('token');

  if (!token) return <Navigate to="/login" />;

  if (adminOnly) {
    let isStaff = false;
    try {
      const payload = jwtDecode(token);
      isStaff = !!payload.is_staff;
    } catch {
      return <Navigate to="/login" />;
    }

    if (!isStaff) return <Navigate to="/" />;
  }

  return children;
}

export default PrivateRoute;
