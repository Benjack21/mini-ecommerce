from datetime import date

from django.db import IntegrityError, transaction
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from store.models import User, UserProfile


def _profile_payload(user):
    """[FIX] Datos del perfil tolerantes a usuarios sin UserProfile (staff/seed)."""
    profile = getattr(user, "profile", None)
    return {
        "email": user.email,
        "username": user.username,
        "is_staff": user.is_staff,
        "first_name": profile.first_name if profile else user.first_name,
        "last_name": profile.last_name if profile else user.last_name,
        "rut": profile.rut if profile else "",
        "phone": profile.phone if profile else "",
        "birth_date": str(profile.birth_date) if profile and profile.birth_date else None,
    }


@api_view(["POST"])
def register(request):
    """
    Registra un nuevo usuario asegurando la sincronización
    entre email y username para compatibilidad total con SimpleJWT.
    """
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password")
    first_name = request.data.get("first_name", "").strip()
    last_name = request.data.get("last_name", "").strip()
    rut = request.data.get("rut", "").strip()
    phone = request.data.get("phone", "").strip()
    # [FIX] El input date vacío llega como '' y DateField.get_prep_value('')
    # lanza ValidationError -> el registro respondía 500. Se normaliza a None.
    birth_date = (request.data.get("birth_date") or "").strip() or None

    # 1. Validación de campos obligatorios
    if not all([email, password, first_name, last_name, rut, phone]):
        return Response(
            {"error": "Todos los campos obligatorios son requeridos"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 2. Validación de dominio Gmail
    if not email.endswith("@gmail.com"):
        return Response(
            {"error": "Solo se permiten correos de @gmail.com"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 3. Validación de formato de fecha (no exponer excepciones como 500)
    if birth_date is not None:
        try:
            date.fromisoformat(birth_date)
        except ValueError:
            return Response(
                {"error": "La fecha de nacimiento no es válida"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    # 4. Validación de unicidad
    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "El correo electrónico ya está registrado"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if UserProfile.objects.filter(rut=rut).exists():
        return Response({"error": "El RUT ya está registrado"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            user = User.objects.create_user(username=email, email=email, password=password)

            UserProfile.objects.create(
                user=user,
                first_name=first_name,
                last_name=last_name,
                rut=rut,
                phone=phone,
                birth_date=birth_date,
            )
    except IntegrityError:
        # [FIX] Carrera entre el chequeo y el INSERT: la restricción UNIQUE
        # debía responder 400, no 500 con el detalle interno del motor.
        return Response(
            {"error": "El correo electrónico o el RUT ya está registrado"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response({"message": "Cuenta creada exitosamente"}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def me(request):
    """
    [FIX] Datos del usuario autenticado.

    Antes no tenía permission_classes: con el DEFAULT_AUTHENTICATION_CLASSES
    (JWT) y AllowAny por defecto, un anónimo recibía 200 con email vacío en
    vez de 401. Además ahora expone los datos del perfil que necesita Profile.
    """
    return Response(_profile_payload(request.user))
