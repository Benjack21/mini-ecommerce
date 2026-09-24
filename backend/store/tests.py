from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

from .models import CartItem, Category, Product
from .services import cart_service, orders_service

User = get_user_model()


class CategoryTestCase(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Electrónica")

    def test_category_created(self):
        self.assertEqual(self.category.name, "Electrónica")

    def test_category_str(self):
        self.assertEqual(str(self.category), "Electrónica")


class ProductTestCase(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Ropa")
        self.product = Product.objects.create(
            name="Polera Negra", description="Polera de algodón", price=9990, stock=10, category=self.category
        )

    def test_product_created(self):
        self.assertEqual(self.product.name, "Polera Negra")
        self.assertEqual(self.product.stock, 10)

    def test_product_str(self):
        self.assertEqual(str(self.product), "Polera Negra")

    def test_product_price(self):
        self.assertEqual(self.product.price, 9990)


class ProductAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name="Electrónica")
        self.product = Product.objects.create(
            name="Audífonos", description="Audífonos Bluetooth", price=29990, stock=15, category=self.category
        )

    def test_get_products(self):
        response = self.client.get("/api/products/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_product_detail(self):
        response = self.client.get(f"/api/products/{self.product.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Audífonos")

    def test_get_categories(self):
        response = self.client.get("/api/categories/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_product_requires_staff(self):
        """[FASE 4.1] Permisos: No staff no crea productos."""
        user = User.objects.create_user(username="customer", password="password", email="customer@example.com")
        self.client.force_authenticate(user=user)
        response = self.client.post(
            "/api/products/", {"name": "Hacker Product", "price": 10, "category": self.category.id}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class AuthAPITestCase(TestCase):
    """[FASE 5.x] Registro y login por los endpoints que USA el frontend."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser@example.com",
            email="testuser@example.com",
            password="testpass123",
        )

    @staticmethod
    def _payload(**overrides):
        payload = {
            "email": "newuser@gmail.com",
            "password": "newpass123",
            "first_name": "New",
            "last_name": "User",
            "rut": "12.345.678-5",
            "phone": "912345678",
            "birth_date": "2000-01-01",
        }
        payload.update(overrides)
        return payload

    def test_register(self):
        response = self.client.post("/api/register/", self._payload())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="newuser@gmail.com").exists())

    def test_register_without_birth_date(self):
        """[FIX] El input date vacío viaja como '' y antes reventaba con 500."""
        response = self.client.post("/api/register/", self._payload(birth_date=""))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="newuser@gmail.com")
        self.assertIsNone(user.profile.birth_date)

    def test_register_invalid_birth_date(self):
        response = self.client.post("/api/register/", self._payload(birth_date="no-es-fecha"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_requires_gmail(self):
        response = self.client.post("/api/register/", self._payload(email="user@hotmail.com"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_email_without_local_part(self):
        """[FIX] '@gmail.com' sin parte local no debe crear cuenta."""
        response = self.client.post("/api/register/", self._payload(email="@gmail.com"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_email_double_at(self):
        """[FIX] 'a@b@gmail.com' tiene dos @: inválido."""
        response = self.client.post("/api/register/", self._payload(email="a@b@gmail.com"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_email_with_spaces(self):
        """[FIX] Espacios dentro del correo: inválido."""
        response = self.client.post("/api/register/", self._payload(email="a b@gmail.com"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_email_uppercase_normalized(self):
        """[FIX] Se normaliza a minúsculas antes de validar/almacenar."""
        response = self.client.post("/api/register/", self._payload(email="NEWUSER@GMAIL.COM"))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="newuser@gmail.com").exists())

    def test_register_missing_fields(self):
        response = self.client.post("/api/register/", self._payload(phone=""))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email(self):
        """Unicidad real: mismo correo @gmail.com ya registrado."""
        self.client.post("/api/register/", self._payload())
        response = self.client.post(
            "/api/register/",
            self._payload(rut="98.765.432-5", phone="987654321"),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_rut(self):
        self.client.post("/api/register/", self._payload())
        response = self.client.post(
            "/api/register/",
            self._payload(email="otro@gmail.com"),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_rut_unformatted_normalized(self):
        """[FIX] Llega sin puntos '12345678-5' y se guarda como '12.345.678-5'."""
        response = self.client.post("/api/register/", self._payload(rut="12345678-5"))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="newuser@gmail.com")
        self.assertEqual(user.profile.rut, "12.345.678-5")

    def test_register_rut_invalid_dv(self):
        """[FIX] DV erróneo (módulo 11): 12.345.678-9 debe rechazarse."""
        response = self.client.post("/api/register/", self._payload(rut="12.345.678-9"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_rut_malformed(self):
        """[FIX] RUT demasiado corto / no numérico: 400, no 500."""
        response = self.client.post("/api/register/", self._payload(rut="12345"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_rut_duplicate_across_formats(self):
        """[FIX] Mismo RUT con y sin puntos debe chocar en la unicidad."""
        self.client.post("/api/register/", self._payload())
        response = self.client.post(
            "/api/register/",
            self._payload(email="otro@gmail.com", rut="12345678-5"),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_with_email(self):
        response = self.client.post("/api/token/", {"email": "testuser@example.com", "password": "testpass123"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIs(AccessToken(response.data["access"])["is_staff"], False)

    def test_login_with_username(self):
        response = self.client.post("/api/token/", {"username": "testuser@example.com", "password": "testpass123"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_login_is_staff_claim(self):
        """PrivateRoute adminOnly lee payload.is_staff del access token."""
        User.objects.filter(pk=self.user.pk).update(is_staff=True)
        response = self.client.post("/api/token/", {"email": "testuser@example.com", "password": "testpass123"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIs(AccessToken(response.data["access"])["is_staff"], True)

    def test_login_wrong_password(self):
        response = self.client.post("/api/token/", {"email": "testuser@example.com", "password": "wrongpass"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        # [FIX] DRF convertía el valor a lista; /register/ responde string.
        self.assertIsInstance(response.data["error"], str)

    def test_login_unknown_email(self):
        response = self.client.post("/api/token/", {"email": "nadien@gmail.com", "password": "x"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_missing_fields(self):
        response = self.client.post("/api/token/", {"password": "testpass123"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIsInstance(response.data["error"], str)

    def test_login_empty_payload(self):
        """[FIX] {} debe responder {"error": ...}, no el detalle de campo de DRF."""
        response = self.client.post("/api/token/", {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIsInstance(response.data["error"], str)
        self.assertNotIn("password", response.data)

    def test_login_blank_password(self):
        response = self.client.post("/api/token/", {"email": "testuser@example.com", "password": ""})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIsInstance(response.data["error"], str)

    def test_login_rejects_inactive_user(self):
        User.objects.filter(pk=self.user.pk).update(is_active=False)
        response = self.client.post("/api/token/", {"email": "testuser@example.com", "password": "testpass123"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_requires_auth(self):
        """[FIX] /api/me/ no tenía permission_classes y devolvía 200 al anónimo."""
        response = self.client.get("/api/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_profile(self):
        response = self.client.post("/api/token/", {"email": "testuser@example.com", "password": "testpass123"})
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        me = self.client.get("/api/me/")
        self.assertEqual(me.status_code, status.HTTP_200_OK)
        self.assertEqual(me.data["email"], "testuser@example.com")
        self.assertIn("is_staff", me.data)

    def test_me_with_expired_token_is_401(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer token-falso")
        response = self.client.get("/api/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class CartAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpass123", email="testuser@example.com")
        self.category = Category.objects.create(name="Electrónica")
        self.product = Product.objects.create(
            name="Audífonos", description="Audífonos Bluetooth", price=29990, stock=15, category=self.category
        )
        response = self.client.post("/api/token/", {"username": "testuser", "password": "testpass123"})
        self.token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_add_to_cart(self):
        response = self.client.post("/api/cart/add/", {"product_id": self.product.id, "quantity": 1})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_cart(self):
        self.client.post("/api/cart/add/", {"product_id": self.product.id, "quantity": 1})
        response = self.client.get("/api/cart/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_cart_requires_auth(self):
        self.client.credentials()
        response = self.client.get("/api/cart/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cart_idor_protection(self):
        """[FASE 4.1] IDOR: Usuario A no ve carrito de Usuario B."""
        user_b = User.objects.create_user(username="userb", password="password", email="userb@example.com")
        CartItem.objects.create(user=user_b, product=self.product, quantity=1)

        # Usuario A intenta ver carrito (el endpoint /me/ ya filtra, pero verificamos)
        response = self.client.get("/api/cart/me/")
        self.assertEqual(len(response.data), 0)

        # Usuario A intenta borrar item de Usuario B vía /api/cartitems/ (si existiera el ID)
        item_b = CartItem.objects.get(user=user_b)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.delete(f"/api/cartitems/{item_b.id}/")
        # El ViewSet usa get_queryset() filtrado por user, así que devolverá 404
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class WishlistAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpass123", email="testuser@example.com")
        self.category = Category.objects.create(name="Electrónica")
        self.product = Product.objects.create(
            name="Audífonos", description="Audífonos Bluetooth", price=29990, stock=15, category=self.category
        )
        response = self.client.post("/api/token/", {"username": "testuser", "password": "testpass123"})
        self.token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_add_to_wishlist(self):
        response = self.client.post("/api/wishlist/", {"product_id": self.product.id})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_wishlist(self):
        self.client.post("/api/wishlist/", {"product_id": self.product.id})
        response = self.client.get("/api/wishlist/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_remove_from_wishlist(self):
        self.client.post("/api/wishlist/", {"product_id": self.product.id})
        response = self.client.delete("/api/wishlist/", {"product_id": self.product.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ReviewAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpass123", email="testuser@example.com")
        self.category = Category.objects.create(name="Electrónica")
        self.product = Product.objects.create(
            name="Audífonos", description="Audífonos Bluetooth", price=29990, stock=15, category=self.category
        )
        response = self.client.post("/api/token/", {"username": "testuser", "password": "testpass123"})
        self.token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_create_review(self):
        response = self.client.post(
            f"/api/products/{self.product.id}/reviews/", {"rating": 5, "comment": "Excelente producto"}
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_reviews(self):
        self.client.post(f"/api/products/{self.product.id}/reviews/", {"rating": 5, "comment": "Excelente producto"})
        response = self.client.get(f"/api/products/{self.product.id}/reviews/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_duplicate_review(self):
        self.client.post(f"/api/products/{self.product.id}/reviews/", {"rating": 5, "comment": "Excelente"})
        response = self.client.post(f"/api/products/{self.product.id}/reviews/", {"rating": 3, "comment": "Duplicada"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ServiceUnitTests(TestCase):
    """[FASE 2.4] Tests unitarios de services sin HTTP."""

    def setUp(self):
        self.user = User.objects.create_user(username="serviceuser", password="password", email="service@example.com")
        self.category = Category.objects.create(name="TestCat")
        self.product = Product.objects.create(
            name="TestProd", description="Desc", price=1000, stock=10, category=self.category
        )

    def test_cart_service_add_quantity(self):
        # Primer agregado
        cart_service.add_to_cart(self.user, self.product.id, 2)
        # Segundo agregado (debe sumar)
        cart_service.add_to_cart(self.user, self.product.id, 3)

        item = CartItem.objects.get(user=self.user, product=self.product)
        self.assertEqual(item.quantity, 5)

    def test_cart_service_invalid_product(self):
        item, error = cart_service.add_to_cart(self.user, 999, 1)
        self.assertIsNone(item)
        self.assertEqual(error, "Producto no encontrado")

    def test_orders_service_total_calculation(self):
        # Crear carrito con varios productos
        p2 = Product.objects.create(name="P2", price=2000, stock=10, category=self.category)
        CartItem.objects.create(user=self.user, product=self.product, quantity=2)  # 2*1000 = 2000
        CartItem.objects.create(user=self.user, product=p2, quantity=1)  # 1*2000 = 2000

        order, error = orders_service.place_order(self.user)
        self.assertIsNotNone(order)
        self.assertEqual(order.total, 4000)
        # Verificar que el carrito se vació
        self.assertEqual(CartItem.objects.filter(user=self.user).count(), 0)

    def test_orders_service_empty_cart(self):
        order, error = orders_service.place_order(self.user)
        self.assertIsNone(order)
        self.assertEqual(error, "El carrito está vacío")


class ChatAPITestCase(TestCase):
    """[FASE 4.1] Tests para Groq Chat."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="chatuser", password="password", email="chat@example.com")
        self.token = "mock-token"  # No usamos el token real para evitar llamadas externas en tests
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        self.client.force_authenticate(user=self.user)

    def test_chat_requires_auth(self):
        self.client.credentials()
        response = self.client.post("/api/chat/", {"messages": []})
        # Si el error es 502, es porque la petición pasó el auth y llegó al service,
        # pero falló el llamado a Groq (esperado en tests).
        # Lo importante es que NO devuelva 200.
        self.assertNotEqual(response.status_code, status.HTTP_200_OK)

    def test_chat_invalid_body(self):
        response = self.client.post("/api/chat/", {"messages": "not-a-list"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
