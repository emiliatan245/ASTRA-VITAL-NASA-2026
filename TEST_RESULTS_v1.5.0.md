# ASTRA-VITAL v1.5.0 validation

## Static checks

- `node --check body-view-ui.js`: passed.
- `node --check app.js`: passed.
- `node --check mission-features.js`: passed.
- `node --check evidence-lab.js`: passed.
- HTML parse and unique-ID check: passed; no duplicate IDs.
- Six view buttons present: normal, skeleton, muscular, circulation, nervous, all.
- Two body reference buttons present: male and female.
- Motion controls present: Auto-rotate, Microgravity, Reset view.
- All local anatomy image assets exist, including the All Systems atlas.
- CSS file references exist.

## Interaction logic reviewed

- The image wrapper is sized from the loaded image's natural dimensions and current stage dimensions.
- Pointer positions are percentages inside the same wrapper as the image, so both move together.
- All Systems uses a landscape 3-view atlas and distinct pointer positions for its skeleton, internal/circulation, and muscular figures.
- Auto-rotate and Microgravity are optional CSS motion modes. Reset view returns to Normal body and removes both motion classes.
- The selected profile changes Normal and Nervous illustrations only. General system plates and All Systems are explicitly treated as non-personalised references.

## Not claimed

A full browser interaction run was blocked in this environment, so the new screen still requires confirmation in the participant's Chrome browser. The visual motion is not a true 3D mesh or physical microgravity simulation. The anatomy artwork is educational and non-diagnostic.
