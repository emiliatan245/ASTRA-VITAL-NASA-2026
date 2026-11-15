# ASTRA-VITAL v1.7.0 — Open Anatomy 3D integration

The Anatomy Explorer now loads an anatomically detailed male or female GLB model from the open-anatomy-3d project. The old procedural model remains an offline fallback only.

The detailed model requires an internet connection the first time it is selected. The male/female GLB is downloaded from jsDelivr. No user measurements or health records are sent to the model host; only the public anatomy model asset is requested.

For the most reliable setup on Windows, double-click `START_ASTRA_VITAL.bat`. It starts a small local web server and opens the app at `http://127.0.0.1:8765/`. This avoids browser restrictions that may apply to ES modules opened directly from `file://`.

If Python is not installed, open `index.html` in Chrome/Edge. If the browser blocks remote modules, the simplified procedural 3D fallback will remain available.

See `ANATOMY_ASSET_GUIDE.md` for licence and attribution. The Open Anatomy 3D model is CC BY 4.0. The app is an educational prototype, not a medical device or diagnostic tool.
