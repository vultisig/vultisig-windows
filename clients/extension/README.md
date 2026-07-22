# Vultisig Browser Extension

## What is the Vultisig Browser Extension?

The browser extension connects web applications to Vultisig vaults without
storing private keys or passwords. It is built in Vultisig and Station flavors,
which share the same functionality with separate branding and build artifacts.

## How safe is it?

You only import public keys and vault information into the extension. Signing
still requires approval on your Vultisig devices because the extension only has
access to public information.

## Requirements

Before building either flavor, install:

- `Node.js` 18.10.0 or later
- Yarn 4.16.0 (the repository-pinned version, available through Corepack)

## How to Build the Extension

From the repository root, build the regular Vultisig flavor with
`yarn build:extension`. Its unpacked artifact is
`clients/extension/dist`.

Build the Station flavor with `yarn build:extension:station`. Its unpacked
artifact is `clients/extension/dist-station`. The two paths are independent so
building one flavor does not replace the other.

## How to Install it in Chrome
1. Open Chrome and go to `chrome://extensions`.
2. Enable `Developer mode` by toggling the switch in the top right corner.
3. Click `Load unpacked` and select `dist` for Vultisig or `dist-station` for
   Station.
4. Verify the extension card says `Vultisig Extension` or `Station Wallet`,
   note its extension ID, and reload the exact `dist` or `dist-station`
   directory before reviewing UI.
5. Your extension should now be installed and ready to use.

## Integration Guide

For details on integrating the extension with your project, see the [Integration Guide](docs/integration-guide.md).

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
