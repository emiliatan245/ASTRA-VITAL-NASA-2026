# ASTRA-VITAL v1.2.1 — Welcome screen fix

## Why v1.2.0 looked stuck
The welcome overlay used `overflow:hidden` with a vertically centered content block. At shorter laptop viewport heights, the launch buttons were positioned below the visible viewport and clipped. The screen looked like a static landing page even though the buttons and navigation handlers existed.

A browser storage exception could also interrupt welcome initialization before the launch-button listeners were attached. v1.2.1 now catches storage access errors.

## Changes
- The welcome overlay can scroll vertically on short screens.
- The welcome content is more compact and uses a wider heading area on desktop.
- An always-visible `ENTER FLIGHT DECK` button is included in the top bar.
- The original `ENTER FLIGHT DECK` and `EXPLORE BODY SYSTEMS` controls remain.
- The remember-device preference is guarded against localStorage errors.

## Install
Replace `index.html`, `violet-theme.css`, and `body-view-ui.js` in the existing project folder. Keep all other files and assets unchanged. Then reload with Ctrl+Shift+R.
