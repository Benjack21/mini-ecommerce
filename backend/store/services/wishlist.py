from ..models import Product, Wishlist


def get_user_wishlist(user):
    """[FASE 2.1] Obtiene la wishlist del usuario."""
    items = Wishlist.objects.filter(user=user)
    return [
        {
            "id": item.id,
            "product_id": item.product.id,
            "name": item.product.name,
            "price": str(item.product.price),
            "image_url": item.product.image_url,
        }
        for item in items
    ]


def add_to_wishlist(user, product_id):
    """[FASE 2.1] Agrega producto a la wishlist."""
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return None, "Producto no encontrado"

    item, created = Wishlist.objects.get_or_create(user=user, product=product)
    if not created:
        return None, "Ya está en tu wishlist"
    return item, None


def remove_from_wishlist(user, product_id):
    """[FASE 2.1] Elimina producto de la wishlist."""
    Wishlist.objects.filter(user=user, product_id=product_id).delete()
    return True, None
