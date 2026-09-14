import os
from django.core.management.base import BaseCommand
from django.apps import apps
from products.image_utils import generate_product_cover


class Command(BaseCommand):
    help = "Regenerate cover images for all products (deletes old media, uses AI realistic generation)"

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Delete existing image files from disk before regenerating',
        )

    def handle(self, *args, **options):
        force = options.get('force', False)
        Product = apps.get_model('products', 'Product')
        qs = Product.objects.all()
        total = qs.count()
        self.stdout.write(f'Regenerating images for {total} product(s)...')

        ok, fail, skipped = 0, 0, 0
        for product in qs:
            old_name = product.image.name if product.image else None
            old_path = product.image.path if product.image and hasattr(product.image, 'path') else None

            if force and old_path and os.path.exists(old_path):
                try:
                    os.remove(old_path)
                    self.stdout.write(self.style.WARNING(f'  Deleted old file: {old_path}'))
                except OSError as e:
                    self.stdout.write(self.style.WARNING(f'  Could not delete old image {old_path}: {e}'))

            try:
                cover = generate_product_cover(product.name, product.category, product.brand)
            except Exception as e:
                self.stderr.write(self.style.ERROR(f'  [{product.name}] FAILED generate: {e}'))
                fail += 1
                continue

            try:
                if cover is None or not getattr(cover, 'name', None):
                    self.stderr.write(self.style.ERROR(f'  [{product.name}] invalid cover output, skipping'))
                    skipped += 1
                    continue

                if old_name and force:
                    try:
                        product.image.delete(save=False)
                    except Exception:
                        pass

                product.image.save(cover.name, cover, save=True)
                ok += 1
                self.stdout.write(self.style.SUCCESS(f'  [{product.name}] OK -> {product.image.name}'))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f'  [{product.name}] FAILED save: {e}'))
                fail += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Done. OK={ok}, skipped={skipped}, failed={fail} (out of {total}).'
            )
        )
