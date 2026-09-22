from ..models import ProductImage, Product

def add_product_image(product_id, url):
    """[FASE 2.1] Sube imagen de producto."""
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return None, "Producto no encontrado"
    
    image = ProductImage.objects.create(product=product, url=url)
    return image, None

def delete_product_image(product_id, image_id):
    """[FASE 2.1] Elimina imagen de producto."""
    ProductImage.objects.filter(id=image_id, product_id=product_id).delete()
    return True, None

def update_product_image(product_id, image_id, url):
    """[FASE 2.1] Actualiza URL de imagen."""
    ProductImage.objects.filter(id=image_id, product_id=product_id).update(url=url)
    return True, None
