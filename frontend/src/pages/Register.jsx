import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import '../styles/Login.css'

function Register() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    try {
      await api.post('/register/', form)
      navigate('/login')
    } catch (err) {
      console.error('Error al registrarse:', err)
      setError('Error al registrarse. El usuario ya existe.')
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <div className="login-header">
          <h1 className="login-header__title">Crear cuenta</h1>
          <p className="login-header__subtitle">Únete a MiniShop</p>
        </div>

        {error && (
          <div className="login-error">{error}</div>
        )}

        <div className="login-form">
          <input
            className="login-form__input"
            placeholder="Usuario"
            value={form.username}
            onChange={e => setForm({...form, username: e.target.value})}
          />
          <input
            className="login-form__input"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
          />
          <button onClick={handleSubmit} className="login-form__btn">
            Registrarse
          </button>
        </div>

        <p className="login-footer">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="login-footer__link">
            Inicia sesión
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Register