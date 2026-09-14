"""Rebuild and verify the static branded QR. Dependencies are in requirements.txt."""
from pathlib import Path
import base64
import io
import json
import hashlib
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import qrcode
import zxingcpp
import pymupdf
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

OUT = Path(__file__).resolve().parent
URL = "https://828constructions.com/"
NAME = "828-construction-website-qr-new-logo"
SCALE = 60
BORDER = 4
qr = qrcode.QRCode(version=4, error_correction=qrcode.constants.ERROR_CORRECT_H,
                   box_size=SCALE, border=BORDER)
qr.add_data(URL, optimize=0)
qr.make(fit=False)
matrix = qr.get_matrix()
units = len(matrix)
logo_path = OUT / "828logo.png"
source_logo = Image.open(logo_path).convert("RGBA")
# Trim empty canvas and isolated nearly invisible edge pixels; preserve the artwork.
alpha = np.array(source_logo)[:, :, 3]
rows = np.where((alpha > 1).sum(axis=1) > 10)[0]
cols = np.where((alpha > 1).sum(axis=0) > 10)[0]
crop = (max(0, int(cols[0])-20), max(0, int(rows[0])-20),
        min(source_logo.width, int(cols[-1])+21), min(source_logo.height, int(rows[-1])+21))
artwork = source_logo.crop(crop)
logo = Image.new("RGB", artwork.size, "black")
logo.paste(artwork, mask=artwork.getchannel("A"))

# Module-aligned clearance keeps the center badge away from functional patterns.
# The 13 x 9 module clearance covers 10.74% of the 33 x 33 symbol.
bx, by, bw, bh = (units - 13) / 2, (units - 9) / 2, 13, 9
inset = 0.46
frame = (bx + inset, by + inset, bw - 2 * inset, bh - 2 * inset)
lw = 11.25
lh = lw * logo.height / logo.width
lx, ly = (units - lw) / 2, (units - lh) / 2

im = Image.new("RGB", (units * SCALE, units * SCALE), "white")
draw = ImageDraw.Draw(im)
for y, row in enumerate(matrix):
    for x, dark in enumerate(row):
        if dark:
            draw.rectangle((x*SCALE, y*SCALE, (x+1)*SCALE-1, (y+1)*SCALE-1), fill="black")
draw.rectangle((bx*SCALE, by*SCALE, (bx+bw)*SCALE-1, (by+bh)*SCALE-1), fill="white")
fx, fy, fw, fh = frame
draw.rectangle((round(fx*SCALE), round(fy*SCALE), round((fx+fw)*SCALE), round((fy+fh)*SCALE)),
               outline="black", width=round(.10*SCALE))
im.paste(logo.resize((round(lw*SCALE), round(lh*SCALE)), Image.Resampling.LANCZOS),
         (round(lx*SCALE), round(ly*SCALE)))
im.save(OUT / f"{NAME}.png", dpi=(300, 300), optimize=True)

# Scalable QR modules, with the supplied logo embedded on its black backing.
path = " ".join(f"M{x},{y}h1v1h-1z" for y, row in enumerate(matrix) for x, dark in enumerate(row) if dark)
logo_bytes = io.BytesIO()
logo.save(logo_bytes, format="PNG")
encoded = base64.b64encode(logo_bytes.getvalue()).decode()
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{units*SCALE}" height="{units*SCALE}" viewBox="0 0 {units} {units}">
<title>828 Construction website QR code</title>
<desc>Static QR encoding {URL}, error correction H, original 828logo.png centered.</desc>
<rect width="{units}" height="{units}" fill="white"/>
<path d="{path}" fill="black" shape-rendering="crispEdges"/>
<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" fill="white"/>
<rect x="{fx}" y="{fy}" width="{fw}" height="{fh}" fill="white" stroke="black" stroke-width="0.10"/>
<image x="{lx}" y="{ly}" width="{lw}" height="{lh}" href="data:image/png;base64,{encoded}"/>
</svg>
'''
(OUT / f"{NAME}.svg").write_text(svg)

# Four-inch-square PDF: vector modules and embedded source logo, no page scaling.
page = 288
step = page / units
c = canvas.Canvas(str(OUT / f"{NAME}.pdf"), pagesize=(page, page))
c.setTitle("828 Construction — Website QR Code")
c.setSubject(f"Static QR: {URL}")
c.setFillColorRGB(1, 1, 1)
c.rect(0, 0, page, page, fill=1, stroke=0)
c.setFillColorRGB(0, 0, 0)
module_path = c.beginPath()
for y, row in enumerate(matrix):
    for x, dark in enumerate(row):
        if dark:
            module_path.rect(x*step, page-(y+1)*step, step, step)
c.drawPath(module_path, fill=1, stroke=0)
c.setFillColorRGB(1, 1, 1)
c.rect(bx*step, page-(by+bh)*step, bw*step, bh*step, fill=1, stroke=0)
c.setStrokeColorRGB(0, 0, 0)
c.setLineWidth(.10*step)
c.rect(fx*step, page-(fy+fh)*step, fw*step, fh*step, fill=1, stroke=1)
c.drawImage(ImageReader(logo), lx*step, page-(ly+lh)*step, lw*step, lh*step)
c.showPage()
c.save()

def decode_test(label, candidate):
    arr = np.array(candidate.convert("RGB"))
    zx = zxingcpp.read_barcodes(arr)
    zx_texts = [r.text for r in zx]
    cv_text = cv2.QRCodeDetector().detectAndDecode(cv2.cvtColor(arr, cv2.COLOR_RGB2BGR))[0]
    return {"case": label, "width_px": candidate.width,
            "zxing_pass": URL in zx_texts, "opencv_pass": cv_text == URL,
            "zxing_decoded": zx_texts, "opencv_decoded": cv_text}

cases = [("original PNG", Image.open(OUT / f"{NAME}.png"))]
svg_doc = pymupdf.open(OUT / f"{NAME}.svg")
svg_pix = svg_doc[0].get_pixmap(matrix=pymupdf.Matrix(1230/svg_doc[0].rect.width, 1230/svg_doc[0].rect.height))
cases.append(("SVG rendered at 1230px", Image.frombytes("RGB", (svg_pix.width,svg_pix.height), svg_pix.samples)))
pdf = pymupdf.open(OUT / f"{NAME}.pdf")
pix = pdf[0].get_pixmap(dpi=300)
cases.append(("PDF rendered at 300dpi", Image.frombytes("RGB", (pix.width,pix.height), pix.samples)))
for size in [256, 320, 480, 800, 1230]:
    cases.append((f"resize {size}px", im.resize((size, size), Image.Resampling.LANCZOS)))
base = im.resize((800, 800), Image.Resampling.LANCZOS)
for angle in [-20, -10, 10, 20, 90, 180, 270]:
    cases.append((f"rotation {angle} degrees", base.rotate(angle, Image.Resampling.BICUBIC, expand=True, fillcolor="white")))
for radius in [.5, 1, 1.5]:
    cases.append((f"blur radius {radius}px at 800px", base.filter(ImageFilter.GaussianBlur(radius))))
for quality in [45, 75]:
    buf = io.BytesIO()
    base.save(buf, format="JPEG", quality=quality)
    buf.seek(0)
    cases.append((f"JPEG quality {quality}", Image.open(buf).copy()))
src = np.float32([[0,0], [799,0], [799,799], [0,799]])
dst = np.float32([[60,30], [740,70], [790,760], [10,790]])
warped = cv2.warpPerspective(np.array(base), cv2.getPerspectiveTransform(src, dst), (820,820), borderValue=(255,255,255))
cases.append(("perspective distortion", Image.fromarray(warped)))
cases.append(("reduced contrast", Image.fromarray((np.array(base).astype(float)*.60+45).astype(np.uint8))))
results = []
for label, candidate in cases:
    result = decode_test(label, candidate)
    results.append(result)
    print(label, "ZXing:", result["zxing_pass"], "OpenCV:", result["opencv_pass"], flush=True)
report = {"url": URL, "type": "static; direct URL; no QR provider or subscription",
          "version": qr.version, "error_correction": "H", "quiet_zone_modules": BORDER,
          "center_clearance_modules": [13,9], "source_logo_sha256": hashlib.sha256(logo_path.read_bytes()).hexdigest(),
          "logo_presentation": "Original artwork on black; outer transparent padding trimmed", "logo_crop": crop,
          "tests": results, "all_passed": all(r["zxing_pass"] and r["opencv_pass"] for r in results)}
(OUT / "verification.json").write_text(json.dumps(report, indent=2) + "\n")
assert report["all_passed"], "One or more scan checks failed; inspect verification.json."
