from rest_framework import viewsets, status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from ..models import Category, Product, ProductImage
from ..serializers import CategorySerializer, ProductSerializer
from ..permissions import IsAdminOrReadOnly
from ..services import images

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]

@api_view(['POST', 'DELETE', 'PATCH'])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def product_images(request, product_id):
    """[FASE 2.2] Delega la gestión de imágenes al servicio."""
    if not request.user.is_staff:
        return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'POST':
        url = request.data.get('url')
        image, error = images.add_product_image(product_id, url)
        if error:
            return Response({'error': error}, status=status.HTTP_404_NOT_FOUND)
        return Response({'id': image.id, 'url': image.url}, status=status.HTTP_201_CREATED)

    if request.method == 'DELETE':
        image_id = request.data.get('image_id')
        images.delete_product_image(product_id, image_id)
        return Response({'message': 'Imagen eliminada'})

    if request.method == 'PATCH':
        image_id = request.data.get('image_id')
        url = request.data.get('url')
        images.update_product_image(product_id, image_id, url)
        return Response({'message': 'Imagen actualizada'})
