# Vultisig Browser Extension

## What is the Vultisig Browser Extension?

The browser extension is a wallet and dApp provider. Users can create, import,
and manage Vultisig vaults in the extension, then connect those vaults to
supported dApps. It is built in Vultisig and Station flavors, which share the
same functionality with separate branding and build artifacts.

## How safe is it?

The extension stores its local vault data and key shares in extension storage
and participates in the selected vault's configured signing flow. The required
participants and authorization flow depend on the vault type and configuration.

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

The regular Vultisig build is written to `clients/extension/dist`. To build the
Station flavor instead, run `yarn build:extension:station`; its independent
unpacked artifact is written to `clients/extension/dist-station`.

## Install the unpacked build in Chrome

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**, then choose `clients/extension/dist` for Vultisig
   or `clients/extension/dist-station` for Station.
4. Verify the extension card says `Vultisig Extension` or `Station Wallet`,
   note its extension ID, and reload the exact `dist` or `dist-station`
   directory before reviewing UI.

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
