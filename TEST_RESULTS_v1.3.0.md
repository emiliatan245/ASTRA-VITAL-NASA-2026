# ASTRA-VITAL v1.3.0 — Validation record

## Static checks completed

- JavaScript syntax checks with `node --check` for all application JavaScript files.
- HTML parsed successfully; no duplicate element IDs found.
- Blue theme stylesheet is linked after the previous theme so its overrides take precedence.
- Four welcome briefing cards are present.
- Three body reference choices are present: Male, Female, Neutral.
- Five anatomy mode buttons are present: Normal, Nervous, Organs/Circulation, Skeleton, Muscle.
- Six system pointer chips remain present.
- Six full-card resource anchors remain present.
- Required local image and CSS assets exist.
- New normal-body and nervous-system SVG files are present for the selectable references.

## Browser testing limitation

Automated Chromium browser testing was attempted in the build environment, but browser navigation was blocked by the environment (`ERR_BLOCKED_BY_ADMINISTRATOR`). Therefore, visual rendering and pointer interaction on the user's laptop are not claimed as passed. The following manual test is required:

1. Open `index.html` in Chrome or Edge.
2. Scroll the welcome page; confirm the four mission cards are present below the hero.
3. Click Enter Flight Deck, then Anatomy Explorer.
4. Choose Male, Female, and Neutral; confirm the Normal and Nervous illustrations change.
5. Click each of the five anatomy layer buttons.
6. Click the six numbered pointers and check that the information panel updates.
7. Verify Research Library cards open their complete external links.
8. Verify the assessment model, local record save, and CSV export still work.

## Scope and limitations

- Anatomy profile buttons change the visual reference only. They do not alter health thresholds, model features, predictions, or medical interpretation.
- Skeleton, muscular, and organ/circulation art is general educational reference imagery shared across visual profiles; it is not personalised by sex.
- Illustrations are educational artwork, not medical scans or clinical anatomy references.
- Rocket and astronaut welcome artwork is decorative SVG and not NASA branding.
- Synthetic model performance metrics are not clinical accuracy.
