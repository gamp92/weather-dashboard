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

## Workflow

1. `npx eslint . --fix` — fix all lint errors
2. `npx jest --no-coverage` — all tests must pass
3. Security checklist:
   - [ ] No raw error messages shown to user — used `sanitizeError()`
   - [ ] All `<input>` fields have `maxlength` + `type`
   - [ ] URL params use `encodeURIComponent()`
   - [ ] No new external domains without CSP update in `src/index.html`
   - [ ] No `bypassSecurityTrust*` or `innerHTML`
   - [ ] Coordinates validated with `isValidCoords()` before API use
4. Audit changed code against Angular patterns above
