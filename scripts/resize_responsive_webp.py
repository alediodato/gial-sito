#!/usr/bin/env python3
"""Genera le versioni ridotte delle foto della home usate nei srcset.

- Slideshow "Chi siamo" (img/gial/gial-N.webp): -600 e -900 di larghezza.
  Il riquadro e' al massimo 526x448 su desktop e ~343x448 su mobile.
- Foto del team (img/team/*.webp): -160, mostrate a 68x68.

Le versioni piu' larghe dell'originale vengono saltate.
Rilanciare dopo aver sostituito o aggiunto una foto.
"""
from PIL import Image
import glob
import os

ROOT = os.path.join(os.path.dirname(__file__), "..")
JOBS = [
    ("img/gial/gial-[0-9].webp", (600, 900)),
    ("img/team/*.webp", (160,)),
]

for pattern, widths in JOBS:
    for src in sorted(glob.glob(os.path.join(ROOT, pattern))):
        base = os.path.splitext(src)[0]
        if base.rsplit("-", 1)[-1].isdigit() and "team" in base:
            continue  # gia' una variante
        im = Image.open(src)
        for w in widths:
            if w >= im.width:
                continue
            h = round(im.height * w / im.width)
            out = f"{base}-{w}.webp"
            im.resize((w, h), Image.LANCZOS).save(out, "WEBP", quality=80, method=6)
            print(os.path.relpath(out, ROOT), (w, h), str(os.path.getsize(out) // 1024) + " KB")
