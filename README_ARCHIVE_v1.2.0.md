# ASTRA-VITAL v1.2.0
## Crew-led astronaut health assessment and mission-support prototype

**Challenge:** Create Health Monitoring Software for Astronauts on Space Missions  
**Event:** NASA Space Apps Challenge 2026 · Kharagpur Local Event  
**Team:** ASTRA-VITAL · independent participant project

ASTRA-VITAL is a local-first educational prototype that combines simulated sensor inputs, self-reported crew observations, a clickable body-system learning map, mission-routine checklists, trend visualisation, and a small explainable-in-scope machine-learning demonstration. It is designed around a simple workflow:

**Measure → check signal quality → add mission context → review a synthetic pattern → use the authorised crew-medical pathway.**

> **Critical safety boundary:** ASTRA-VITAL is not a medical device, clinical decision-support product, flight-certified tool, or NASA product. It does not diagnose, determine medical fitness, prescribe treatment, select medication, calculate operational radiation risk, or decide emergency urgency. Never enter real personal or medical information. For real measurements or symptoms, crew members must use their mission-approved medical procedures and qualified flight-medical support. The included classifier is trained exclusively on artificial scenario labels and must never be used for real people.

## Run on Windows

1. Download and extract the full `ASTRA_VITAL_v1.2.0` folder.
2. Keep all files in the same folder. In particular, do not separate `index.html`, `styles.css`, `app.js`, `mission-features.js`, `model.js`, and `evidence-lab.js`.
3. Double-click `index.html` and open it in Chrome or Edge.
4. No backend, account, API key, Python installation, or package installation is required to use the browser app.
5. Internet access is needed only for external NASA references and Google Fonts. Core app features and the synthetic model run locally.

## What is included

### 1. Mission console
- Crew snapshot and trend charts for the existing synthetic check-in history.
- Local record completeness and an attention/review queue based on explicitly labelled prototype rules.
- Mission context and direct navigation to assessment.

### 2. Crew assessment
- Simulated inputs: heart rate, oxygen saturation, respiratory rate, temperature, sleep duration, fatigue, mood, dizziness, breathlessness, and nausea.
- Mission context selector: orbital station/LEO, transit spacecraft, lunar surface base, and Mars surface habitat.
- Signal-quality gate. A simulated poor-quality signal blocks model classification; uncertain quality remains visible in the output.
- Local Random Forest scenario classification with class probabilities.
- Suggested actions are workflow-only: verify measurement quality, record context, follow mission-approved procedures, and contact qualified flight-medical staff when an operational concern exists.
- Saved synthetic assessment scenarios remain in local browser storage and can be exported as CSV.

### 3. Interactive body-system explorer
- Four selectable anatomical views: a neutral external human-form mannequin, skeleton, internal organs/vasculature, and muscular system.
- Six numbered, colour-coded, clickable pointers update the system information panel. The same system selector is available through keyboard-accessible controls.
- First-launch mission introduction, participant-supplied orbital-A project mark, purple-black interface, and full-card clickable research links.
- Each system panel offers Overview, Spaceflight, and My concern; a practice topic can be carried into the synthetic assessment context without changing sensor values.
- Each selection explains example signals, mission-research context, safe workflow cues, and what the prototype cannot infer.
- The skeleton, internal/circulatory, and muscular views use AI-generated educational illustrations, labelled in the app. The normal-human view is a custom vector mannequin. All are static images with interactive overlays, not a rotatable 3D mesh, clinical scan, validated anatomical reference, examination guide, or sensor-placement map.

### 4. Mission routine and engagement
- Optional workflow checklist for device readiness, assigned measurement logging, sleep log, wellbeing check-in, assigned countermeasure completion, and data-context review.
- XP rewards completion of logging tasks only. XP, streaks, and routine completion are not health scores and never penalise missed tasks.
- Routine data are stored locally in the browser.

### 5. Daily log and trends
- Existing local check-in history, personal demo reference comparisons, CSV export, and trend charts.
- Records are stored in browser `localStorage`; clearing browser data can delete them. Export a backup when needed.

### 6. NASA Data Lab
- Study-context notes for NASA OSDR OSD-575.
- Participant-selected CSV/TSV importer that runs locally in the browser.
- Header-row selection, numeric-column selection, optional grouping, descriptive statistics, missing-value completeness, row preview, and grouped summary.
- SHA-256 file fingerprint to identify the selected file. A hash is not proof of NASA origin.
- Reproducibility report and grouped-summary CSV downloads.
- No data file is sent to an ASTRA-VITAL server.

### 7. AI model card
- Algorithm: scikit-learn RandomForestClassifier, 51 trees, max depth 7.
- Synthetic dataset: 18,000 generated rows, 13,500 training and 4,500 held-out test rows.
- Ten input features and three synthetic pattern labels.
- The forest is serialised to `model.js` for dependency-free browser inference.
- Model metrics and feature importance are displayed with prominent limitations.

## Synthetic AI model: exact meaning and limitations

The model is a real machine-learning classifier trained offline by `generate_model.py`. However, **both its input records and target labels are synthetic**. The labels are assigned by a scenario-generation script, and the classifier learns to reproduce those artificial labels.

- Holdout accuracy: **89.73%**.
- Holdout macro-F1: **0.8974**.
- Holdout set: 4,500 generated examples.
- Random seed: `24062026`.

These values measure agreement with the synthetic scenario generator only. They are **not** medical accuracy, sensitivity, specificity, calibration, clinical validation, astronaut performance, or evidence that the model is safe. A high score is expected when a machine-learning model learns patterns from data generated by a controlled script. Do not report it as a real-world health prediction score.

The three outputs are:

1. `routine_pattern` — routine-like synthetic scenario.
2. `review_pattern` — mixed synthetic scenario.
3. `priority_review_pattern` — stronger synthetic multi-signal scenario.

They are not disease categories, medical risk levels, diagnosis, or emergency triage. The displayed class probability is a probability over the generator's artificial labels—not a probability of illness or harm.

## Synthetic sensor dataset

`synthetic_training_data.csv` contains all 18,000 generated training and test examples, with a `data_origin` column set to `SYNTHETIC_GENERATED`. It is included for reproducibility and model inspection. It is not a NASA dataset or real astronaut telemetry.

Features and units:

| Feature | Unit / encoding |
|---|---|
| `heart_rate_bpm` | beats per minute |
| `spo2_pct` | percent |
| `resp_rate_min` | breaths per minute |
| `temperature_c` | degrees Celsius |
| `sleep_hours` | hours |
| `fatigue_1_5` | self-report scale, 1–5 |
| `mood_1_5` | self-report scale, 1–5 |
| `dizziness_0_1` | synthetic binary flag |
| `breathlessness_0_1` | synthetic binary flag |
| `nausea_0_1` | synthetic binary flag |

The value ranges are generated for software testing. They are not astronaut reference ranges, medical thresholds, or operational safety limits. Do not infer recommended treatment or safe/unsafe status from the model.

## NASA research: OSD-575

NASA OSDR study OSD-575 (Version 3, DOI `10.26030/mc5d-p710`) concerns SpaceX Inspiration4 blood-serum metabolic panel and immune/cardiac cytokine-array assays. It documents pre-flight and post-flight sample collection and laboratory assays. It is a useful example of actual human-spaceflight biospecimen research, but it is not continuous in-flight wearable heart-rate, oxygen-saturation, sleep, or ECG telemetry.

The app's importer can analyse a downloaded NASA CSV/TSV if the participant selects one. **The package does not claim that an OSD-575 raw file has already been imported or that the model was trained on NASA data.** If using an actual OSDR file, record and check the study accession/version, exact filename, variable name, unit, assay, sample type, timepoint, transformation, licence, and SHA-256 fingerprint. Descriptive statistics alone do not prove causality or clinical significance.

The NASA Space Apps Navigator's response to the 2026 challenge specifically notes that public astronaut-health data are not necessarily unified in a single dataset and recommends a hybrid of real research data and clearly labelled synthetic telemetry for unavailable indicators. The same response cautions against applying Earth-based clinical ranges directly as astronaut-safe limits.

## Measurement guidance

The UI provides simple context, not procedural medical instructions:
- Heart rate: an approved wearable or mission-issued pulse measurement.
- Oxygen saturation: an approved pulse-oximetry device if included in the mission protocol.
- Respiratory rate and temperature: use only the method and equipment approved by the crew medical team.
- Sleep, fatigue, and mood: crew self-report or validated mission-approved device summaries.
- Bone, muscle, immune, metabolic, and radiation research indicators: use qualified research/lab instruments and mission-approved monitoring; the app does not estimate these from a body-map click.

The app never instructs a crew member to self-treat. Any treatment or prevention plan must be authorised through the mission medical system.

## Privacy and security boundaries

- Check-ins, routine completion, and saved synthetic assessments remain in local browser storage.
- Imported files are parsed locally and are not uploaded by the application.
- Browser storage is not a secure medical-record system.
- Do not enter actual medical, identifying, or sensitive crew information.
- No live wearable sensor, spacecraft telemetry, NASA API feed, or clinical system is connected in this version.

## Files

- `index.html` — application sections and workflow.
- `styles.css` — responsive visual system and body-map styling.
- `app.js` — original local check-ins, charts, navigation, and exports.
- `mission-features.js` — synthetic model inference, body map, routine checklist, local assessment log.
- `model.js` — serialised Random Forest model for browser inference.
- `generate_model.py` — reproducible synthetic data generator and Random Forest training script.
- `synthetic_training_data.csv` — 18,000 generated records, explicitly labelled synthetic.
- `model_metrics.json`, `model_training_report.md` — model evaluation and limitations.
- `evidence-lab.js` — local OSDR CSV/TSV analysis tool.
- `sample_telemetry.csv` — small synthetic sample for testing the legacy daily-log UI.
- `assets/astra-orbit-mark.png` — participant-supplied orbital-A project emblem, processed for transparent display. It is not NASA branding.
- `assets/body-normal.svg`, `body-skeleton.webp`, `body-circulation.webp`, `body-muscular.webp` — four selectable anatomy views; the latter three are AI-generated educational illustrations.
- `AI_DISCLOSURE.md`, `SOURCES.md`, `SUBMISSION_CHECKLIST.md`, `CHANGELOG.md` — documentation.

## Known work still required before submission

1. Confirm the Kharagpur Local Lead's interpretation of the NASA SI/AI rule because ChatGPT helped with initial concept framing as well as implementation. Disclose this honestly; do not state AI was code-only.
2. Confirm the exact Local Event Resources list and retain screenshots or links to it.
3. If possible, download one NASA OSDR/NLSP source file and import it into the Evidence Lab; record its metadata. Do not call the synthetic classifier NASA-trained.
4. Test the new assessment, body map, routine checklist, model card, and local assessment-log export in the participant's own Chrome/Edge browser.
5. Capture genuine screenshots of the final build and update the seven-slide deck so all claims match the actual application.
6. Publish the application and demonstration on a public, no-login host; test the links in a private browser window.
7. Complete all submission fields and click **Submit for Judging** before the Kharagpur Local Event deadline.

## Affiliation

ASTRA-VITAL is an independent participant project. It is not affiliated with, sponsored by, or endorsed by NASA. The orbital-A project emblem was supplied by the participant and does not use NASA marks.

## v1.2.0 — Anatomy explorer interaction

The Body Systems page now presents four selectable anatomy views: normal external human form, skeleton, internal organs/vasculature, and muscular system. Each view uses six numbered, labelled clickable pointers. Selecting a pointer opens a system information panel with three modes: **Overview**, **Spaceflight**, and **My concern**. The concern mode offers region-specific practice topics and can carry the selected topic into the synthetic assessment context field. It does not alter measurement values, create a diagnosis, or record real medical information.

The anatomy is a static AI-generated 3D-style illustration with interactive SVG overlays; it is not a rotatable 3D mesh, medical scan, anatomical reference standard, or examination guide.


### Latest visual preview

See `ASTRA_VITAL_v1_2_Anatomy_Normal.png` and `ASTRA_VITAL_v1_2_Anatomy_Circulation.png` for anatomy explorer previews. The actual browser screen includes clickable SVG overlays on the selected illustration.


## v1.2.0 interface update

- Purple-black mission-console theme with color-coded body-system indicators.
- First-launch mission-introduction screen with Enter Flight Deck and direct Anatomy Explorer launch.
- Participant-supplied orbital-A emblem used for project branding.
- Four switchable anatomy views: normal human form, skeleton, internal/circulatory systems and muscular system.
- Contextual clickable pointers are generated for each anatomy view and open the existing system information panel.
- Research resource cards and the featured OSD-575 study are fully clickable, keyboard-accessible links.
- Existing observations, synthetic model, NASA evidence workbench and browser-local storage keys are retained.
- Anatomy imagery is illustrative and not a diagnostic scan; the external human form is a stylized vector mannequin. These are image-based views, not a rotatable 3D mesh.
