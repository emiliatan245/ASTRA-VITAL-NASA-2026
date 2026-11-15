# ASTRA-VITAL v1.4.1 — Anatomy pointer alignment fix

## Fixed
- Anatomy pointers are now positioned relative to the rendered anatomy image bounds rather than the full stage. This keeps each marker attached to the corresponding body region across viewport sizes, aspect ratios, and browser zoom.
- The anatomy illustration is larger and uses a blended dark canvas so the source image rectangle is less visually prominent against the blue-black stage.
- Pointer labels are compact tooltips shown on hover, keyboard focus, or selection, reducing persistent overlap across the figure.
- Female normal-form artwork receives a small visual alignment correction because its generated figure is offset within the source canvas.
- The anatomy stage height now scales more reliably with available viewport height.

## Preserved
- Male/female reference selection.
- Normal, nervous-system, circulation, skeleton, and muscular views.
- Six clickable body-system pointers and keyboard access.
- Existing assessment, local browser records, evidence lab, research cards, and synthetic model.

## Limitations
- Anatomy artwork remains static educational illustration, not a rotatable 3D mesh or validated clinical image.
- The six pointer locations are illustrative navigation anchors, not examination or sensor sites.
