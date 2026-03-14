import {
  fromt_derive_keys_from_seed,
  fromt_derive_spend_pub_key,
  FromtDkgSession,
  fromtDkgSetupMsgNew,
  FromtKeyImageSession,
  fromtKeyImageSetupMsgNew,
  FromtKeyImportSession,
  fromtKeyImportSetupMsgNew,
  FromtReshareSession,
  fromtReshareSetupMsgNew,
} from '../../../lib/fromt/fromt_wasm'
import { getKeygenThreshold } from '../getKeygenThreshold'
import { fromMpcServerMessage, toMpcServerMessage } from '../message/server'
import { waitForSetupMessage } from '../message/setup/get'
import { uploadMpcSetupMessage } from '../message/setup/upload'
import { extractFromtKeyPackage } from './fromtBundle'
import { FromtSessionHandle } from './fromtSession'
import { initializeFromt } from './initialize'

type FromtSessionParams = {
  serverUrl: string
  sessionId: string
  localPartyId: string
  hexEncryptionKey: string
  setupMessageId: string
  isInitiatingDevice: boolean
  signers: string[]
}

function encodePartiesData(signers: string[]): Uint8Array {
  const sorted = [...signers].sort()
  const encoder = new TextEncoder()
  const encodedNames = sorted.map(name => encoder.encode(name))

  let totalSize = 2
  for (const name of encodedNames) {
    totalSize += 4 + name.length
  }

  const buf = new Uint8Array(totalSize)
  const view = new DataView(buf.buffer)
  view.setUint16(0, sorted.length, true)

  let offset = 2
  for (let i = 0; i < sorted.length; i++) {
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
  params: FromtSessionParams
): Promise<void> {
  const encrypted = toMpcServerMessage(setupMsg, params.hexEncryptionKey)
  await uploadMpcSetupMessage({
    serverUrl: params.serverUrl,
    message: encrypted,
    sessionId: params.sessionId,
    messageId: params.setupMessageId,
  })
}

async function fetchSetup(params: FromtSessionParams): Promise<Uint8Array> {
  const encryptedSetup = await waitForSetupMessage({
    serverUrl: params.serverUrl,
    sessionId: params.sessionId,
    messageId: params.setupMessageId,
  })
  return fromMpcServerMessage(encryptedSetup, params.hexEncryptionKey)
}

const moneroMainnet = 0

export async function createFromtKeygenSession(
  params: FromtSessionParams & { birthday: number }
): Promise<FromtSessionHandle> {
  await initializeFromt()
  const maxSigners = params.signers.length
  const minSigners = getKeygenThreshold(maxSigners)
  const partiesData = encodePartiesData(params.signers)

  let setupMsg: Uint8Array
  if (params.isInitiatingDevice) {
    setupMsg = fromtDkgSetupMsgNew(
      maxSigners,
      minSigners,
      partiesData,
      moneroMainnet,
      BigInt(params.birthday)
    )
    await uploadSetup(setupMsg, params)
  } else {
    setupMsg = await fetchSetup(params)
  }

  return FromtDkgSession.fromSetup(
    setupMsg,
    params.localPartyId,
    moneroMainnet,
    BigInt(params.birthday)
  )
}

export async function createFromtImportSession(
  params: FromtSessionParams & {
    seed: Uint8Array
    spendKey?: Uint8Array
    birthday: number
  }
): Promise<FromtSessionHandle> {
  await initializeFromt()
  const maxSigners = params.signers.length
  const minSigners = getKeygenThreshold(maxSigners)
  const partiesData = encodePartiesData(params.signers)
  const seedHolderId = getFrostId(params.localPartyId, params.signers)

  const derivedKeys =
    params.spendKey == null && params.seed.length > 0
      ? fromt_derive_keys_from_seed(params.seed)
      : null
  const spendKey =
    params.spendKey ??
    (derivedKeys ? derivedKeys.slice(0, 32) : new Uint8Array())

  let setupMsg: Uint8Array
  if (params.isInitiatingDevice) {
    setupMsg = fromtKeyImportSetupMsgNew(
      maxSigners,
      minSigners,
      partiesData,
      moneroMainnet,
      BigInt(params.birthday),
      seedHolderId,
      spendKey,
      0
    )
    await uploadSetup(setupMsg, params)
  } else {
    setupMsg = await fetchSetup(params)
  }

  const session = FromtKeyImportSession.fromSetup(
    setupMsg,
    params.localPartyId,
    spendKey,
    moneroMainnet,
    BigInt(params.birthday)
  )
  return session
}

export async function createFromtKeyImageSession(
  params: FromtSessionParams & {
    keyShare: Uint8Array
    outputs: Uint8Array
  }
): Promise<FromtSessionHandle> {
  await initializeFromt()
  const partiesData = encodePartiesData(params.signers)

  let setupMsg: Uint8Array
  if (params.isInitiatingDevice) {
    setupMsg = fromtKeyImageSetupMsgNew(partiesData, params.outputs)
    await uploadSetup(setupMsg, params)
  } else {
    setupMsg = await fetchSetup(params)
  }

  return FromtKeyImageSession.fromSetup(
    setupMsg,
    params.localPartyId,
    params.keyShare
  )
}

export async function createFromtReshareSession(
  params: FromtSessionParams & {
    oldKeyShare: Uint8Array
    oldParties: string[]
  }
): Promise<FromtSessionHandle> {
  await initializeFromt()
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
    const expectedVk = fromt_derive_spend_pub_key(params.oldKeyShare)

    setupMsg = fromtReshareSetupMsgNew(
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

  return FromtReshareSession.fromSetup(
    setupMsg,
    params.localPartyId,
    extractFromtKeyPackage(params.oldKeyShare)
  )
}
