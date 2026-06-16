# Deployment Guide

This project is deploy-ready for GitHub Pages using Vite.

## Placeholder Values

Before deployment, replace `sid0sid-ops` placeholders in:

- `README.md`
- `package.json`
- `src/data/projectContent.js`
- `docs/deployment.md`

Use your GitHub username in URLs such as:

```text
https://sid0sid-ops.github.io/titanic-data-to-discovery/
```

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Vite Base Path

`vite.config.js` must use the repository name as the base path:

```js
base: '/titanic-data-to-discovery/'
```

This is already configured.

## GitHub Actions Deployment

The repository includes:

```text
.github/workflows/deploy.yml
```

Steps:

1. Push the repository to GitHub.
2. Open the repository on GitHub.
3. Go to **Settings -> Pages**.
4. Set **Build and deployment** source to **GitHub Actions**.
5. Push changes to the `main` branch.
6. Wait for the workflow named **Deploy React site to GitHub Pages**.

The live page will be available at:

```text
https://sid0sid-ops.github.io/titanic-data-to-discovery/
```

## Optional Manual Deployment

The project also includes a `gh-pages` deploy script:

```bash
npm run build
npm run deploy
```

GitHub Actions is recommended because it deploys automatically from `main`.
