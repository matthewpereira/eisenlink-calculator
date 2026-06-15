# Eisenlink Weight Calculator

A small static web app for visualizing the loaded weight of an Eisenlink
adjustable dumbbell. Drag the slider to step through every achievable weight
(10–80 lb) and see the exact plate/screw breakdown plus a scaled diagram of
the dumbbell.

## Project structure

```
.
├── index.html          # Markup only
├── css/styles.css      # All styles
├── js/app.js           # Weight model, breakdown + diagram rendering
└── .github/workflows/
    └── deploy.yml      # GitHub Pages deployment
```

There is no build step — the site is plain HTML, CSS, and vanilla JS.

## Running locally

Because the page loads `css/` and `js/` over relative paths, serve it from a
local web server rather than opening the file directly:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying to GitHub Pages

Deployment is handled by GitHub Actions (`.github/workflows/deploy.yml`):

1. Push this repository to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Every push to `main` builds and publishes the site automatically.

The `.nojekyll` file disables Jekyll processing so the `css/` and `js/`
directories are served verbatim.
