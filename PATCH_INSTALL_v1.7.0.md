# ASTRA-VITAL v1.7.0 update

For an existing v1.6.0 installation:

1. Back up the complete ASTRA_VITAL folder and export any demo CSV records you want to keep.
2. Extract the patch ZIP.
3. Copy `index.html`, `real-anatomy-loader.js`, `real-anatomy-atlas.css`, `README.md`, `SOURCES.md`, `AI_DISCLOSURE.md`, `ANATOMY_ASSET_GUIDE.md`, and `VERSION.txt` into the existing project folder.
4. Replace files when Windows asks.
5. Keep the existing `assets` directory and all existing JavaScript files.
6. Open `index.html` in Chrome or Edge with an internet connection.
7. Open Anatomy Explorer, select Male or Female, and choose a layer. The selected GLB model is fetched from jsDelivr on first use.

If the remote modules or model files cannot load, the app uses the previous procedural 3D fallback. Your local demo history is stored in browser localStorage and is not intentionally cleared by this patch.
