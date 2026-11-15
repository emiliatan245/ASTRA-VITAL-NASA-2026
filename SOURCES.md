# ASTRA-VITAL sources and references

Reviewed 14 November 2026. Source types are distinguished: NASA challenge context, NASA study metadata, synthetic demonstration data, and software tools.

## Official NASA challenge and guidance

1. NASA Space Apps Challenge 2026 — **Create Health Monitoring Software for Astronauts on Space Missions**: https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/
2. NASA Space Apps Navigator answer — **Datasets for Create Health Monitoring Software for Astronauts challenge**, discussion #2025, 13 November 2026: https://github.com/nasa/spaceapps/discussions/2025
   - Says astronaut-health datasets are not necessarily unified in one public real-time stream.
   - Recommends NASA OSDR, NASA Life Sciences Portal (NLSP), NASA Human Research Program (HRP), and OSDR FAQ as research starting points.
   - Says a hybrid of accessible research data and clearly labelled synthetic telemetry is reasonable for indicators unavailable in public datasets.
   - Recommends individual-baseline comparisons rather than assuming Earth reference ranges are astronaut-safe limits.
3. NASA Space Apps 2026 Judging & Awards Guide (participant-provided official page, 13 Nov 2026): https://www.spaceappschallenge.org/resources/
4. NASA Space Apps 2026 Project Submission Guide (participant-provided official page, 13 Nov 2026): https://www.spaceappschallenge.org/resources/

## NASA human-spaceflight research resources

5. NASA Open Science Data Repository (OSDR): https://osdr.nasa.gov/
6. NASA OSDR study **OSD-575, Version 3** — SpaceX Inspiration4 blood-serum metabolic panel and immune/cardiac cytokine arrays: https://osdr.nasa.gov/bio/repo/data/studies/OSD-575
   - DOI: https://doi.org/10.26030/mc5d-p710
   - Study page lists licence CC0-1.0.
   - OSDR records 28 biospecimen samples and laboratory biomarker assays. It is not a continuous in-flight heart-rate, SpO₂, sleep or ECG stream.
7. NASA OSDR Study Files API (OSD-575): https://osdr.nasa.gov/osdr/data/osd/files/575
8. NASA OSDR Public API documentation: https://api.nasa.gov/
9. NASA OSDR FAQ: https://science.nasa.gov/reference/osdr-faq/
10. NASA Life Sciences Portal: https://nlsp.nasa.gov/
11. NASA Human Research Program: https://www.nasa.gov/hrp/
12. NASA article on Inspiration4 astronaut health dataset research: https://science.nasa.gov/humans-in-space/nasas-repository-supports-research-of-commercial-astronaut-health/

## Software and model tools

13. scikit-learn RandomForestClassifier documentation: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html
14. NumPy documentation: https://numpy.org/doc/
15. Google Fonts used by the interface: DM Sans, Space Grotesk, DM Mono — https://fonts.google.com/

## Data provenance

- `synthetic_training_data.csv` and `sample_telemetry.csv` are generated for this prototype; they are not NASA data.
- `generate_model.py` produces all synthetic model data and labels with fixed seed `24062026`.
- `model.js` is the serialized Random Forest trained by that script.
- OSD-575 is documented as a NASA research reference and available candidate file source. The project does not claim the synthetic model was trained on OSDR data.
- If an OSDR CSV/TSV is imported, record the exact filename, accession/version, variable, units, population, assay/sample type, timepoint, transformations, licence and SHA-256. The browser importer does not authenticate file provenance.

## AI and media

ChatGPT's use is described in `AI_DISCLOSURE.md`, including initial concept framing and implementation. The orbital-A logo was supplied by the participant and is not NASA branding. The skeleton, internal-system and muscular anatomy illustrations were AI-generated for educational use and are visibly labelled. The external human-form mannequin is a custom vector illustration. No NASA logo or insignia is used.


## 3D rendering implementation

- The v1.6.0 anatomy viewer uses browser-native WebGL and Canvas 2D APIs to render original code-generated geometry. No third-party 3D framework, remote model, CDN library or external anatomical mesh is loaded by the viewer.
- The software renderer is a projected 3D triangle mesh with depth sorting; it is a compatibility fallback for browsers where WebGL is unavailable.


## Actual 3D anatomy model (v1.7.0)

16. Open Anatomy 3D — interactive 3D human anatomy package and model catalogue: https://github.com/MervinR07/open-anatomy-3d
17. Open Anatomy 3D model licence — male/female GLB models and catalogue, CC BY 4.0: https://github.com/MervinR07/open-anatomy-3d/blob/main/LICENSE-MODELS.md
18. Open Anatomy 3D attribution — BodyParts3D / DBCLS, HuBMAP Human Reference Atlas female organs and MakeHuman sources: https://github.com/MervinR07/open-anatomy-3d/blob/main/ATTRIBUTION.md
19. Open Anatomy 3D model files served via jsDelivr: https://cdn.jsdelivr.net/npm/open-anatomy-3d@0.1.0/models/anatomy-male.glb and https://cdn.jsdelivr.net/npm/open-anatomy-3d@0.1.0/models/anatomy-female.glb
20. Three.js — MIT licence: https://threejs.org/
21. Three.js GLTFLoader, OrbitControls and MeshoptDecoder examples: https://github.com/mrdoob/three.js/tree/dev/examples/jsm

### v1.7.0 model provenance

The detailed 3D anatomy is not AI-generated art and is not a Kurzgesagt asset. It uses the openly licensed Open Anatomy 3D male/female GLB models and displays their required attribution in `ANATOMY_ASSET_GUIDE.md`. The bundled procedural 3D model remains only as an offline compatibility fallback.
