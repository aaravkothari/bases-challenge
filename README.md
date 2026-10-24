# Bagel Bros — The Orbital Economy

Static three-tab presentation template. No build or dependencies required.

## Preview
Run `python3 -m http.server 4173 --directory dist` from this folder, then open http://localhost:4173.

## Add your work
- `dist/content.js`: hero text and imagery, industry candidates, source records, team bios, Google Doc URL, and simulation settings.
- `dist/app.js`: research sections and calculator shell. No economic formulas or findings have been invented. Replace pending text with your research, and use `citation('source-id')` with a matching source record for linked in-text citations.
- `dist/style.css`: responsive design and print styles.
- `dist/assets/`: three locally stored SpaceX reference images. Credits appear in Research & Team. These are design-template assets, not research evidence.

## Integrate the simulation
Choose one setting in `content.js`:
1. `iframeUrl`: a hosted simulation URL or local page such as `sim/index.html`. Copy its files into `dist/sim/`.
2. `moduleUrl`: an ES module path such as `./sim/main.js`. Export `mount(container)`, returning a cleanup function if your simulation uses animation loops or event listeners. Do not modify the outer page or navigation.

The iframe has a title and a fixed responsive viewport. It allows scripts and same-origin behavior; only embed trusted team code. Module loading failures show an unavailable state. Navigating away calls the module's cleanup function.

## Model
The calculator is intentionally disabled. Add researched formulas, input bounds, units, and source-backed defaults before enabling it. Distinguish cost competitiveness from profitability and use quality-adjusted usable output, not raw cell counts. Do not populate a result before a valid model exists.

## Navigation and printing
Tabs and sections use hash URLs, e.g. `#economy/calculator`. Browser back/forward works. Print Research prints the current tab's content; switch tabs to print another chapter. The initial template has no research bibliography entries, bios, or external document links.
