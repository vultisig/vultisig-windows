import {
  frozt_keyshare_bundle_key_package,
  frozt_keyshare_bundle_pub_key_package,
  frozt_pubkeypackage_verifying_key,
  FroztDkgSession,
  froztDkgSetupMsgNew,
  FroztKeyImportSession,
  froztKeyImportSetupMsgNew,
  FroztReshareSession,
  froztReshareSetupMsgNew,
  FroztSignSession,
  froztSignSetupMsgNew,
} from '../../../lib/frozt/frozt_wasm'
import { getKeygenThreshold } from '../getKeygenThreshold'
import { fromMpcServerMessage, toMpcServerMessage } from '../message/server'
import { waitForSetupMessage } from '../message/setup/get'
import { uploadMpcSetupMessage } from '../message/setup/upload'
import { FroztSessionHandle } from './froztSession'
import { initializeFrozt } from './initialize'

type FroztSessionParams = {
  serverUrl: string
  sessionId: string
  localPartyId: string
  hexEncryptionKey: string
  setupMessageId: string
  isInitiatingDevice: boolean
  signers: string[]
}

function encodePartiesData(
  signers: string[],
  preserveSignerOrder = false
): Uint8Array {
  const orderedSigners = preserveSignerOrder
    ? [...signers]
    : [...signers].sort()
  const encoder = new TextEncoder()
  const encodedNames = orderedSigners.map(name => encoder.encode(name))

  let totalSize = 2
  for (const name of encodedNames) {
    totalSize += 4 + name.length
  }

  const buf = new Uint8Array(totalSize)
  const view = new DataView(buf.buffer)
  view.setUint16(0, orderedSigners.length, true)

  let offset = 2
  for (let i = 0; i < orderedSigners.length; i++) {
    view.setUint16(offset, i + 1, true)
    offset += 2
    view.setUint16(offset, encodedNames[i].length, true)
    offset += 2
    buf.set(encodedNames[i], offset)
    offset += encodedNames[i].length
  }

  return buf
}

function getFrostId(localPartyId: string, signers: string[]): number {
  const sorted = [...signers].sort()
  return sorted.indexOf(localPartyId) + 1
}

function encodeU16List(ids: number[]): Uint8Array {
  const buf = new Uint8Array(2 + ids.length * 2)
  const view = new DataView(buf.buffer)
  view.setUint16(0, ids.length, true)
  let offset = 2
  for (const id of ids) {
    view.setUint16(offset, id, true)
    offset += 2
  }
  return buf
}

async function uploadSetup(
  setupMsg: Uint8Array,
  params: FroztSessionParams
): Promise<void> {
  const encrypted = toMpcServerMessage(setupMsg, params.hexEncryptionKey)
  await uploadMpcSetupMessage({
    serverUrl: params.serverUrl,
    message: encrypted,
    sessionId: params.sessionId,
    messageId: params.setupMessageId,
  })
}

async function fetchSetup(params: FroztSessionParams): Promise<Uint8Array> {
  const encryptedSetup = await waitForSetupMessage({
    serverUrl: params.serverUrl,
    sessionId: params.sessionId,
    messageId: params.setupMessageId,
  })
  return fromMpcServerMessage(encryptedSetup, params.hexEncryptionKey)
}

export async function createFroztKeygenSession(
  params: FroztSessionParams & { birthday: number }
): Promise<FroztSessionHandle> {
  await initializeFrozt()
  const maxSigners = params.signers.length
  const minSigners = getKeygenThreshold(maxSigners)
  const partiesData = encodePartiesData(params.signers)

  let setupMsg: Uint8Array
  if (params.isInitiatingDevice) {
    setupMsg = froztDkgSetupMsgNew(
      maxSigners,
      minSigners,
      partiesData,
      BigInt(params.birthday)
    )
    await uploadSetup(setupMsg, params)
  } else {
    setupMsg = await fetchSetup(params)
  }

  return FroztDkgSession.fromSetup(
    setupMsg,
    params.localPartyId,
    BigInt(params.birthday)
  )
}

export async function createFroztImportSession(
  params: FroztSessionParams & {
    seed: Uint8Array
    accountIndex: number
    birthday: number
  }
): Promise<FroztSessionHandle> {
  await initializeFrozt()
  const maxSigners = params.signers.length
  const minSigners = getKeygenThreshold(maxSigners)
  const partiesData = encodePartiesData(params.signers)
  const seedHolderId = getFrostId(params.localPartyId, params.signers)

  let setupMsg: Uint8Array
  if (params.isInitiatingDevice) {
    setupMsg = froztKeyImportSetupMsgNew(
      maxSigners,
      minSigners,
      partiesData,
      BigInt(params.birthday),
      seedHolderId,
      params.seed,
      params.accountIndex
    )
    await uploadSetup(setupMsg, params)
  } else {
    setupMsg = await fetchSetup(params)
  }

  const session = FroztKeyImportSession.fromSetup(
    setupMsg,
    params.localPartyId,
    params.seed,
    params.accountIndex,
    BigInt(params.birthday)
  )
  return session
}

export async function createFroztReshareSession(
  params: FroztSessionParams & {
    oldBundle: Uint8Array
    oldParties: string[]
  }
): Promise<FroztSessionHandle> {
  await initializeFrozt()
  const maxSigners = params.signers.length
  const minSigners = getKeygenThreshold(maxSigners)
  const partiesData = encodePartiesData(params.signers)

  let setupMsg: Uint8Array
  if (params.isInitiatingDevice) {
    const sortedOldParties = [...params.oldParties].sort()
    const signerSet = new Set(params.signers)
    const oldIdentifiersData = encodeU16List(
      sortedOldParties.flatMap((party, index) =>
        signerSet.has(party) ? [index + 1] : []
      )
    )

    const expectedVk = frozt_pubkeypackage_verifying_key(
      frozt_keyshare_bundle_pub_key_package(params.oldBundle)
    )

    setupMsg = froztReshareSetupMsgNew(
      maxSigners,
      minSigners,
      partiesData,
      oldIdentifiersData,
      expectedVk
    )
    await uploadSetup(setupMsg, params)
  } else {
    setupMsg = await fetchSetup(params)
  }

  return FroztReshareSession.fromSetup(
    setupMsg,
    params.localPartyId,
    frozt_keyshare_bundle_key_package(params.oldBundle)
  )
}

export async function createFroztSignSession(
  params: FroztSessionParams & {
    msgToSign: Uint8Array
    keyPackage: Uint8Array
    pubKeyPackage: Uint8Array
  }
): Promise<FroztSessionHandle> {
  await initializeFrozt()
  // Sign setup must preserve the key-package identifier mapping from keygen/import.
  const partiesData = encodePartiesData(params.signers)

  let setupMsg: Uint8Array
  if (params.isInitiatingDevice) {
    setupMsg = froztSignSetupMsgNew(params.msgToSign, partiesData)
    await uploadSetup(setupMsg, params)
  } else {
    setupMsg = await fetchSetup(params)
  }

  return FroztSignSession.fromSetup(
    setupMsg,
    params.localPartyId,
    params.keyPackage,
    params.pubKeyPackage
  )
}

export async function createFroztSignSessionWithAlpha(
  params: FroztSessionParams & {
    msgToSign: Uint8Array
    keyPackage: Uint8Array
    pubKeyPackage: Uint8Array
    alpha: Uint8Array
  }
): Promise<FroztSessionHandle> {
  await initializeFrozt()
  // Sapling alpha changes signing randomness, not signer identifiers.
  const partiesData = encodePartiesData(params.signers)

  let setupMsg: Uint8Array
  if (params.isInitiatingDevice) {
    setupMsg = froztSignSetupMsgNew(params.msgToSign, partiesData)
    await uploadSetup(setupMsg, params)
  } else {
    setupMsg = await fetchSetup(params)
  }

  return FroztSignSession.fromSetupWithAlpha(
    setupMsg,
    params.localPartyId,
    params.keyPackage,
    params.pubKeyPackage,
    params.alpha
  )
}
