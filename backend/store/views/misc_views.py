from django_ratelimit.decorators import ratelimit
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from ..models import Order, Product, User
from ..services import analytics_service, chat_service, notifications_service, reviews_service, wishlist_service


@api_view(["GET", "POST"])
@authentication_classes([JWTAuthentication, SessionAuthentication])
def reviews(request, product_id):
    """[FASE 2.2] Delega la gestión de reseñas al servicio."""
    if request.method == "GET":
        data = reviews_service.get_product_reviews(product_id)
        return Response(data)

    if request.method == "POST":
        if not request.user.is_authenticated:
            return Response({"error": "Debes iniciar sesión"}, status=status.HTTP_401_UNAUTHORIZED)

        review, error = reviews_service.create_review(
            request.user, product_id, request.data.get("rating"), request.data.get("comment")
        )
        if error:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "Reseña creada"}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def analytics(request):
    """[FASE 2.2] Delega el analytics al servicio."""
    if not request.user.is_staff:
        return Response({"error": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)

    data = analytics_service.get_admin_analytics()
    # Agregamos totales generales que el service de analytics no tenía pero la view sí
    data["total_products"] = Product.objects.count()
    data["total_users"] = User.objects.count()
    data["total_orders"] = Order.objects.count()

    return Response(data)


@api_view(["GET", "POST", "DELETE"])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def wishlist(request):
    """[FASE 2.2] Delega la wishlist al servicio."""
    if request.method == "GET":
        data = wishlist_service.get_user_wishlist(request.user)
        return Response(data)

    if request.method == "POST":
        product_id = request.data.get("product_id")
        item, error = wishlist_service.add_to_wishlist(request.user, product_id)
        if error == "Producto no encontrado":
            return Response({"error": error}, status=status.HTTP_404_NOT_FOUND)
        if error:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "Agregado a wishlist"}, status=status.HTTP_201_CREATED)

    if request.method == "DELETE":
        product_id = request.data.get("product_id")
        wishlist_service.remove_from_wishlist(request.user, product_id)
        return Response({"message": "Eliminado de wishlist"})


@api_view(["GET"])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """[FASE 2.2] Delega las notificaciones al servicio."""
    data = notifications_service.get_user_notifications(request.user)
    return Response(data)


@api_view(["PATCH"])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def mark_notifications_read(request):
    """[FASE 2.2] Delega el marcado de notificaciones al servicio."""
    notifications_service.mark_all_notifications_read(request.user)
    return Response({"message": "Notificaciones marcadas como leídas"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@ratelimit(key="ip", rate="10/m", method="POST", block=True)
def groq_chat(request):
    """[FASE 2.2] Delega el chat a Groq al servicio."""
    messages = request.data.get("messages", [])

    if not isinstance(messages, list) or len(messages) > 20:
        return Response({"error": "messages debe ser una lista (máx. 20)"}, status=status.HTTP_400_BAD_REQUEST)

    safe_messages = []
    for m in messages:
        if (
            isinstance(m, dict)
            and m.get("role") in ("user", "assistant")
            and isinstance(m.get("content"), str)
            and len(m["content"]) <= 2000
        ):
            safe_messages.append({"role": m["role"], "content": m["content"]})

    response, error = chat_service.get_groq_response(safe_messages)
    if error:
        return Response({"error": error}, status=status.HTTP_502_BAD_GATEWAY)
    return Response(response)
