from django.contrib import admin
from .models import Category, Product, CartItem, Order, OrderItem, Review, ProductImage, Wishlist, Notification

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(CartItem)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Review)
admin.site.register(ProductImage)
admin.site.register(Wishlist)
admin.site.register(Notification)
#Guarda y recarga la página del admin. Ahora deberías ver **Categories, Products y Cart Items** en el panel.
### 🧪 Agrega datos de prueba

#Desde el admin crea:

#**2 categorías:**
#- `Electrónica`
#- `Ropa`

#**2 productos:**
#- Nombre: `Audífonos Bluetooth`, Precio: `29.99`, Stock: `10`, Categoría: `Electrónica`
#- Nombre: `Polera Negra`, Precio: `14.99`, Stock: `25`, Categoría: `Ropa`

#Para la imagen puedes usar cualquier URL de imagen de internet, por ejemplo:
#```
#https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400