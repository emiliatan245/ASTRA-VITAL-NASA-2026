# ASTRA-VITAL — NASA Space Apps 2026 submission checklist

## Eligibility and submission
- [ ] Confirm the ASTRA-VITAL team is assigned to **Kharagpur Local Event** and the selected challenge is the astronaut health-monitoring challenge.
- [ ] Confirm solo participation on the Team Members tab. The 2026 Judging & Awards Guide says Local Event teams need at least one participant; Universal Event teams need at least two.
- [ ] Ask the Kharagpur Local Lead whether a separate live demo/Q&A is required and note the local judging time.
- [ ] Complete all project fields in English.
- [ ] Include the required Project Demo as either no more than 7 slides (title and intro included) or a video no longer than 30 seconds.
- [ ] Provide public links to the demo and final project with no password, login or permission requirement.
- [ ] Include every external source, data, code, text and image reference.
- [ ] Read the SI/AI disclosure rule and obtain local-lead clarification because AI assisted with initial solution framing as well as implementation.
- [ ] Only check declarations if they are accurate and true.
- [ ] Click **Submit for Judging** before the Kharagpur Local Event deadline (the guide states Sunday 15 November 2026, 11:59 p.m. local time).
- [ ] Save a screenshot of the submission success banner.

## Scientific and model transparency
- [x] Built-in sensor training rows are explicitly synthetic.
- [x] Model labels are explicitly synthetic scenario classes, not diagnoses.
- [x] Model holdout score is described as synthetic-label agreement only.
- [x] OSD-575 is described as a serum biomarker study, not continuous wearable telemetry.
- [ ] Verify any downloaded NASA dataset's exact source metadata and licence.
- [ ] Import and demonstrate an actual NASA research file if available during the submission window.
- [ ] Keep research measurements and synthetic sensor telemetry in separate app layers and presentation slides.
- [ ] Do not present the model's output as medical risk, diagnosis, clinical probability or treatment guidance.

## User experience and technical tests
- [ ] Run the v1.0 folder locally in Chrome/Edge.
- [ ] Run a routine-like synthetic scenario and inspect class probabilities.
- [ ] Run a mixed-signal synthetic scenario and inspect the model output.
- [ ] Select poor signal quality and verify that classification is blocked.
- [ ] Click each body-map marker and inspect the educational context.
- [ ] Complete one mission-routine item and confirm XP updates.
- [ ] Save a synthetic assessment record and export the assessment CSV.
- [ ] Import a downloaded OSDR CSV/TSV into Evidence Lab and inspect units/metadata.
- [ ] Check charts, mobile/responsive layout, external NASA links and browser local storage.

## Presentation
- [ ] Update the 7-slide presentation using final application screenshots.
- [ ] Add participant's registered full name in the Team Members slide (verify spelling in account profile).
- [ ] Identify the exact challenge and Kharagpur event.
- [ ] Show one real NASA research source and one clearly labelled synthetic model workflow.
- [ ] Include limitations and AI-generated concept-art watermark.
- [ ] Test the public demo and final-project links in a private/logged-out browser.

## Outstanding disclosure issue
- [ ] Ask the local lead how to proceed under the NASA SI rule. ChatGPT helped with initial concept framing as well as coding, documentation and synthetic-model generation. Do not describe the AI contribution as code-only or hide it.

## v1.1.0 anatomy explorer QA
- [x] Automated harness: all six named anatomical pointers update the matching system panel.
- [x] Automated harness: Overview, Spaceflight and My concern tabs switch content.
- [x] Automated harness: practice topics can be selected and carried into the assessment context without changing sensor values.
- [x] Automated harness: keyboard Enter activation and 390px mobile layout with no horizontal overflow.
- [x] AI-generated illustration watermark and AI-use disclosure retained.
- [ ] Participant to repeat the same tests in their own Chrome/Edge browser.


## v1.1.0 anatomy explorer interaction QA (automated harness)
- [x] Six anatomical system selectors render and update the side panel.
- [x] SVG pointer activates by click and keyboard Enter.
- [x] Overview, Spaceflight and My concern modes update the information panel.
- [x] Region-specific practice concerns can be selected.
- [x] Selected practice topic is handed to the assessment context without changing sensor values.
- [x] Mobile layout checked at 390px viewport with no horizontal overflow.
- [ ] Participant to confirm the same interactions in their own Chrome/Edge installation.


## v1.2.0 presentation checks
- [ ] Demonstrate all four anatomy views (normal, skeletal, circulatory/internal, muscular).
- [ ] Demonstrate clickable pointers and the related system information panel.
- [ ] Demonstrate full-card links in Research Library.
- [ ] Disclose AI-assisted artwork and code accurately; do not claim the illustrations are medical imaging or rotatable 3D anatomy.


## v1.6.0 3D anatomy demo checks
- [ ] Open the Anatomy explorer and choose Male or Female.
- [ ] Confirm the model is a live 3D geometry view, not a static anatomy image.
- [ ] Drag to rotate the model and scroll to zoom.
- [ ] Test all six view modes, including All Systems.
- [ ] Click all six body-system pointers and confirm the information panel updates.
- [ ] Confirm Auto-rotate, Microgravity-style float and Reset view work.
- [ ] Keep the model limitation visible: stylised educational geometry, not a validated anatomical scan or diagnostic tool.
