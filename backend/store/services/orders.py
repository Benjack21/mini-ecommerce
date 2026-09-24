from ..models import CartItem, Order, OrderItem


def place_order(user):
    """[FASE 2.1] Convierte el carrito en una orden."""
    items = CartItem.objects.filter(user=user)
    if not items.exists():
        return None, "El carrito está vacío"

    total = sum(item.product.price * item.quantity for item in items)
    order = Order.objects.create(user=user, total=total)

    for item in items:
        OrderItem.objects.create(order=order, product=item.product, quantity=item.quantity, price=item.product.price)

    items.delete()
    return order, None


def get_user_orders(user):
    """[FASE 2.1] Retorna el historial de órdenes del usuario."""
    orders = Order.objects.filter(user=user).order_by("-created_at")
    data = [
        {
            "id": order.id,
            "total": str(order.total),
            "created_at": order.created_at.strftime("%d/%m/%Y %H:%M"),
            "items": [
                {
                    "product": item.product.name if item.product else "Producto eliminado",
                    "quantity": item.quantity,
                    "price": str(item.price),
                }
                for item in order.items.all()
            ],
        }
        for order in orders
    ]
    return data
