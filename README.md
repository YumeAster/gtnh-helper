# GTNH Helper

A Vite + React + Tailwind prototype for a GregTech: New Horizons helper web app.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages deployment

This repository includes `.github/workflows/deploy.yml`.

1. Push the whole project to the `main` branch.
2. Open the repository on GitHub.
3. Go to **Settings → Pages**.
4. Set **Build and deployment → Source** to **GitHub Actions**.
5. Open the **Actions** tab and wait for `Deploy to GitHub Pages` to succeed.

The Vite `base` option is set to `./`, so the app should work even if the repository name changes.

## Current limitations

Some recipe entries are placeholders. Treat the calculator as a UI/data-structure prototype until the recipe data is verified against your GTNH pack version.
