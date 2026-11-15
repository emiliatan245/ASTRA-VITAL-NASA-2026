# Changelog

## v1.1.0 — 3D-style anatomy explorer and crew-led interface
- Reworked the Body Systems page into a three-view anatomy explorer using the existing AI-generated atlas: skeletal, internal-organ/vascular, and muscular views.
- Added six numbered, labelled SVG pointers over the 3D-style illustration, with hover, keyboard focus and selected states.
- Added a cleaner right-side system panel with Overview, Spaceflight and My concern modes.
- Added region-specific practice concern choices; a selected topic can be carried into the synthetic assessment context without changing any sensor values.
- Added clearer guidance that wellbeing is a whole-crew domain rather than a single anatomical organ.
- Improved responsive layout, visual hierarchy, marker contrast, keyboard accessibility and reduced-motion behaviour.
- Updated the sidebar label to “Anatomy explorer”.

## v1.0.1 — Anatomical body-system explorer redesign
- Replaced the simple letter-marker silhouette with an original three-view educational anatomy illustration showing skeletal, internal-organ/vascular, and muscular systems.
- Added clickable region hotspots and a keyboard-accessible system selector legend.
- Added visible AI-generated illustration watermark and clarified that marker positions are navigation aids, not examination points or sensor-placement instructions.

## v1.0.0 — Challenge-aligned assessment redesign
- Reframed the project around the challenge workflow: measure, validate signal, add mission context, review synthetic pattern, and use authorised crew-medical pathways.
- Added Crew Assessment inputs for HR, SpO₂, respiratory rate, temperature, sleep, fatigue, mood and three self-reported symptom flags.
- Added measurement-quality gate that blocks synthetic classification for poor-quality inputs.
- Added local browser inference with a 51-tree Random Forest trained on 18,000 explicitly synthetic sensor-scenario examples.
- Added model card, training metrics, feature importance and synthetic-data limitations.
- Added interactive body-system map with educational monitoring context and limitations.
- Added environment selector for orbital/LEO, transit spacecraft, lunar base and Mars habitat; environment is contextual only and does not alter model inference.
- Added optional mission-routine checklist and XP for workflow completion only.
- Added local synthetic assessment history and CSV export.
- Preserved original daily check-in, trend charts, research library, and local NASA OSDR file workbench.
- Updated AI-use disclosure, documentation and competition checklist.

## v0.3.0 — Evidence Lab
- Added local CSV/TSV importer, descriptive statistics, SHA-256 fingerprinting and reproducibility exports.

## v0.2.0 — Local persistence and research references
- Added local check-in persistence, trend views and NASA OSDR references.

## v0.1.0 — Initial crew health dashboard
- Added synthetic dashboard data, daily check-ins and basic trends.


## v1.2.0 — Purple mission interface and view selection

- Reworked the visual theme to black / violet with colour-coded system navigation.
- Added a first-launch intro screen with a mission-oriented opening and direct navigation choices.
- Applied the participant-provided orbital A emblem to the project brand and intro.
- Added four anatomy display modes: normal human form, skeleton, circulation/internal systems and muscles.
- Added view-specific clickable pointers, keyboard activation, and a shared system information panel.
- Made the featured study and each NASA research resource card clickable across the full card surface.
- Retained local-first storage and existing synthetic-data disclosures.

## v1.2.1 — Welcome screen launch visibility fix
- Fixed the welcome overlay clipping its launch actions on shorter laptop viewports.
- Added a persistent top-right Enter Flight Deck action.
- Made the welcome overlay vertically scrollable when required.
- Guarded the remembered-device localStorage read so blocked storage cannot prevent launch handlers from registering.

## v1.3.0 — Blue flight deck and body-reference preferences

- Replaced the purple emphasis with a deep navy / electric-blue palette and frosted-glass panels.
- Rebuilt the welcome screen as a scrollable mission briefing with challenge, solution, workflow and scientific-boundary cards.
- Added decorative rocket and astronaut SVG illustrations with subtle motion and reduced-motion support.
- Added Male / Female / Neutral visual reference buttons before anatomy-layer selection.
- Added nervous-system artwork and a five-layer anatomy selector: normal, nervous, organs/circulation, skeleton, muscles.
- Added a profile-selection handoff that changes visual reference only; it does not modify measurements or model behaviour.


## v1.4.0 — Anatomical reference and mission-launch refresh
- Replaced the simplified normal-body silhouette with separate male and female full-body 3D-style reference illustrations.
- Reduced the profile selection to Male body and Female body, chosen before anatomy layers appear.
- Retained five anatomy layers: Normal body, Nervous system, Organs & circulation, Skeleton, and Muscular system.
- Reused detailed skeleton, internal/circulation and muscular educational plates; kept profile-specific nervous-system SVG references.
- Added a reference-selection gate so no placeholder silhouette appears before the user chooses a body reference.
- Unified the interface with a black / electric-blue translucent glass theme.
- Added scroll-linked parallax to the welcome visual and a rocket takeoff transition into the flight deck.
- Added reveal motion for mission-briefing cards and preserved reduced-motion support.
- Kept the full-resource-card anchor behavior for NASA study and source cards.
- Updated AI-art disclosure and installation notes.


## v1.6.0 — Procedural interactive 3D anatomy
- Replaced the static anatomy image viewer with a procedural 3D mesh generated from geometry at runtime.
- Added mouse/touch drag rotation, scroll zoom, slow auto-rotation, Microgravity-style floating motion, and Reset view.
- Reprojected all six body-system pointers from 3D anchor coordinates every animation frame so they remain attached while the model rotates and resizes.
- Added a WebGL renderer where supported and a native Canvas2D software 3D fallback for compatibility.
- Updated UI language and documentation to distinguish a true interactive procedural 3D model from static images and to clarify its educational-only limitations.
