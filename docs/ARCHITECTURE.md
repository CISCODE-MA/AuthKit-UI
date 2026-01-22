# Architecture (React TS DeveloperKit)

This template is for building a reusable React TypeScript **library**:
**components + hooks + utils**.

Tooling is standardized — do not change it casually.

---

## Folder structure

- `src/components/`  
  React UI components only.

- `src/hooks/`  
  React hooks only (state/side-effects/live integrations).

- `src/utils/`  
  Framework-agnostic utilities (no React imports).

- `src/__tests___`
  Unit tests directory

- `src/index.ts`  
  **The only public API** entrypoint.

---

## Public API rules (strict)

- Consumers must import from the package root only:
  - ✅ `import { X } from "@scope/pkg"`
  - ❌ `import { X } from "@scope/pkg/dist/..."`
  - ❌ `import { X } from "@scope/pkg/src/..."`

- Only export public things from `src/index.ts`.
- Anything not exported from `src/index.ts` is private and may change freely.

---

## Layer rules

### `utils`

- MUST NOT import `react` or `react-dom`.
- No DOM globals unless explicitly required.
- Pure functions preferred.

### `hooks`

- May import React.
- Avoid “magic” side effects: prefer explicit params.
- No direct network calls unless the library is explicitly meant to do so.

### `components`

- May import React.
- Keep UI behavior self-contained and testable.
- No styling dependencies.
  - Tailwind-compatible className patterns are allowed
  - Do not assume global CSS
  - Do not ship Tailwind as a dependency

---

## Exports convention

Default pattern:

- `src/components/Button/Button.tsx`
- `src/components/Button/index.ts` exports Button
- `src/components/index.ts` re-exports all components
- `src/index.ts` re-exports `components`, `hooks`, `utils`

---

## Testing

- Vitest only.
- Prefer unit tests for `utils`.
- For `components/hooks`, start with behavior tests and keep DOM coupling minimal.
