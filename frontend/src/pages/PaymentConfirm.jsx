import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api'
import '../styles/PaymentConfirm.css'

function PaymentConfirm() {
  const [searchParams] = useSearchParams()
  const token = localStorage.getItem('token')
  const navigate = useNavigate()
  const token_ws = searchParams.get('token_ws')

  const [status, setStatus] = useState(
    token_ws && token ? 'loading' : 'error'
  )

  useEffect(() => {
    if (!token_ws || !token) return
    api.post('/payment/confirm/', { token_ws })
      .then(() => setStatus('success'))
      .catch(err => {
        console.error('Error al confirmar pago:', err)
        setStatus('error')
      })
  }, [token, token_ws])

  return (
    <div className="payment-wrapper">
      <div className="payment-card">

        {status === 'loading' && (
          <>
            <div className="payment-spinner"></div>
            <p className="payment-loading__text">Confirmando pago...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <p className="payment-icon">✅</p>
            <h1 className="payment-title">¡Pago exitoso!</h1>
            <p className="payment-text">Tu orden ha sido creada correctamente.</p>
            <button onClick={() => navigate('/orders')} className="payment-btn">
              Ver mis órdenes
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <p className="payment-icon">❌</p>
            <h1 className="payment-title">Pago rechazado</h1>
            <p className="payment-text">Hubo un problema con tu pago.</p>
            <button onClick={() => navigate('/cart')} className="payment-btn">
              Volver al carrito
            </button>
          </>
        )}

      </div>
    </div>
  )
}

export default PaymentConfirm