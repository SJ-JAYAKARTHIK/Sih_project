AgriProcure screenshot asset pack
=================================

Source screenshot:
ChatGPT Image Sep 10, 2026, 01_40_16 PM.png (1672 x 941 px)

Contents:
- source_screenshot.png — untouched supplied screenshot
- 30 PNG crops — visible graphical/UI assets and composite regions
- asset_manifest.json — exact crop coordinates and native sizes

Important:
This is a flattened screenshot, so it does not contain the original SVG/PNG
source files, fonts, or DOM/CSS. The PNGs here are faithful crops of the
visible screenshot pixels. For an exact visual clone, use these crops as
reference/texture assets where appropriate and recreate text, layout, cards,
borders, and interactions in HTML/CSS/React.

Suggested implementation:
- Keep the page canvas at a 16:9 responsive ratio.
- Treat the supplied screenshot as the pixel reference.
- Use the individual crops only for graphical elements; recreate text as
  selectable HTML text using a close matching font.
- The QR crop is preserved exactly as it appears in the screenshot.
