# vultisig-windows — Agent Reference

## Overview

Desktop (Wails) and browser extension for Vultisig wallet. TypeScript monorepo with React 19, Yarn 4 workspaces, resolver pattern for chain logic.

## Quick Start

```bash
git clone https://github.com/vultisig/vultisig-windows.git
cd vultisig-windows
yarn install
yarn check:all   # lint + typecheck + test + knip
```

## Before You Change Code

1. Run `yarn check` after every code change
2. If touching `core/mpc/` or `tss/`: extra caution — affects signing across all platforms
3. `lib/` holds shared workspace packages (`@lib/ui`, `@lib/codegen`, `@lib/extension`) maintained in this repo like `core/`. Published `@vultisig/*` SDK packages come from npm when you bump dependencies.
4. If adding user-facing text: only edit `en.ts`, run `yarn translate`, then `yarn i18n:review-quality`
5. Chain-specific logic: use resolver pattern (never switch on chain type directly)
6. If touching Vite `define` values, ambient build globals, Station/client flavor config, or product-brand branching, run `yarn check:client-build-flags`. It includes the desktop Wails frontend production compile and the Station extension flavor build, which can catch build-time global issues that `yarn check` misses.

## Patterns

- Resolver pattern for all chain-specific logic (`core/chain/`)
- React 19 + React Compiler (no manual memoization)
- `type` over `interface`, no `as` assertions
- Object parameters with `{FunctionName}Input` naming for >1 param
- `attempt()` for user-facing errors only (not logging)
- Relative imports within package, `@core/*` / `@lib/*` cross-package
- One React component per `.tsx` file
- `yarn check:all` as the full CI-equivalent validation

## Security Notes

- Never log key material or vault shares
- MPC/TSS bindings — do not modify without review
- Always test keygen and keysign flows after refactoring
- Use `useTranslation()` for all user-facing strings

## Knowledge Base

For deeper context beyond this file, see [vultisig-knowledge](https://github.com/vultisig/vultisig-knowledge).

Key docs for this repo:
- [repos/vultisig-windows.md](https://github.com/vultisig/vultisig-knowledge/blob/main/repos/vultisig-windows.md)
- [architecture/mpc-tss-explained.md](https://github.com/vultisig/vultisig-knowledge/blob/main/architecture/mpc-tss-explained.md)
- [coding/gotchas.md](https://github.com/vultisig/vultisig-knowledge/blob/main/coding/gotchas.md)
- [coding/patterns.md](https://github.com/vultisig/vultisig-knowledge/blob/main/coding/patterns.md)
