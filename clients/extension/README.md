# VultiConnect

## What is VultiConnect
VultiConnect is a Chrome extension similar to MetaMask but much safer. It does not store any critical information such as private keys or passwords. Instead, it allows you to connect your Vultisig app to DeFi applications, enabling you to interact with them and sign transactions on your devices.

## How Safe is VultiConnect
You only need to import public keys and vault information into VultiConnect. Unlike MetaMask, if someone hacks your Chrome or the extension, they cannot execute transactions without your approval on your Vultisig devices, as they only have access to public information.

## Requirements
Before building VultiConnect, ensure you have the following installed:
- `Node.js` (version 18.10.0 or later)
- `pnpm` (for managing packages)
- `npm` (if you need it for specific tasks)

## How to Build the VultiConnect Extension
To build the VultiConnect extension, follow these steps:
1. Clone the repository:
   `git clone https://github.com/vultisig/vulticonnect.git`
2. Navigate to the project directory:
   `cd vulticonnect`
3. Install the necessary dependencies using pnpm:
   `pnpm install`
4. Build the project for production:
   `pnpm run build`

## How to Install it in Chrome
1. Open Chrome and go to `chrome://extensions`.
2. Enable `Developer mode` by toggling the switch in the top right corner.
3. Click on `Load unpacked` and select the *dist* folder from the VultiConnect project directory.
4. Your extension should now be installed and ready to use.

## Integration Guide

For details on integrating VultiConnect with your project, see the [Integration Guide](docs/integration-guide.md).

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
