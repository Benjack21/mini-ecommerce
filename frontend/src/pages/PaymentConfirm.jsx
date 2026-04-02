import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, useSearchParams } from 'react-router-dom'

function PaymentConfirm() {
  const [searchParams] = useSearchParams()
  const token = localStorage.getItem('token')
  const navigate = useNavigate()
  const token_ws = searchParams.get('token_ws')
  const [status, setStatus] = useState(token_ws ? 'loading' : 'error')

  useEffect(() => {
    if (!token_ws) return

    axios.post('http://127.0.0.1:8000/api/payment/confirm/',
      { token_ws },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(() => setStatus('success'))
    .catch(() => setStatus('error'))
  }, [token, token_ws])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center max-w-sm w-full">

        {status === 'loading' && (
          <>
            <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Confirmando pago...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <p className="text-5xl mb-4">✅</p>
            <h1 className="text-xl font-bold text-gray-900 mb-2">¡Pago exitoso!</h1>
            <p className="text-gray-400 text-sm mb-6">Tu orden ha sido creada correctamente.</p>
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-gray-900 text-white py-2 rounded-xl text-sm hover:bg-gray-700 transition-colors"
            >
              Ver mis órdenes
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <p className="text-5xl mb-4">❌</p>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Pago rechazado</h1>
            <p className="text-gray-400 text-sm mb-6">Hubo un problema con tu pago.</p>
            <button
              onClick={() => navigate('/cart')}
              className="w-full bg-gray-900 text-white py-2 rounded-xl text-sm hover:bg-gray-700 transition-colors"
            >
              Volver al carrito
            </button>
          </>
        )}

      </div>
    </div>
  )
}

export default PaymentConfirm