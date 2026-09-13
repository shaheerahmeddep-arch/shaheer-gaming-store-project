"""
Generates real, locally-rendered cover art for products so that every
product has an actual stored image file (no external/fake image URLs).
Used by the seed_products management command.
"""
import io
import re
from PIL import Image, ImageDraw, ImageFont
from django.core.files.base import ContentFile

WIDTH, HEIGHT = 800, 600

# (top color, bottom color) per category - matches the site's neon gaming palette
CATEGORY_COLORS = {
    'action': ((255, 70, 70), (40, 5, 15)),
    'adventure': ((60, 220, 150), (5, 40, 35)),
    'rpg': ((168, 85, 247), (20, 5, 45)),
    'shooter': ((255, 170, 40), (45, 20, 0)),
    'sports': ((40, 190, 255), (0, 25, 55)),
    'racing': ((255, 225, 40), (45, 35, 0)),
    'strategy': ((80, 225, 225), (5, 35, 40)),
    'horror': ((200, 20, 40), (10, 0, 5)),
    'accessories': ((0, 246, 255), (5, 10, 35)),
    'consoles': ((190, 90, 255), (15, 5, 40)),
}

DEFAULT_COLORS = ((124, 58, 237), (10, 10, 25))


def _slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return re.sub(r'-+', '-', text).strip('-')


def _wrap_text(draw, text, font, max_width):
    words = text.split()
    lines = []
    current = ''
    for word in words:
        trial = f'{current} {word}'.strip()
        bbox = draw.textbbox((0, 0), trial, font=font)
        if bbox[2] - bbox[0] <= max_width or not current:
            current = trial
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def generate_product_cover(name, category, brand=''):
    """Renders an 800x600 gradient cover image with the product name, and
    returns it as a Django ContentFile ready to assign to an ImageField."""
    top, bottom = CATEGORY_COLORS.get(category, DEFAULT_COLORS)

    img = Image.new('RGB', (WIDTH, HEIGHT), top)
    pixels = img.load()
    for y in range(HEIGHT):
        ratio = y / HEIGHT
        r = int(top[0] + (bottom[0] - top[0]) * ratio)
        g = int(top[1] + (bottom[1] - top[1]) * ratio)
        b = int(top[2] + (bottom[2] - top[2]) * ratio)
        for x in range(WIDTH):
            pixels[x, y] = (r, g, b)

    draw = ImageDraw.Draw(img, 'RGBA')

    # subtle diagonal accent stripes for a "gaming" feel
    stripe_color = (255, 255, 255, 18)
    for offset in range(-HEIGHT, WIDTH, 70):
        draw.line([(offset, HEIGHT), (offset + HEIGHT, 0)], fill=stripe_color, width=18)

    # dark vignette panel behind the text for readability
    panel_top = HEIGHT - 190
    draw.rectangle([(0, panel_top), (WIDTH, HEIGHT)], fill=(8, 8, 18, 170))

    # thin neon border
    border_color = tuple(min(255, c + 40) for c in top) + (255,)
    draw.rectangle([(6, 6), (WIDTH - 6, HEIGHT - 6)], outline=border_color, width=4)

    try:
        title_font = ImageFont.load_default(size=46)
        brand_font = ImageFont.load_default(size=26)
    except TypeError:
        # Older Pillow without the `size` kwarg on load_default
        title_font = ImageFont.load_default()
        brand_font = ImageFont.load_default()

    lines = _wrap_text(draw, name, title_font, WIDTH - 100)[:2]
    total_text_height = len(lines) * 56
    text_y = HEIGHT - 60 - total_text_height

    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=title_font)
        line_w = bbox[2] - bbox[0]
        draw.text(((WIDTH - line_w) / 2, text_y), line, font=title_font, fill=(255, 255, 255, 255))
        text_y += 56

    if brand:
        bbox = draw.textbbox((0, 0), brand.upper(), font=brand_font)
        brand_w = bbox[2] - bbox[0]
        draw.text(((WIDTH - brand_w) / 2, HEIGHT - 46), brand.upper(), font=brand_font, fill=(0, 246, 255, 255))

    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    filename = f"{_slugify(name)}.png"
    return ContentFile(buffer.getvalue(), name=filename)
