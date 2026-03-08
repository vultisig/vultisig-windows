import { base64Encode } from '@lib/utils/base64Encode'
import { encodeMap, signing } from '@vultisig/frozt-sdk'
import { frozt_encode_identifier } from 'frozt-wasm'

import { getMessageHash } from '../getMessageHash'
import { MpcRelayMessage } from '../message/relay'
import { deleteMpcRelayMessage } from '../message/relay/delete'
import { getMpcRelayMessages } from '../message/relay/get'
import { sendMpcRelayMessage } from '../message/relay/send'
import { fromMpcServerMessage, toMpcServerMessage } from '../message/server'
import { sleep } from '../sleep'
import { initializeFrozt } from './initialize'

export class FroztKeysign {
  private readonly isCoordinator: boolean
  private readonly serverURL: string
  private readonly sessionId: string
  private readonly localPartyId: string
  private readonly signingCommittee: string[]
  private readonly hexEncryptionKey: string
  private readonly timeoutMs: number

  constructor(
    isCoordinator: boolean,
    serverURL: string,
    sessionId: string,
    localPartyId: string,
    signingCommittee: string[],
    hexEncryptionKey: string,
    timeoutMs?: number
  ) {
    this.isCoordinator = isCoordinator
    this.serverURL = serverURL
    this.sessionId = sessionId
    this.localPartyId = localPartyId
    this.signingCommittee = signingCommittee
    this.hexEncryptionKey = hexEncryptionKey
    this.timeoutMs = timeoutMs ?? 60000
  }

  private getFrostIdForParty(partyId: string): number {
    const sorted = [...this.signingCommittee].sort()
    const idx = sorted.indexOf(partyId)
    return idx + 1
  }

  private async broadcastMessage(
    body: Uint8Array,
    messageId: string
  ): Promise<void> {
    const encrypted = toMpcServerMessage(body, this.hexEncryptionKey)
    const peers = this.signingCommittee.filter(p => p !== this.localPartyId)

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
          `frozt sign: timeout collecting ${messageId}, got ${collected.size}/${expectedCount}`
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

  private async collectSingleMessage(
    messageId: string,
    start: number
  ): Promise<Uint8Array> {
    const seen = new Set<string>()

    while (true) {
      const elapsed = Date.now() - start
      if (elapsed > this.timeoutMs) {
        throw new Error(`frozt sign: timeout waiting for ${messageId}`)
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

        await deleteMpcRelayMessage({
          serverUrl: this.serverURL,
          localPartyId: this.localPartyId,
          sessionId: this.sessionId,
          messageHash: msg.hash,
          messageId,
        })

        return decrypted
      }

      await sleep(100)
    }
  }

  public async sign(
    message: Uint8Array,
    keyPackageBase64: string,
    pubKeyPackageBase64: string
  ): Promise<Uint8Array> {
    await initializeFrozt()

    const keyPackage = Buffer.from(keyPackageBase64, 'base64')
    const pubKeyPackage = Buffer.from(pubKeyPackageBase64, 'base64')
    const peerCount = this.signingCommittee.length - 1
    const start = Date.now()

    const commitResult = signing.commit(keyPackage)
    const nonces: number = commitResult.nonces
    const commitments: Uint8Array = commitResult.commitments

    await this.broadcastMessage(commitments, 'frozt-commit')

    if (this.isCoordinator) {
      const peerCommitments = await this.collectMessages(
        'frozt-commit',
        peerCount,
        start
      )

      const allCommitmentsEntries: Array<[Uint8Array, Uint8Array]> = []

      const myFrostId = this.getFrostIdForParty(this.localPartyId)
      const myIdBytes = frozt_encode_identifier(myFrostId)
      allCommitmentsEntries.push([myIdBytes, commitments])

      for (const [partyId, data] of peerCommitments) {
        const frostId = this.getFrostIdForParty(partyId)
        const idBytes = frozt_encode_identifier(frostId)
        allCommitmentsEntries.push([idBytes, data])
      }

      const commitmentsMap = encodeMap(allCommitmentsEntries)

      const pkgResult = signing.newPackage(
        message,
        commitmentsMap,
        pubKeyPackage
      )
      const signingPackage: Uint8Array = pkgResult.signing_package
      const randomizer: Uint8Array = pkgResult.randomizer

      const payload = new Uint8Array(
        4 + signingPackage.length + randomizer.length
      )
      const spLen = signingPackage.length
      payload[0] = (spLen >> 24) & 0xff
      payload[1] = (spLen >> 16) & 0xff
      payload[2] = (spLen >> 8) & 0xff
      payload[3] = spLen & 0xff
      payload.set(signingPackage, 4)
      payload.set(randomizer, 4 + signingPackage.length)

      await this.broadcastMessage(payload, 'frozt-pkg')

      const myShare = signing.sign(
        signingPackage,
        nonces,
        keyPackage,
        randomizer
      )

      const peerShares = await this.collectMessages(
        'frozt-share',
        peerCount,
        start
      )

      const sharesEntries: Array<[Uint8Array, Uint8Array]> = []
      sharesEntries.push([myIdBytes, myShare])

      for (const [partyId, data] of peerShares) {
        const frostId = this.getFrostIdForParty(partyId)
        const idBytes = frozt_encode_identifier(frostId)
        sharesEntries.push([idBytes, data])
      }

      const sharesMap = encodeMap(sharesEntries)

      const finalSignature = signing.aggregate(
        signingPackage,
        sharesMap,
        pubKeyPackage,
        randomizer
      )

      await this.broadcastMessage(finalSignature, 'frozt-sig')

      return finalSignature
    } else {
      const payload = await this.collectSingleMessage('frozt-pkg', start)

      const spLen =
        (payload[0] << 24) | (payload[1] << 16) | (payload[2] << 8) | payload[3]
      const signingPackage = payload.slice(4, 4 + spLen)
      const randomizer = payload.slice(4 + spLen)

      const signatureShare = signing.sign(
        signingPackage,
        nonces,
        keyPackage,
        randomizer
      )

      const encrypted = toMpcServerMessage(
        signatureShare,
        this.hexEncryptionKey
      )
      const coordinator = this.signingCommittee.find(
        p => p !== this.localPartyId
      )!
      const relayMessage: MpcRelayMessage = {
        session_id: this.sessionId,
        from: this.localPartyId,
        to: [coordinator],
        body: encrypted,
        hash: getMessageHash(base64Encode(signatureShare)),
        sequence_no: 0,
      }
      await sendMpcRelayMessage({
        serverUrl: this.serverURL,
        sessionId: this.sessionId,
        message: relayMessage,
        messageId: 'frozt-share',
      })

      const finalSignature = await this.collectSingleMessage('frozt-sig', start)

      return finalSignature
    }
  }

  public async signWithAlpha(
    message: Uint8Array,
    keyPackageBase64: string,
    pubKeyPackageBase64: string,
    alpha: Uint8Array
  ): Promise<Uint8Array> {
    await initializeFrozt()

    const keyPackage = Buffer.from(keyPackageBase64, 'base64')
    const pubKeyPackage = Buffer.from(pubKeyPackageBase64, 'base64')
    const peerCount = this.signingCommittee.length - 1
    const start = Date.now()

    const commitResult = signing.commit(keyPackage)
    const nonces: number = commitResult.nonces
    const commitments: Uint8Array = commitResult.commitments

    await this.broadcastMessage(commitments, 'frozt-commit')

    if (this.isCoordinator) {
      const peerCommitments = await this.collectMessages(
        'frozt-commit',
        peerCount,
        start
      )

      const allCommitmentsEntries: Array<[Uint8Array, Uint8Array]> = []

      const myFrostId = this.getFrostIdForParty(this.localPartyId)
      const myIdBytes = frozt_encode_identifier(myFrostId)
      allCommitmentsEntries.push([myIdBytes, commitments])

      for (const [partyId, data] of peerCommitments) {
        const frostId = this.getFrostIdForParty(partyId)
        const idBytes = frozt_encode_identifier(frostId)
        allCommitmentsEntries.push([idBytes, data])
      }

      const commitmentsMap = encodeMap(allCommitmentsEntries)

      const pkgResult = signing.newPackage(
        message,
        commitmentsMap,
        pubKeyPackage
      )
      const signingPackage: Uint8Array = pkgResult.signing_package

      const payload = new Uint8Array(4 + signingPackage.length + alpha.length)
      const spLen = signingPackage.length
      payload[0] = (spLen >> 24) & 0xff
      payload[1] = (spLen >> 16) & 0xff
      payload[2] = (spLen >> 8) & 0xff
      payload[3] = spLen & 0xff
      payload.set(signingPackage, 4)
      payload.set(alpha, 4 + signingPackage.length)

      await this.broadcastMessage(payload, 'frozt-pkg')

      const myShare = signing.sign(signingPackage, nonces, keyPackage, alpha)

      const peerShares = await this.collectMessages(
        'frozt-share',
        peerCount,
        start
      )

      const sharesEntries: Array<[Uint8Array, Uint8Array]> = []
      sharesEntries.push([myIdBytes, myShare])

      for (const [partyId, data] of peerShares) {
        const frostId = this.getFrostIdForParty(partyId)
        const idBytes = frozt_encode_identifier(frostId)
        sharesEntries.push([idBytes, data])
      }

      const sharesMap = encodeMap(sharesEntries)

      const finalSignature = signing.aggregate(
        signingPackage,
        sharesMap,
        pubKeyPackage,
        alpha
      )

      await this.broadcastMessage(finalSignature, 'frozt-sig')

      return finalSignature
    } else {
      const payload = await this.collectSingleMessage('frozt-pkg', start)

      const spLen =
        (payload[0] << 24) | (payload[1] << 16) | (payload[2] << 8) | payload[3]
      const signingPackage = payload.slice(4, 4 + spLen)
      const randomizer = payload.slice(4 + spLen)

      const signatureShare = signing.sign(
        signingPackage,
        nonces,
        keyPackage,
        randomizer
      )

      const encrypted = toMpcServerMessage(
        signatureShare,
        this.hexEncryptionKey
      )
      const coordinator = this.signingCommittee.find(
        p => p !== this.localPartyId
      )!
      const relayMessage: MpcRelayMessage = {
        session_id: this.sessionId,
        from: this.localPartyId,
        to: [coordinator],
        body: encrypted,
        hash: getMessageHash(base64Encode(signatureShare)),
        sequence_no: 0,
      }
      await sendMpcRelayMessage({
        serverUrl: this.serverURL,
        sessionId: this.sessionId,
        message: relayMessage,
        messageId: 'frozt-share',
      })

      const finalSignature = await this.collectSingleMessage('frozt-sig', start)

      return finalSignature
    }
  }
}
