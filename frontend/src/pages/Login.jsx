import { useState } from 'react'
import axios from 'axios'

function Login() {
  const [form, setForm] = useState({ username: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/token/', form)
      localStorage.setItem('token', res.data.access)
      alert('¡Login exitoso!')
    } catch {
      alert('Credenciales incorrectas')
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
        <input className="w-full border px-3 py-2 rounded mb-4" placeholder="Usuario"
          onChange={e => setForm({...form, username: e.target.value})} />
        <input className="w-full border px-3 py-2 rounded mb-6" type="password" placeholder="Contraseña"
          onChange={e => setForm({...form, password: e.target.value})} />
        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Entrar
        </button>
      </div>
    </div>
  )
}

export default Login