// MPC engine bootstrap — see vultisig/vultisig-windows#3777.
//
// `@vultisig/sdk` browser / chrome-extension bundles run a top-level `configureMpc`
// with an inlined WASM engine (SDK ≥ ~0.18). That instance is an anonymous class, so
// `constructor.name` is empty and mpc-types logs it as `Object`.
//
// This repo used to call `configureMpc(new WasmMpcEngine())` here first. After the SDK
// change, the second `configureMpc` from the SDK tripped strict duplicate detection
// (WasmMpcEngine vs anonymous engine) and the app never rendered.
//
// Pulling in the SDK platform entry once per UI realm is the single source of truth: it
// registers MPC, crypto, storage, and WalletCore init. Keep this import first in
// `CoreApp` so it runs before any `@vultisig/core-mpc` usage.
//
// Rules (unchanged):
// - Do NOT import this from background or inpage chunks — it drags the full SDK + WASM
//   into those bundles. See eslint.config.mjs and the headers of
//   clients/extension/src/{background,inpage}/index.ts.
import '@vultisig/sdk'
