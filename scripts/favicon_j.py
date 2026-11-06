#!/usr/bin/env python3
"""Regenerate the Jepong Devxyz favicon: mint 'J' on black.

Builds the ICO container manually with explicit RGBA PNG payloads —
Next.js/Turbopack rejects ICOs whose embedded PNGs are not RGBA
("The PNG is not in RGBA format!").
"""
import struct
from PIL import Image, ImageDraw, ImageFont

MINT = (38, 228, 182, 255)   # #26E4B6
BLACK = (0, 0, 0, 255)

S = 512  # draw large, then downscale for crisp results
img = Image.new("RGBA", (S, S), BLACK)
d = ImageDraw.Draw(img)

candidates = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
]
font = None
for c in candidates:
    try:
        font = ImageFont.truetype(c, 380)
        break
    except OSError:
        continue
if font is None:
    raise SystemExit("no bold font found")

bbox = d.textbbox((0, 0), "J", font=font)
w = bbox[2] - bbox[0]
h = bbox[3] - bbox[1]
x = (S - w) // 2 - bbox[0]
y = (S - h) // 2 - bbox[1]
d.text((x, y), "J", font=font, fill=MINT)

img = img.convert("RGBA")  # enforce RGBA before any encoding


def png_bytes_rgba(image: Image.Image, size: int) -> bytes:
    """Return a strictly RGBA PNG encoded at `size`x`size`."""
    im = image.resize((size, size), Image.LANCZOS).convert("RGBA")
    assert im.mode == "RGBA"
    import io
    buf = io.BytesIO()
    im.save(buf, format="PNG")
    data = buf.getvalue()
    # sanity: PNG IHDR color type must be 6 (RGBA)
    ct = data[25]
    assert ct == 6, f"PNG color type {ct} != 6"
    return data


sizes = [16, 32, 48, 64]
payloads = [png_bytes_rgba(img, s) for s in sizes]

# ICO container: ICONDIR (6 bytes) + ICONDIRENTRY (16 bytes) per image + data
ico = struct.pack("<HHH", 0, 1, len(sizes))
offset = 6 + 16 * len(sizes)
for s, data in zip(sizes, payloads):
    b = s if s < 256 else 0
    ico += struct.pack("<BBBBHHII", b, b, 0, 0, 1, 32, len(data), offset)
    offset += len(data)
for data in payloads:
    ico += data

out_ico = "/home/z/my-project/src/app/favicon.ico"
with open(out_ico, "wb") as f:
    f.write(ico)

# keep legacy public copy in sync
img.resize((64, 64), Image.LANCZOS).convert("RGBA").save(
    "/home/z/my-project/public/favicon-cinedevxyz.png", format="PNG"
)
print("favicon written (manual RGBA ICO):", out_ico, len(ico), "bytes")
