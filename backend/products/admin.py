from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'platform', 'price', 'stock', 'featured', 'created_at']
    list_filter = ['category', 'platform', 'featured']
    search_fields = ['name', 'brand', 'description']
