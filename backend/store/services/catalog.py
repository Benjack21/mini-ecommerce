from django.db.models import Sum

from ..models import OrderItem, Product


def get_catalog_stats():
    """[FASE 2.1] Retorna estadísticas básicas del catálogo."""
    return {
        "total_products": Product.objects.count(),
        "total_categories": Product.objects.values("category").distinct().count(),
    }


def get_top_products(limit=5):
    """[FASE 2.1] Retorna los productos más vendidos."""
    return (
        OrderItem.objects.values("product__name").annotate(total_sold=Sum("quantity")).order_by("-total_sold")[:limit]
    )
