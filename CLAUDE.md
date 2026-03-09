# Vultisig Windows — Claude Guidelines

## Security Tier

STANDARD

## Critical Boundaries

- `core/mpc/` — MPC/TSS cryptographic operations. Do not modify without explicit review.
- `tss/` — TSS Go bindings (Wails). Do not modify without explicit review.
- `lib/` — Upstream mirror. Do not edit directly.

## Project Overview

Vultisig desktop (Wails + React) and browser extension for multi-chain cryptocurrency wallet management. TypeScript monorepo with Yarn workspaces.

## Tech Stack

- **Language**: TypeScript (strict)
- **UI**: React 19 with React Compiler (no manual memoization)
- **Desktop**: Wails (Go backend + web frontend)
- **Extension**: Chrome/Brave browser extension
- **Build**: Vite, Yarn 4 workspaces
- **Styling**: styled-components
- **State**: Zustand + React hooks
- **Testing**: Vitest
- **Linting**: ESLint
- **Type checking**: tsgo --noEmit

## Directory Structure

```text
vultisig-windows/
├── clients/
│   ├── desktop/         # Wails desktop app
│   └── extension/       # Browser extension
├── core/
│   ├── chain/           # Chain-specific logic (resolver pattern)
│   ├── config/          # App configuration
│   ├── extension/       # Extension-specific core
│   ├── inpage-provider/ # Web3 injected provider
│   ├── mpc/             # MPC/TSS operations
│   └── ui/              # Shared UI components, i18n
├── lib/                 # Upstream mirrors (do not edit)
├── storage/             # Data persistence
├── tss/                 # TSS Go bindings
├── relay/               # Relay server
├── mediator/            # Mediator service
├── build/               # Build scripts
├── ci/                  # CI configuration
└── utils/               # Shared utilities
```

## Quick Commands

```bash
# Validate code (quick)
yarn check

# Full CI-equivalent validation
yarn check:all

# Lint
yarn lint
yarn lint:fix

# Type check
yarn typecheck

# Test
yarn test

# Desktop dev server (Wails, port 34115, UI at 8081)
yarn dev:desktop

# Extension dev
yarn dev:extension

# Build
yarn build:desktop
yarn build:extension
```

## Code Conventions

See `.claude/rules/` for detailed rules. Key points:

- **Validate after every change**: run `yarn check` after modifying code
- **Resolver pattern**: all chain-specific logic uses resolver pattern (never switch on chain type)
- **Object params**: functions with >1 parameter use `{FunctionName}Input` object
- **`attempt()` over try-catch**: only for user-facing errors, not for logging
- **Imports**: relative within package, workspace names (`@core/chain`, `@lib/utils`) cross-package
- **React**: one component per file, no `useMemo`/`useCallback` (React Compiler handles it)
- **i18n**: `useTranslation()` for all user-facing text, only edit `en.ts`, run `yarn translate`
- **Types**: `type` over `interface`, no `as` assertions, derive unions from const arrays
- **Desktop dev**: always use `yarn dev:desktop` (Wails), never plain Vite
- **JSDoc**: `/** ... */` on all exported functions, classes, and type definitions

## Knowledge Base

For deeper context, see [vultisig-knowledge](https://github.com/vultisig/vultisig-knowledge). Read only when needed:

| Situation | Read |
|-----------|------|
| First time in this repo | [repos/vultisig-windows.md](https://github.com/vultisig/vultisig-knowledge/blob/main/repos/vultisig-windows.md) |
| Touching crypto/MPC code | [architecture/mpc-tss-explained.md](https://github.com/vultisig/vultisig-knowledge/blob/main/architecture/mpc-tss-explained.md) |
| Working on agent chat | [repos/agent-backend.md](https://github.com/vultisig/vultisig-knowledge/blob/main/repos/agent-backend.md) |
| Cross-repo gotchas | [coding/gotchas.md](https://github.com/vultisig/vultisig-knowledge/blob/main/coding/gotchas.md) |
| Unsure about conventions | [coding/patterns.md](https://github.com/vultisig/vultisig-knowledge/blob/main/coding/patterns.md) |
