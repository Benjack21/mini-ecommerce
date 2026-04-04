from django.core.management.base import BaseCommand
from store.models import Category, Product

class Command(BaseCommand):
    help = 'Carga productos de prueba'

    def handle(self, *args, **kwargs):
        # Limpiar datos existentes
        Product.objects.all().delete()
        Category.objects.all().delete()

        # Crear categorías
        electronica = Category.objects.create(name='Electrónica')
        ropa = Category.objects.create(name='Ropa')
        hogar = Category.objects.create(name='Hogar')
        deportes = Category.objects.create(name='Deportes')
        libros = Category.objects.create(name='Libros')

        # Productos electrónica
        productos = [
            {
                'name': 'Audífonos Bluetooth',
                'description': 'Audífonos inalámbricos con cancelación de ruido y 20 horas de batería.',
                'price': 29990,
                'stock': 15,
                'image_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
                'category': electronica
            },
            {
                'name': 'Smartwatch Pro',
                'description': 'Reloj inteligente con monitor de frecuencia cardíaca y GPS integrado.',
                'price': 89990,
                'stock': 8,
                'image_url': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
                'category': electronica
            },
            {
                'name': 'Teclado Mecánico',
                'description': 'Teclado mecánico RGB con switches Cherry MX Red.',
                'price': 49990,
                'stock': 12,
                'image_url': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
                'category': electronica
            },
            {
                'name': 'Mouse Gamer',
                'description': 'Mouse inalámbrico con 12000 DPI y batería de 70 horas.',
                'price': 34990,
                'stock': 20,
                'image_url': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
                'category': electronica
            },
            {
                'name': 'Cámara Web HD',
                'description': 'Cámara web 1080p con micrófono integrado y enfoque automático.',
                'price': 24990,
                'stock': 18,
                'image_url': 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400',
                'category': electronica
            },
            {
                'name': 'Parlante Bluetooth',
                'description': 'Parlante portátil resistente al agua con 12 horas de batería.',
                'price': 19990,
                'stock': 25,
                'image_url': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
                'category': electronica
            },
            # Ropa
            {
                'name': 'Polera Básica Negra',
                'description': 'Polera 100% algodón, corte regular, disponible en tallas S-XL.',
                'price': 9990,
                'stock': 50,
                'image_url': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
                'category': ropa
            },
            {
                'name': 'Jeans Slim Fit',
                'description': 'Jeans de corte slim con elastano para mayor comodidad.',
                'price': 24990,
                'stock': 30,
                'image_url': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
                'category': ropa
            },
            {
                'name': 'Zapatillas Running',
                'description': 'Zapatillas ligeras con suela amortiguadora para running.',
                'price': 49990,
                'stock': 20,
                'image_url': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
                'category': ropa
            },
            {
                'name': 'Chaqueta Impermeable',
                'description': 'Chaqueta resistente al agua con capucha desmontable.',
                'price': 39990,
                'stock': 15,
                'image_url': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
                'category': ropa
            },
            # Hogar
            {
                'name': 'Lámpara LED de Escritorio',
                'description': 'Lámpara con ajuste de brillo y temperatura de color, puerto USB.',
                'price': 14990,
                'stock': 22,
                'image_url': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
                'category': hogar
            },
            {
                'name': 'Cafetera Express',
                'description': 'Cafetera automática con espumador de leche integrado.',
                'price': 79990,
                'stock': 10,
                'image_url': 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400',
                'category': hogar
            },
            {
                'name': 'Set de Cuchillos',
                'description': 'Set de 5 cuchillos de acero inoxidable con soporte de madera.',
                'price': 29990,
                'stock': 18,
                'image_url': 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400',
                'category': hogar
            },
            {
                'name': 'Aspiradora Robot',
                'description': 'Robot aspirador con mapeo inteligente y control por app.',
                'price': 149990,
                'stock': 5,
                'image_url': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
                'category': hogar
            },
            # Deportes
            {
                'name': 'Bicicleta de Montaña',
                'description': 'Bicicleta 21 velocidades con frenos de disco hidráulicos.',
                'price': 299990,
                'stock': 5,
                'image_url': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
                'category': deportes
            },
            {
                'name': 'Set de Pesas',
                'description': 'Set de mancuernas ajustables de 2 a 24 kg.',
                'price': 59990,
                'stock': 12,
                'image_url': 'https://images.unsplash.com/photo-1517963879433-6ad2171073fb?w=400',
                'category': deportes
            },
            {
                'name': 'Colchoneta Yoga',
                'description': 'Colchoneta antideslizante de 6mm con bolsa de transporte.',
                'price': 14990,
                'stock': 30,
                'image_url': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
                'category': deportes
            },
            # Libros
            {
                'name': 'Clean Code',
                'description': 'El libro esencial para escribir código limpio y mantenible.',
                'price': 19990,
                'stock': 20,
                'image_url': 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
                'category': libros
            },
            {
                'name': 'The Pragmatic Programmer',
                'description': 'Guía práctica para convertirte en un mejor programador.',
                'price': 17990,
                'stock': 15,
                'image_url': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
                'category': libros
            },
            {
                'name': 'Diseño Atómico',
                'description': 'Aprende a diseñar sistemas de diseño escalables y consistentes.',
                'price': 15990,
                'stock': 10,
                'image_url': 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400',
                'category': libros
            },
        ]

        for p in productos:
            Product.objects.create(**p)

        self.stdout.write(self.style.SUCCESS(f'✅ {len(productos)} productos creados exitosamente!'))