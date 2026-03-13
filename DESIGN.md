# Weather Dashboard — Design Document

## Overview

A single-page Angular 19 weather dashboard that displays real-time weather conditions, a 24-hour hourly forecast, and a 7-day daily forecast for any location in the world. Data is sourced from the free [Open-Meteo API](https://open-meteo.com/) (no API key required). The UI uses a glassmorphism aesthetic with dynamic weather-themed background gradients.

---

## Architecture

### Layer diagram

```
┌─────────────────────────────────────────────────────┐
│                    UI Layer                         │
│  DashboardComponent (orchestrator shell)            │
│  ├── LocationSearchComponent                        │
│  ├── CurrentConditionsComponent                     │
│  ├── ForecastHourlyComponent                        │
│  │     └── ForecastHourItemComponent (×24)          │
│  └── ForecastDailyComponent                         │
│        └── ForecastDayCardComponent  (×7)           │
└────────────────────┬────────────────────────────────┘
                     │ signals (read-only)
┌────────────────────▼────────────────────────────────┐
│                 Facade Layer                        │
│  WeatherFacadeService                               │
│  (single public API surface for the UI)             │
└──────┬──────────────┬──────────────┬────────────────┘
       │              │              │
┌──────▼──────┐ ┌─────▼──────┐ ┌────▼────────────────┐
│  Weather    │ │ Geolocation│ │  LocationSearch      │
│  Service   │ │  Service   │ │  Service             │
└──────┬──────┘ └─────┬──────┘ └────┬────────────────┘
       │              │              │
┌──────▼──────────────▼──────────────▼────────────────┐
│                External APIs                        │
│  Open-Meteo Forecast API  /  Open-Meteo Geocoding   │
│  Browser Geolocation API                            │
└─────────────────────────────────────────────────────┘
```

---

## Services

### `WeatherService`
- **Responsibility**: Fetch weather data from Open-Meteo and maintain `WeatherState`.
- **State**: `signal<WeatherState>` — `{ weather, loading, error }`.
- **Exposed signals**: `weather`, `loading`, `error` (all computed, read-only).
- **Entry points**: `loadWeather(location)`, `loadWeatherByCoords(coords)`, `loadDefault()`.
- **Security**: Validates coordinates with `isValidCoords` before any HTTP call.

### `GeolocationService`
- **Responsibility**: Wrap `navigator.geolocation.getCurrentPosition` as an Observable.
- **Returns**: `Observable<GeolocationCoords>` (errors if permission denied or unavailable).

### `LocationSearchService`
- **Responsibility**: Geocode city name queries and manage location state.
- **State**: `signal<LocationState>` — `{ location, searchResults, searchLoading, searchError }`.
- **Security**: Validates query length (2–100 chars), uses `encodeURIComponent` in URL building.
- **Debounce**: RxJS `debounceTime(300)` + `distinctUntilChanged` + `switchMap`.

### `WeatherFacadeService`
- **Responsibility**: Single public API for the Dashboard. Composes the three services above.
- **Exposes**: `weather`, `loading`, `error`, `location`, `searchResults`, `searchLoading`, `theme` (computed from weather code).
- **Methods**: `initGeolocation()`, `selectLocation()`, `searchLocations()`, `clearSearch()`.

### `ClockService`
- **Responsibility**: Provide a reactive `tick` signal (updates every second).
- **Usage**: Injected by `CurrentConditionsComponent` to drive a live local-time display.

---

## Components

| Component | Inputs | Outputs | Notes |
|---|---|---|---|
| `DashboardComponent` | — | — | Shell; reads facade signals, delegates user events |
| `LocationSearchComponent` | `results`, `loading` | `citySearch`, `locationSelected`, `cleared` | Debounces input 300 ms |
| `CurrentConditionsComponent` | `weather`, `location`, `timezone` | — | Live clock via `ClockService` |
| `ForecastHourlyComponent` | `hourly`, `currentTime` | — | Slices next 24 h; owns `@for` loop |
| `ForecastHourItemComponent` | `time`, `temperature`, `weatherCode`, `isCurrent` | — | Leaf; shows "Now" when current |
| `ForecastDailyComponent` | `daily` | — | Owns `@for` loop |
| `ForecastDayCardComponent` | `date`, `tempMax`, `tempMin`, `weatherCode` | — | Leaf display card |

All components use `ChangeDetectionStrategy.OnPush`.

---

## Data flow

```
User opens app
  → DashboardComponent.ngOnInit
    → facade.initGeolocation()
      → GeolocationService.getCurrentCoords()
        → success: WeatherService.loadWeatherByCoords(coords)
        → failure: WeatherService.loadDefault()   // London fallback

User types in search box
  → LocationSearchComponent emits citySearch after 300 ms debounce
    → facade.searchLocations(query)
      → LocationSearchService.search(query)
        → GET geocoding API  → update searchResults signal

User selects a result
  → LocationSearchComponent emits locationSelected
    → facade.selectLocation(location)
      → LocationSearchService.selectLocation(location)
      → WeatherService.loadWeather(location)
        → validate coords
        → GET forecast API  → update weather signal
          → DashboardComponent re-renders (signals → OnPush)
```

---

## Domain interfaces

```
WeatherData
├── current: CurrentWeather        temperature, feelsLike, humidity,
│                                  windSpeed, windDirection, weatherCode, time
├── hourly:  HourlyForecast        time[], temperature[], weatherCode[]
├── daily:   DailyForecast         time[], temperatureMax[], temperatureMin[], weatherCode[]
└── timezone: string               IANA timezone string (e.g. "Europe/London")

WeatherLocation
  name, latitude, longitude, country, timezone

LocationState
  location, searchResults[], searchLoading, searchError
```

---

## Shared utilities

| Utility | Purpose |
|---|---|
| `weather-code.util.ts` | Strategy-pattern lookup map (WMO code → description, label, icon, theme) |
| `weather-forecast.util.ts` | `getNext24Hours`, `formatHour`, `formatDay`, `formatFullDate`, `formatTimeInZone` |
| `wind-direction.util.ts` | `degreeToCompass` — converts bearing to N / NE / E … |
| `coordinate-validator.util.ts` | `isValidCoords` — guards NaN, Infinity, out-of-range |
| `error-sanitizer.util.ts` | Maps raw error messages to safe user-facing strings |
| `temperature.pipe.ts` | Angular pipe; converts °C → °F on demand |

---

## Security model

| Concern | Mitigation |
|---|---|
| Raw error messages leaked to UI | `sanitizeError` maps all errors to pre-approved strings |
| Arbitrary coordinates sent to API | `isValidCoords` validates latitude/longitude before any HTTP call |
| XSS via user input in URL | `encodeURIComponent` on all search queries |
| Input length abuse | `maxlength="100"` on search input; service rejects < 2 or > 100 chars |
| Untrusted third-party connections | CSP `connect-src` in `index.html` restricts to Open-Meteo domains only |
| Browser fingerprinting / tracking | `Referrer-Policy: strict-origin-when-cross-origin` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Geolocation abuse | `Permissions-Policy: geolocation=(self)` |

---

## Theming

Weather codes are mapped to one of six visual themes via the strategy pattern in `weather-code.util.ts`:

```
sunny · cloudy · foggy · rainy · snowy · stormy
```

Each theme applies a CSS gradient class (`.theme-sunny`, `.theme-rainy`, etc.) to the dashboard root, which cascades to background gradients defined in `src/styles/_variables.scss`.

---

## API

**Forecast** — `https://api.open-meteo.com/v1/forecast`
- Parameters: `latitude`, `longitude`, `current`, `hourly`, `daily`, `forecast_days=7`, `timezone=auto`
- No API key required.

**Geocoding** — `https://geocoding-api.open-meteo.com/v1/search`
- Parameters: `name` (encoded), `count=5`, `language=en`, `format=json`
- No API key required.

---

## File structure

```
src/
├── app/
│   ├── app.component.ts
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── core/
│   │   ├── interfaces/
│   │   │   ├── weather.interface.ts
│   │   │   └── location.interface.ts
│   │   └── services/
│   │       ├── clock.service.ts
│   │       ├── geolocation.service.ts
│   │       ├── location-search.service.ts
│   │       ├── weather.service.ts
│   │       └── weather-facade.service.ts
│   ├── features/
│   │   ├── dashboard/
│   │   ├── current-conditions/
│   │   ├── forecast-hourly/
│   │   │   └── forecast-hour-item/
│   │   ├── forecast-daily/
│   │   │   └── forecast-day-card/
│   │   └── location-search/
│   └── shared/
│       ├── pipes/
│       │   └── temperature.pipe.ts
│       └── utils/
│           ├── coordinate-validator.util.ts
│           ├── error-sanitizer.util.ts
│           ├── weather-code.util.ts
│           ├── weather-forecast.util.ts
│           └── wind-direction.util.ts
├── styles/
│   ├── _variables.scss
│   ├── _reset.scss
│   └── styles.scss
└── index.html
testing/
├── setup-jest.ts
└── *.spec.ts
```

---

## Code rules (non-negotiable)

- No `if/else` — use strategy pattern (lookup maps) or guard returns.
- No function over 10 lines, no file over 400 lines (100 lines for HTML).
- `@for` loops only inside child/leaf components — never in orchestrator templates.
- No subscribers in components — use signals and computed values.
- Pure functions for all data transformations.
- Single Responsibility Principle enforced at every layer.
- All interfaces use `readonly` modifiers.
- TDD for every bug fix.
- Security audit after every task.

Enforced by ESLint v9 flat config (`eslint.config.js`) — run `npm run lint`.
