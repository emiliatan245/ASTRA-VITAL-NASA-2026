# ASTRA-VITAL v1.7.0 — Anatomy asset guide

## Primary anatomy asset

ASTRA-VITAL v1.7.0 uses the open `open-anatomy-3d` package by MervinR07 for the anatomically detailed 3D male and female references. The package supplies named glTF structures for skin, skeleton, muscles, organs, vessels and nerves, plus joint hotspots.

- Project: https://github.com/MervinR07/open-anatomy-3d
- Package models: `https://cdn.jsdelivr.net/npm/open-anatomy-3d@0.1.0/models/anatomy-male.glb` and `https://cdn.jsdelivr.net/npm/open-anatomy-3d@0.1.0/models/anatomy-female.glb`
- Model licence: Creative Commons Attribution 4.0 International (CC BY 4.0).
- Model licence page: https://github.com/MervinR07/open-anatomy-3d/blob/main/LICENSE-MODELS.md
- Full attribution: https://github.com/MervinR07/open-anatomy-3d/blob/main/ATTRIBUTION.md

Required credit line (reproduced from the upstream attribution file):

> Anatomy: BodyParts3D © The Database Center for Life Science (CC BY 4.0); female organs: Human Reference Atlas 3D Reference Organs, HuBMAP (CC BY 4.0); female body: MakeHuman (CC0). Modified by open-anatomy-3d, CC BY 4.0.

### Upstream model contents

The upstream documentation describes the male model as containing 140 named structures and the female model as containing 145. The package catalogue documents skin, skeleton, muscles, organs, vessels and nerves, and references 147 structures across the catalogue. The model files are approximately 7.6 MB and 8.1 MB.

### Source provenance and changes

The upstream project documents these sources:

- BodyParts3D 4.0, © The Database Center for Life Science (DBCLS), CC BY 4.0, used in both models.
- Human Reference Atlas 3D Reference Organ Set, united female v1.10, HuBMAP / Indiana University, CC BY 4.0, used for female-specific organs.
- MakeHuman base mesh and female skin reference, CC0 1.0.

The models are adapted works. See the upstream attribution file for details of fitting, mesh simplification, coordinate conversion and compression.

### Runtime delivery

The models are fetched from jsDelivr at first use. Only the selected sex model is loaded. No crew-entered measurements or health data are sent to the model CDN. If network loading fails, ASTRA-VITAL falls back to its bundled procedural 3D educational model.

### Usage boundary

The model is for education and visualisation, not for diagnosis or clinical decision-making. It is not a medical device. The visual pointer anchors are interaction aids, not clinically validated exam or sensor-placement locations.
