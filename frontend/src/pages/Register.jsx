import { useState } from 'react'
import axios from 'axios'

function Register() {
  const [form, setForm] = useState({ username: '', password: '' })

  const handleSubmit = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/register/', form)
      alert('¡Registro exitoso! Ya puedes iniciar sesión.')
    } catch {
      alert('Error al registrarse')
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Crear Cuenta</h2>
        <input className="w-full border px-3 py-2 rounded mb-4" placeholder="Usuario"
          onChange={e => setForm({...form, username: e.target.value})} />
        <input className="w-full border px-3 py-2 rounded mb-6" type="password" placeholder="Contraseña"
          onChange={e => setForm({...form, password: e.target.value})} />
        <button onClick={handleSubmit} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Registrarse
        </button>
      </div>
    </div>
  )
}

export default Register