#!/usr/bin/env python3
"""Genera l'immagine Open Graph brandizzata (1200x630) per le condivisioni social."""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), "..")
NAVY = (31, 59, 99)
BLUE = (37, 99, 235)
GOLD = (217, 158, 43)
GRAY = (75, 85, 99)

W, H = 1200, 630
img = Image.new("RGB", (W, H), (255, 255, 255))
d = ImageDraw.Draw(img)

# fascia superiore sfumata azzurro chiaro
for y in range(200):
    t = 1 - y / 200
    c = (int(239 + (255 - 239) * (1 - t)), int(246 + (255 - 246) * (1 - t)), 255)
    d.line([(0, y), (W, y)], fill=c)

# logo centrato in alto
logo = Image.open(os.path.join(ROOT, "img", "gial-logo-rettangolo-nosfondo.png")).convert("RGBA")
lw = 480
lh = int(logo.height * lw / logo.width)
logo = logo.resize((lw, lh), Image.LANCZOS)
img.paste(logo, ((W - lw) // 2, 70), logo)

FONT_B = r"C:\Windows\Fonts\arialbd.ttf"
FONT_R = r"C:\Windows\Fonts\segoeui.ttf"

def center_text(y, text, font, fill):
    bbox = d.textbbox((0, 0), text, font=font)
    d.text(((W - (bbox[2] - bbox[0])) / 2 - bbox[0], y), text, font=font, fill=fill)

center_text(300, "Termoidraulica a Prato", ImageFont.truetype(FONT_B, 64), NAVY)
center_text(390, "Bagni · Caldaie · Climatizzazione · Infissi", ImageFont.truetype(FONT_R, 40), GRAY)
center_text(455, "Preventivo AI gratuito · Assicurazione postuma 10 anni", ImageFont.truetype(FONT_R, 32), BLUE)

# barra tricolore brand in basso (blu / rosso / oro come nel logo)
bar_y = H - 46
seg = W // 3
d.rectangle([0, bar_y, seg, H], fill=NAVY)
d.rectangle([seg, bar_y, seg * 2, H], fill=(214, 40, 40))
d.rectangle([seg * 2, bar_y, W, H], fill=GOLD)

# sito web sopra la barra
center_text(bar_y - 60, "gialtermoidraulica.it", ImageFont.truetype(FONT_B, 30), GOLD)

out = os.path.join(ROOT, "img", "og-image.png")
img.save(out, optimize=True)
print("saved", out, os.path.getsize(out) // 1024, "KB")
