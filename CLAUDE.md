# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (Vite)
npm run build      # tsc + vite build
npm test           # vitest in watch mode
npm run test:run   # vitest single run (CI)
```

Run a single test file:
```bash
npx vitest run src/components/LoginPage.test.tsx
```

## Architecture

This is a React 18 + TypeScript + Vite app — a two-page authentication UI with client-side routing via `react-router-dom`.

**Routing** (`src/main.tsx` → `src/App.tsx`): `BrowserRouter` wraps the app at the entry point; `App` declares two routes — `/` → `LoginPage`, `/signup` → `SignUpPage`.

**API layer** (`src/api/auth.ts`): All network calls go through `loginUser` and `signUpUser`. Currently these are mocks (500 ms delay, hardcoded credentials). Real API calls would replace only this file.

**Page components** (`src/components/`): Each page is self-contained with its own CSS Module (`.module.css`). The internal pattern is consistent: a local `validate()` function returns a `FormErrors` object; form state uses a `Status = 'idle' | 'loading' | 'success' | 'error'` union; API errors are surfaced separately from field-level validation errors.

**Tests** (`*.test.tsx`): Vitest + Testing Library. Tests wrap components in `MemoryRouter` and mock `src/api/auth` with `vi.mock`. The mock-credential contract (`admin@example.com` / `password123`, `existing@example.com` triggers duplicate-email error) lives in the API module — tests use `vi.mocked` to override per-case.
