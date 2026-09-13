from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    platform_display = serializers.CharField(source='get_platform_display', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'category', 'category_display',
            'brand', 'platform', 'platform_display', 'stock', 'rating', 'image',
            'image_url', 'featured', 'created_at', 'updated_at', 'in_stock',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
