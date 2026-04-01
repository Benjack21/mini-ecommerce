import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

function Register() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/register/', form)
      navigate('/login')
    } catch {
      setError('Error al registrarse. El usuario ya existe.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-sm border border-gray-100 p-8">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-gray-400 text-sm mt-1">Únete a MiniShop</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <input
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            placeholder="Usuario"
            onChange={e => setForm({...form, username: e.target.value})}
          />
          <input
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            type="password"
            placeholder="Contraseña"
            onChange={e => setForm({...form, password: e.target.value})}
          />
          <button
            onClick={handleSubmit}
            className="bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors mt-2"
          >
            Registrarse
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-gray-900 font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Register