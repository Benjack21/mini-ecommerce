import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/Login.css';

function Register() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    rut: '',
    phone: '',
    email: '',
    birth_date: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.first_name || !form.last_name || !form.rut || !form.phone || !form.email || !form.password) {
      setError('Todos los campos obligatorios deben estar llenos');
      return;
    }

    if (!(form.email || '').toLowerCase().endsWith('@gmail.com')) {
      setError('El correo electrónico debe ser de @gmail.com');
      return;
    }

    setLoading(true);
    try {
      await authService.register(form);
      navigate('/login');
    } catch (err) {
      console.error('Error al registrarse:', err);
      setError(err.response?.data?.error || 'Error al registrarse. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-header__title">Crear cuenta</h1>
          <p className="login-header__subtitle">Únete a MiniShop</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <input
            className="login-form__input"
            placeholder="Nombre"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          />
          <input
            className="login-form__input"
            placeholder="Apellido"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          />
          <input
            className="login-form__input"
            placeholder="RUT"
            value={form.rut}
            onChange={(e) => setForm({ ...form, rut: e.target.value })}
          />
          <input
            className="login-form__input"
            placeholder="Teléfono"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            className="login-form__input"
            type="email"
            placeholder="Correo (@gmail.com)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="login-form__input"
            type="date"
            placeholder="Fecha de Nacimiento"
            value={form.birth_date}
            onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
          />
          <input
            className="login-form__input"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button type="submit" disabled={loading} className="login-form__btn">
            {loading ? 'Creando cuenta…' : 'Registrarse'}
          </button>
        </form>

        <p className="login-footer">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="login-footer__link">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
