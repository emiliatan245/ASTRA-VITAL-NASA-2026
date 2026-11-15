# ASTRA-VITAL v1.3.0 — Blue Flight Deck & Anatomy Preferences

ASTRA-VITAL is an educational, local-first astronaut health-assessment prototype for the 2026 NASA Space Apps Challenge. It is not a medical device, is not clinically validated, and is not affiliated with or endorsed by NASA.

## What's new in v1.3.0

- Reworked the welcome experience in a deep navy / electric-blue visual system with translucent glass panels.
- Added a mission-briefing section below the hero so the opening screen contains the challenge, approach, workflow, and scientific boundaries.
- Added original CSS/SVG rocket and astronaut illustrations with restrained motion; `prefers-reduced-motion` is respected.
- Added a body-reference choice before opening anatomy layers: Male reference, Female reference, or Neutral reference.
- Added five anatomy layers: Normal body, Nervous system, Organs & circulation, Skeleton, and Muscle system.
- Normal and nervous-system illustrations respond to the selected reference. Skeleton, muscle, and organ/circulation illustrations are general educational reference plates shared across profiles; they do not imply sex-specific thresholds or diagnoses.
- Existing assessment model, local logs, research cards, data lab, and full-card resource links are retained.

## Run locally

1. Extract the complete project folder.
2. Keep `index.html`, all JavaScript/CSS files, and the `assets` folder together.
3. Double-click `index.html` to open in a modern browser.
4. Use the welcome screen's **Enter Flight Deck** button, or choose **Explore Body Systems**.
5. In Anatomy Explorer, choose a reference body first, then choose an anatomy layer. Select a numbered pointer to open the information panel.

No account or server is required for the basic local prototype. Some external links and font loading require an internet connection.

## Anatomy interaction order

1. Select Male, Female, or Neutral reference.
2. Select Normal body, Nervous system, Organs & circulation, Skeleton, or Muscle system.
3. Select one of six numbered pointers or a quick system chip.
4. Review Overview, Spaceflight, or My concern.
5. A practice concern can be handed to the synthetic assessment context; it does not change sensor values.

The reference selection is a visual preference only. It does not change model parameters, data, review rules, or medical interpretation.

## Data and model boundaries

- Sample crew telemetry and model training labels are synthetic demonstration data.
- The Random Forest reproduces synthetic scenario labels; its holdout score is not clinical accuracy.
- The NASA research links and the local CSV/TSV workbench do not authenticate a file's source. Preserve source identifiers, data dictionaries, units, sample populations, and timepoints when importing research files.
- Do not input real medical information. For actual crew health concerns, follow approved mission medical procedures and qualified flight-medical support.

## AI and artwork disclosure

See `AI_DISCLOSURE.md`. AI-assisted artwork and code must be identified accurately in the final submission. The participant-provided orbital-A logo remains project branding and is not NASA branding.
