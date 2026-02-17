---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Import Rules (Monorepo)

## Within the same package
Use **relative imports**: `./`, `../`

## Cross-package
Use **workspace package names**: `@core/chain`, `@lib/utils`, `@lib/ui`

## Never
- Traverse package boundaries with relative paths (`../../core/chain/...`)
- Import from a package's internal files — use its public API
