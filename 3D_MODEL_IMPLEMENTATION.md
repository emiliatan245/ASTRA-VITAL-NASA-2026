# ASTRA-VITAL procedural 3D model — implementation notes

## What makes it 3D

The viewer does not place a flat image on the screen. `astra-3d-anatomy.js` creates 3D vertex positions and normals for spheres, ellipsoids, tapered limb surfaces, curved tubes and simplified anatomy layers. Every frame, the model's vertices are rotated around the X/Y axes, projected through a perspective camera and rendered to the canvas.

The display can be manipulated:
- Drag / touch-drag: change model rotation.
- Wheel: change camera distance (zoom).
- Auto-rotate: increment the model's Y rotation over time.
- Microgravity: add a small time-based vertical camera-space offset.
- Reset view: restore camera distance, rotation and the Normal body layer.

Six 3D points (brain, respiratory, cardiovascular, abdominal/immune-metabolic, musculoskeletal, wellbeing) are projected into screen coordinates every frame. The numbered HTML buttons therefore follow the selected model as it rotates and the viewport changes.

## Rendering paths

1. WebGL 1: simple vertex-colour rendering when the browser exposes a WebGL context.
2. Canvas2D fallback: the same 3D mesh is transformed and perspective-projected in JavaScript, triangle faces are depth-sorted, and the faces are drawn in 2D. This allows interactive 3D rotation and zoom on browsers where WebGL is disabled.

No remote scripts or 3D model downloads are required.

## Educational limitations

This is a stylised procedural human-form model. Individual organs, nerves, vessels, bones and muscle groups are simplified shapes designed for navigation and explanation. It is not a realistic or validated anatomical representation, not suitable for clinical or medical training, and not intended to generate medical decisions. Male/Female profiles only adjust the illustrative geometry proportions; they do not affect measurement interpretation.
