import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-8xl font-bold text-gray-900 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Página no encontrada</h1>
        <p className="text-gray-400 mb-8">La página que buscas no existe o fue movida.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="border border-gray-200 text-gray-500 px-6 py-2 rounded-xl text-sm hover:bg-gray-100 transition-colors"
          >
            ← Volver
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm hover:bg-gray-700 transition-colors"
          >
            Ir a la tienda
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound