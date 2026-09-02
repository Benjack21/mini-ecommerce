import { useNavigate } from 'react-router-dom'
import '../styles/NotFound.css'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="notfound-wrapper">
      <div className="notfound-inner">
        <p className="notfound-code">404</p>
        <h1 className="notfound-title">Página no encontrada</h1>
        <p className="notfound-text">La página que buscas no existe o fue movida.</p>
        <div className="notfound-actions">
          <button onClick={() => navigate(-1)} className="notfound-btn-back">
            ← Volver
          </button>
          <button onClick={() => navigate('/')} className="notfound-btn-home">
            Ir a la tienda
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound