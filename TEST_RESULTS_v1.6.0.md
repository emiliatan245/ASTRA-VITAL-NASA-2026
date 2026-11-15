# ASTRA-VITAL v1.6.0 validation report

## Static validation
- `node --check astra-3d-anatomy.js`: passed.
- `node --check body-view-ui.js`: passed.
- `node --check mission-features.js`: passed.
- All other application JavaScript files: syntax checked.
- HTML duplicate-ID scan: no duplicate IDs.
- Local stylesheet / script paths: all present.
- All six anatomy controls: present.
- Male/Female profile controls: present.
- Six body-region pointers: present and generated from 3D anchor points.
- Complete project ZIP: integrity checked.
- Update patch ZIP: integrity checked.

## Browser interaction validation
A Playwright Chromium test harness loaded the complete application markup, styles and scripts in an isolated browser page.

Passed:
- Female reference selection.
- Normal body scene creation and canvas sizing (680 × 720 CSS pixels in test viewport).
- Six body-system marker positions generated as visible screen coordinates.
- Heart/cardiovascular pointer click updated the information panel title to “Heart & cardiovascular system”.
- Skeleton view selection rebuilt the 3D scene.
- Drag gesture changed both camera rotation values.
- Wheel gesture changed camera distance from 8.2 to 8.55 (zoom).
- No JavaScript page errors.
- Auto-rotation advanced the model angle during the test.

The automation environment did not expose WebGL, so the built-in Canvas2D software 3D fallback was exercised successfully. The WebGL path is present but was not exercised in this environment. The Canvas2D renderer uses the same 3D vertex mesh, perspective projection and interactive camera; it is not a static illustration.

The isolated test page blocks localStorage access by browser policy, so the existing app's expected “use demo data” / welcome preference warnings appeared in the test harness. This does not indicate a failure of the model renderer. The user's local Chrome test is still required to confirm GPU path selection and device-specific performance.

## Limitations
- This is a stylised procedural geometric anatomy model, not a photorealistic or medically validated mesh.
- No diagnosis, treatment recommendation or astronaut safety decision is produced.
- Real-user performance on the participant's laptop remains to be confirmed.
