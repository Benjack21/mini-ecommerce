import { useEffect } from 'react'

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const colors = {
    success: 'bg-gray-900 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-400 text-gray-900',
  }

  return (
    <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 transition-all ${colors[type]}`}>
      {message}
    </div>
  )
}

export default Toast