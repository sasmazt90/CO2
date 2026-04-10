from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"

SOFT_WHITE = "#F8FAF7"
PASTEL_SAGE = "#DDEBDD"
MINT_GREEN = "#B3E5C9"
SOFT_TEAL = "#89D2C6"
PASTEL_GREEN = "#ADE1AF"
WARM_GRAY = "#A0A7A2"
FOREST = "#4E6156"


def vertical_gradient(size: int, top: str, bottom: str) -> Image.Image:
    image = Image.new("RGBA", (size, size), top)
    draw = ImageDraw.Draw(image)
    top_rgb = tuple(int(top[i : i + 2], 16) for i in (1, 3, 5))
    bottom_rgb = tuple(int(bottom[i : i + 2], 16) for i in (1, 3, 5))
    for y in range(size):
      blend = y / max(size - 1, 1)
      color = tuple(
          int(top_rgb[index] * (1 - blend) + bottom_rgb[index] * blend)
          for index in range(3)
      )
      draw.line((0, y, size, y), fill=color)
    return image


def draw_logo(size: int) -> Image.Image:
    base = vertical_gradient(size, SOFT_WHITE, PASTEL_SAGE)
    draw = ImageDraw.Draw(base)

    padding = int(size * 0.15)
    ring_width = int(size * 0.085)
    outer = [padding, padding, size - padding, size - padding]
    draw.ellipse(outer, fill=SOFT_WHITE, outline=SOFT_TEAL, width=ring_width)

    draw.arc(outer, start=210, end=25, fill=PASTEL_GREEN, width=ring_width)
    draw.arc(outer, start=25, end=150, fill=MINT_GREEN, width=ring_width)

    center = size / 2
    leaf_box = (
        center - size * 0.12,
        center - size * 0.06,
        center + size * 0.16,
        center + size * 0.2,
    )
    draw.ellipse(leaf_box, fill=MINT_GREEN)
    draw.polygon(
        [
            (center, center - size * 0.15),
            (center + size * 0.18, center - size * 0.02),
            (center + size * 0.03, center + size * 0.16),
        ],
        fill=SOFT_TEAL,
    )
    draw.line(
        (
            center - size * 0.01,
            center + size * 0.16,
            center + size * 0.11,
            center - size * 0.08,
        ),
        fill=FOREST,
        width=max(2, int(size * 0.018)),
    )
    return base


def create_icon_assets() -> None:
    ASSETS.mkdir(exist_ok=True)
    icon = draw_logo(1024)
    icon.save(ASSETS / "icon.png")
    icon.save(ASSETS / "adaptive-icon.png")

    splash = Image.new("RGBA", (1242, 2436), SOFT_WHITE)
    splash_logo = draw_logo(720)
    splash.alpha_composite(
        splash_logo,
        ((splash.width - splash_logo.width) // 2, (splash.height - splash_logo.height) // 2),
    )
    splash.save(ASSETS / "splash-icon.png")

    favicon = draw_logo(64)
    favicon.save(ASSETS / "favicon.png")

    card = Image.new("RGBA", (1600, 900), SOFT_WHITE)
    overlay = vertical_gradient(900, PASTEL_SAGE, SOFT_WHITE)
    card.alpha_composite(overlay, (350, 0))
    card_logo = draw_logo(360)
    card.alpha_composite(card_logo, (120, 270))
    draw = ImageDraw.Draw(card)
    draw.text((520, 300), "Digital Carbon", fill=FOREST)
    draw.text((520, 360), "Footprint Score", fill=FOREST)
    draw.text((520, 430), "Calm daily carbon coaching", fill=WARM_GRAY)
    card.save(ASSETS / "social-preview.png")


if __name__ == "__main__":
    create_icon_assets()
