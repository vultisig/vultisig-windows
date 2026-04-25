// MPC engine bootstrap shim — see vultisig/vultisig-windows#3777 postmortem.
//
// @vultisig/core-mpc lazily calls getMpcEngine() on @vultisig/mpc-types and
// throws "MPC engine not configured" if nothing registered one. The SDK now
// anchors this singleton on globalThis (runtimeStore pattern), which fixes the
// cross-chunk duplication bug on its own. We still keep this shim because:
//
// 1. MV3 realms. The extension service worker, popup, and inpage script each
//    run in a separate JS realm with their own globalThis. Every realm that
//    can reach MPC code must import this file once at its entrypoint.
// 2. Tree-shaking. Even with `sideEffects` declared in the SDK package, a
//    consumer that only imports types from @vultisig/core-mpc can still have
//    the platform entry's top-level configure call dropped. Importing this
//    shim as a side-effect is the explicit, unshakeable anchor.
// 3. Defence in depth. A future bundler or chunking change could regress the
//    SDK-side fix; this shim catches it before it ships.
//
// Rules:
// - Import this file FIRST in every realm entrypoint that may touch MPC.
// - Do NOT import it from background or inpage chunks that never call
//   getMpcEngine() — it drags DKLS/Schnorr WASM into their bundles. See the
//   no-restricted-imports rule in eslint.config.mjs and the headers of
//   clients/extension/src/{background,inpage}/index.ts.
import { configureMpc } from '@vultisig/mpc-types'
import { WasmMpcEngine } from '@vultisig/mpc-wasm'

configureMpc(new WasmMpcEngine())
