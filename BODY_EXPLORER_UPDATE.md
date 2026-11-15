# Anatomy Explorer update — v1.6.0

The image-based anatomy stage has been replaced with a procedural 3D mesh renderer. Users can choose a Male or Female reference and select Normal, Skeleton, Muscular, Circulation, Nervous or All Systems. The model supports pointer/touch dragging, scroll zoom, auto-rotation, a microgravity-style float animation and Reset view. Six clickable body-system markers are projected from 3D coordinates every frame, so they remain aligned as the model rotates.

Implementation: `astra-3d-anatomy.js`, `astra-3d-viewer.css`, and `body-view-ui.js`. WebGL is preferred; a native Canvas2D software renderer draws the same transformed 3D triangle mesh when WebGL is unavailable.

The geometry is stylised educational content and is not a medically validated anatomical model, scan, sensor-placement guide or diagnostic tool.
