from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product
from .serializers import ProductSerializer
from .permissions import IsAdminOrReadOnly


class ProductListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/products/   -> list all products (public, supports search/filter/sort)
    POST /api/products/   -> create a product (admin only)
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'platform', 'brand', 'featured']
    search_fields = ['name', 'description', 'brand']
    ordering_fields = ['price', 'rating', 'created_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        return qs


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/products/<id>/   -> retrieve a single product (public)
    PUT    /api/products/<id>/   -> full update (admin only)
    PATCH  /api/products/<id>/   -> partial update (admin only)
    DELETE /api/products/<id>/   -> delete (admin only)
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
