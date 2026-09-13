"""
Generates real, locally-rendered cover art for products so that every
product has an actual stored image file (no external/fake image URLs).
Used by the seed_products management command.

Each cover includes the product's name + brand overlaid on a category-
specific gradient, plus a large low-opacity category icon/silhouette so
the product type is instantly recognizable at a glance (accessories
show a headset silhouette, consoles show a gamepad, RPG shows a shield,
shooter shows crosshairs, etc.).
"""
import io
import re
import math
from PIL import Image, ImageDraw, ImageFont
from django.core.files.base import ContentFile

WIDTH, HEIGHT = 800, 600

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


def _draw_icon(draw, category, accent):
    """Draw a large, low-opacity, category-specific silhouette in the
    upper portion of the cover so the product type is visually obvious."""
    icon_color = accent + (30,)
    cx, cy = WIDTH // 2, int(HEIGHT * 0.38)
    if category == 'accessories':
        cy = int(HEIGHT * 0.34)
        ear_l = cx - 170, cy - 80
        ear_r = cx + 170, cy - 80
        draw.ellipse((ear_l[0] - 70, ear_l[1] - 80, ear_l[0] + 70, ear_l[1] + 80), outline=icon_color, width=18)
        draw.ellipse((ear_r[0] - 70, ear_r[1] - 80, ear_r[0] + 70, ear_r[1] + 80), outline=icon_color, width=18)
        draw.arc((cx - 180, cy - 230, cx + 180, cy + 60), start=180, end=0, fill=icon_color, width=22)
    elif category == 'consoles':
        body_l, body_r = cx - 210, cx + 210
        draw.rounded_rectangle((body_l, cy - 90, body_r, cy + 90), radius=50, outline=icon_color, width=18)
        draw.ellipse((cx - 170, cy - 60, cx - 90, cy + 20), outline=icon_color, width=14)
        draw.ellipse((cx + 90, cy - 60, cx + 170, cy + 20), outline=icon_color, width=14)
        for dx, dy in ((-6, -22), (14, -22), (-6, -2), (14, -2)):
            draw.ellipse((cx + dx - 6, cy + dy - 6, cx + dx + 6, cy + dy + 6), fill=icon_color)
    elif category in ('action', 'rpg', 'adventure'):
        if category == 'rpg':
            draw.ellipse((cx - 130, cy - 150, cx + 130, cy + 130), outline=icon_color, width=20)
            top_l = (cx, cy - 200)
            draw.polygon([top_l, (cx - 130, cy - 100), (cx - 130, cy + 40), (cx + 130, cy + 40), (cx + 130, cy - 100)], outline=icon_color, width=16)
        else:
            hilt = (cx - 35, cy - 160, cx + 35, cy - 110)
            blade = (cx - 20, cy - 220, cx + 20, cy + 80)
            draw.rounded_rectangle(hilt, radius=10, outline=icon_color, width=18)
            draw.rounded_rectangle(blade, radius=14, outline=icon_color, width=20)
            draw.polygon([(cx - 80, cy - 110), (cx + 80, cy - 110), (cx + 80, cy - 90), (cx - 80, cy - 90)], fill=icon_color)
    elif category == 'shooter':
        r_outer, r_mid, r_inner = 170, 110, 30
        draw.ellipse((cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer), outline=icon_color, width=14)
        draw.ellipse((cx - r_mid, cy - r_mid, cx + r_mid, cy + r_mid), outline=icon_color, width=10)
        draw.ellipse((cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner), fill=icon_color)
        draw.line(((cx - r_outer - 25, cy), (cx + r_outer + 25, cy)), fill=icon_color, width=10)
        draw.line(((cx, cy - r_outer - 25), (cx, cy + r_outer + 25)), fill=icon_color, width=10)
    elif category == 'racing':
        y = int(HEIGHT * 0.33)
        for i, c in enumerate((icon_color, (255, 255, 255, 18)) * 6):
            x = 40 + i * 60
            draw.polygon([(x, y), (x + 40, y - 40), (x + 40, y + 40)], fill=c)
        for i, c in enumerate(((255, 255, 255, 18), icon_color) * 6):
            x = 40 + i * 60
            draw.polygon([(x, y + 90), (x + 40, y + 50), (x + 40, y + 130)], fill=c)
    elif category == 'sports':
        r = 150
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=icon_color, width=18)
        for angle in (0, 60, 120, 180, 240, 300):
            a = math.radians(angle)
            x2 = cx + int(math.cos(a) * r)
            y2 = cy + int(math.sin(a) * r)
            draw.line(((cx, cy), (x2, y2)), fill=icon_color, width=10)
    elif category == 'strategy':
        size = 70
        for row in range(4):
            for col in range(4):
                if (row + col) % 2 == 0:
                    x = cx - 140 + col * size
                    y = cy - 140 + row * size
                    draw.rectangle((x, y, x + size, y + size), fill=icon_color)
                else:
                    x = cx - 140 + col * size
                    y = cy - 140 + row * size
                    draw.rectangle((x, y, x + size, y + size), outline=icon_color, width=8)
    elif category == 'horror':
        r = 160
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=icon_color, width=20)
        for eye_x in (cx - 65, cx + 65):
            draw.ellipse((eye_x - 35, cy - 60, eye_x + 35, cy), fill=icon_color)
        draw.ellipse((cx - 14, cy + 20, cx + 14, cy + 48), fill=icon_color)
        mouth_pts = []
        for i in range(7):
            tooth_x = cx - 105 + i * 35
            mouth_pts.extend([(tooth_x, cy + 70), (tooth_x + 18, cy + 115)])
        draw.line(mouth_pts, fill=icon_color, width=14)
    else:
        for i in range(5, 1, -1):
            r = 40 * i
            draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=icon_color, width=10)


def generate_product_cover(name, category, brand=''):
    """Renders an 800x600 gradient cover image with the product name,
    category icon, and brand.  Returns a Django ContentFile ready to
    assign directly to an ImageField.
    """
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

    accent_color = tuple(min(255, c + 40) for c in top)
    _draw_icon(draw, category, accent_color)

    stripe_color = (255, 255, 255, 18)
    for offset in range(-HEIGHT, WIDTH, 70):
        draw.line([(offset, HEIGHT), (offset + HEIGHT, 0)], fill=stripe_color, width=18)

    panel_top = HEIGHT - 190
    draw.rectangle([(0, panel_top), (WIDTH, HEIGHT)], fill=(8, 8, 18, 170))

    border_color = accent_color + (255,)
    draw.rectangle([(6, 6), (WIDTH - 6, HEIGHT - 6)], outline=border_color, width=4)

    try:
        title_font = ImageFont.load_default(size=46)
        brand_font = ImageFont.load_default(size=26)
    except TypeError:
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

