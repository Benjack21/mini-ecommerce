"""
[FASE 1.1] Vista JWT personalizada.
"""

from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

INVALID_CREDENTIALS = "Correo o contraseña incorrectos"
MISSING_FIELDS = "El correo y la contraseña son requeridos"


def _error_message(detail):
    """
    Normaliza el detalle a string.

    DRF pasa los errores del serializer por as_serializer_error(), que
    convierte cada valor en lista -> {"error": ["..."]}. /register/ responde
    {"error": "..."} (string), así que aquí uniformamos el formato.
    """
    if isinstance(detail, dict):
        detail = next(iter(detail.values()), "")
    if isinstance(detail, (list, tuple)):
        detail = detail[0] if detail else ""
    return str(detail)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Login por email (o username) que emite el claim `is_staff`.

    PrivateRoute.jsx lee `payload.is_staff` para las rutas adminOnly, por lo
    que el claim debe estar SIEMPRE presente en el access token.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # TokenObtainSerializer declara `username` y `password` requeridos: DRF
        # responde 400 con el detalle de campo ANTES de llamar a validate(), así
        # que un payload con solo `email` (o vacío) nunca llegaría aquí y el
        # formato del error no sería {"error": "..."} como en /register/.
        # Los hacemos opcionales y validamos la presencia a mano en validate().
        self.fields[self.username_field].required = False
        self.fields[self.username_field].allow_blank = True
        self.fields["password"].required = False
        self.fields["password"].allow_blank = True

    def validate(self, attrs):
        # SimpleJWT filtra attrs por USERNAME_FIELD; usamos el request original
        # para leer el payload crudo (acepta `email` o `username`).
        request = self.context.get("request")
        data = request.data if request else attrs

        email = (data.get("email") or data.get("username") or "").strip()
        password = data.get("password")

        if not email or not password:
            raise ValidationError({"error": MISSING_FIELDS})

        # EmailBackend (settings.AUTHENTICATION_BACKENDS) resuelve por email.
        user = authenticate(username=email, password=password)

        if user is None:
            # 401 = credenciales inválidas. api.js excluye /token/ del
            # redirect global para que Login.jsx pueda mostrar el mensaje.
            raise AuthenticationFailed({"error": INVALID_CREDENTIALS})

        self.user = user
        refresh = self.get_token(user)
        # str() es obligatorio: Token no es subclase de str y DRF no lo serializa.
        return {"access": str(refresh.access_token), "refresh": str(refresh)}

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # [FASE 1.1] Claim extra para que el frontend no dependa de /me/.
        token["is_staff"] = user.is_staff
        return token


class CustomTokenObtainPairView(TokenObtainPairView):
    """Vista de login que emite tokens con el claim is_staff incluido."""

    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        """Responde siempre {"error": "<string>"} (mismo formato que /register/)."""
        try:
            return super().post(request, *args, **kwargs)
        except ValidationError as exc:
            return Response({"error": _error_message(exc.detail)}, status=status.HTTP_400_BAD_REQUEST)
        except AuthenticationFailed as exc:
            return Response({"error": _error_message(exc.detail)}, status=status.HTTP_401_UNAUTHORIZED)
