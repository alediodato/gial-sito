from PIL import Image
import sys
import os

base = "img/itec"
out = "img/itec.webp"

inp = None
for ext in ("jpeg", "jpg", "png"):
    candidate = f"{base}.{ext}"
    if os.path.exists(candidate):
        inp = candidate
        break

if inp is None:
    print("Error: source file not found (tried .jpeg .jpg .png)")
    sys.exit(1)

try:
    im = Image.open(inp)
    im.save(out, "WEBP", quality=85, method=6)
    print("Saved:", out)
except Exception as e:
    print("Error:", e)
    sys.exit(1)
