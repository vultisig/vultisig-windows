---
name: validate-code
description: RUN yarn check WHEN TypeScript or JavaScript files are modified TO catch type errors, lint issues, and unused code
---

# Validate Code Changes

Run `yarn check` after completing tasks that modify code files.

## When to Run

Run `yarn check` if you modified any of these file types:

- `.ts`, `.tsx`, `.js`, `.jsx` - TypeScript/JavaScript source files
- `package.json` - dependency changes
- `tsconfig.json` - TypeScript config
- `.eslintrc.*`, `eslint.config.*` - ESLint config

## When to Skip

Skip `yarn check` if you ONLY did one of these:

- Edited `.md`, `.mdx` files (documentation)
- Edited `.mdc` files (Cursor rules)
- Called MCP tools without modifying code
- Read files or explored the codebase
- Made git commits/pushes
- Edited JSON files unrelated to TypeScript (e.g., Linear configs)
- Edited images or other assets

## Workflow

1. Run `yarn check`
2. Fix all reported issues (TypeScript, ESLint, or unused code from Knip)
3. Rerun `yarn check` until it passes with no errors

**Crucial**: Always delete unused exports or files reported by Knip.

## Quick Decision

Ask yourself: "Did I modify any `.ts`, `.tsx`, `.js`, or `.jsx` file?"

- **Yes** -> Run `yarn check`
- **No** -> Skip it
