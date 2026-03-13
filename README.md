# Weather Dashboard

An Apple-style weather forecast dashboard built with Angular 19, powered by the free [Open-Meteo API](https://open-meteo.com/). No API key required.

---

## Features

- **Current conditions** — temperature, feels like, humidity, wind speed & direction
- **24-hour forecast** — hourly temperature and weather icons
- **7-day forecast** — daily high/low cards
- **Location search** — search any city by name
- **Auto geolocation** — detects your location on load (browser permission required)
- **Dynamic theming** — background adapts to weather conditions (sunny, rainy, stormy, etc.)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Angular 19 (standalone components) |
| State | Angular Signals |
| Styling | SCSS + CSS Variables (Apple-like glassmorphism) |
| API | [Open-Meteo](https://open-meteo.com/) (free, no key needed) |
| Testing | Jest + jest-preset-angular |
| Linting | ESLint v9 (flat config) |

---

## Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **Angular CLI** (optional, for scaffolding)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the dev server

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start development server on port 4200 |
| `npm run build` | Production build (output: `dist/`) |
| `npm test` | Run all Jest tests |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint on all TS + HTML files |
| `npm run lint:fix` | Auto-fix ESLint violations |

---

## Project Structure

```
src/
  app/
    core/
      interfaces/          # TypeScript interfaces (domain + API response types)
      services/            # WeatherService, GeolocationService,
                           # LocationSearchService, WeatherFacadeService
    features/
      dashboard/           # Main orchestrator component
      current-conditions/  # Current weather card
      location-search/     # Search bar + results dropdown
      forecast-daily/      # 7-day forecast + ForecastDayCard child
      forecast-hourly/     # 24h forecast + ForecastHourItem child
    shared/
      pipes/               # TemperaturePipe
      utils/               # weather-code, wind-direction, weather-forecast,
                           # error-sanitizer, coordinate-validator
  styles/
    _variables.scss        # Design tokens (colors, spacing, typography)
    _reset.scss            # CSS reset

testing/                   # All Jest spec files + setup
```

---

## API

Uses [Open-Meteo](https://open-meteo.com/) — completely free, no API key, GDPR compliant.

| Endpoint | Used for |
|---|---|
| `api.open-meteo.com/v1/forecast` | Current, hourly, and daily weather |
| `geocoding-api.open-meteo.com/v1/search` | City name search |

**Privacy note:** Your GPS coordinates (if geolocation is granted) and city search queries are sent to Open-Meteo servers to retrieve weather data.

---

## Security

- Content Security Policy (CSP) enforced via `<meta>` in `index.html`
- `frame-ancestors 'none'` — prevents clickjacking
- `Permissions-Policy` — restricts geolocation to same-origin only
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- All API calls use HTTPS
- User inputs validated (maxlength, range checks, URL encoding)
- Error messages sanitized before display — no internal details exposed

---

## Linting

ESLint v9 (flat config) is set up with Angular, TypeScript, and custom code rules.

### Run linting

```bash
# Check for violations
npm run lint

# Auto-fix fixable violations
npm run lint:fix
```

### What it enforces

| Rule | What it catches |
|---|---|
| `no-else-return` | No `if/else` — use guard returns or strategy pattern |
| `max-lines-per-function: 10` | Functions over 10 lines |
| `max-lines: 400 / 100` | Files over 400 lines (TS) or 100 lines (HTML) |
| `complexity: 5` | Logic with too many branches |
| `max-depth: 2` | Nested blocks deeper than 2 levels |
| `no-param-reassign` | Mutating function parameters |
| `@typescript-eslint/no-explicit-any` | Use of `any` type |
| `@typescript-eslint/explicit-function-return-type` | Missing return types |
| `@typescript-eslint/prefer-readonly` | Class properties that could be `readonly` |
| `@angular-eslint/prefer-on-push` | Components without `OnPush` change detection |
| `@angular-eslint/no-output-native` | Output names that clash with DOM events |

### Config file

Rules are defined in [`eslint.config.js`](eslint.config.js). Source files use `tsconfig.app.json` for typed linting; test files use `tsconfig.spec.json`.

> **Rule:** Lint must pass with zero errors before any task is considered done.

---

## Code Rules

See [CLAUDE.md](CLAUDE.md) for the full set of code quality and security rules enforced on this project.

---

## Running Tests

```bash
# All tests
npm test

# Watch mode (re-runs on file change)
npm run test:watch

# With coverage report
npm run test:coverage
```

Tests are located in the `testing/` folder. Coverage reports output to `coverage/`.

---

## Building for Production

```bash
npm run build
```

Output is placed in `dist/project-weather/`. Serve with any static file server:

```bash
npx serve dist/project-weather/browser
```
