// MPC engine bootstrap — see vultisig/vultisig-windows#3777 and #4937.
//
// `@vultisig/sdk` browser / chrome-extension bundles run a top-level `configureMpc`
// with an inlined WASM engine. Evaluating the SDK entry is what registers the engine
// that `@vultisig/core-mpc` reaches through `@vultisig/mpc-types`, and nothing else
// may register one: a second registration trips the SDK's duplicate detection.
//
// The entry is loaded on demand instead of imported for its side effect, so the
// extension's action popup keeps the SDK, and everything it drags in (WalletCore
// glue, MPC WASM glue, chain clients), out of the chunk it evaluates before home
// paints. Every path that reaches the engine awaits `loadMpcEngine()` first:
// key-share reading, the keygen mutation, keysign, agent plugin installs.
// Clients that boot behind a splash await it in `MpcEngineGate`. A path
// that forgets fails loudly: `getMpcEngine` throws, and `ensureMpcEngine` cannot
// fall back because `@vultisig/mpc-wasm` is not installed.
//
// Rules (unchanged):
// - Do NOT import this from background or inpage chunks — it drags the full SDK + WASM
//   into those bundles. See eslint.config.mjs and the headers of
//   clients/extension/src/{background,inpage}/index.ts.

import { memoizeAsync } from '@vultisig/lib-utils/memoizeAsync'

/**
 * Loads the SDK platform entry once per realm, which registers the MPC engine
 * as a side effect, and resolves to the SDK module so code that needs one of
 * its helpers shares the same load. Await it before the first MPC operation on
 * any path. A failed load is not cached, so the next call retries.
 */
export const loadMpcEngine = memoizeAsync(() => import('@vultisig/sdk'))
