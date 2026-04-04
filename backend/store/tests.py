from django.test import TestCase

# Create your tests here.
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Category, Product, CartItem, Order, Review, Wishlist

class CategoryTestCase(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Electrónica')

    def test_category_created(self):
        self.assertEqual(self.category.name, 'Electrónica')

    def test_category_str(self):
        self.assertEqual(str(self.category), 'Electrónica')


class ProductTestCase(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Ropa')
        self.product = Product.objects.create(
            name='Polera Negra',
            description='Polera de algodón',
            price=9990,
            stock=10,
            category=self.category
        )

    def test_product_created(self):
        self.assertEqual(self.product.name, 'Polera Negra')
        self.assertEqual(self.product.stock, 10)

    def test_product_str(self):
        self.assertEqual(str(self.product), 'Polera Negra')

    def test_product_price(self):
        self.assertEqual(self.product.price, 9990)


class ProductAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name='Electrónica')
        self.product = Product.objects.create(
            name='Audífonos',
            description='Audífonos Bluetooth',
            price=29990,
            stock=15,
            category=self.category
        )

    def test_get_products(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_product_detail(self):
        response = self.client.get(f'/api/products/{self.product.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Audífonos')

    def test_get_categories(self):
        response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class AuthAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

    def test_register(self):
        response = self.client.post('/api/register/', {
            'username': 'newuser',
            'password': 'newpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_register_duplicate_user(self):
        response = self.client.post('/api/register/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login(self):
        response = self.client.post('/api/token/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_login_wrong_password(self):
        response = self.client.post('/api/token/', {
            'username': 'testuser',
            'password': 'wrongpass'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class CartAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.category = Category.objects.create(name='Electrónica')
        self.product = Product.objects.create(
            name='Audífonos',
            description='Audífonos Bluetooth',
            price=29990,
            stock=15,
            category=self.category
        )
        response = self.client.post('/api/token/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_add_to_cart(self):
        response = self.client.post('/api/cart/add/', {
            'product_id': self.product.id,
            'quantity': 1
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_cart(self):
        self.client.post('/api/cart/add/', {
            'product_id': self.product.id,
            'quantity': 1
        })
        response = self.client.get('/api/cart/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_cart_requires_auth(self):
        self.client.credentials()
        response = self.client.get('/api/cart/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class WishlistAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.category = Category.objects.create(name='Electrónica')
        self.product = Product.objects.create(
            name='Audífonos',
            description='Audífonos Bluetooth',
            price=29990,
            stock=15,
            category=self.category
        )
        response = self.client.post('/api/token/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_add_to_wishlist(self):
        response = self.client.post('/api/wishlist/', {
            'product_id': self.product.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_wishlist(self):
        self.client.post('/api/wishlist/', {'product_id': self.product.id})
        response = self.client.get('/api/wishlist/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_remove_from_wishlist(self):
        self.client.post('/api/wishlist/', {'product_id': self.product.id})
        response = self.client.delete('/api/wishlist/', {
            'product_id': self.product.id
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ReviewAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.category = Category.objects.create(name='Electrónica')
        self.product = Product.objects.create(
            name='Audífonos',
            description='Audífonos Bluetooth',
            price=29990,
            stock=15,
            category=self.category
        )
        response = self.client.post('/api/token/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_create_review(self):
        response = self.client.post(
            f'/api/products/{self.product.id}/reviews/',
            {'rating': 5, 'comment': 'Excelente producto'}
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_reviews(self):
        self.client.post(
            f'/api/products/{self.product.id}/reviews/',
            {'rating': 5, 'comment': 'Excelente producto'}
        )
        response = self.client.get(f'/api/products/{self.product.id}/reviews/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_duplicate_review(self):
        self.client.post(
            f'/api/products/{self.product.id}/reviews/',
            {'rating': 5, 'comment': 'Excelente'}
        )
        response = self.client.post(
            f'/api/products/{self.product.id}/reviews/',
            {'rating': 3, 'comment': 'Duplicada'}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)