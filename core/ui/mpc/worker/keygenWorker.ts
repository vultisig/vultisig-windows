/**
 * Keygen Web Worker entry.
 *
 * Each worker is its own JS realm with its own DKLS/Schnorr/MLDSA WASM engine
 * (configured below) — independent of the main thread and of every sibling
 * worker. That isolation is exactly what makes true parallel keygen safe: same
 * curve sessions can run concurrently across workers without corrupting WASM
 * linear memory (the constraint that forces serial-within-curve on a single
 * realm). See issue #3754.
 *
 * Relay I/O runs inside the worker too: the keygen classes talk to the relay
 * server directly, so no message buffers need to cross the worker boundary.
 */
import { DKLS } from '@vultisig/core-mpc/dkls/dkls'
import { initializeMpcLib } from '@vultisig/core-mpc/lib/initialize'
import { MldsaKeygen } from '@vultisig/core-mpc/mldsa/mldsaKeygen'
import { Schnorr } from '@vultisig/core-mpc/schnorr/schnorrKeygen'
import { memoizeAsync } from '@vultisig/lib-utils/memoizeAsync'
import { configureMpc } from '@vultisig/mpc-types'
import { WasmMpcEngine } from '@vultisig/mpc-wasm'

import {
  KeyImportProtocolSpec,
  WorkerCommand,
  WorkerRequest,
  WorkerResponse,
} from './keygenWorkerProtocol'

// This worker is its own JS realm with no engine configured. Register ONLY the
// MPC engine (DKLS/Schnorr WASM) — not the full `@vultisig/sdk`, whose
// storage/crypto/WalletCore bootstrap is far heavier and, when instantiated per
// worker, stalls the initiator's already-busy tab (issue #3754). Relay
// encryption uses node-polyfilled crypto, so the engine alone is sufficient.
configureMpc(new WasmMpcEngine())

type KeyImportInstance = {
  prepareKeyImportSetup: (
    hexPrivateKey: string,
    hexChainCode: string,
    messageId?: string
  ) => Promise<void>
  startKeyImportWithRetry: (
    hexPrivateKey: string,
    hexChainCode: string,
    setupMessageId?: string,
    protocolMessageId?: string
  ) => Promise<{ keyshare: string; publicKey: string; chaincode: string }>
}

/**
 * Warm up the worker's own WASM engine exactly once. `initializeMpcLib` ignores
 * its curve argument and initializes the whole engine (DKLS + Schnorr), so a
 * single call covers both key-import curves. Memoizing prevents a concurrent
 * double-instantiation that would corrupt freshly created Rust sessions.
 */
const ensureEngineReady = memoizeAsync(() => initializeMpcLib('ecdsa'))

const createKeyImportInstance = (
  spec: KeyImportProtocolSpec
): KeyImportInstance => {
  const { shared } = spec
  if (spec.curve === 'ecdsa') {
    return new DKLS(
      { keyimport: true },
      shared.isInitiateDevice,
      shared.serverUrl,
      shared.sessionId,
      shared.localPartyId,
      shared.signers,
      shared.oldKeygenCommittee,
      shared.hexEncryptionKey
    )
  }
  return new Schnorr(
    { keyimport: true },
    shared.isInitiateDevice,
    shared.serverUrl,
    shared.sessionId,
    shared.localPartyId,
    shared.signers,
    shared.oldKeygenCommittee,
    shared.hexEncryptionKey,
    new Uint8Array()
  )
}

const preparedProtocols = new Map<
  string,
  { instance: KeyImportInstance; spec: KeyImportProtocolSpec }
>()

const handleCommand = async (command: WorkerCommand): Promise<unknown> => {
  if (command.type === 'init') {
    await ensureEngineReady()
    return undefined
  }

  await ensureEngineReady()

  switch (command.type) {
    case 'prepare': {
      const { spec } = command
      const instance = createKeyImportInstance(spec)
      preparedProtocols.set(spec.id, { instance, spec })
      if (spec.uploadSetup) {
        await instance.prepareKeyImportSetup(
          spec.privateKeyHex,
          spec.hexChainCode,
          spec.setupMessageId
        )
      }
      return undefined
    }
    case 'exchange': {
      const prepared = preparedProtocols.get(command.id)
      if (!prepared) {
        throw new Error(`No prepared protocol for id ${command.id}`)
      }
      const { instance, spec } = prepared
      const result = await instance.startKeyImportWithRetry(
        spec.privateKeyHex,
        spec.hexChainCode,
        spec.setupMessageId,
        spec.protocolMessageId
      )
      preparedProtocols.delete(command.id)
      return result
    }
    case 'mldsa': {
      const { shared, messageId, setupMessageId } = command.spec
      const keygen = new MldsaKeygen(
        shared.isInitiateDevice,
        shared.serverUrl,
        shared.sessionId,
        shared.localPartyId,
        shared.signers,
        shared.hexEncryptionKey,
        { messageId, setupMessageId }
      )
      return keygen.startKeygenWithRetry()
    }
  }
}

const workerScope = self as unknown as {
  postMessage: (message: WorkerResponse) => void
  addEventListener: (
    type: 'message',
    listener: (event: { data: WorkerRequest }) => void
  ) => void
}

workerScope.addEventListener('message', ({ data }) => {
  const { requestId, command } = data
  handleCommand(command).then(
    result => workerScope.postMessage({ requestId, ok: true, result }),
    (error: unknown) =>
      workerScope.postMessage({
        requestId,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      })
  )
})
