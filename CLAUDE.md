# AI Code Rules — Non-Negotiable

## Structure
- No `if/else` — use the **Strategy Pattern** instead (lookup maps, polymorphism, or guard returns)
- No if-wrapped code blocks — flatten logic with guard returns
- No files over 300–400 lines (HTML files max 100 lines)
- No functions over 10 lines
- **For loops belong in child components or a dedicated function** — never inline iteration in a component

## Design
- Pure functions only — no side effects inside business logic
- Single Responsibility Principle (SRP) — one reason to change per unit
- **Always use interfaces** — no inline object types, no `any`, no raw primitives for domain concepts
- No subscribers/observables in components when avoidable — push to services or state layers

## Quality
- **AUDIT AFTER EVERY TASK** against these rules — non-negotiable
- **Boy Scout Rule** — always leave the code cleaner than you found it
- **TDD on every bug** — write a failing test first, then fix

## Linting (Angular + TypeScript)
- Config: `eslint.config.js` (flat config, ESLint v9+)
- **Always run lint and fix all errors before a task is done**
- Key rules enforced by ESLint:
  - `no-else-return` — no if/else
  - `max-lines-per-function: 10` — function length limit
  - `max-lines: 400` (TS) / `100` (HTML) — file length limits
  - `complexity: 5` / `max-depth: 2` — keeps logic flat
  - `no-param-reassign` — enforces pure function style
  - `@typescript-eslint/explicit-function-return-type` — no implicit returns
  - `@typescript-eslint/no-explicit-any` — no `any`
  - `@angular-eslint/prefer-on-push-component-change-detection` — OnPush required
- Install deps: `npm i -D eslint @eslint/js typescript-eslint angular-eslint`
- Run: `npx eslint .` / `npx eslint . --fix`

## Security — Non-Negotiable

### Input & Output
- **Never render raw error messages to the UI** — always use `sanitizeError()` from `error-sanitizer.util.ts`
- **Always validate user input** before using it — length, format, range
- **Always `encodeURIComponent()`** any user-provided value in a URL query string
- **No `innerHTML`, `outerHTML`, or `document.write()`** — ever
- **No `bypassSecurityTrust*`** (Angular DomSanitizer bypass) — ever
- **No `eval()`, `new Function()`, `setTimeout(string)`** — ever

### API & Data
- **HTTPS only** — no HTTP API calls, no mixed content
- **Validate coordinates** before sending to external APIs — use `isValidCoords()` from `coordinate-validator.util.ts`
- **Type all API responses** with interfaces — no `any` on response types
- **Never expose stack traces, server errors, or internal paths** to the browser UI

### HTML & Templates
- **All `<input>` fields must have `maxlength`** and appropriate type
- **Use Angular template binding `{{ }}`** — never string-concatenate into HTML
- **No dynamic `[innerHTML]` binding** unless explicitly sanitized

### Content Security Policy
- CSP is defined in `src/index.html` — do not weaken it
- Any new external API domain must be added to the `connect-src` directive in CSP
- Do not add `'unsafe-eval'` to `script-src`
- Do not add `'unsafe-inline'` to `script-src`

### Permissions
- Geolocation, camera, microphone — only request what is needed
- Permissions-Policy is set in `src/index.html` — do not expand it without review

### Security Audit Checklist (run after every task)
- [ ] No raw error messages shown to user
- [ ] All inputs have `maxlength` + type validation
- [ ] All URL params use `encodeURIComponent()`
- [ ] No new external domains without CSP update
- [ ] No `bypassSecurityTrust*` or `innerHTML`
- [ ] HTTPS only for all API calls
- [ ] Coordinates validated before API use

## Workflow
1. Complete the task
2. Run `npx eslint .` — fix all errors
3. Run the **Security Audit Checklist** above
4. Audit the changed code against all code rules
5. Fix any violations before considering the task done
