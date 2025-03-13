# Vultisig Desktop & VultiConnect

This monorepo contains two main components:
1. The Vultisig Desktop Application (currently Windows-only, with support for other platforms coming soon)
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

> Note: The VultiConnect repository has been moved into this monorepo (https://github.com/vultisig/vultisig-windows) to enable code sharing between the extension and desktop application.

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
