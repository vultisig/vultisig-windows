# Code Quality Rules

## Validate after every code change
Run `yarn check` after modifying any code file. Skip for docs-only tasks.
- Quick validation: `yarn check` (typecheck + lint:fix + knip)
- Full CI-equivalent: `yarn check:all` (lint + typecheck + test + knip)

## ESLint autofix workflow
- Use ESLint autofix only for auto-fixable issues (import sorting, etc.)
- Never sort imports manually
- Single file: `yarn eslint <path> --fix`
- All files: `yarn lint:fix`

## Readable code over comments
Write self-documenting code. Comments only for:
- Complex business logic not obvious from code
- Non-obvious algorithmic decisions
- Temporary workarounds/TODOs with context

## No empty styled components
Never create styled components with empty template literals. Use regular elements.

## Desktop development
Always use `yarn dev:desktop` (Wails dev server on port 34115). The plain Vite dev server lacks Wails-injected scripts. UI checks at `http://localhost:8081`.
