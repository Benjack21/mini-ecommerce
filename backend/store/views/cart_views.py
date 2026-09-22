from rest_framework import viewsets, status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from ..models import CartItem
from ..serializers import CartItemSerializer
from ..services import cart

class CartItemViewSet(viewsets.ModelViewSet):
    """
    [FASE 2.2] Mantiene la lógica de aislamiento por dueño (IDOR FIX).
    """
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['POST'])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    """[FASE 2.2] Delega la adición al carrito al servicio."""
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)
    
    item, error = cart.add_to_cart(request.user, product_id, quantity)
    if error:
        return Response({'error': error}, status=status.HTTP_404_NOT_FOUND if "no encontrado" in error else status.HTTP_400_BAD_REQUEST)
    
    return Response({'message': 'Agregado al carrito'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def get_cart(request):
    """[FASE 2.2] Delega la obtención del carrito al servicio."""
    data = cart.get_cart_items(request.user)
    return Response(data)
