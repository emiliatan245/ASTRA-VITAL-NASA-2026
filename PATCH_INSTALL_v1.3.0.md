# Install patch: v1.2.x → v1.3.0

1. Close the ASTRA-VITAL browser tab.
2. Make a backup copy of your existing `ASTRA_VITAL` folder and export your local observations to CSV.
3. Extract `ASTRA_VITAL_v1.3.0_Update_Patch.zip`.
4. Copy the patch contents into your existing project folder, preserving the `assets` subfolder structure.
5. When Windows asks, replace `index.html`, `body-view-ui.js`, and `mission-features.js`, and add `blue-theme.css` and the six new SVG assets.
6. Confirm that your existing `styles.css`, `violet-theme.css`, `app.js`, `model.js`, and other existing files remain in place.
7. Reopen `index.html` and hard-refresh with `Ctrl + Shift + R`.

The patch does not replace the existing data model, sample CSV, or local browser storage. Still keep the CSV backup before updating.

## First-run checks

- Scroll the welcome screen and confirm the mission briefing cards are below the hero.
- Try both welcome actions and the top-right Enter Flight Deck button.
- Open Anatomy Explorer.
- Choose Male, Female, or Neutral reference. Then select all five anatomy layers.
- Select each numbered pointer; the information panel should update.
- Check the Research Library full-card links.

## Note

The three visual reference choices only change the educational illustrations. They do not change data, model settings, thresholds, or health interpretation. Skeleton, muscular, and organs/circulation views use general educational reference plates shared across profiles.
