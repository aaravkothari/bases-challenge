# The Orbital Economy

Static three-tab presentation template. No build or dependencies required.

## Preview
Run `python3 -m http.server 4173 --directory dist` from this folder, then open http://localhost:4173.

## Add your work
- `dist/content.js`: hero text and imagery, industry candidates, source records, team bios, Google Doc URL, and simulation settings.
- `dist/app.js`: research sections and calculator shell. No economic formulas or findings have been invented. Replace pending text with your research, and use `citation('source-id')` with a matching source record for linked in-text citations.
- `dist/style.css`: responsive design and print styles.
- `dist/assets/`: three locally stored SpaceX reference images. Reference imagery is decorative SpaceX imagery used in the initial design template. These are design-template assets, not research evidence.

## Integrate the simulation
Choose one setting in `content.js`:
1. `iframeUrl`: a hosted simulation URL or local page such as `sim/index.html`. Copy its files into `dist/sim/`.
2. `moduleUrl`: an ES module path such as `./sim/main.js`. Export `mount(container)`, returning a cleanup function if your simulation uses animation loops or event listeners. Do not modify the outer page or navigation.

The iframe has a title and a fixed responsive viewport. It allows scripts and same-origin behavior; only embed trusted team code. Module loading failures show an unavailable state. Navigating away calls the module's cleanup function.

## Model
Tab 1, section 05 embeds the stem-cell cost calculator from `dist/calculator/` (copied from https://github.com/ManasPuri3/stem-cell-space-calculator). `pitch.html?embed=1&theme=dark` is the four-step Earth vs space comparison shown in the iframe; `calculator/index.html` is the full model with every assumption, evidence rating and source. To update it, copy the `app/` files from that repo into `dist/calculator/`. The iframe resizes to its content (`mountCalculator` in `dist/app.js`).

## Navigation and printing
Tabs and sections use hash URLs, e.g. `#economy/calculator`. Browser back/forward works. Print Research prints the current tab's content; switch tabs to print another chapter. The Research tab displays the working Google Doc directly.

## Tab 3: orbital economy research walkthrough
The narrative follows Bagel Bros' thesis, Part 1, and Q1–Q3. Sources and source limitations are in `dist/infra-sources.js`. The recording remains embedded in `dist/infrastructure.js`.

All five displayed graphs are rendered with LaTeX/PGFPlots, not JavaScript. Editable source: `figures/main.tex`. PDF and PNG assets: `dist/assets/latex/`. Rebuild from this folder:

```sh
tectonic figures/main.tex --outdir figures/build
pdftoppm -png -scale-to 2000 figures/build/main.pdf dist/assets/latex/figure
cp figures/build/main.pdf dist/assets/latex/research-figures.pdf
cp figures/main.tex dist/assets/latex/main.tex
```

Requires Tectonic and Poppler only when rebuilding figures. No build dependencies are needed to serve the website. The previous JavaScript model module and tests are retained as historical working files but are not imported by the current walkthrough. Capacity growth and repair budgets are labeled scenarios, not forecasts or quoted prices. SEC excerpts and Kalshi snapshots remain explicitly unverified.

Production hosting uses GitHub Pages.

Primary navigation: Industries (matrix, potential industries, industries that don’t work), Microgravity & Medicine (premise, medicine, simulation, calculator, verdict), and Orbital Economy (existing infrastructure walkthrough). Research remains accessible via the research link and displays the embedded Google Doc configured by `rawWorkUrl` in `dist/content.js`. Industry classifications remain pending evidence.

## GitHub Pages deployment
`.github/workflows/pages.yml` publishes `dist/` on pushes to `main`, or via a manual workflow run. In repository Settings → Pages, select **GitHub Actions** as the source. Relative asset paths and hash navigation support the `/bases-challenge/` project URL.

Live site: https://aaravkothari.github.io/bases-challenge/

The repository is public and Pages uses GitHub Actions. `vercel.json` disables automatic Vercel Git deployments. Existing Vercel deployments are retained but no longer receive automatic updates.
