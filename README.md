# Himesh Bhattacharjee — Personal Portfolio

[![Portfolio CI](https://github.com/HimeshBhattacharjee/My_Portfolio/actions/workflows/portfolio-ci.yml/badge.svg)](https://github.com/HimeshBhattacharjee/My_Portfolio/actions/workflows/portfolio-ci.yml)
[![Live site](https://img.shields.io/badge/live-himeshb.netlify.app-0b7a75)](https://himeshb.netlify.app/)

The source for my personal portfolio: a single-page site that presents my professional journey, selected work and recognition, with a direct way to get in touch.

**Live:** [himeshb.netlify.app](https://himeshb.netlify.app/)

## Features

- **React and Vite**: a component-based single-page app with fast local development and optimised production builds.
- **Interactive Three.js Lattice**: a WebGL scene in the hero, loaded in its own chunk after first paint, with a static SVG fallback when WebGL is unavailable.
- **Framer Motion animations**: section and interaction animations that respect the visitor's reduced-motion preference.
- **Light and dark themes**: follows the system preference until the visitor chooses a theme, then remembers that choice.
- **Interactive professional timeline**: an expandable timeline of roles and milestones.
- **Project showcases**: selected projects with summaries and figures.
- **EmailJS contact form**: messages are sent from the browser through EmailJS, with no backend to run.
- **Responsive design**: layouts adapt from mobile to wide desktop screens.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | React 18, Vite 5 |
| 3D graphics | Three.js |
| Animation | Framer Motion |
| Styling | Tailwind CSS, PostCSS, Autoprefixer |
| Contact | EmailJS (`@emailjs/browser`) |
| Code quality | ESLint 9 |
| CI and hosting | GitHub Actions, Netlify |

## Getting started

### Prerequisites

- **Node.js 22**, as pinned in [`.nvmrc`](.nvmrc) (run `nvm use` if you use nvm)
- **npm**, which ships with Node.js

### Installation

```bash
git clone https://github.com/HimeshBhattacharjee/My_Portfolio.git
cd My_Portfolio
npm ci
```

`npm ci` installs the exact dependency versions recorded in `package-lock.json`.

### Environment variables

The contact form needs three EmailJS values. Copy [`.env.example`](.env.example) to `.env.local` (git-ignored) and fill them in:

| Variable | Purpose |
| --- | --- |
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service ID |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS template ID |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS public key |

Without them, the site still runs and builds; the contact form shows its fallback instead of sending. Every `VITE_` value is embedded in the public JavaScript bundle, so never put the EmailJS private key in this project. See [`docs/EMAILJS_SETUP.md`](docs/EMAILJS_SETUP.md) for the full setup.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with hot reload |
| `npm run lint` | Run ESLint across the project |
| `npm run build` | Run the content check, then build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run check:content` | Validate the site's content data on its own |
| `npm run check:hygiene` | Check that no private files or credentials are committed |

## Deployment (Netlify)

The site is deployed on Netlify, which builds from this GitHub repository. Build settings live in [`netlify.toml`](netlify.toml), so production and Deploy Previews build the same way:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node.js version | Read from `.nvmrc` |

To deploy your own copy:

1. Create a new Netlify site and connect it to the GitHub repository.
2. Netlify picks up the build settings from `netlify.toml`.
3. Under **Site configuration → Environment variables**, add `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID` and `VITE_EMAILJS_PUBLIC_KEY`.
4. Trigger a deploy. Because the build runs the content check first, a deploy fails rather than publish incomplete content.

The pre-release steps are listed in [`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md).

## Continuous integration

[`.github/workflows/portfolio-ci.yml`](.github/workflows/portfolio-ci.yml) runs on pushes to `main` and `portfolio-redesign`, on pull requests to `main`, and on manual dispatch. It validates only; Netlify handles deployment, and the workflow needs no secrets.

- **quality-checks**: installs with `npm ci`, then runs the repository hygiene check, lint and the production build, and verifies the build output (HTML, JavaScript and CSS bundles, CV and portrait).
- **dependency-audit** (informational): runs `npm audit` on production dependencies. It is reported separately and does not block the quality checks.

## Connect

- **Portfolio:** [himeshb.netlify.app](https://himeshb.netlify.app/)
- **GitHub:** [github.com/HimeshBhattacharjee](https://github.com/HimeshBhattacharjee)
- **LinkedIn:** [in.linkedin.com/in/himeshbhattacharjee](https://in.linkedin.com/in/himeshbhattacharjee)
