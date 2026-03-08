import {
  encode_map,
  frozt_encode_identifier,
  frozt_pubkeypackage_verifying_key,
  FroztDkgSession,
  froztDkgSetupMsgNew,
  FroztKeyImportSession,
  froztKeyImportSetupMsgNew,
  FroztReshareSession,
  froztReshareSetupMsgNew,
} from '../../../lib/frozt/frozt_wasm'
import { getKeygenThreshold } from '../getKeygenThreshold'
import { fromMpcServerMessage, toMpcServerMessage } from '../message/server'
import { waitForSetupMessage } from '../message/setup/get'
import { uploadMpcSetupMessage } from '../message/setup/upload'
import { FroztSessionHandle } from './froztSession'
import { initializeFrozt } from './initialize'

const factoryLog = (tag: string, ...args: unknown[]) =>
  console.log(`[frozt-factory][${tag}]`, ...args)

type FroztSessionParams = {
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

  factoryLog('import', {
    maxSigners,
    minSigners,
    seedHolderId,
    birthday: params.birthday,
    isInitiating: params.isInitiatingDevice,
    setupMessageId: params.setupMessageId,
    seedLength: params.seed.length,
  })

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
    factoryLog('import', `setup created, size=${setupMsg.length}, uploading`)
    await uploadSetup(setupMsg, params)
    factoryLog('import', 'setup uploaded')
  } else {
    factoryLog('import', 'fetching setup from relay')
    setupMsg = await fetchSetup(params)
    factoryLog('import', `setup fetched, size=${setupMsg.length}`)
  }

  factoryLog('import', 'creating FroztKeyImportSession from setup')
  const session = FroztKeyImportSession.fromSetup(
    setupMsg,
    params.localPartyId,
    params.seed,
    params.accountIndex,
    BigInt(params.birthday)
  )
  factoryLog('import', 'session created')
  return session
}

export async function createFroztReshareSession(
  params: FroztSessionParams & {
    oldKeyPackage: Uint8Array
    oldPubKeyPackage?: Uint8Array
  }
): Promise<FroztSessionHandle> {
  await initializeFrozt()
  const maxSigners = params.signers.length
  const minSigners = getKeygenThreshold(maxSigners)
  const partiesData = encodePartiesData(params.signers)

  let setupMsg: Uint8Array
  if (params.isInitiatingDevice) {
    const sorted = [...params.signers].sort()
    const oldIdEntries = sorted.map((_, i) => ({
      id: i + 1,
      value: frozt_encode_identifier(i + 1),
    }))
    const oldIdentifiersData = encode_map(oldIdEntries)

    const expectedVk = params.oldPubKeyPackage
      ? frozt_pubkeypackage_verifying_key(params.oldPubKeyPackage)
      : new Uint8Array()

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
    params.oldKeyPackage
  )
}
