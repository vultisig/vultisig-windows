/**
 * Configure the MPC engine singleton used by @vultisig/core-mpc.
 *
 * The SDK bundles its own copy of @vultisig/mpc-types, so its platform
 * entry-point call to configureMpc() does not reach the same module
 * instance that core-mpc reads via getMpcEngine(). This module bridges
 * the gap by calling configureMpc on the real @vultisig/mpc-types`
 * package at module-load time.
 */
import { configureMpc } from '@vultisig/mpc-types'
import { WasmMpcEngine } from '@vultisig/mpc-wasm'

configureMpc(new WasmMpcEngine())
