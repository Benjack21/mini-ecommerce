from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import CategoryViewSet, ProductViewSet, CartItemViewSet, register, add_to_cart, get_cart

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'cartitems', CartItemViewSet)  # CRUD completo en /api/cartitems/

urlpatterns = router.urls + [
    path('register/', register),
    path('cart/add/', add_to_cart),   # lógica personalizada
    path('cart/me/', get_cart),       # carrito del usuario actual
]