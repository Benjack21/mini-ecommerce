from django.db.models import Sum

from ..models import Order, OrderItem


def get_admin_analytics():
    """[FASE 2.1] Agregaciones para el panel admin."""
    total_revenue = Order.objects.aggregate(Sum("total"))["total__sum"] or 0

    top_products = (
        OrderItem.objects.values("product__name").annotate(total_sold=Sum("quantity")).order_by("-total_sold")[:5]
    )

    recent_orders = Order.objects.order_by("-created_at")[:5]
    recent_data = [
        {
            "id": o.id,
            "user": o.user.username,
            "total": str(o.total),
            "created_at": o.created_at.strftime("%d/%m/%Y %H:%M"),
        }
        for o in recent_orders
    ]

    return {
        "total_revenue": str(total_revenue),
        "top_products": list(top_products),
        "recent_orders": recent_data,
    }
