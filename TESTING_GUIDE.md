# 💳 Guía de Pruebas de Pago (Webpay Plus)

Este documento contiene las credenciales y tarjetas de prueba proporcionadas por Transbank para validar el flujo de pagos en el ambiente de integración (TEST).

## 🔑 Autenticación de Usuario
Cuando el simulador de Webpay solicite autenticación mediante RUT y clave, utiliza los siguientes datos:

- **RUT:** `11.111.111-1`
- **Clave:** `123`

## 💳 Tarjetas de Prueba

| Tipo de Tarjeta | Número de Tarjeta | CVV | Expiración | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- |
| **VISA** | `4051 8856 0044 6623` | `123` | Cualquiera | ✅ Aprobada |
| **AMEX** | `3700 0000 0002 032` | `1234` | Cualquiera | ✅ Aprobada |
| **MASTERCARD** | `5186 0595 5959 0568` | `123` | Cualquiera | ❌ Rechazada |
| **Redcompra 1** | `4051 8842 3993 7763` | - | - | ✅ Aprobada |
| **Redcompra 2** | `4511 3466 6003 7060` | - | - | ✅ Aprobada |
| **Redcompra 3** | `5186 0085 4123 3829` | - | - | ❌ Rechazada |
| **Prepago VISA** | `4051 8860 0005 6590` | `123` | Cualquiera | ✅ Aprobada |
| **Prepago MC** | `5186 1741 1062 9480` | `123` | Cualquiera | ❌ Rechazada |

## 🚀 Flujo de Verificación

1. Iniciar sesión en la aplicación.
2. Agregar productos al carrito.
3. Hacer clic en el botón de **Pagar**.
4. Ser redirigido al portal de pruebas de Transbank.
5. Seleccionar el método de pago y usar una de las tarjetas anteriores.
6. Verificar que la aplicación procese la respuesta correctamente:
   - **Si es Aprobada**: La orden debe crearse, el carrito vaciarse y mostrarse el mensaje de éxito.
   - **Si es Rechazada**: Debe mostrarse el error de "Pago rechazado".
