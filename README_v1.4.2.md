# ASTRA-VITAL v1.4.2

## Welcome screen visibility fix

This release fixes a welcome screen that could disappear on launch because an earlier version had stored a `seen` preference. v1.4.2 uses a new version-specific preference key and shows the welcome screen by default.

### What changed
- Welcome screen appears on launch by default.
- The optional checkbox is now unchecked by default and reads **Skip the welcome screen next time on this device**.
- A **WELCOME** button remains in the flight-deck top bar so the introduction can be reopened at any time.
- No health records, assessments, settings, or browser data are cleared.

## Run
1. Extract the complete ZIP.
2. Keep the `assets` folder and all JavaScript/CSS files beside `index.html`.
3. Open `index.html` in Chrome or Edge.

## Update an existing v1.4.1 folder
Use `ASTRA_VITAL_v1.4.2_Update_Patch.zip`. Copy and replace:
- `index.html`
- `body-view-ui.js`
- `astra-blue-final.css`

Do not delete the rest of the project folder. Existing localStorage records remain in the browser.
