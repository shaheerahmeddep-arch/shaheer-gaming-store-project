from django.core.management.base import BaseCommand
from products.models import Product
from products.image_utils import generate_product_cover


SAMPLE_PRODUCTS = [
    {
        "name": "Cyber Nexus 2088",
        "description": "An open-world cyberpunk RPG set in a sprawling neon metropolis. Customize your cybernetic implants and shape the story through your choices.",
        "price": 59.99, "category": "rpg", "brand": "NightCity Studios",
        "platform": "pc", "stock": 45, "rating": 4.6, "featured": True,
    },
    {
        "name": "Shadow Strike: Infinite",
        "description": "A fast-paced tactical shooter with competitive ranked multiplayer and a deep weapon customization system.",
        "price": 49.99, "category": "shooter", "brand": "Vortex Games",
        "platform": "multi", "stock": 60, "rating": 4.4, "featured": True,
    },
    {
        "name": "Dragon's Requiem",
        "description": "An epic dark-fantasy action RPG featuring soul-crushing bosses and a richly detailed world to explore.",
        "price": 69.99, "category": "action", "brand": "Ember Forge",
        "platform": "ps5", "stock": 30, "rating": 4.8, "featured": True,
    },
    {
        "name": "Velocity Rush GT",
        "description": "An arcade racing game with over 80 licensed cars, dynamic weather, and split-screen multiplayer.",
        "price": 39.99, "category": "racing", "brand": "Turbo Interactive",
        "platform": "xbox", "stock": 55, "rating": 4.2, "featured": False,
    },
    {
        "name": "Empire Ascendant",
        "description": "A grand 4X strategy game where you build and lead a civilization from the stone age into the stars.",
        "price": 44.99, "category": "strategy", "brand": "Iron Throne Games",
        "platform": "pc", "stock": 25, "rating": 4.5, "featured": False,
    },
    {
        "name": "Hollow Whisper",
        "description": "A psychological horror game set in an abandoned asylum. Survive terrifying encounters using only your wits.",
        "price": 34.99, "category": "horror", "brand": "Pale Moon Studios",
        "platform": "multi", "stock": 40, "rating": 4.3, "featured": True,
    },
    {
        "name": "Championship Legends 25",
        "description": "The most realistic football simulation yet, with full league licenses and next-gen motion capture.",
        "price": 69.99, "category": "sports", "brand": "ProSport Games",
        "platform": "ps5", "stock": 70, "rating": 4.1, "featured": False,
    },
    {
        "name": "Starlight Odyssey",
        "description": "A charming adventure game about a young explorer discovering a galaxy of floating islands and forgotten ruins.",
        "price": 29.99, "category": "adventure", "brand": "Wanderlight",
        "platform": "switch", "stock": 65, "rating": 4.7, "featured": True,
    },
    {
        "name": "Nova Elite Wireless Controller",
        "description": "A premium wireless controller with hair-trigger locks, programmable back paddles, and RGB lighting.",
        "price": 79.99, "category": "accessories", "brand": "Nova Peripherals",
        "platform": "multi", "stock": 100, "rating": 4.6, "featured": False,
    },
    {
        "name": "Apex Gaming Headset X1",
        "description": "7.1 surround sound gaming headset with a noise-cancelling detachable mic and memory-foam ear cushions.",
        "price": 89.99, "category": "accessories", "brand": "Apex Audio",
        "platform": "multi", "stock": 80, "rating": 4.4, "featured": False,
    },
    {
        "name": "Phantom Console Series Z",
        "description": "Next-gen gaming console with 2TB SSD storage, ray tracing support, and lightning-fast load times.",
        "price": 499.99, "category": "consoles", "brand": "Phantom Tech",
        "platform": "multi", "stock": 15, "rating": 4.9, "featured": True,
    },
    {
        "name": "Frostbound Legacy",
        "description": "A story-driven adventure RPG set in a frozen realm, blending puzzle-solving with turn-based combat.",
        "price": 54.99, "category": "rpg", "brand": "Glacier Interactive",
        "platform": "pc", "stock": 35, "rating": 4.5, "featured": False,
    },
]


class Command(BaseCommand):
    help = "Seed the database with sample gaming products"

    def handle(self, *args, **options):
        created_count = 0
        for data in SAMPLE_PRODUCTS:
            product, created = Product.objects.get_or_create(
                name=data["name"], defaults=data
            )
            if created:
                created_count += 1
            # Generate real cover art for any product missing an image
            # (no external/fake URLs - this is an actual rendered file
            # saved through Django's storage system).
            if not product.image:
                cover = generate_product_cover(product.name, product.category, product.brand)
                product.image.save(cover.name, cover, save=True)
        self.stdout.write(self.style.SUCCESS(
            f"Seeded {created_count} new products (total in DB: {Product.objects.count()})."
        ))
