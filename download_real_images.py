"""Download 12 realistic product photos matching the exact product catalog.

Uses the TRAE text_to_image endpoint and saves each PNG to
backend/media/products/ with the slugified filename that the
database + seed_products.py already reference.
"""
import os
import urllib.request
import urllib.parse
from urllib.error import URLError, HTTPError

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PRODUCTS_DIR = os.path.join(SCRIPT_DIR, 'backend', 'media', 'products')
os.makedirs(PRODUCTS_DIR, exist_ok=True)

API_BASE = 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image'

# Each entry: (product_name, category, brand, size, detailed_prompt)
# Sizes chosen: landscape_4_3 for video game box art (cards show ~4:3),
#               square_hd     for hardware photos (controllers/headsets/consoles).
PRODUCTS = [
    (
        'Cyber Nexus 2088',
        'rpg',
        'NightCity Studios',
        'landscape_4_3',
        'Cyber Nexus 2088 premium video game box cover art, AAA open-world cyberpunk RPG product shot, glossy plastic case, neon-lit dystopian cityscape, chrome skyscrapers at rainy night, female cyborg protagonist with glowing blue implants and katana, holographic ads, ultra detailed photorealistic packaging, shelf-ready retail product photography, white studio background',
    ),
    (
        'Shadow Strike: Infinite',
        'shooter',
        'Vortex Games',
        'landscape_4_3',
        'Shadow Strike Infinite first-person shooter video game box cover, tactical military FPS retail packaging, glossy PS5/Xbox game case, elite special forces soldier in black tactical gear holding a futuristic assault rifle, night vision goggles glowing green, smoke and explosions in ruined city backdrop, dramatic cinematic lighting, professional product photography on seamless white background',
    ),
    (
        "Dragon's Requiem",
        'action',
        'Ember Forge',
        'landscape_4_3',
        "Dragon's Requiem dark fantasy action RPG premium box cover, soulslike AAA video game packaging, glossy PlayStation 5 case, heroic knight wielding a flaming greatsword facing a colossal black fire-breathing dragon perched on gothic castle ruins, embers and dark storm clouds, epic dark fantasy artwork style, retail shelf product photo on pure white background",
    ),
    (
        'Velocity Rush GT',
        'racing',
        'Turbo Interactive',
        'landscape_4_3',
        'Velocity Rush GT arcade racing video game product box shot, glossy retail Xbox case, bright yellow 1969 Ford Mustang GT350 racing car on sunlit race track with motion blur, tire smoke, cheering crowd in grandstands, dynamic low-angle shot, vivid colors, professional product photography on white seamless background',
    ),
    (
        'Empire Ascendant',
        'strategy',
        'Iron Throne Games',
        'landscape_4_3',
        'Empire Ascendant 4X grand strategy PC game box cover art, glossy DVD case, ancient marble map table with tiny bronze soldier miniatures, Roman general in red cape pointing at map, golden eagle standard, senate columns in background, classical oil-painting aesthetic strategy game packaging, white studio product background',
    ),
    (
        'Hollow Whisper',
        'horror',
        'Pale Moon Studios',
        'landscape_4_3',
        'Hollow Whisper psychological horror video game retail box cover, glossy case, terrifying scene of abandoned asylum corridor at night, flickering fluorescent lights, bloody handprints on walls, tall pale humanoid monster silhouette at end of hallway, creepy foggy atmosphere, horror movie poster style product photo on white background',
    ),
    (
        'Championship Legends 25',
        'sports',
        'ProSport Games',
        'landscape_4_3',
        'Championship Legends 25 football simulation game retail box cover, glossy PS5 sport game case, male professional soccer player in blue #10 jersey kicking a soccer ball inside packed modern stadium with floodlights, confetti falling, realistic sport simulation product packaging style, studio shot on plain white background',
    ),
    (
        'Starlight Odyssey',
        'adventure',
        'Wanderlight',
        'landscape_4_3',
        'Starlight Odyssey charming adventure game Nintendo Switch box cover, glossy retail case, young female explorer in tan explorer outfit standing on floating island in space with glowing magical crystals, cute animal companion, starry purple nebula sky, Studio Ghibli inspired whimsical artwork style, product photography on clean white background',
    ),
    (
        'Nova Elite Wireless Controller',
        'accessories',
        'Nova Peripherals',
        'square_hd',
        'Nova Elite Wireless premium gaming controller product photograph, matte black and gunmetal Xbox-style controller with RGB glowing joystick rings and programmable back paddles, hair trigger locks visible, sitting on soft display stand, clean studio lighting, crisp white seamless background, e-sports tech product photography',
    ),
    (
        'Apex Gaming Headset X1',
        'accessories',
        'Apex Audio',
        'square_hd',
        'Apex Gaming Headset X1 professional product photo, matte black over-ear 7.1 surround sound headset with RGB LED accent lights on earcups, detachable flexible noise-cancelling microphone extended, plush memory foam ear cushions, adjustable metal headband, standing upright on display stand, studio lighting, pure white seamless background, gaming accessory product shot',
    ),
    (
        'Phantom Console Series Z',
        'consoles',
        'Phantom Tech',
        'square_hd',
        'Phantom Console Series Z next-generation home gaming console product photo, sleek vertical matte black and chrome tower design with glowing neon cyan power LED ring, standing upright next to matching white controller, super slim profile, brushed aluminum texture, premium console packaging aesthetic, soft studio lighting on pure white seamless background',
    ),
    (
        'Frostbound Legacy',
        'rpg',
        'Glacier Interactive',
        'landscape_4_3',
        'Frostbound Legacy frozen RPG video game box cover, premium glossy PC game case, lone viking warrior with fur cloak and glowing ice axe standing on massive frozen waterfall, northern lights aurora in sky, ancient rune-carved stone arch, snow storm atmosphere, cinematic fantasy artwork, professional product photography on white studio background',
    ),
]


def slugify(name):
    """Replicate the slug style used by image_utils.save_product_cover."""
    import re
    s = name.lower().strip()
    # Replace non-alnum with hyphens, collapse runs, strip ends
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = s.strip("-")
    return s


def download_one(name, prompt, size):
    filename = slugify(name) + '.png'
    target = os.path.join(PRODUCTS_DIR, filename)
    params = urllib.parse.urlencode({
        'prompt': prompt,
        'image_size': size,
    })
    url = f'{API_BASE}?{params}'
    print(f'Downloading: {name:40s}  ->  {filename}  [{size}]')
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = resp.read()
        if len(data) < 2048:
            print(f'  WARNING: tiny response ({len(data)} bytes), image may have failed.')
        with open(target, 'wb') as f:
            f.write(data)
        print(f'  OK ({len(data)} bytes)')
        return True
    except (URLError, HTTPError) as e:
        print(f'  FAILED: {type(e).__name__}: {e}')
        return False
    except Exception as e:
        print(f'  FAILED: {type(e).__name__}: {e}')
        return False


def main():
    ok, fail = 0, 0
    for (name, cat, brand, size, prompt) in PRODUCTS:
        full_prompt = f'{prompt} -- brand name: {brand}, game/product title overlay on cover: "{name}"'
        if download_one(name, full_prompt, size):
            ok += 1
        else:
            fail += 1
    print(f'\nDone. OK={ok}, FAILED={fail}. Images saved to: {PRODUCTS_DIR}')


if __name__ == '__main__':
    main()
