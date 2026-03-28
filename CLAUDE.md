# Weather Dashboard — Project Rules

Global rules from `~/.claude/CLAUDE.md` apply automatically.
This file adds rules that are specific to this project and stack.

---

## Stack

- **Framework:** Angular 19, standalone components, OnPush change detection
- **Language:** TypeScript (strict mode)
- **State:** Angular Signals (`signal`, `computed`, `effect`)
- **HTTP:** Angular `HttpClient` + RxJS
- **Tests:** Jest + `jest-preset-angular` — run with `npx jest`
- **Lint:** ESLint v9 flat config — run with `npx eslint .` / `npx eslint . --fix`
- **API:** Open-Meteo (weather + geocoding) — no API key required, HTTPS only

---

## Project Structure

```
src/app/
  core/
    interfaces/   — all domain + API response types
    services/     — business logic, HTTP, state (no UI code here)
  features/       — one folder per page/feature, each self-contained
  shared/
    pipes/        — pure transform pipes
    utils/        — pure functions only, no Angular dependencies
testing/          — all spec files live here (not next to source)
api/              — Vercel serverless functions (Node.js, not Angular)
```

---

## Angular-Specific Patterns

### All components must use OnPush
```ts
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
```
ESLint enforces this via `@angular-eslint/prefer-on-push-component-change-detection`.

### Signal setter pattern for all @Input properties
Use a private signal + setter instead of a plain `@Input()` field, so inputs integrate with the signal graph.
```ts
// ❌ Wrong
@Input({ required: true }) weather!: WeatherData;

// ✅ Correct
private readonly _weather = signal<WeatherData | null>(null);
@Input({ required: true }) set weather(v: WeatherData) { this._weather.set(v); }
protected readonly temp = computed(() => this._weather()?.temperature ?? 0);
```

### No subscriptions in components
Subscriptions belong in services. Components read signals exposed by services, never subscribe to observables directly.

### Subscription cleanup in services
Use `takeUntilDestroyed()` for root services that set up pipes in the constructor. Use `takeUntilDestroyed(this.destroyRef)` when outside an injection context (inject `DestroyRef` explicitly).

### Use switchMap for search/cancellable HTTP
Any user-triggered HTTP call (search, location change) must use `switchMap` so rapid triggers cancel the previous in-flight request.

### No direct DOM manipulation
Never use `nativeElement`, `document.querySelector`, or similar. Drive all view state through signals and Angular template bindings.

### Facade pattern — components inject one service only
`WeatherFacadeService` is the single entry point for all state in components. Never inject `WeatherService`, `LocationSearchService`, `AiInsightService`, `TemperatureUnitService`, or `ClockService` directly into a component. All orchestration belongs in the facade.

---

## Project-Specific Security

### Error sanitization
Always use `sanitizeError()` from `src/app/shared/utils/error-sanitizer.util.ts`.
Never pass raw `error.message` or `HttpErrorResponse` details to the UI.
When adding new patterns to `ERROR_MESSAGE_MAP`, specific patterns (e.g. `': 429'`) must come **before** the generic catch-all (`'Http failure response'`) — the first match wins. Getting this order wrong causes the wrong message to be shown and is hard to spot without a targeted test.

### Coordinate validation
Always call `isValidCoords()` from `src/app/shared/utils/coordinate-validator.util.ts` before passing coordinates to the Open-Meteo API.

### CSP lives in `src/index.html`
- Do not weaken the existing CSP
- Any new external domain must be added to `connect-src`
- Never add `'unsafe-eval'` or `'unsafe-inline'` to `script-src`
- Permissions-Policy is also set there — do not expand it

### Angular-specific bans
- No `bypassSecurityTrust*` (DomSanitizer bypass) — ever
- No `[innerHTML]` binding — ever
- No `outerHTML` or `document.write()` — ever

### Disable CSS inlining when using a strict CSP
Angular's style optimizer generates `<link media="print" onload="this.media='all'">` by default.
That `onload` is an inline event handler — blocked by `script-src 'self'` with no `'unsafe-inline'`.
Always set this in `angular.json` production config:
```json
"optimization": { "scripts": true, "styles": false, "fonts": true }
```

### Use `[attr.aria-label]` for dynamic ARIA attributes
`aria-label="{{ expression }}"` fails Angular's strict template compiler.
Always use `[attr.aria-label]="expression"` for any ARIA attribute with a dynamic value.

---

## Testing

- Test files live in `testing/` (not co-located with source)
- Run: `npx jest` / `npx jest --no-coverage`
- Use `fakeAsync` + `tick(ms)` for anything with `debounceTime` or `setTimeout`
- Use `HttpTestingController` for all HTTP — never mock `HttpClient` directly
- TDD on every bug: write a failing test first, then fix
- Every file in `shared/pipes/` must have a corresponding spec in `testing/` — pipes have no ESLint enforcement so bugs slip through silently (the missing `°C`/`°F` unit was caught visually, not by a test)
- Every file in `shared/utils/` must have a corresponding spec in `testing/`

---

## Linting Rules (enforced by ESLint)

| Rule | Limit |
|---|---|
| `max-lines-per-function` | 10 lines |
| `max-lines` | 400 lines (TS), 100 lines (HTML) |
| `complexity` | 5 |
| `max-depth` | 2 |
| `no-else-return` | no if/else |
| `no-param-reassign` | pure function style |
| `@typescript-eslint/no-explicit-any` | no `any` |
| `@typescript-eslint/explicit-function-return-type` | always |

---

## Local Development

Two terminals are required when working on the AI insight feature:

| Terminal | Command | Purpose |
|---|---|---|
| 1 | `node server.local.js` | Local API server on port 3002 (calls Groq) |
| 2 | `ng serve` | Angular dev server on port 4200 |

- `proxy.conf.json` connects them — Angular forwards `/api/*` to port 3002 automatically
- Without `server.local.js`, the AI card silently shows nothing (graceful no-op) — no crash, no visible error
- `ng serve` alone works for everything except the AI insight feature
- Never use `vercel dev` for local development — it conflicts with Angular 19's internal Vite setup
- **Secrets**: `.env` = local dev only (gitignored). Production secrets go in the Vercel dashboard under Environment Variables. Never put production secrets in `.env` and never commit it.

---

## AI Feature

### Groq model name lives in two places — always update both
- `api/insight.ts` (production, runs on Vercel)
- `server.local.js` (local dev only)

If you change the model, update both files.

### `AI_CONFIG.endpoint` must always be a relative path
`app.config.ts` provides `{ endpoint: '/api/insight' }`. Never change this to an absolute URL — the relative path works for both local (proxied by Angular) and production (Vercel routing).

### AI responses are untrusted input
Everything returned by Groq must go through `parseInsightResponse()` in `src/app/shared/utils/ai-prompt.util.ts` before entering application state. Never use the raw AI text directly.

### Server-side API calls do not need CSP entries
Calls made from `api/` (Node.js, server-side) are invisible to the browser — they do not need `connect-src` entries in `src/index.html`. Only add CSP entries for domains the **browser** calls directly.

---

## Temperature and Units

- The `TemperaturePipe` must always return the unit letter: `26°C` or `79°F` — never bare `26°`
- The unit toggle button shows the unit you'd **switch to**, not the current unit — this is intentional UX
- Always pass the `unit()` signal as the second argument to the `temperature` pipe: `{{ value | temperature : unit() }}`

---

## Use Existing Utilities — Do Not Duplicate

Before writing new validation, formatting, or lookup logic, check these first:

| Utility | Location | Use for |
|---|---|---|
| `sanitizeError()` | `shared/utils/error-sanitizer.util.ts` | All user-facing error messages |
| `isValidCoords()` | `shared/utils/coordinate-validator.util.ts` | Before any API call with coordinates |
| `getWeatherLabel()` | `shared/utils/weather-code.util.ts` | WMO weather code → label/icon/theme |
| `buildWeatherPrompt()` | `shared/utils/ai-prompt.util.ts` | Building prompts for Groq |
| `parseInsightResponse()` | `shared/utils/ai-prompt.util.ts` | Parsing and validating AI responses |

---

## Vercel Serverless Functions (`api/`)

- Every file in `api/` is a Node.js serverless function — it runs in a different runtime from Angular
- The root `tsconfig.json` uses `"moduleResolution": "bundler"` (Angular-specific) which breaks Node.js — never let `api/` files inherit it
- `api/tsconfig.json` must always exist with `"module": "CommonJS"` and `"moduleResolution": "node"`
- API keys must come from `process.env` — never hardcoded, never passed from the client
- Before pushing any change to `api/`, run `vercel build` locally to catch config/compilation errors before they hit production

---

## Workflow

1. `npx eslint . --fix` — fix all lint errors
2. `npx jest --no-coverage` — all tests must pass
3. If `api/` was changed: `vercel build` — must complete without errors
4. Security checklist:
   - [ ] No raw error messages shown to user — used `sanitizeError()`
   - [ ] All `<input>` fields have `maxlength` + `type`
   - [ ] URL params use `encodeURIComponent()`
   - [ ] No new external domains without CSP update in `src/index.html`
   - [ ] No `bypassSecurityTrust*` or `innerHTML`
   - [ ] Coordinates validated with `isValidCoords()` before API use
   - [ ] Any new `api/` function has its own `tsconfig.json` or inherits `api/tsconfig.json`
5. Audit changed code against Angular patterns above
