import { useState } from 'react'
import api from '../api'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Login.css'

function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/token/', form)
      localStorage.setItem('token', res.data.access)
      navigate('/')
    } catch {
      setError('Usuario o contraseña incorrectos')
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <div className="login-header">
          <h1 className="login-header__title">Iniciar sesión</h1>
          <p className="login-header__subtitle">Bienvenido de vuelta</p>
        </div>

        {error && (
          <div className="login-error">{error}</div>
        )}

        <div className="login-form">
          <input
            className="login-form__input"
            placeholder="Usuario"
            onChange={e => setForm({...form, username: e.target.value})}
          />
          <input
            className="login-form__input"
            type="password"
            placeholder="Contraseña"
            onChange={e => setForm({...form, password: e.target.value})}
          />
          <button onClick={handleSubmit} className="login-form__btn">
            Entrar
          </button>
        </div>

        <p className="login-footer">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="login-footer__link">
            Regístrate
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Login