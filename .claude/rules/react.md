---
paths:
  - "**/*.tsx"
---

# React Rules

## One component per file
Each .tsx exports ONE React component. Skeleton/error variants go in separate files.

## React Compiler — no manual memoization
- **NEVER** use `useMemo` or `useCallback` — React Compiler handles it
- Write natural code and let the compiler optimize

## Component autonomy
Domain components access state directly via hooks, not props. Only pass props to reusable/generic components.

## Pattern matching over switch/case
- Use Record lookups and match functions instead of switch/case
- Config arrays for repetitive conditionals

## i18n — all user-facing text
- Use `useTranslation()` hook for all visible text
- Add translations **only** to `en.ts` — never edit other locale files directly
- Use `yarn translate` to propagate to other locales
