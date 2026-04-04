import { useState, useRef, useEffect } from 'react'

function SupportChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy el asistente de MiniShop. ¿En qué puedo ayudarte? 😊' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${import.meta.env.VITE_GROQ_API_KEY}'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `Eres un asistente de soporte de MiniShop, una tienda online chilena.

              INFORMACIÓN DE LA TIENDA:
              - Vendemos productos electrónicos y ropa
              - Aceptamos pagos con Webpay (tarjetas de crédito y débito)
              - Los pedidos se procesan inmediatamente después del pago
              - No hacemos despacho a domicilio por ahora, solo retiro en tienda

              PREGUNTAS FRECUENTES:
              - ¿Cómo compro? → Agrega productos al carrito y paga con Webpay
              - ¿Cómo veo mis pedidos? → Ve a tu perfil y click en "Mis órdenes"
              - ¿Puedo devolver un producto? → Sí, tienes 7 días para devoluciones
              - ¿Cómo contacto soporte? → Por este chat o al email soporte@minishop.cl
              - ¿Tienen garantía? → Sí, todos los productos tienen 6 meses de garantía

              FUNCIONALIDADES:
              - Wishlist, reseñas, notificaciones, carrito con cantidades modificables

              INSTRUCCIONES:
              - Responde siempre en español
              - Sé amable y breve
              - Si no sabes algo, di que lo consultarás con el equipo`
            },
            ...updatedMessages.filter(msg => msg.role === 'user')
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      const data = await response.json()
      console.log('Respuesta de Groq:', data)

      if (!response.ok) {
        console.error('Error de Groq:', data)
        throw new Error(data.error?.message || 'Error desconocido')
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.choices[0].message.content
      }])
    } catch (err) {
      console.error('Error completo:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, hubo un error. Por favor intenta de nuevo. 😔'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-gray-900 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-gray-700 transition-colors z-50"
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col z-50 overflow-hidden">
          <div className="bg-gray-900 text-white px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-900 text-sm font-bold">
              AI
            </div>
            <div>
              <p className="text-sm font-semibold">Soporte MiniShop</p>
              <p className="text-xs text-gray-400">Asistente IA · Groq</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-h-80">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-gray-900 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-700 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-400 px-3 py-2 rounded-2xl rounded-bl-sm text-sm">
                  Escribiendo...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-100 p-3 flex gap-2">
            <input
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Escribe tu pregunta..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  sendMessage()
                }
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-gray-900 text-white px-3 py-2 rounded-xl text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default SupportChat