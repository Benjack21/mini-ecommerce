from ..models import Review

def get_product_reviews(product_id):
    """[FASE 2.1] Obtiene reseñas de un producto."""
    reviews = Review.objects.filter(product_id=product_id).order_by('-created_at')
    return [
        {
            'id': r.id,
            'user': r.user.username,
            'rating': r.rating,
            'comment': r.comment,
            'created_at': r.created_at.strftime('%d/%m/%Y')
        }
        for r in reviews
    ]

def create_review(user, product_id, rating, comment):
    """[FASE 2.1] Crea una reseña si el usuario no ha reseñado el producto."""
    if Review.objects.filter(user=user, product_id=product_id).exists():
        return None, "Ya reseñaste este producto"
    
    review = Review.objects.create(
        user=user,
        product_id=product_id,
        rating=rating,
        comment=comment
    )
    return review, None
