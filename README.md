# ASTRA-VITAL v1.7.1 — Named Anatomy Pointers

ASTRA-VITAL is an educational astronaut health-assessment prototype. The v1.7.1 Anatomy Explorer now displays structure-anchored named pointer labels (without numbered badges) over anatomically detailed, named 3D human-body meshes rather than relying on a stylised procedural mannequin.

## Real human anatomy model

The viewer uses the `open-anatomy-3d` male and female GLB models. The upstream package documents two models (about 7.6 MB and 8.1 MB), 147 named structures across the catalogue, and separate skin, skeleton, muscle, organ, vessel and nerve layers. The male model has 140 structures and the female model has 145. The viewer downloads only the selected model on first use from jsDelivr. An internet connection is required for the detailed atlas.

- **Male / Female:** loads a distinct anatomical reference model.
- **Normal body:** skin layer.
- **Skeleton:** skeletal layer.
- **Muscular system:** muscle layer.
- **Circulation:** organs and vessels.
- **Nervous system:** nerves plus the brain structures.
- **All systems:** skeleton, muscles, organs, vessels and nerves together (skin hidden so internal anatomy remains visible).
- **Drag:** orbit around the model.
- **Scroll:** zoom.
- **Auto-rotate:** gentle idle rotation.
- **Microgravity:** subtle vertical visual motion only; not a physical simulation.
- **Click a structure or numbered pointer:** open the related body-system information panel.

The viewer uses Three.js, GLTFLoader, OrbitControls and MeshoptDecoder from jsDelivr. The actual GLB assets are fetched directly from the published `open-anatomy-3d@0.1.0` package. This app does not upload crew-entered data; the CDN request downloads model assets only.

## Offline fallback

If the CDN, WebGL or model download is unavailable, ASTRA-VITAL restores its bundled procedural 3D geometry viewer. The page clearly labels that as a simplified fallback. The fallback is still interactive but is not the anatomically detailed mesh.

## Model attribution and licence

The 3D models are licensed under **Creative Commons Attribution 4.0 International (CC BY 4.0)**. The required credit line is: **“Anatomy: BodyParts3D © The Database Center for Life Science (CC BY 4.0); female organs: Human Reference Atlas 3D Reference Organs, HuBMAP (CC BY 4.0); female body: MakeHuman (CC0). Modified by open-anatomy-3d, CC BY 4.0.”** The full attribution and source details are in `ANATOMY_ASSET_GUIDE.md` and `SOURCES.md`.

The 3D anatomy models are for education and visualisation. They are not medical devices and must not be used for diagnosis or clinical decisions. Do not treat the body markers as validated examination sites or sensor placements.

## Run locally

1. Extract the complete project ZIP with its folder structure intact.
2. Keep an internet connection enabled for the first load of the selected anatomy model.
3. Double-click `index.html` in a current desktop browser (Chrome or Edge recommended).
4. Open **Anatomy explorer**.
5. Choose Male or Female and select an anatomical layer.
6. Drag to rotate, scroll to zoom, and click a structure or named anatomical pointer.

If the browser blocks remote module imports from a local `file://` page, the app keeps the built-in procedural 3D fallback. For a reliable hosted deployment, serve the folder over HTTPS.

## Key files

- `index.html` — application structure, import map, and anatomy controls.
- `real-anatomy-loader.js` — downloads and renders the actual Open Anatomy 3D GLB models.
- `real-anatomy-atlas.css` — real model canvas and loading status styling.
- `astra-3d-anatomy.js` — bundled procedural 3D fallback.
- `body-view-ui.js` — profile, anatomy layer, pointer and welcome-screen controls.
- `mission-features.js` — body-system information and mission routine.
- `model.js` — synthetic-scenario Random Forest runtime.
- `synthetic_training_data.csv`, `sample_telemetry.csv` — synthetic demonstration data.
- `AI_DISCLOSURE.md` — AI assistance and synthetic-data disclosure.
- `ANATOMY_ASSET_GUIDE.md` — model source, attribution and licence.
- `TEST_RESULTS_v1.7.1.md` — named-pointer browser-harness validation record.

## Health and model limitations

ASTRA-VITAL is an educational prototype. The machine-learning classifier runs on synthetic scenarios and does not predict medical conditions or astronaut health risk. The anatomy viewer is not clinically validated, and the visual reference selection does not change health interpretation. For real crew concerns, use the mission's approved medical communication and flight-surgeon procedures.
