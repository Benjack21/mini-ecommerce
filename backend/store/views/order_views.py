from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from ..services import orders

@api_view(['POST'])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def place_order(request):
    """[FASE 2.2] Delega la creación de orden al servicio."""
    order, error = orders.place_order(request.user)
    if error:
        return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({'message': 'Orden creada exitosamente', 'order_id': order.id}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def get_orders(request):
    """[FASE 2.2] Delega el historial de órdenes al servicio."""
    data = orders.get_user_orders(request.user)
    return Response(data)
