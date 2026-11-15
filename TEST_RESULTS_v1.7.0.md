# ASTRA-VITAL v1.7.0 test record

## Static checks performed

- `real-anatomy-loader.js` syntax checked with Node.js.
- Existing procedural renderer remains present as an offline fallback.
- Import-map targets, model URLs, and the published `open-anatomy-3d@0.1.0` package paths were checked against the upstream README.
- Male/female profile buttons, six anatomy modes, 3D viewer canvas and overlay pointer layer remain present.
- HTML structure and local CSS/JS references checked.
- CC BY 4.0 credit and source attribution added to project documentation.

## Important unverified runtime check

This build environment did not have outbound DNS/network access, so it could not fetch the external Three.js modules or the male/female GLB files. The remote anatomical mesh itself therefore could not be rendered or browser-tested here. When the app is opened on a connected laptop, it should load the selected GLB from jsDelivr; otherwise it will display the bundled procedural fallback. The user must verify the first online model load in Chrome/Edge.

## What remains to test on the participant's laptop

1. Open `index.html` with internet access.
2. Choose Male body; confirm the detailed GLB model loads.
3. Switch Normal, Skeleton, Muscular, Circulation, Nervous and All systems; confirm each layer changes.
4. Choose Female body; confirm the female GLB model loads, including its distinct anatomy.
5. Drag to rotate, scroll to zoom, toggle Auto-rotate and Microgravity, and reset.
6. Click a numbered pointer and a visible 3D structure; confirm the information panel responds.
7. Turn off internet and reload; confirm the simplified procedural fallback is clearly labelled.

No medical accuracy, diagnosis, treatment or astronaut safety capability is claimed.
