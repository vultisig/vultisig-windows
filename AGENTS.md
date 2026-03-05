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
3. If touching `lib/`: that's an upstream mirror — do not edit directly
4. If adding user-facing text: only edit `en.ts`, run `yarn translate`
5. Chain-specific logic: use resolver pattern (never switch on chain type directly)

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
