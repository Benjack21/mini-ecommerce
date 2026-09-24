from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

# [FASE 1.1] Importamos la vista JWT custom (NO la de simplejwt directamente)
# para que el login emita tokens con el claim `is_staff`.
from store.auth import CustomTokenObtainPairView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("store.urls")),
    # [FASE 1.1] TokenObtainPairView -> CustomTokenObtainPairView
    # Ahora POST /api/token/ devuelve un JWT que SÍ lleva is_staff.
    path("api/token/", CustomTokenObtainPairView.as_view()),
    path("api/token/refresh/", TokenRefreshView.as_view()),
]
