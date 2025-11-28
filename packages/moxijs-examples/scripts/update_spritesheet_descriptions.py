import colorsys
import json
import re
from pathlib import Path

from PIL import Image


ASSET_JSON = Path(
    "/Users/chadneff/git/moxi/packages/moxi-examples/assets/space-sprite-sheets/space-shooter.json"
)
ASSET_IMAGE = ASSET_JSON.with_suffix(".png")


COLOR_TOKENS = [
    "bronze",
    "silver",
    "yellow",
    "orange",
    "purple",
    "green",
    "black",
    "white",
    "brown",
    "grey",
    "gray",
    "blue",
    "red",
    "teal",
    "gold",
]

BASE_TYPE_MAP = {
    "beam": "beam",
    "beamlong": "long beam",
    "bold": "bold glyph",
    "bolt": "bolt pickup",
    "button": "ui button",
    "cockpit": "cockpit module",
    "cursor": "ui cursor",
    "enemy": "enemy fighter",
    "engine": "engine pod",
    "fire": "thruster flame",
    "gun": "gun icon",
    "laser": "laser bolt",
    "meteor": "meteor",
    "numeral": "digit",
    "pill": "pill powerup",
    "playerlife": "life icon",
    "playership": "player ship",
    "powerup": "powerup",
    "scratch": "hull scratch",
    "shield": "shield icon",
    "speed": "speed icon",
    "star": "star icon",
    "things": "badge icon",
    "turretbase": "turret base",
    "ufo": "ufo saucer",
    "wing": "wing segment",
}

SIZE_TOKENS = {
    "big": "big",
    "med": "med",
    "small": "small",
    "tiny": "tiny",
    "long": "long",
}


def load_assets():
    with ASSET_JSON.open("r", encoding="utf-8") as json_file:
        data = json.load(json_file)
    image = Image.open(ASSET_IMAGE).convert("RGBA")
    return data, image


def average_color(image, frame):
    x, y, w, h = frame["x"], frame["y"], frame["w"], frame["h"]
    region = image.crop((x, y, x + w, y + h))
    pixels = [pixel for pixel in region.getdata() if len(pixel) == 4 and pixel[3] > 0]
    if not pixels:
        return 0, 0, 0
    r = sum(pixel[0] for pixel in pixels) / len(pixels)
    g = sum(pixel[1] for pixel in pixels) / len(pixels)
    b = sum(pixel[2] for pixel in pixels) / len(pixels)
    return r, g, b


def classify_color(rgb):
    r, g, b = rgb
    if r == g == b == 0:
        return "Black"

    r_f, g_f, b_f = (channel / 255.0 for channel in (r, g, b))
    h, s, v = colorsys.rgb_to_hsv(r_f, g_f, b_f)

    if s < 0.22:
        if v > 0.85:
            return "White"
        if v > 0.6:
            return "Light Grey"
        if v > 0.35:
            return "Grey"
        return "Dark Grey"

    hue = h * 360
    if hue < 20 or hue >= 340:
        return "Red"
    if hue < 40:
        return "Orange" if v > 0.45 else "Brown"
    if hue < 65:
        return "Yellow"
    if hue < 160:
        return "Green"
    if hue < 210:
        return "Cyan"
    if hue < 255:
        return "Blue"
    if hue < 310:
        return "Purple"
    return "Magenta"


def normalize_variant(raw_variant):
    if not raw_variant:
        return ""
    try:
        return str(int(raw_variant))
    except ValueError:
        return raw_variant.upper()


def extract_base(part):
    letters = re.sub(r"\d+$", "", part).lower()
    digits = re.search(r"(\d+)$", part)
    variant = digits.group(1) if digits else ""
    for candidate in sorted(BASE_TYPE_MAP.keys(), key=len, reverse=True):
        if letters.startswith(candidate):
            remainder = letters[len(candidate) :]
            return candidate, remainder, variant
    return letters, "", variant


def split_token(token):
    letters = re.sub(r"\d+$", "", token).lower()
    digits = re.search(r"(\d+)$", token)
    number = digits.group(1) if digits else ""
    return letters, number


def detect_color(name_lower, token_letters, rgb):
    for color_token in COLOR_TOKENS:
        if color_token in name_lower:
            return color_token.replace("gray", "grey").title()
    for letters in token_letters:
        for color_token in COLOR_TOKENS:
            if color_token in letters:
                return color_token.replace("gray", "grey").title()
    return classify_color(rgb)


def describe_frame(filename, frame, image):
    frame_name = filename.rsplit(".", 1)[0]
    lower_name = frame_name.lower()
    parts = frame_name.split("_")

    base_part = parts[0]
    base_key, base_remainder, base_variant = extract_base(base_part)

    extra_tokens = [base_remainder] if base_remainder else []
    extra_tokens.extend(parts[1:])
    parsed_tokens = [split_token(token) for token in extra_tokens if token]

    rgb = average_color(image, frame["frame"])
    color = detect_color(lower_name, [token for token, _ in parsed_tokens], rgb)
    variant_main = normalize_variant(base_variant)

    if color.startswith("Light "):
        color = color.replace("Light ", "Lt ")
    if color.startswith("Dark "):
        color = color.replace("Dark ", "Dk ")

    type_label = BASE_TYPE_MAP.get(base_key, base_key.replace("playership", "player ship"))

    def number_suffix(label, digits):
        return f"{label}{digits}" if digits else label

    def joined_variant(primary, fallback=""):
        if primary:
            return f"v{primary}"
        return fallback

    description = ""

    if base_key == "beam":
        description = " ".join(filter(None, [color, "beam", joined_variant(variant_main)]))
    elif base_key == "beamlong":
        description = " ".join(filter(None, [color, "long beam", joined_variant(variant_main)]))
    elif base_key == "bold":
        description = f"{color} bold glyph"
    elif base_key == "bolt":
        description = f"{color} bolt pickup"
    elif base_key == "button":
        description = f"{color} ui button"
    elif base_key == "cockpit":
        description = " ".join(filter(None, [color, "cockpit", joined_variant(variant_main)]))
    elif base_key == "cursor":
        description = f"{color} ui cursor"
    elif base_key == "enemy":
        description = " ".join(filter(None, [color, "enemy fighter", joined_variant(variant_main)]))
    elif base_key == "engine":
        description = " ".join(filter(None, [color, "engine pod", joined_variant(variant_main)]))
    elif base_key == "fire":
        description = " ".join(filter(None, [color, "thruster flame", joined_variant(variant_main)]))
    elif base_key == "gun":
        description = " ".join(filter(None, [color, "gun icon", joined_variant(variant_main)]))
    elif base_key == "laser":
        description = " ".join(filter(None, [color, "laser bolt", joined_variant(variant_main)]))
    elif base_key == "meteor":
        size = next((SIZE_TOKENS[letters] for letters, _ in parsed_tokens if letters in SIZE_TOKENS), "")
        order = next((normalize_variant(digits) for letters, digits in parsed_tokens if letters in SIZE_TOKENS and digits), variant_main)
        description = " ".join(filter(None, [color, size, "meteor", joined_variant(order)]))
    elif base_key == "numeral":
        numeral = base_remainder.upper() if base_remainder else variant_main
        description = f"{color} digit {numeral}"
    elif base_key == "pill":
        description = f"{color} pill powerup"
    elif base_key == "playerlife":
        description = " ".join(filter(None, [color, "life icon", joined_variant(variant_main)]))
    elif base_key == "playership":
        damage = next((normalize_variant(digits) for letters, digits in parsed_tokens if letters == "damage"), "")
        ship_variant = joined_variant(variant_main)
        damage_tag = f"dmg{damage}" if damage else ""
        description = " ".join(filter(None, [color, "player ship", ship_variant, damage_tag]))
    elif base_key == "powerup":
        flavor = next((letters for letters, _ in parsed_tokens if letters and letters not in COLOR_TOKENS), "orb")
        description = f"{color} {flavor} powerup"
    elif base_key == "scratch":
        description = " ".join(filter(None, [color, "hull scratch", joined_variant(variant_main)]))
    elif base_key == "shield":
        level = normalize_variant(variant_main)
        description = " ".join(filter(None, [color, "shield icon", joined_variant(level)]))
    elif base_key == "speed":
        description = f"{color} speed icon"
    elif base_key == "star":
        star_variant = base_remainder.upper() if base_remainder else variant_main
        description = " ".join(filter(None, [color, "star icon", joined_variant(star_variant)]))
    elif base_key == "things":
        flavor = base_remainder or next((letters for letters, _ in parsed_tokens if letters not in COLOR_TOKENS), "")
        description = " ".join(filter(None, [color, flavor or "badge", "icon"]))
    elif base_key == "turretbase":
        size = next((SIZE_TOKENS[letters] for letters, _ in parsed_tokens if letters in SIZE_TOKENS), "")
        description = " ".join(filter(None, [color, size, "turret base"]))
    elif base_key == "ufo":
        description = f"{color} ufo saucer"
    elif base_key == "wing":
        description = " ".join(filter(None, [color, "wing segment", joined_variant(variant_main)]))
    else:
        description = " ".join(filter(None, [color, type_label.strip(), joined_variant(variant_main)]))

    return description.strip()


def main():
    data, image = load_assets()
    frames = data.get("frames", {})

    for filename, details in frames.items():
        description = describe_frame(filename, details, image)
        details["description"] = description

    with ASSET_JSON.open("w", encoding="utf-8") as json_file:
        json.dump(data, json_file, indent=2)

    print(f"Updated descriptions for {len(frames)} frames")


if __name__ == "__main__":
    main()
