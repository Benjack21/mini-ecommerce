from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Category, Product, CartItem, Order, OrderItem, Review
from .serializers import CategorySerializer, ProductSerializer, CartItemSerializer

from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User

from rest_framework.permissions import IsAuthenticated

from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication

from transbank.webpay.webpay_plus.transaction import Transaction
from transbank.common.options import WebpayOptions
from transbank.common.integration_type import IntegrationType

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class CartItemViewSet(viewsets.ModelViewSet):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if User.objects.filter(username=username).exists():
        return Response({'error': 'El usuario ya existe'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password)
    return Response({'message': 'Usuario creado exitosamente'}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    user = request.user
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    cart_item, created = CartItem.objects.get_or_create(user=user, product=product)
    if not created:
        cart_item.quantity += quantity
    cart_item.save()

    return Response({'message': 'Agregado al carrito'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def get_cart(request):
    user = request.user
    items = CartItem.objects.filter(user=user)
    data = [
        {
            'id': item.id,
            'product': item.product.name,
            'price': str(item.product.price),
            'quantity': item.quantity,
            'total': str(item.product.price * item.quantity)
        }
        for item in items
    ]
    return Response(data)

@api_view(['GET'])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response({
        'username': user.username,
        'is_staff': user.is_staff,
    })

@api_view(['POST'])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def place_order(request):
    user = request.user
    items = CartItem.objects.filter(user=user)

    if not items.exists():
        return Response({'error': 'El carrito está vacío'}, status=status.HTTP_400_BAD_REQUEST)

    total = sum(item.product.price * item.quantity for item in items)

    order = Order.objects.create(user=user, total=total)

    for item in items:
        OrderItem.objects.create(
            order=order,
            product=item.product,
            quantity=item.quantity,
            price=item.product.price
        )

    items.delete()

    return Response({'message': 'Orden creada exitosamente', 'order_id': order.id}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def get_orders(request):
    user = request.user
    orders = Order.objects.filter(user=user).order_by('-created_at')
    data = [
        {
            'id': order.id,
            'total': str(order.total),
            'created_at': order.created_at.strftime('%d/%m/%Y %H:%M'),
            'items': [
                {
                    'product': item.product.name if item.product else 'Producto eliminado',
                    'quantity': item.quantity,
                    'price': str(item.price)
                }
                for item in order.items.all()
            ]
        }
        for order in orders
    ]
    return Response(data)

@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication, SessionAuthentication])
def reviews(request, product_id):
    if request.method == 'GET':
        product_reviews = Review.objects.filter(product_id=product_id).order_by('-created_at')
        data = [
            {
                'id': r.id,
                'user': r.user.username,
                'rating': r.rating,
                'comment': r.comment,
                'created_at': r.created_at.strftime('%d/%m/%Y')
            }
            for r in product_reviews
        ]
        return Response(data)

    if request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Debes iniciar sesión'}, status=status.HTTP_401_UNAUTHORIZED)

        if Review.objects.filter(user=request.user, product_id=product_id).exists():
            return Response({'error': 'Ya reseñaste este producto'}, status=status.HTTP_400_BAD_REQUEST)

        rating = request.data.get('rating')
        comment = request.data.get('comment')

        Review.objects.create(
            user=request.user,
            product_id=product_id,
            rating=rating,
            comment=comment
        )
        return Response({'message': 'Reseña creada'}, status=status.HTTP_201_CREATED)
    
@api_view(['GET'])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def analytics(request):
    if not request.user.is_staff:
        return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)

    from django.contrib.auth.models import User
    from django.db.models import Sum, Count

    total_products = Product.objects.count()
    total_users = User.objects.count()
    total_orders = Order.objects.count()
    total_revenue = Order.objects.aggregate(Sum('total'))['total__sum'] or 0

    top_products = (
        OrderItem.objects
        .values('product__name')
        .annotate(total_sold=Sum('quantity'))
        .order_by('-total_sold')[:5]
    )

    recent_orders = Order.objects.order_by('-created_at')[:5]
    recent_data = [
        {
            'id': o.id,
            'user': o.user.username,
            'total': str(o.total),
            'created_at': o.created_at.strftime('%d/%m/%Y %H:%M')
        }
        for o in recent_orders
    ]

    return Response({
        'total_products': total_products,
        'total_users': total_users,
        'total_orders': total_orders,
        'total_revenue': str(total_revenue),
        'top_products': list(top_products),
        'recent_orders': recent_data,
    })

@api_view(['POST'])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def create_payment(request):
    user = request.user
    items = CartItem.objects.filter(user=user)

    if not items.exists():
        return Response({'error': 'El carrito está vacío'}, status=status.HTTP_400_BAD_REQUEST)

    total = int(sum(item.product.price * item.quantity for item in items))
    buy_order = f'order-{user.id}-{Order.objects.count() + 1}'
    session_id = f'session-{user.id}'
    return_url = 'http://localhost:5173/payment/confirm'

    tx = Transaction(WebpayOptions(
        commerce_code='597055555532',
        api_key='579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C',
        integration_type=IntegrationType.TEST
    ))

    response = tx.create(buy_order, session_id, total, return_url)

    return Response({
        'url': response['url'],
        'token': response['token']
    })


@api_view(['POST'])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def confirm_payment(request):
    token = request.data.get('token_ws')
    user = request.user

    tx = Transaction(WebpayOptions(
        commerce_code='597055555532',
        api_key='579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C',
        integration_type=IntegrationType.TEST
    ))

    response = tx.commit(token)

    if response['status'] == 'AUTHORIZED':
        items = CartItem.objects.filter(user=user)
        total = sum(item.product.price * item.quantity for item in items)
        order = Order.objects.create(user=user, total=total)
        for item in items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )
        items.delete()
        return Response({'message': 'Pago exitoso', 'order_id': order.id})

    return Response({'error': 'Pago rechazado'}, status=status.HTTP_400_BAD_REQUEST)