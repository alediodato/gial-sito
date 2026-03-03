from PIL import Image
import sys

inp = "img/itec.jpeg"
out = "img/itec.webp"

try:
    im = Image.open(inp)
    im.save(out, "WEBP", quality=85, method=6)
    print("Saved:", out)
except Exception as e:
    print("Error:", e)
    sys.exit(1)
