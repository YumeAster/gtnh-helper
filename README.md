# GTNH Item Navigator v0.1

A small Vite + React prototype for a GTNH item guide and tier-aware recipe tree calculator.

This ZIP is already configured for GitHub Pages deployment with GitHub Actions.

## Upload-only GitHub Pages setup

1. Create a new GitHub repository.
2. Upload all files in this folder to the repository.
3. Commit to the `main` branch.
4. Go to **Settings → Pages**.
5. Under **Build and deployment**, set **Source** to **GitHub Actions**.
6. Go to the **Actions** tab and wait for **Deploy to GitHub Pages** to finish.
7. Open the Pages URL shown in **Settings → Pages**.

The project uses `base: './'` in `vite.config.js`, so it should work regardless of your repository name.

## Local run

```bash
npm install
npm run dev
```

Then open the local URL shown in the terminal, usually `http://localhost:5173`.

## Notes

- Data is currently embedded in `src/main.jsx` for quick prototyping.
- Some recipes are placeholders and should be replaced with verified GTNH recipes before use as an authoritative calculator.
- Current tier and selected machines are saved with LocalStorage.
