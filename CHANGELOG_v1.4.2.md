# ASTRA-VITAL v1.4.2 — Welcome screen visibility fix

- Fixed welcome screen being hidden on startup by a stale `localStorage` preference written by earlier versions.
- Introduced a version-specific preference key (`astra-vital-welcome-v1.4.2`) so prior versions cannot silently suppress the welcome screen.
- Welcome screen is shown by default on launch.
- Changed the checkbox to an explicit, unchecked-by-default **Skip the welcome screen next time on this device** option.
- Added a persistent **WELCOME** control in the flight-deck top bar to reopen the introduction after it has been dismissed.
- Added accessible `aria-hidden` state updates when opening and closing the welcome dialog.
- Existing assessment history and other local application data are not modified.
