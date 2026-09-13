from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('action', 'Action'),
        ('adventure', 'Adventure'),
        ('rpg', 'RPG'),
        ('shooter', 'Shooter'),
        ('sports', 'Sports'),
        ('racing', 'Racing'),
        ('strategy', 'Strategy'),
        ('horror', 'Horror'),
        ('accessories', 'Accessories'),
        ('consoles', 'Consoles'),
    ]

    PLATFORM_CHOICES = [
        ('pc', 'PC'),
        ('ps5', 'PlayStation 5'),
        ('ps4', 'PlayStation 4'),
        ('xbox', 'Xbox Series X/S'),
        ('switch', 'Nintendo Switch'),
        ('multi', 'Multi-Platform'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='action')
    brand = models.CharField(max_length=100, default='Generic')
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='pc')
    stock = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(
        max_digits=2, decimal_places=1, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def in_stock(self):
        return self.stock > 0
