from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["POST"])
def register(request):
    """[FASE 2.2] Registra un nuevo usuario."""
    username = request.data.get("username")
    password = request.data.get("password")

    if User.objects.filter(username=username).exists():
        return Response({"error": "El usuario ya existe"}, status=status.HTTP_400_BAD_REQUEST)

    User.objects.create_user(username=username, password=password)
    return Response({"message": "Usuario creado exitosamente"}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def me(request):
    """[FASE 2.2] Retorna datos del usuario autenticado."""
    user = request.user
    return Response(
        {
            "username": user.username,
            "is_staff": user.is_staff,
        }
    )
