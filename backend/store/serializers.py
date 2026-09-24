from rest_framework import serializers

from .models import CartItem, Category, Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = "__all__"


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = "__all__"


class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = "__all__"
        # [FASE 1.3] `user` solo lectura: no se acepta desde el body.
        # El ViewSet lo fuerza con perform_create(user=request.user).
        # Previene que alguien cree ítems en el carrito de otro usuario.
        read_only_fields = ("user",)
