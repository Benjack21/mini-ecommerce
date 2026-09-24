import requests as http_requests
from decouple import config


def get_groq_response(messages):
    """[FASE 2.1] Lógica de comunicación con Groq API."""
    # messages ya debe venir filtrado/validado desde la view
    try:
        response = http_requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f'Bearer {config("GROQ_API_KEY")}', "Content-Type": "application/json"},
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {
                        "role": "system",
                        "content": """Eres un asistente de soporte de MiniShop, una tienda online chilena.

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

INSTRUCCIONES:
- Responde siempre en español
- Sé amable y breve""",
                    },
                    *messages,
                ],
                "max_tokens": 500,
                "temperature": 0.7,
            },
            timeout=15,
        )
        response.raise_for_status()
        return response.json(), None
    except http_requests.RequestException:
        return None, "No se pudo contactar al asistente"
