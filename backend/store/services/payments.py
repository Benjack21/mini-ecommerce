from decouple import config
from transbank.common.integration_type import IntegrationType
from transbank.common.options import WebpayOptions
from transbank.webpay.webpay_plus.transaction import Transaction

from ..models import CartItem, Notification, Order, OrderItem


def _get_webpay_transaction() -> Transaction:
    """[FASE 2.1] Construye la instancia de Transbank."""
    return Transaction(
        WebpayOptions(
            commerce_code=config("TBK_COMMERCE_CODE"),
            api_key=config("TBK_API_KEY"),
            integration_type=(
                IntegrationType.TEST
                if config("TBK_INTEGRATION_TYPE", default="TEST") == "TEST"
                else IntegrationType.LIVE
            ),
        )
    )


def create_payment_session(user):
    """[FASE 2.1] Crea una sesión de pago en Webpay."""
    items = CartItem.objects.filter(user=user)
    if not items.exists():
        return None, "El carrito está vacío"

    total = int(sum(item.product.price * item.quantity for item in items))
    buy_order = f"order-{user.id}-{Order.objects.count() + 1}"
    session_id = f"session-{user.id}"
    return_url = config("TBK_RETURN_URL", default="http://localhost:5173/payment/confirm")

    tx = _get_webpay_transaction()
    response = tx.create(buy_order, session_id, total, return_url)
    return response, None


def confirm_payment(user, token):
    """[FASE 2.1] Confirma el pago y crea la orden."""
    tx = _get_webpay_transaction()
    response = tx.commit(token)

    if response["status"] == "AUTHORIZED":
        items = CartItem.objects.filter(user=user)
        total = sum(item.product.price * item.quantity for item in items)
        order = Order.objects.create(user=user, total=total)
        for item in items:
            OrderItem.objects.create(
                order=order, product=item.product, quantity=item.quantity, price=item.product.price
            )
        items.delete()
        Notification.objects.create(user=user, message=f"✅ Tu orden #{order.id} fue creada exitosamente por ${total}")
        return order, None

    return None, "Pago rechazado"
