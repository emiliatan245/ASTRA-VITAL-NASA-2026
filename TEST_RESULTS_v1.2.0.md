# ASTRA-VITAL v1.2.0 — Test results

## Automated checks completed

- JavaScript syntax checks passed for `app.js`, `mission-features.js`, `body-view-ui.js`, `evidence-lab.js`, and `model.js`.
- Embedded Chromium preview harness loaded the app scripts without browser console errors or uncaught page errors.
- First-launch welcome screen rendered in the test harness.
- Body-view switcher rendered all four modes: normal, skeleton, circulation, and muscular.
- Each anatomy mode rendered six interactive system pointers.
- Clicking the cardiovascular pointer updated the side information panel.
- Research library test found five source cards; all five are full-card anchor links. The featured OSD-575 card is also a full-card anchor.
- Slide deck contains exactly seven slides and was rendered to PDF for visual inspection.
- The updated slide 4 anatomy view was visually inspected after layout adjustment.

## Not yet verified on participant's laptop

- The user must install v1.2.0 and test in their own Chrome/Edge browser.
- The complete navigation and all assessment interactions still require a user-side smoke test.
- A real NASA OSDR dataset has not yet been imported or analysed in this release. OSD-575 remains a documented research reference; the built-in model and sample telemetry are synthetic.
- Public hosting and public-link access have not yet been completed.

## Important limitations

- Anatomy artwork is static image/vector artwork with interactive overlays; it is not a rotatable 3D model.
- The skeleton, internal/circulatory, and muscle images are AI-generated educational illustrations. The normal external figure is a vector mannequin. None is a medical scan or validated anatomical reference.
- The machine-learning model is trained only on generated synthetic scenarios and labels. Its holdout score measures agreement with synthetic labels, not medical accuracy.
- ASTRA-VITAL is an educational prototype, not a medical device or flight-certified system.
