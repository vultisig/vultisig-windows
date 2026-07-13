# Vultisig Extension

## What is Vultisig Extension

Vultisig Extension is a browser wallet and dApp provider. Users can create,
import, and manage Vultisig vaults in the extension, then connect those vaults
to supported dApps. The extension stores its local vault data and key shares
in extension storage and participates in the vault's configured signing flow.

## Requirements

- The current Node.js LTS release (the repository `.nvmrc` uses `lts/*`)
- Corepack, which installs the repository-pinned Yarn release
- Chrome or another Chromium browser for loading the unpacked build

## Build from source

The extension is part of the `vultisig-windows` monorepo:

```bash
git clone https://github.com/vultisig/vultisig-windows.git
cd vultisig-windows
corepack enable
yarn install --immutable
yarn build:extension
```

The unpacked Chromium build is written to `clients/extension/dist`.

## Install the unpacked build in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose `clients/extension/dist` from this repository.

## Integration Guide

For provider discovery, supported chains, and method contracts, see the
[Integration Guide](docs/integration-guide.md).

## Linting

From the repository root:

```bash
yarn workspace @clients/extension lint
```

The package `lint` script is the focused extension closeout gate. It checks maintained extension app source, `vite.config.ts`, and package build/dev scripts.

For narrower changes, use:

```bash
yarn workspace @clients/extension lint:src
yarn workspace @clients/extension lint:scripts
```

The test lint surface has existing historical violations, so it is separated from the normal focused gate:

```bash
yarn workspace @clients/extension lint:tests
yarn workspace @clients/extension lint:all
```

Use those commands only when intentionally cleaning or changing that broader lint surface.
