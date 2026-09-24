from django.contrib.auth.backends import ModelBackend

from store.models import User


class EmailBackend(ModelBackend):
    """
    Backend de autenticación estricto basado en Email.
    Sustituye la búsqueda por username por una búsqueda por email.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get("email")

        if username is None or password is None:
            return None

        try:
            # Buscamos al usuario exclusivamente por su email
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            # [FIX] Ejecutamos el hasher igual que ModelBackend para no filtrar
            # por timing si el correo no existe.
            User().set_password(password)
            return None

        # [FIX] user_can_authenticate(): un usuario desactivado por el admin
        # ya no puede iniciar sesión (antes solo se validaba check_password).
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
