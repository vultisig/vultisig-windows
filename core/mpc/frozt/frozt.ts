import { base64Encode } from '@lib/utils/base64Encode'
import {
  createKeygenMetadata,
  createKeygenMetadataWithExtras,
  decodeMap,
  encodeMap,
  hashKeygenMetadata,
  keygen,
  keyImport,
  packBundle,
  parseKeygenMetadata,
  reshare,
} from '@vultisig/frozt-sdk'
import { frozt_encode_identifier } from 'frozt-wasm'

import { getKeygenThreshold } from '../getKeygenThreshold'
import { getMessageHash } from '../getMessageHash'
import { MpcRelayMessage } from '../message/relay'
import { deleteMpcRelayMessage } from '../message/relay/delete'
import { getMpcRelayMessages } from '../message/relay/get'
import { sendMpcRelayMessage } from '../message/relay/send'
import { fromMpcServerMessage, toMpcServerMessage } from '../message/server'
import { sleep } from '../sleep'
import { initializeFrozt } from './initialize'

export type FroztKeygenResult = {
  bundle: string
  pubKeyPackage: string
  saplingExtras: string
  birthday: number
}

export class Frozt {
  private readonly isInitiateDevice: boolean
  private readonly serverURL: string
  private readonly sessionId: string
  private readonly localPartyId: string
  private readonly keygenCommittee: string[]
  private readonly hexEncryptionKey: string
  private readonly timeoutMs: number

  constructor(
    isInitiateDevice: boolean,
    serverURL: string,
    sessionId: string,
    localPartyId: string,
    keygenCommittee: string[],
    hexEncryptionKey: string,
    timeoutMs?: number
  ) {
    this.isInitiateDevice = isInitiateDevice
    this.serverURL = serverURL
    this.sessionId = sessionId
    this.localPartyId = localPartyId
    this.keygenCommittee = keygenCommittee
    this.hexEncryptionKey = hexEncryptionKey
    this.timeoutMs = timeoutMs ?? 60000
  }

  private getMyFrostId(): number {
    const sorted = [...this.keygenCommittee].sort()
    const idx = sorted.indexOf(this.localPartyId)
    return idx + 1
  }

  private getFrostIdForParty(partyId: string): number {
    const sorted = [...this.keygenCommittee].sort()
    const idx = sorted.indexOf(partyId)
    return idx + 1
  }

  private async broadcastMessage(
    body: Uint8Array,
    messageId: string
  ): Promise<void> {
    const encrypted = toMpcServerMessage(body, this.hexEncryptionKey)
    const peers = this.keygenCommittee.filter(p => p !== this.localPartyId)

    for (const peer of peers) {
      const relayMessage: MpcRelayMessage = {
        session_id: this.sessionId,
        from: this.localPartyId,
        to: [peer],
        body: encrypted,
        hash: getMessageHash(base64Encode(body)),
        sequence_no: 0,
      }
      await sendMpcRelayMessage({
        serverUrl: this.serverURL,
        sessionId: this.sessionId,
        message: relayMessage,
        messageId,
      })
    }
  }

  private async sendToParty(
    body: Uint8Array,
    targetPartyId: string,
    messageId: string
  ): Promise<void> {
    const encrypted = toMpcServerMessage(body, this.hexEncryptionKey)
    const relayMessage: MpcRelayMessage = {
      session_id: this.sessionId,
      from: this.localPartyId,
      to: [targetPartyId],
      body: encrypted,
      hash: getMessageHash(base64Encode(body)),
      sequence_no: 0,
    }
    await sendMpcRelayMessage({
      serverUrl: this.serverURL,
      sessionId: this.sessionId,
      message: relayMessage,
      messageId,
    })
  }

  private async collectMessages(
    messageId: string,
    expectedCount: number,
    start: number
  ): Promise<Map<string, Uint8Array>> {
    const collected = new Map<string, Uint8Array>()
    const seen = new Set<string>()

    while (collected.size < expectedCount) {
      const elapsed = Date.now() - start
      if (elapsed > this.timeoutMs) {
        throw new Error(
          `frozt: timeout collecting messages for ${messageId}, got ${collected.size}/${expectedCount}`
        )
      }

      const messages = await getMpcRelayMessages({
        serverUrl: this.serverURL,
        localPartyId: this.localPartyId,
        sessionId: this.sessionId,
        messageId,
      })

      for (const msg of messages) {
        const cacheKey = `${msg.session_id}-${msg.from}-${msg.hash}`
        if (seen.has(cacheKey)) {
          continue
        }
        seen.add(cacheKey)

        const decrypted = fromMpcServerMessage(msg.body, this.hexEncryptionKey)
        collected.set(msg.from, decrypted)

        await deleteMpcRelayMessage({
          serverUrl: this.serverURL,
          localPartyId: this.localPartyId,
          sessionId: this.sessionId,
          messageHash: msg.hash,
          messageId,
        })
      }

      if (collected.size < expectedCount) {
        await sleep(100)
      }
    }

    return collected
  }

  private buildFrostMap(partyDataMap: Map<string, Uint8Array>): Uint8Array {
    const entries: Array<{ id: number; value: Uint8Array }> = []
    for (const [partyId, data] of partyDataMap) {
      const frostId = this.getFrostIdForParty(partyId)
      entries.push({ id: frostId, value: data })
    }
    return encodeMap(entries)
  }

  private async exchangeMetadata(
    birthday: number,
    existingExtras?: Uint8Array
  ): Promise<{ extras: Uint8Array; birthday: number; metadata: Uint8Array }> {
    const start = Date.now()
    const isCoordinator = this.isInitiateDevice

    let metadataBytes: Uint8Array
    if (isCoordinator) {
      if (existingExtras) {
        metadataBytes = createKeygenMetadataWithExtras(existingExtras, birthday)
      } else {
        const result = createKeygenMetadata(birthday)
        metadataBytes = result.metadata
      }
      await this.broadcastMessage(metadataBytes, 'frozt-metadata')
    } else {
      const messages = await this.collectMessages('frozt-metadata', 1, start)
      metadataBytes = messages.values().next().value!
    }

    const parsed = parseKeygenMetadata(metadataBytes)
    const metadataHash = hashKeygenMetadata(metadataBytes)
    await this.broadcastMessage(metadataHash, 'frozt-metadata-hash')
    const peerHashes = await this.collectMessages(
      'frozt-metadata-hash',
      this.keygenCommittee.length - 1,
      start
    )
    const myHashHex = Array.from(metadataHash)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    for (const [partyId, peerHash] of peerHashes) {
      const peerHashHex = Array.from(peerHash)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      if (peerHashHex !== myHashHex) {
        throw new Error(`frozt metadata hash mismatch with ${partyId}`)
      }
    }

    return {
      extras: parsed.extras,
      birthday: Number(parsed.birthday),
      metadata: metadataBytes,
    }
  }

  private packBundle(
    keyPackage: Uint8Array,
    pubKeyPackage: Uint8Array,
    extras: Uint8Array,
    birthday: number
  ): FroztKeygenResult {
    const bundle = packBundle(keyPackage, pubKeyPackage, extras, birthday)
    return {
      bundle: base64Encode(bundle),
      pubKeyPackage: base64Encode(pubKeyPackage),
      saplingExtras: base64Encode(extras),
      birthday,
    }
  }

  private async startKeygen(birthday: number): Promise<FroztKeygenResult> {
    const myId = this.getMyFrostId()
    const maxSigners = this.keygenCommittee.length
    const minSigners = getKeygenThreshold(maxSigners)
    const peerCount = maxSigners - 1
    const start = Date.now()

    const r1Result = keygen.part1(myId, maxSigners, minSigners)
    const r1Secret: Uint8Array = r1Result.secret
    const r1Package: Uint8Array = r1Result.package

    await this.broadcastMessage(r1Package, 'frozt-r1')
    const r1Messages = await this.collectMessages('frozt-r1', peerCount, start)
    const r1Map = this.buildFrostMap(r1Messages)

    const r2Result = keygen.part2(r1Secret, r1Map)
    const r2Secret: Uint8Array = r2Result.secret
    const r2PackagesEncoded: Uint8Array = r2Result.packages
    const r2Packages: Array<{ id: number; value: Uint8Array }> =
      decodeMap(r2PackagesEncoded)

    const sorted = [...this.keygenCommittee].sort()
    for (const { id: targetFrostId, value: pkgData } of r2Packages) {
      const targetIdx = targetFrostId - 1
      const targetPartyId = sorted[targetIdx]
      if (targetPartyId && targetPartyId !== this.localPartyId) {
        await this.sendToParty(pkgData, targetPartyId, 'frozt-r2')
      }
    }

    const r2Messages = await this.collectMessages('frozt-r2', peerCount, start)
    const r2Map = this.buildFrostMap(r2Messages)

    const r3Result = keygen.part3(r2Secret, r1Map, r2Map)
    const keyPackage: Uint8Array = r3Result.keyPackage
    const pubKeyPackage: Uint8Array = r3Result.pubKeyPackage

    const { extras, birthday: parsedBirthday } =
      await this.exchangeMetadata(birthday)

    return this.packBundle(keyPackage, pubKeyPackage, extras, parsedBirthday)
  }

  public async startKeygenWithRetry(
    birthday: number
  ): Promise<FroztKeygenResult> {
    await initializeFrozt()

    for (let i = 0; i < 3; i++) {
      try {
        return await this.startKeygen(birthday)
      } catch (error) {
        console.error(`frozt keygen attempt ${i} failed:`, error)
      }
    }
    throw new Error('frozt keygen failed after 3 attempts')
  }

  private async startReshare(
    oldKeyshare?: string,
    oldPubKeyPackage?: string,
    oldSaplingExtras?: string,
    oldBirthday?: number
  ): Promise<FroztKeygenResult> {
    const myId = this.getMyFrostId()
    const maxSigners = this.keygenCommittee.length
    const minSigners = getKeygenThreshold(maxSigners)
    const peerCount = maxSigners - 1
    const start = Date.now()

    let oldKp: Uint8Array | null = null
    if (oldKeyshare) {
      oldKp = Buffer.from(oldKeyshare, 'base64')
    }

    const sorted = [...this.keygenCommittee].sort()
    const oldIdentifiersEntries: Array<{ id: number; value: Uint8Array }> = []
    for (let i = 0; i < sorted.length; i++) {
      const idBytes = frozt_encode_identifier(i + 1)
      oldIdentifiersEntries.push({ id: i + 1, value: idBytes })
    }
    const oldIdentifiers = encodeMap(oldIdentifiersEntries)

    const r1Result = reshare.part1(
      myId,
      maxSigners,
      minSigners,
      oldKp,
      oldIdentifiers
    )
    const r1Secret: Uint8Array = r1Result.secret
    const r1Package: Uint8Array = r1Result.package

    await this.broadcastMessage(r1Package, 'frozt-r1')
    const r1Messages = await this.collectMessages('frozt-r1', peerCount, start)
    const r1Map = this.buildFrostMap(r1Messages)

    const r2Result = keygen.part2(r1Secret, r1Map)
    const r2Secret: Uint8Array = r2Result.secret
    const r2PackagesEncoded: Uint8Array = r2Result.packages
    const r2Packages: Array<{ id: number; value: Uint8Array }> =
      decodeMap(r2PackagesEncoded)

    for (const { id: targetFrostId, value: pkgData } of r2Packages) {
      const targetIdx = targetFrostId - 1
      const targetPartyId = sorted[targetIdx]
      if (targetPartyId && targetPartyId !== this.localPartyId) {
        await this.sendToParty(pkgData, targetPartyId, 'frozt-r2')
      }
    }

    const r2Messages = await this.collectMessages('frozt-r2', peerCount, start)
    const r2Map = this.buildFrostMap(r2Messages)

    let expectedVk = new Uint8Array()
    if (oldPubKeyPackage) {
      expectedVk = Buffer.from(oldPubKeyPackage, 'base64')
    }

    const r3Result = reshare.part3(r2Secret, r1Map, r2Map, expectedVk)
    const keyPackage: Uint8Array = r3Result.keyPackage
    const pubKeyPackage: Uint8Array = r3Result.pubKeyPackage

    const extras = oldSaplingExtras
      ? Buffer.from(oldSaplingExtras, 'base64')
      : new Uint8Array()
    const birthday = oldBirthday ?? 0

    return this.packBundle(keyPackage, pubKeyPackage, extras, birthday)
  }

  public async startReshareWithRetry(
    oldKeyshare?: string,
    oldPubKeyPackage?: string,
    oldSaplingExtras?: string,
    oldBirthday?: number
  ): Promise<FroztKeygenResult> {
    await initializeFrozt()

    for (let i = 0; i < 3; i++) {
      try {
        return await this.startReshare(
          oldKeyshare,
          oldPubKeyPackage,
          oldSaplingExtras,
          oldBirthday
        )
      } catch (error) {
        console.error(`frozt reshare attempt ${i} failed:`, error)
      }
    }
    throw new Error('frozt reshare failed after 3 attempts')
  }

  private async startKeyImport(
    birthday: number,
    seed?: Uint8Array,
    accountIndex: number = 0
  ): Promise<FroztKeygenResult> {
    const myId = this.getMyFrostId()
    const maxSigners = this.keygenCommittee.length
    const minSigners = getKeygenThreshold(maxSigners)
    const peerCount = maxSigners - 1
    const start = Date.now()
    const isCoordinator = seed !== undefined && seed.length > 0

    const r1Result = keyImport.part1(
      myId,
      maxSigners,
      minSigners,
      isCoordinator ? seed : null,
      accountIndex
    )
    const r1Secret: Uint8Array = r1Result.secret
    const r1Package: Uint8Array = r1Result.package

    await this.broadcastMessage(r1Package, 'frozt-r1')
    const r1Messages = await this.collectMessages('frozt-r1', peerCount, start)
    const r1Map = this.buildFrostMap(r1Messages)

    const r2Result = keygen.part2(r1Secret, r1Map)
    const r2Secret: Uint8Array = r2Result.secret
    const r2PackagesEncoded: Uint8Array = r2Result.packages
    const r2Packages: Array<{ id: number; value: Uint8Array }> =
      decodeMap(r2PackagesEncoded)

    const sorted = [...this.keygenCommittee].sort()
    for (const { id: targetFrostId, value: pkgData } of r2Packages) {
      const targetIdx = targetFrostId - 1
      const targetPartyId = sorted[targetIdx]
      if (targetPartyId && targetPartyId !== this.localPartyId) {
        await this.sendToParty(pkgData, targetPartyId, 'frozt-r2')
      }
    }

    const r2Messages = await this.collectMessages('frozt-r2', peerCount, start)
    const r2Map = this.buildFrostMap(r2Messages)

    let expectedVk: Uint8Array
    if (isCoordinator) {
      expectedVk = r1Result.verifyingKey
      await this.broadcastMessage(expectedVk, 'frozt-expected-vk')
    } else {
      const vkMessages = await this.collectMessages(
        'frozt-expected-vk',
        1,
        start
      )
      expectedVk = vkMessages.values().next().value!
    }

    const r3Result = keyImport.part3(r2Secret, r1Map, r2Map, expectedVk)
    const keyPackage: Uint8Array = r3Result.keyPackage
    const pubKeyPackage: Uint8Array = r3Result.pubKeyPackage

    const existingExtras = isCoordinator ? r1Result.extras : undefined
    const { extras, birthday: parsedBirthday } = await this.exchangeMetadata(
      birthday,
      existingExtras
    )

    return this.packBundle(keyPackage, pubKeyPackage, extras, parsedBirthday)
  }

  public async startKeyImportWithRetry(
    birthday: number,
    seed?: Uint8Array,
    accountIndex: number = 0
  ): Promise<FroztKeygenResult> {
    await initializeFrozt()

    for (let i = 0; i < 3; i++) {
      try {
        return await this.startKeyImport(birthday, seed, accountIndex)
      } catch (error) {
        console.error(`frozt key import attempt ${i} failed:`, error)
      }
    }
    throw new Error('frozt key import failed after 3 attempts')
  }
}
