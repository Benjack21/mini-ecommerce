"""
[FASE 1.1] Vista JWT personalizada.

PROBLEMA: SimpleJWT por defecto solo incluye user_id, username, exp...
en el token. NO incluye `is_staff`. Por eso PrivateRoute.jsx (que lee
payload.is_staff) siempre veía `undefined` y redirigía al admin a home.

SOLUCIÓN: Esta subclase de TokenObtainPairView sobrescribe `obtain_token`
para inyectar el claim `is_staff` en el payload del JWT. Así el frontend
puede saber si el usuario es admin SIN necesidad de llamar a /me/.
"""
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Serializer custom que agrega campos extra al token."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # [FASE 1.1] Agregamos is_staff como claim del token.
        # El frontend lo leerá con: JSON.parse(atob(token.split('.')[1])).is_staff
        token['is_staff'] = user.is_staff
        return token


class CustomTokenObtainPairView(TokenObtainPairView):
    """Vista de login que emite tokens con el claim is_staff incluido."""
    serializer_class = CustomTokenObtainPairSerializer
