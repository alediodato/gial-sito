#!/usr/bin/env python3
"""Rigenera il logo WebP dal PNG sorgente.

Codifica lossless con canale alpha: il logo e' a tinte piatte con bordi netti,
la compressione lossy impasta la chiave inglese e le righe tricolori sottili.
"""
from PIL import Image
import os
import sys

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = os.path.join(ROOT, "img", "gial-logo-rettangolo-nosfondo.png")
OUT = os.path.join(ROOT, "img", "gial-logo-rettangolo-nosfondo.webp")

if not os.path.exists(SRC):
    print("Error: source file not found:", SRC)
    sys.exit(1)

try:
    im = Image.open(SRC).convert("RGBA")
    im.save(OUT, "WEBP", lossless=True, quality=100, method=6)
    print("Saved:", OUT, im.size, im.mode, str(os.path.getsize(OUT) // 1024) + " KB")
except Exception as e:
    print("Error:", e)
    sys.exit(1)
