/**
 * Wire protocol between the main-thread {@link KeygenWorkerPool} and the keygen
 * Web Worker. Every payload here is structured-clone friendly (strings, arrays,
 * booleans) — no class instances or large buffers cross the boundary because
 * relay I/O stays inside the worker (see runKeyImportViaWorkers for the
 * relay-location tradeoff).
 */

/** Result returned by every DKLS/Schnorr key-import protocol. */
export type WorkerKeyShareResult = {
  keyshare: string
  publicKey: string
  chaincode: string
}

/** Result returned by an ML-DSA keygen (no chain code). */
export type WorkerMldsaResult = {
  keyshare: string
  publicKey: string
}

/** MPC session parameters shared by every protocol in a batch import. */
export type SharedMpcParams = {
  isInitiateDevice: boolean
  serverUrl: string
  sessionId: string
  localPartyId: string
  signers: string[]
  oldKeygenCommittee: string[]
  hexEncryptionKey: string
}

/** The two key-import curves handled by a worker (ML-DSA is single-shot). */
export const keyImportCurves = ['ecdsa', 'eddsa'] as const
export type KeyImportCurve = (typeof keyImportCurves)[number]

/**
 * A single key-import protocol pinned to one worker. The worker keeps the
 * underlying DKLS/Schnorr instance alive between the prepare and exchange
 * phases (the WASM session created during setup is reused by the exchange).
 */
export type KeyImportProtocolSpec = {
  /** Unique id; equals the protocol message id (e.g. `p-ecdsa`, `p-${chain}`). */
  id: string
  curve: KeyImportCurve
  /** True only for the initiating device, which uploads the setup message. */
  uploadSetup: boolean
  privateKeyHex: string
  hexChainCode: string
  setupMessageId: string | undefined
  protocolMessageId: string
  shared: SharedMpcParams
}

/** An ML-DSA keygen dispatched as a single-shot worker task. */
export type MldsaProtocolSpec = {
  id: string
  shared: SharedMpcParams
  messageId: string
  setupMessageId: string
}

/** Phase 1: construct the protocol instance and (initiator only) upload setup. */
export type PrepareCommand = {
  type: 'prepare'
  spec: KeyImportProtocolSpec
}

/** Phase 2: run the message exchange on the instance prepared in phase 1. */
export type ExchangeCommand = {
  type: 'exchange'
  id: string
}

/** Single-shot ML-DSA keygen. */
export type MldsaCommand = {
  type: 'mldsa'
  spec: MldsaProtocolSpec
}

/** Warm up this worker's WASM engine ahead of the timing-sensitive relay phase. */
export type InitCommand = {
  type: 'init'
}

export type WorkerCommand =
  | InitCommand
  | PrepareCommand
  | ExchangeCommand
  | MldsaCommand

/** Envelope sent to the worker, correlated by {@link WorkerResponse.requestId}. */
export type WorkerRequest = {
  requestId: number
  command: WorkerCommand
}

export type WorkerResponse =
  | { requestId: number; ok: true; result: unknown }
  | { requestId: number; ok: false; error: string }
