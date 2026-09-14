828 Construction website QR code

Destination: https://828constructions.com/

The QR directly encodes the destination URL. It has no expiration date, account,
subscription, tracking service, or third-party QR redirect. Continued website access
depends on keeping the domain, HTTPS certificate, and hosting operational.

Artwork: the exact 828logo.png from OneDrive's 00 Brand Logo folder. Transparent
outer padding is trimmed and the original letter shapes appear black on white
inside a thin bordered square center box, matching the original QR spacing. The original source is preserved as 828logo.png.

Deliverables:
- PNG: 2508 x 2508 pixels, opaque white background, 300 dpi metadata.
- SVG: scalable QR modules with the logo embedded; no external image dependency.
- PDF: 4 x 4 inches, vector QR modules and an embedded raster logo.

Verification: 22 cases passed both ZXing-C++ and OpenCV (44 successful decodes),
including the saved PNG, rendered SVG and PDF, small sizes down to 256 pixels,
rotation, blur, JPEG compression, reduced contrast, and perspective distortion.
Every decoded value exactly matches the destination URL. See verification.json.
These are software tests, not physical phone-camera or printed-proof tests.

Keep the white outer margin intact and preserve the square aspect ratio. Scan a
sample at its final printed size before ordering a print run.

Rebuild: install requirements.txt into an isolated Python environment, then run
generate.py. The QR is version 8, mask 4, error correction H, with a four-module quiet zone.
