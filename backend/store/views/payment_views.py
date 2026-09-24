from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from ..services import payments


@api_view(["POST"])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def create_payment(request):
    """[FASE 2.2] Delega la creación de sesión de pago al servicio."""
    response, error = payments.create_payment_session(request.user)
    if error:
        return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"url": response["url"], "token": response["token"]})


@api_view(["POST"])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def confirm_payment(request):
    """[FASE 2.2] Delega la confirmación del pago al servicio."""
    token = request.data.get("token_ws")
    order, error = payments.confirm_payment(request.user, token)
    if error:
        return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"message": "Pago exitoso", "order_id": order.id})
