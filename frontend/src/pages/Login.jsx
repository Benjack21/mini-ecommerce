import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/Login.css';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('El correo y la contraseña son requeridos');
      return;
    }

    setLoading(true);
    try {
      await authService.login(form);
      navigate('/');
    } catch (err) {
      // api.js NO redirige en 401 de /token/, así que el mensaje se ve.
      setError(err.response?.data?.error || 'Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-header__title">Iniciar sesión</h1>
          <p className="login-header__subtitle">Bienvenido de vuelta</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <input
            className="login-form__input"
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="login-form__input"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button type="submit" disabled={loading} className="login-form__btn">
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="login-footer">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="login-footer__link">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
