---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Function Rules

## Object parameters for multiple arguments
Functions with >1 parameter use an object parameter with `{FunctionName}Input` naming.

## attempt() over try-catch
- Use `attempt()` **only** for user-facing errors or alternative logic paths
- **NOT** for logging — let errors bubble up naturally
- Never wrap functions just to catch and re-log errors
