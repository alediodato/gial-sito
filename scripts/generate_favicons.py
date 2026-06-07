#!/usr/bin/env python3
"""Genera il set completo di favicon GIAL (casa + goccia blu su navy).

Output nella root del sito:
  favicon.ico (16/32/48), favicon-16.png, favicon-32.png,
  apple-touch-icon.png (180, opaco), icon-192.png, icon-512.png
"""
import os
from math import sin, cos, acos, pi
from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(__file__), "..")
NAVY = (31, 59, 99)
BLUE = (37, 99, 235)
WHITE = (255, 255, 255)
SS = 4


def house_pts(s, mx=0.20, roof=0.40, top=0.18, bot=0.84):
    left, right = s * mx, s * (1 - mx)
    t, b = s * top, s * bot
    roof_base = t + (b - t) * roof
    return [(s / 2, t), (right, roof_base), (right, b), (left, b), (left, roof_base)]


def drop_pts(cx, cy, r, d):
    ang = acos(r / d)
    pts = [(cx, cy - d)]
    N = 240
    for i in range(N + 1):
        a = ang + (2 * pi - 2 * ang) * i / N
        pts.append((cx + r * sin(a), cy - r * cos(a)))
    return pts


def render(size, rounded=True):
    s = size * SS
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if rounded:
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=NAVY)
    else:
        d.rectangle([0, 0, s - 1, s - 1], fill=NAVY)  # opaco, pieno (apple-touch)
    d.polygon(house_pts(s), fill=WHITE)
    d.polygon(drop_pts(s / 2, s * 0.62, s * 0.115, s * 0.21), fill=BLUE)
    return img.resize((size, size), Image.LANCZOS)


def out(name):
    return os.path.join(ROOT, name)


# PNG favicon
render(16).save(out("favicon-16.png"))
render(32).save(out("favicon-32.png"))
# ICO multi-size da un master 256
master = render(256)
master.save(out("favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
# Apple touch (opaco, quadrato pieno: iOS arrotonda da solo)
render(180, rounded=False).save(out("apple-touch-icon.png"))
# Manifest icons
render(192).save(out("icon-192.png"))
render(512).save(out("icon-512.png"))
print("Favicon set generato:", "favicon.ico, favicon-16/32.png, apple-touch-icon.png, icon-192/512.png")
