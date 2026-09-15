# SWAPI Planets

A Star Wars planets explorer built with Vue 3. Browse the full catalogue from [SWAPI](https://swapi.dev/), search by name, mark favourites, and dive into each planet's stats, films, and terrain visualisation.

## Key features

- **Planet catalogue** — fetches all planets from SWAPI and displays them in a paginated list
- **Search** — case-insensitive prefix search that instantly filters the list
- **Favourites** — toggle a heart on any planet; selections persist in `localStorage`
- **Golden-angle planet map** — planets are laid out on a sunflower-spiral so dots never overlap, with a cycling focus highlight
- **Terrain & water gradients** — each planet's circle is coloured with a linear gradient derived from its terrain tokens and surface-water percentage
- **Detail page** — shows all stats, film appearances, and a surface circle; unknown fields render in italic
- **Next planet** — from a detail page, jump to the next planet in the current list (search and favourites filters apply; wraps to the first)
- **Pagination** — adaptive controls with page count derived from the filtered list
- **Responsive** — mobile-friendly planet sizes, adaptive layout, and `prefers-reduced-motion` support

## Tech stack

| Layer        | Choice                                  |
| ------------ | --------------------------------------- |
| Framework    | Vue 3 (Composition API, `<script setup>`) |
| State        | Pinia                                   |
| Routing      | Vue Router (HTML5 history)              |
| Styling      | Tailwind CSS v4                         |
| Build        | Vite                                    |
| Language     | TypeScript                              |
| Unit tests   | Vitest + jsdom + Vue Test Utils         |
| E2E tests    | Cypress                                 |
| Linting      | oxlint                                  |
| Formatting   | oxfmt                                   |

## Architecture

```
SWAPI (swapi.dev/api)
  │
  ▼
src/api/swapi.ts          ← fetch helpers (getAllPlanets, getPlanet, getFilms)
src/api/types.ts          ← shared TypeScript interfaces
  │
  ▼
src/stores/planets.ts     ← Pinia store: catalogue, favourites, pagination, search
  │
  ▼
src/views/
  PlanetsView.vue         ← list page (map + toolbar + list + pagination)
  PlanetDetailView.vue    ← detail page (stats, films, surface circle)
  │
  ▼
src/components/
  PlanetMap.vue           ← golden-angle dot layout with animated focus
  PlanetsList.vue         ← paginated planet rows
  Pagination.vue          ← page controls
  Toolbar.vue             ← search input + LIKED toggle
  LikeButton.vue          ← favourite heart button
  PlanetTooltip.vue       ← hover/focus tooltip on map dots
  StatusMessage.vue       ← reusable empty/error state (uses getListStatusMessage)
```

**Data flow:** API → store → views → components. Views read reactive store state via `storeToRefs` and call store actions. Components follow a props-in / events-out pattern.

**Pure utility layer** (`src/utils/`) keeps presentation logic out of components:

| Module                | Responsibility                                    |
| --------------------- | ------------------------------------------------- |
| `pagination.ts`       | Page count and page-slice helpers                 |
| `planetDiameter.ts`   | Parse diameter, find max, compute circle size (px)|
| `planetSurface.ts`    | Terrain colour lookup, water %, CSS gradient      |
| `goldenAnglePosition.ts` | Sunflower-spiral x/y for map dots              |
| `storage.ts`          | Type-safe `localStorage` read/write for string lists |
| `listStatusMessage.ts`| Derives the correct empty/error status message    |
| `nextPlanet.ts`       | Next planet id in a list, wrapping last to first  |

## Project structure

```
src/
├── api/
│   ├── swapi.ts            # SWAPI fetch helpers
│   └── types.ts            # Shared interfaces
├── assets/
│   ├── images/             # Background SVG, logo
│   └── main.css            # Tailwind entry point
├── components/             # Presentational Vue components
├── router/
│   └── index.ts            # Route definitions (/, /planets, /planets/:id)
├── stores/
│   └── planets.ts          # Pinia store
├── utils/                  # Pure helper functions
├── views/                  # Page-level Vue components
├── App.vue                 # Root layout (galaxy background, header, footer)
└── main.ts                 # App entry point
```

## Getting started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Deploy

Pull requests targeting `main` are checked by [`.github/workflows/ci.yml`](.github/workflows/ci.yml) (lint, format, unit tests, production build, and Cypress e2e). The site is published to GitHub Pages from `main` by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

Live URL: [https://annacv.github.io/swapi-planets/](https://annacv.github.io/swapi-planets/)

**First-time setup** (once per repo): GitHub → **Settings** → **Pages** → **Build and deployment** → **Source**: GitHub Actions.

## Testing

### Unit tests (Vitest)

Unit tests live alongside their modules at `src/**/__tests__/<module>.spec.ts` and cover pure utility functions plus the Pinia store.

```bash
# Run in watch mode
npm run test:unit

# Single run with coverage
npx vitest run --coverage
```

### E2E tests (Cypress)

E2E tests use intercepted SWAPI responses (fixtures) for deterministic, offline execution.

```bash
# Open Cypress interactive runner (dev server must be running)
npm run test:e2e

# Headless CI run
npm run test:e2e:ci
```

## Other scripts

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run lint`         | Lint with oxlint (auto-fix)              |
| `npm run lint:check`   | Lint without writing files (CI)          |
| `npm run format`       | Format `src/` with oxfmt                 |
| `npm run format:check` | Check formatting without writing (CI)    |
| `npm run type-check`   | Type-check with `vue-tsc --build`        |

## API

All planet and film data comes from the [Star Wars API (SWAPI)](https://swapi.dev/). No API key is required.
