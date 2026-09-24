"""
[FASE 1.4] Permisos reutilizables (SOLID: responsabilidad única).

Aquí viven las clases de permiso de DRF para no mezclarlas con la
lógica de negocio en views.py.
"""

from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdminOrReadOnly(BasePermission):
    """
    [FASE 1.4] Permiso "lectura pública, escritura solo admin".

    PROBLEMA: ProductViewSet y CategoryViewSet usaban
    IsAuthenticatedOrReadOnly → cualquier usuario LOGUEADO podía:
      - POST   /api/products/    → crear productos
      - PUT    /api/products/1/  → editar precios/stock
      - DELETE /api/products/1/  → borrar productos

    SOLUCIÓN: Esta clase permite GET/HEAD/OPTIONS a cualquiera
    (público), pero exige is_staff para métodos de escritura
    (POST/PUT/PATCH/DELETE).

    Uso:
        class ProductViewSet(...):
            permission_classes = [IsAdminOrReadOnly]
    """

    def has_permission(self, request, view):
        # Métodos seguros (lectura) → siempre permitidos
        if request.method in SAFE_METHODS:
            return True
        # Escritura → requiere usuario autenticado Y staff (admin)
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)
