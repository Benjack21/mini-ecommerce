from ..models import CartItem, Product

def add_to_cart(user, product_id, quantity=1):
    """[FASE 2.1] Agrega un producto al carrito del usuario."""
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return None, "Producto no encontrado"

    cart_item, created = CartItem.objects.get_or_create(user=user, product=product)
    if created:
        cart_item.quantity = quantity
    else:
        cart_item.quantity += quantity
    cart_item.save()
    return cart_item, None

def get_cart_items(user):
    """[FASE 2.1] Obtiene los ítems del carrito para un usuario."""
    items = CartItem.objects.filter(user=user)
    data = [
        {
            'id': item.id,
            'product': item.product.name,
            'price': str(item.product.price),
            'quantity': item.quantity,
            'total': str(item.product.price * item.quantity)
        }
        for item in items
    ]
    return data
