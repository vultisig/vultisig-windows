// Registers the MPC engine on the @vultisig/mpc-types module singleton.
// @vultisig/core-mpc calls getMpcEngine() lazily and throws if this never runs,
// so each chunk entry that may touch MPC must import this module first — before
// any other @vultisig/* import. Each bundle is a separate module graph, so the
// registration must happen once per chunk.
import { configureMpc } from '@vultisig/mpc-types'
import { WasmMpcEngine } from '@vultisig/mpc-wasm'

configureMpc(new WasmMpcEngine())
