#!/usr/bin/env python3
"""
Generates Ginti's brand assets from two hand-designed source images:

  assets/brand/icon-source.png   — the app icon artwork (dark-green rounded
                                    tile with the wallet + leaf mark on a cream
                                    background)
  assets/brand/banner.png        — the wide marketing banner (also the source
                                    for the Play Store feature graphic)

Outputs (overwrites in place):
  assets/icon.png                        1024x1024  full-bleed app icon
  assets/adaptive-icon.png               1024x1024  Android adaptive foreground
  assets/notification-icon.png             96x96    white leaf silhouette (alpha)
  assets/splash.png                      1284x2778  deep-green splash w/ icon tile
  assets/play/play-icon-512.png            512x512  Play Console hi-res icon
  assets/play/feature-graphic-1024x500.png 1024x500 Play feature graphic

Requires Pillow:  pip install Pillow
Run:              python3 scripts/generate-assets.py
"""
import os
import math
from collections import deque
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
PLAY = os.path.join(ASSETS, "play")
BRAND = os.path.join(ASSETS, "brand")
ICON_SRC = os.path.join(BRAND, "icon-source.png")
BANNER_SRC = os.path.join(BRAND, "banner.png")

# Brand colours (sampled from the icon artwork) — kept in sync with app.json.
SPLASH_BG = (10, 33, 24)      # #0A2118 deep green
GRAD_TL = (34, 103, 79)       # icon field, top-left (lightest)
GRAD_BR = (10, 60, 50)        # icon field, bottom-right (darkest)

# Feature-graphic crop: bias left so the "Ginti" logo + phones are preserved
# (a centre crop would clip the logo). Fraction of the horizontal overscan.
FG_LEFT_FRAC = 0.043


def bri(p):
    return 0.299 * p[0] + 0.587 * p[1] + 0.714 * p[2]


def is_green(p):
    return p[1] > p[0] + 8 and p[1] > p[2] + 3 and bri(p) < 170


def detect_rect(im):
    """Bounding box of the dark-green rounded tile (dark pixels) in the icon art."""
    w, h = im.size
    px = im.load()
    minx, miny, maxx, maxy = w, h, -1, -1
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            if bri(px[x, y]) < 135:
                minx = min(minx, x); maxx = max(maxx, x)
                miny = min(miny, y); maxy = max(maxy, y)
    return minx, miny, maxx, maxy


def build_fullbleed(rect):
    """Remove the cream corners of the rounded tile and return a seamless,
    full-bleed green square (gradient + wallet preserved)."""
    side = rect.width
    rpx = rect.load()

    # Flood the non-green regions connected to the 4 corners = the cream corners
    # (the centred wallet + sparkle islands are fenced off by green, so safe).
    flood = bytearray(side * side)
    inb = lambda x, y: 0 <= x < side and 0 <= y < side
    dq = deque()
    for sx, sy in [(0, 0), (side - 1, 0), (0, side - 1), (side - 1, side - 1)]:
        if not is_green(rpx[sx, sy]):
            flood[sy * side + sx] = 1
            dq.append((sx, sy))
    while dq:
        x, y = dq.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if inb(nx, ny) and not flood[ny * side + nx] and not is_green(rpx[nx, ny]):
                flood[ny * side + nx] = 1
                dq.append((nx, ny))

    # Fill flooded pixels by marching toward the centre until a green pixel.
    cx = cy = side / 2.0
    fb = rect.copy()
    fpx = fb.load()
    for y in range(side):
        row = y * side
        for x in range(side):
            if not flood[row + x]:
                continue
            dx, dy = cx - x, cy - y
            d = math.hypot(dx, dy)
            ux, uy = dx / d, dy / d
            for step in range(1, 360):
                gx = int(round(x + ux * step)); gy = int(round(y + uy * step))
                if inb(gx, gy) and not flood[gy * side + gx] and is_green(rpx[gx, gy]):
                    fpx[x, y] = rpx[gx, gy]
                    break

    # Smooth the filled corners (the per-pixel march leaves faint streaks):
    # blur, then composite the blur only over the dilated + feathered corners.
    mask = Image.new("L", (side, side), 0)
    mpx = mask.load()
    for y in range(side):
        for x in range(side):
            if flood[y * side + x]:
                mpx[x, y] = 255
    mask = mask.filter(ImageFilter.MaxFilter(21)).filter(ImageFilter.GaussianBlur(6))
    return Image.composite(fb.filter(ImageFilter.GaussianBlur(24)), fb, mask)


def gradient(size):
    canvas = Image.new("RGB", (size, size))
    cpx = canvas.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * (size - 1))
            cpx[x, y] = (
                int(GRAD_TL[0] + (GRAD_BR[0] - GRAD_TL[0]) * t),
                int(GRAD_TL[1] + (GRAD_BR[1] - GRAD_TL[1]) * t),
                int(GRAD_TL[2] + (GRAD_BR[2] - GRAD_TL[2]) * t),
            )
    return canvas


def main():
    os.makedirs(PLAY, exist_ok=True)
    src = Image.open(ICON_SRC).convert("RGB")
    rx0, ry0, rx1, ry1 = detect_rect(src)
    side = min(rx1 - rx0, ry1 - ry0)
    rect = src.crop((rx0, ry0, rx0 + side, ry0 + side))
    fb = build_fullbleed(rect)

    # 1. icon.png — full-bleed, opaque (iOS / legacy launcher)
    fb.resize((1024, 1024), Image.LANCZOS).save(os.path.join(ASSETS, "icon.png"))
    print("✓ icon.png (1024x1024)")

    # 2. play-icon-512.png — Play Console hi-res icon, full-bleed
    fb.resize((512, 512), Image.LANCZOS).save(os.path.join(PLAY, "play-icon-512.png"))
    print("✓ play/play-icon-512.png (512x512)")

    # 3. adaptive-icon.png — full-bleed; mark inset to ~90% so masks never clip it
    canvas = gradient(1024)
    sz = int(1024 * 0.90); off = (1024 - sz) // 2
    canvas.paste(fb.resize((sz, sz), Image.LANCZOS), (off, off))
    canvas.save(os.path.join(ASSETS, "adaptive-icon.png"))
    print("✓ adaptive-icon.png (1024x1024)")

    # 4. splash.png — deep-green canvas with a centred rounded icon tile
    W2, H2 = 1284, 2778
    sp = Image.new("RGB", (W2, H2), SPLASH_BG)
    ts = 620
    tile = fb.resize((ts, ts), Image.LANCZOS).convert("RGBA")
    tm = Image.new("L", (ts, ts), 0)
    ImageDraw.Draw(tm).rounded_rectangle([0, 0, ts - 1, ts - 1], radius=int(ts * 0.22), fill=255)
    tile.putalpha(tm)
    sp.paste(tile, ((W2 - ts) // 2, (H2 - ts) // 2), tile)
    sp.save(os.path.join(ASSETS, "splash.png"))
    print("✓ splash.png (1284x2778)")

    # 5. notification-icon.png — white leaf silhouette on transparent (Android)
    w, h = src.size
    lf = src.crop((int(w * 0.322), int(h * 0.491), int(w * 0.535), int(h * 0.683)))
    lpx = lf.load(); lw, lh = lf.size
    alpha = Image.new("L", (lw, lh), 0); apx = alpha.load()
    for y in range(lh):
        for x in range(lw):
            p = lpx[x, y]; b = bri(p)
            greenish = p[1] >= p[2] - 4 and p[1] >= p[0] - 12
            if b >= 240 or not greenish:
                apx[x, y] = 0
            elif b <= 180:
                apx[x, y] = 255
            else:
                apx[x, y] = int(255 * (240 - b) / 60)
    alpha = alpha.crop(alpha.getbbox())
    aw, ah = alpha.size
    s = 76 / max(aw, ah)
    na = alpha.resize((max(1, int(aw * s)), max(1, int(ah * s))), Image.LANCZOS)
    c96 = Image.new("RGBA", (96, 96), (255, 255, 255, 0))
    c96.paste(Image.new("RGBA", na.size, (255, 255, 255, 255)),
              ((96 - na.size[0]) // 2, (96 - na.size[1]) // 2), na)
    c96.save(os.path.join(ASSETS, "notification-icon.png"))
    print("✓ notification-icon.png (96x96)")

    # 6. feature-graphic-1024x500.png — crop-to-fill from the banner, biased left
    ban = Image.open(BANNER_SRC).convert("RGB")
    bw, bh = ban.size
    sw = round(bw * 500 / bh)
    scaled = ban.resize((sw, sh := 500), Image.LANCZOS)
    left = round((sw - 1024) * FG_LEFT_FRAC)
    scaled.crop((left, 0, left + 1024, 500)).save(
        os.path.join(PLAY, "feature-graphic-1024x500.png"))
    print("✓ play/feature-graphic-1024x500.png (1024x500)")

    print("\nAll Ginti assets regenerated from assets/brand/.")


if __name__ == "__main__":
    main()
