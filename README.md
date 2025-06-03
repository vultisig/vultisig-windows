# Vultisig Desktop & VultiConnect

This monorepo contains two main components:

1. The Vultisig Desktop Application (Windows and Linux)
2. The VultiConnect Browser Extension - A Chrome extension for bridging your Vultisig vaults to dApps

## Desktop Application

### Technical Requirements

This project uses Wails. Please refer to https://wails.io/docs/gettingstarted/installation/ for installation instructions.

### For Linux Users

Vultisig under Linux requires `libwebkit2gtk-4.0-dev`. Install it with:

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev
```

### Development

To run the desktop application in development mode:

```bash
yarn dev:desktop
```

**Important Note:** This will expose two dev servers: one on 34115 (the Wails development server) and a Vite development server on port 5173.
Always use the former, as the Vite development server won't have the requited Wails-injected scripts.

### Building

To build the desktop app dist:

```bash
yarn build:desktop
```

For Ubuntu 24.4 users who can't find `libwebkit2gtk-4.0-dev`:

1. Add `deb http://gb.archive.ubuntu.com/ubuntu jammy main` to `/etc/apt/sources.list`
2. Run `sudo apt update && sudo apt install libwebkit2gtk-4.0-dev`

## VultiConnect Extension

### What is VultiConnect?

VultiConnect is a Chrome extension similar to MetaMask but much safer. It does not store any critical information such as private keys or passwords. Instead, it acts as a bridge that allows you to connect your Vultisig app to DeFi applications, enabling you to interact with them and sign transactions securely on your devices.

### How Safe is VultiConnect?

You only need to import public keys and vault information into VultiConnect. Unlike MetaMask, if someone hacks your Chrome or the extension, they cannot execute transactions without your approval on your Vultisig devices, as they only have access to public information.

### Requirements

Before building VultiConnect, ensure you have the following installed:

- `Node.js` (version 18.10.0 or later)
- `yarn` (for managing packages)

### Development

To run the Vulticonnect extension in development mode:

```bash
yarn dev:extension
```

### Building

To build the extension:

```bash
yarn build:extension
```

### Installing in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (top-right corner)
3. Click "Load unpacked" and select the `dist` folder from the extension
4. The extension should now be installed and ready to use

## VultiConnect Integration Guide

For details on integrating VultiConnect with your project, see the [Integration Guide](clients/extension/docs/integration-guide.md).

## Development Guidelines

### Code Organization: Domain-Driven Structure

This codebase uses **domain-driven organization** - files are grouped by business purpose rather than technical type.

**❌ Avoid:** Dumping everything in generic folders like `core/ui/components`

**✅ Follow:** Place files based on their business domain. For example, `ReshareVaultPage` goes in `core/ui/mpc/keygen/reshare/` because:

- `core/` - shared across projects
- `ui/` - user interface code
- `mpc/` - multi-party computation domain
- `keygen/` - key generation subdomain
- `reshare/` - specific reshare functionality

This makes code easier to find, understand, and maintain by keeping related functionality together.

### Top-Level Folder Structure

When adding new code, choose the appropriate top-level folder based on abstraction level:

**`lib/`** - Pure, reusable code that could work in any project

- Zero dependencies on Vultisig business logic
- Examples: UI components, utilities
- Think: "Could I copy this to a completely different project?"

**`core/`** - Vultisig-specific business logic shared across clients

- Contains domain knowledge about vaults, MPC, chains, etc.
- Shared between desktop and extension clients
- Examples: vault management, MPC protocols, chain integrations

**`clients/`** - Application-specific code for each platform

- `clients/desktop/` - Desktop app UI and platform-specific code
- `clients/extension/` - Browser extension UI and Chrome APIs
- Should import from `core/` and `lib/`, not the other way around

**Rule of thumb:** Code flows from abstract (`lib/`) → domain-specific (`core/`) → application-specific (`clients/`).

### Within Feature/Domain Folders

Inside each feature or domain folder, organize files by their technical purpose:

**`config.ts`** - Shared constants and configuration

- Feature-specific constants that might be reused
- Default values, enums, static configurations
- Example: `core/ui/passcodeEncryption/core/config.ts` for passcode-related constants

**`state/`** - React state management organized by entity

- One subfolder per data entity being managed
- Example: `state/mpcServerType/` contains hooks and providers for `MpcServerType`
- Include both the hook and provider in the same folder

**`core/`** - Pure business logic for this feature

- Types, interfaces, classes, utility functions
- No React dependencies - pure TypeScript/JavaScript
- Example: `core/ui/chain/coin/addCustomToken/core` This includes functions for adding custom tokens based on a specified chain, serving as the foundational logic for this feature.

**`queries/`** - React Query queries for data fetching

- GET operations, data fetching hooks
- Organized by entity or API endpoint
- File names don't need the full hook name (e.g., `coinBalance.ts` instead of `useCoinBalanceQuery.ts`)

**`mutations/`** - React Query mutations for data modification

- POST, PUT, DELETE operations
- State-changing operations
- File names don't need the full hook name (e.g., `changePasscode.ts` instead of `useChangePasscodeMutation.ts`)

**Note:** No `/components` folder needed - most files are already components, and non-component code goes into the folders above.
