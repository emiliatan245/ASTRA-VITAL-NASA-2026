# ASTRA-VITAL v1.6.0 — Procedural 3D Anatomy

- Replaced the anatomy image layer with a runtime-generated 3D polygon mesh.
- Added perspective rotation through pointer drag and touch drag.
- Added pointer-wheel zoom with camera-distance limits.
- Enabled slow auto-rotation by default, with a button to toggle it.
- Added Microgravity-style vertical float as an illustrative animation only.
- Added Reset view for camera and layer controls.
- Repositioned the six clickable body-system pointers by projecting their 3D anchor coordinates each animation frame.
- Retained Male/Female reference selection and all six anatomy modes.
- Added WebGL rendering where available and a built-in Canvas2D 3D software renderer fallback for browsers or laptops without WebGL.
- Kept the model local-first: no external 3D framework, network model download or remote runtime dependency.
- Updated documentation to distinguish a procedural educational 3D geometry model from validated anatomical meshes and medical scans.
