# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `yarn dev:desktop` - Run desktop app in development (uses Wails dev server on port 34115)
- `yarn dev:extension` - Run extension in development mode
- `yarn dev:desktop:vite` - Run desktop Vite dev server only (for frontend-only development)

### Building
- `yarn build:desktop` - Build desktop application
- `yarn build:extension` - Build browser extension
- `yarn build` - Alias for `yarn build:desktop`

### Testing & Quality
- `yarn test` - Run tests (vitest)
- `yarn lint` - Lint TypeScript/JavaScript files across all clients
- `yarn lint:fix` - Fix linting issues automatically
- `yarn typecheck` - Run TypeScript type checking
- `yarn check:all` - Run lint, typecheck, test, and knip together
- `yarn knip` - Find unused dependencies and exports
- `yarn knip:fix` - Automatically remove unused dependencies and files

### Package Management
- `yarn sync-packages` - Fix version mismatches across workspaces (syncpack)

## Architecture

### Monorepo Structure

This is a **yarn workspaces monorepo** with domain-driven organization:

**`lib/`** - Pure, reusable code (zero Vultisig dependencies)
- `@lib/utils` - Generic utilities and helper functions
- `@lib/ui` - Reusable UI components
- `@lib/extension` - Browser extension utilities
- Other domain-agnostic libraries (schnorr, dkls, codegen)

**`core/`** - Vultisig business logic shared across clients
- `@core/chain` - Blockchain integrations and chain-specific logic
- `@core/mpc` - Multi-party computation protocols
- `@core/ui` - Domain-specific UI components and state management
- `@core/extension` - Extension-specific business logic
- `@core/config` - Shared configuration and constants
- `@core/inpage-provider` - Web3 provider implementation

**`clients/`** - Application-specific code per platform
- `clients/desktop/` - Wails-based desktop app for Windows/Linux
- `clients/extension/` - Chrome extension (VultiConnect)
- `clients/mobile/` - Mobile app code references

### Technology Stack

**Desktop App:**
- **Wails** - Go + React framework for desktop apps
- **Vite** - Frontend build tool
- **React 19** - UI framework
- **styled-components** - CSS-in-JS styling
- **TypeScript** - Type safety

**Extension:**
- **Chrome Extension APIs** - Browser integration
- **React 19** - Popup and content script UI
- **Vite** - Build system with multiple entry points
- **Web3 Standards** - Wallet standard compliance

**Shared:**
- **TanStack Query** - Server state management
- **React Hook Form** - Form handling
- **Framer Motion** - Animations
- **i18next** - Internationalization
- **Zod** - Runtime type validation

### Key Concepts

**Multi-Party Computation (MPC)** - Core security model where private keys are split across multiple devices, requiring threshold signatures for transactions.

**Resolver Pattern** - Used throughout for chain-specific logic. Each feature has:
- `index.ts` - Router that delegates to chain-specific resolvers
- `resolver.ts` - Type definitions
- `resolvers/` - Implementation per chain (evm.ts, solana.ts, etc.)

**Chain Abstraction** - Unified interface for different blockchains (EVM, Solana, Cosmos, UTXO, etc.) with chain-specific implementations.

## Development Guidelines

### Code Organization
- **Domain-driven structure** - Group files by business purpose, not technical type
- **Resolver pattern** - Use for chain-dependent features instead of switch statements
- **Pattern matching** - Prefer `Record` lookups and `match` functions over switch/case

### TypeScript Rules
- Use `type` for object definitions, not `interface` (enforced by ESLint)
- Use `interface` only for class contracts that will be implemented

### Import Rules
- **Within same package** - Use relative imports (`./`, `../`)
- **Cross-package imports** - Use workspace names (`@core/chain`, `@lib/utils`)
- Never traverse package boundaries with relative paths

### Error Handling
- Use `attempt()` only for user-facing errors or alternative logic paths
- Prefer `shouldBePresent()` and `assertField()` over optional chaining for required values
- Avoid try/catch for logging purposes

### Testing
- Use Vitest for unit tests
- Test files should be co-located with source code or in `__tests__` folders

## Important Notes

### Desktop Development
- Always use the Wails dev server (port 34115), not the Vite dev server directly
- The Vite server lacks required Wails-injected scripts

### Extension Development
- Extension builds multiple entry points: app, background, content, inpage
- Use `yarn dev:extension` which watches all entry points simultaneously

### Blockchain Support
Current supported chains include EVM-compatible chains, Solana, Cosmos ecosystem, Bitcoin/UTXO, Polkadot, Ripple, Sui, TON, and Tron. Each has specific resolver implementations under the resolver pattern.

### Workspace Dependencies
Package dependencies use workspace protocol (`workspace:^`) for internal packages. External dependencies are managed at the root level where possible.