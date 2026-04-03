from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import CategoryViewSet, ProductViewSet, CartItemViewSet, register, add_to_cart, get_cart, me, get_orders, get_cart, place_order, reviews, analytics, create_payment, confirm_payment, product_images, wishlist

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'cartitems', CartItemViewSet)  # CRUD completo en /api/cartitems/

urlpatterns = router.urls + [
    path('register/', register),
    path('cart/add/', add_to_cart),   # lógica personalizada
    path('cart/me/', get_cart),       # carrito del usuario actual
    path('me/', me),
    path('orders/place/', place_order),
    path('orders/me/', get_orders),
    path('products/<int:product_id>/reviews/', reviews),
    path('products/<int:product_id>/images/', product_images),
    path('analytics/', analytics),
    path('payment/create/', create_payment),
    path('payment/confirm/', confirm_payment),
    path('wishlist/', wishlist),
]