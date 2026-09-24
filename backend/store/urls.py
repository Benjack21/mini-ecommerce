from django.urls import path
from rest_framework.routers import DefaultRouter

# [FASE 1.x] Se quitó el import duplicado de get_cart (aparecía dos veces).
from .views import (
    CartItemViewSet,
    CategoryViewSet,
    ProductViewSet,
    add_to_cart,
    analytics,
    confirm_payment,
    create_payment,
    get_cart,
    get_notifications,
    get_orders,
    groq_chat,
    mark_notifications_read,
    me,
    place_order,
    product_images,
    register,
    reviews,
    wishlist,
)

router = DefaultRouter()
router.register(r"categories", CategoryViewSet)
router.register(r"products", ProductViewSet)
router.register(r"cartitems", CartItemViewSet)  # CRUD completo en /api/cartitems/

urlpatterns = router.urls + [
    path("register/", register),
    path("cart/add/", add_to_cart),  # lógica personalizada
    path("cart/me/", get_cart),  # carrito del usuario actual
    path("me/", me),
    path("orders/place/", place_order),
    path("orders/me/", get_orders),
    path("products/<int:product_id>/reviews/", reviews),
    path("products/<int:product_id>/images/", product_images),
    path("analytics/", analytics),
    path("payment/create/", create_payment),
    path("payment/confirm/", confirm_payment),
    path("wishlist/", wishlist),
    path("notifications/", get_notifications),
    path("notifications/read/", mark_notifications_read),
    path("chat/", groq_chat),
]
