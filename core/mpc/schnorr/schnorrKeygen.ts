import { base64Encode } from '@lib/utils/base64Encode'

import {
  KeygenSession,
  KeyImportInitiator,
  KeyImportSession,
  Keyshare,
  QcSession,
} from '../../../lib/schnorr/vs_schnorr_wasm'
import { getKeygenThreshold } from '../getKeygenThreshold'
import { getMessageHash } from '../getMessageHash'
import { KeygenOperation } from '../keygen/KeygenOperation'
import { initializeMpcLib } from '../lib/initialize'
import { deleteMpcRelayMessage } from '../message/relay/delete'
import { getMpcRelayMessages } from '../message/relay/get'
import { sendMpcRelayMessage } from '../message/relay/send'
import { fromMpcServerMessage, toMpcServerMessage } from '../message/server'
import { waitForSetupMessage } from '../message/setup/get'
import { uploadMpcSetupMessage } from '../message/setup/upload'
import { combineReshareCommittee } from '../reshareCommittee'
import { sleep } from '../sleep'

export class Schnorr {
  private readonly keygenOperation: KeygenOperation
  private readonly isInitiateDevice: boolean
  private readonly serverURL: string
  private readonly sessionId: string
  private readonly localPartyId: string
  private readonly keygenCommittee: string[]
  private readonly oldKeygenCommittee: string[]
  private readonly hexEncryptionKey: string
  private isKeygenComplete: boolean = false
  private sequenceNo: number = 0
  private cache: Record<string, string> = {}
  private setupMessage: Uint8Array = new Uint8Array()
  private readonly localUI?: string
  private readonly publicKey?: string
  private readonly chainCode?: string
  private readonly timeoutMs: number
  constructor(
    keygenOperation: KeygenOperation,
    isInitiateDevice: boolean,
    serverURL: string,
    sessionId: string,
    localPartyId: string,
    keygenCommittee: string[],
    oldKeygenCommittee: string[],
    hexEncryptionKey: string,
    setupMessage: Uint8Array, // DKLS/Schnorr keygen only need to setup message once, thus for EdDSA , we could reuse the setup message from DKLS
    options?: {
      localUI?: string
      publicKey?: string
      chainCode?: string
      timeoutMs?: number
    }
  ) {
    this.keygenOperation = keygenOperation
    this.isInitiateDevice = isInitiateDevice
    this.serverURL = serverURL
    this.sessionId = sessionId
    this.localPartyId = localPartyId
    this.keygenCommittee = keygenCommittee
    this.oldKeygenCommittee = oldKeygenCommittee
    this.hexEncryptionKey = hexEncryptionKey
    this.setupMessage = setupMessage
    this.localUI = options?.localUI?.padEnd(64, '0')
    this.publicKey = options?.publicKey
    this.chainCode = options?.chainCode
    this.timeoutMs = options?.timeoutMs ?? 60000 // Default to 1 minute (60000ms)
  }

  private async processOutbound(
    session: KeygenSession | QcSession | KeyImportInitiator | KeyImportSession
  ): Promise<boolean> {
    try {
      const message = session.outputMessage()
      if (message === undefined) {
        if (this.isKeygenComplete) {
          console.log('stop processOutbound')
          return true
        } else {
          await sleep(100) // backoff for 100ms
          return await this.processOutbound(session)
        }
      }
      console.log('outbound message:', message)
      const messageToSend = toMpcServerMessage(
        message.body,
        this.hexEncryptionKey
      )
      message?.receivers.forEach(receiver => {
        // send message to receiver
        sendMpcRelayMessage({
          serverUrl: this.serverURL,
          sessionId: this.sessionId,
          message: {
            session_id: this.sessionId,
            from: this.localPartyId,
            to: [receiver],
            body: messageToSend,
            hash: getMessageHash(base64Encode(message.body)),
            sequence_no: this.sequenceNo,
          },
        })
        this.sequenceNo++
      })
      await sleep(100)
      return await this.processOutbound(session)
    } catch (error) {
      console.error('processOutbound error:', error)
      await sleep(100)
      return await this.processOutbound(session)
    }
  }

  private async processInbound(
    session: KeygenSession | QcSession | KeyImportInitiator | KeyImportSession,
    start: number
  ): Promise<boolean> {
    try {
      const parsedMessages = await getMpcRelayMessages({
        serverUrl: this.serverURL,
        localPartyId: this.localPartyId,
        sessionId: this.sessionId,
      })
      if (parsedMessages.length === 0) {
        // no message to download, backoff for 100ms
        await sleep(100)
        return await this.processInbound(session, start)
      }
      for (const msg of parsedMessages) {
        const cacheKey = `${msg.session_id}-${msg.from}-${msg.hash}`
        if (this.cache[cacheKey]) {
          continue
        }
        console.log(
          `got message from: ${msg.from},to: ${msg.to},key:${cacheKey}`
        )
        const decryptedMessage = fromMpcServerMessage(
          msg.body,
          this.hexEncryptionKey
        )
        const isFinish = session.inputMessage(decryptedMessage)
        if (isFinish) {
          await sleep(1000) // wait for 1 second to make sure all messages are processed
          this.isKeygenComplete = true
          console.log('keygen complete')
          return true
        }
        this.cache[cacheKey] = ''
        await deleteMpcRelayMessage({
          serverUrl: this.serverURL,
          localPartyId: this.localPartyId,
          sessionId: this.sessionId,
          messageHash: msg.hash,
        })
      }
      const end = Date.now()
      // timeout after configured duration
      if (end - start > this.timeoutMs) {
        console.log('timeout')
        this.isKeygenComplete = true
        return false
      }
      await sleep(100)
      return await this.processInbound(session, start)
    } catch (error) {
      console.error('processInbound error:', error)
      await sleep(100)
      return await this.processInbound(session, start)
    }
  }

  private async startKeygen(attempt: number) {
    if (this.setupMessage === undefined || this.setupMessage.length === 0) {
      throw new Error('setup message is empty')
    }
    console.log('startKeygen attempt:', attempt)
    console.log('session id:', this.sessionId)
    this.isKeygenComplete = false
    try {
      let session: KeygenSession
      if ('create' in this.keygenOperation) {
        session = new KeygenSession(this.setupMessage, this.localPartyId)
      } else if (
        'reshare' in this.keygenOperation &&
        this.keygenOperation.reshare === 'migrate'
      ) {
        session = KeygenSession.migrate(
          this.setupMessage,
          this.localPartyId,
          Buffer.from(this.localUI || '', 'hex'),
          Buffer.from(this.publicKey || '', 'hex'),
          Buffer.from(this.chainCode || '', 'hex')
        )
      } else {
        throw new Error('invalid keygen type')
      }
      const start = Date.now()
      const outbound = this.processOutbound(session)
      const inbound = this.processInbound(session, start)
      const [, inboundResult] = await Promise.all([outbound, inbound])
      if (inboundResult) {
        const keyShare = session.finish()
        return {
          keyshare: base64Encode(keyShare.toBytes()),
          publicKey: Buffer.from(keyShare.publicKey()).toString('hex'),
          chaincode: Buffer.from(keyShare.rootChainCode()).toString('hex'),
        }
      }
      throw new Error('Schnorr keygen failed')
    } catch (error) {
      if (error instanceof Error) {
        console.error('Schnorr keygen error:', error)
        console.error('Schnorr keygen error:', error.stack)
      }
      throw error
    }
  }

  public async startKeygenWithRetry() {
    await initializeMpcLib('eddsa')
    for (let i = 0; i < 3; i++) {
      try {
        const result = await this.startKeygen(i)
        return result
      } catch (error) {
        console.error('Schnorr keygen error:', error)
      }
    }
    throw new Error('Schnorr keygen failed')
  }

  private async startReshare(
    rawSchnorrKeyshare: string | undefined,
    attempt: number
  ) {
    console.log('startReshare schnorr, attempt:', attempt)
    this.isKeygenComplete = false
    let localKeyshare: Keyshare | null = null
    if (rawSchnorrKeyshare !== undefined && rawSchnorrKeyshare.length > 0) {
      localKeyshare = Keyshare.fromBytes(
        Buffer.from(rawSchnorrKeyshare, 'base64')
      )
    }

    try {
      let setupMessage: Uint8Array = new Uint8Array()
      if (this.isInitiateDevice && attempt === 0) {
        if (localKeyshare === null) {
          throw new Error('local keyshare is null')
        }
        const isPlugin =
          'reshare' in this.keygenOperation &&
          this.keygenOperation.reshare === 'plugin'
        // keygenCommittee only has new committee members
        const threshold = isPlugin
          ? 2
          : getKeygenThreshold(this.keygenCommittee.length)
        const { allCommittee, newCommitteeIdx, oldCommitteeIdx } =
          combineReshareCommittee({
            keygenCommittee: this.keygenCommittee,
            oldKeygenCommittee: this.oldKeygenCommittee,
          })
        setupMessage = QcSession.setup(
          localKeyshare,
          allCommittee,
          new Uint8Array(oldCommitteeIdx),
          threshold,
          new Uint8Array(newCommitteeIdx)
        )
        // upload setup message to server
        const encryptedSetupMsg = toMpcServerMessage(
          setupMessage,
          this.hexEncryptionKey
        )
        await uploadMpcSetupMessage({
          serverUrl: this.serverURL,
          message: encryptedSetupMsg,
          sessionId: this.sessionId,
          messageId: 'eddsa',
        })
        console.log('uploaded setup message successfully')
      } else {
        const encodedEncryptedSetupMsg = await waitForSetupMessage({
          serverUrl: this.serverURL,
          sessionId: this.sessionId,
          messageId: 'eddsa',
        })
        setupMessage = fromMpcServerMessage(
          encodedEncryptedSetupMsg,
          this.hexEncryptionKey
        )
      }
      const session = new QcSession(
        setupMessage,
        this.localPartyId,
        localKeyshare
      )

      try {
        const start = Date.now()
        const outbound = this.processOutbound(session)
        const inbound = this.processInbound(session, start)
        const [, inboundResult] = await Promise.all([outbound, inbound])
        if (inboundResult) {
          const finalKeyShare = session.finish()
          if (finalKeyShare === undefined) {
            throw new Error('keyshare is null, schnorr reshare failed')
          }

          return {
            keyshare: base64Encode(finalKeyShare.toBytes()),
            publicKey: Buffer.from(finalKeyShare.publicKey()).toString('hex'),
            chaincode: Buffer.from(finalKeyShare.rootChainCode()).toString(
              'hex'
            ),
          }
        }
      } finally {
        session.free()
      }
    } catch (error) {
      console.error('schnorr reshare error:', error)
      throw error
    }
  }

  public async startReshareWithRetry(keyshare: string | undefined) {
    await initializeMpcLib('eddsa')
    for (let i = 0; i < 3; i++) {
      try {
        const result = await this.startReshare(keyshare, i)
        if (result !== undefined) {
          return result
        }
      } catch (error) {
        console.error('schnorr reshare error:', error)
      }
    }
    throw new Error('schnorr reshare failed')
  }
  private async startKeyImport(
    hexPrivateKey: string,
    hexChainCode: string,
    attempt: number,
    additionalHeader?: string
  ) {
    console.log('startKeyImport schnorr, attempt:', attempt)
    this.isKeygenComplete = false
    try {
      let session: KeyImportSession | KeyImportInitiator | null = null
      if (this.isInitiateDevice && attempt === 0) {
        const privateKey = Buffer.from(hexPrivateKey, 'hex')
        const chainCode = Buffer.from(hexChainCode, 'hex')
        const initiatorSession = new KeyImportInitiator(
          Uint8Array.from(privateKey),
          Uint8Array.from(chainCode),
          getKeygenThreshold(this.keygenCommittee.length),
          this.keygenCommittee
        )
        this.setupMessage = initiatorSession.setup
        session = initiatorSession
        // upload setup message to server
        const encryptedSetupMsg = toMpcServerMessage(
          this.setupMessage,
          this.hexEncryptionKey
        )
        await uploadMpcSetupMessage({
          serverUrl: this.serverURL,
          message: encryptedSetupMsg,
          sessionId: this.sessionId,
          messageId: additionalHeader,
        })
        console.log('uploaded setup message successfully')
      } else {
        const encodedEncryptedSetupMsg = await waitForSetupMessage({
          serverUrl: this.serverURL,
          sessionId: this.sessionId,
          messageId: additionalHeader,
        })
        this.setupMessage = fromMpcServerMessage(
          encodedEncryptedSetupMsg,
          this.hexEncryptionKey
        )
      }
      if ('keyimport' in this.keygenOperation) {
        if (!this.isInitiateDevice) {
          session = new KeyImportSession(this.setupMessage, this.localPartyId)
        }
      } else {
        throw new Error('invalid keygen type')
      }
      if (session === null) {
        throw new Error('Schnorr key import session is null')
      }
      const start = Date.now()
      const outbound = this.processOutbound(session)
      const inbound = this.processInbound(session, start)
      const [, inboundResult] = await Promise.all([outbound, inbound])
      if (inboundResult) {
        const keyShare = session.finish()
        return {
          keyshare: base64Encode(keyShare.toBytes()),
          publicKey: Buffer.from(keyShare.publicKey()).toString('hex'),
          chaincode: Buffer.from(keyShare.rootChainCode()).toString('hex'),
        }
      }
      throw new Error('Schnorr keygen failed')
    } catch (error) {
      if (error instanceof Error) {
        console.error('Schnorr keygen error:', error)
        console.error('Schnorr keygen error:', error.stack)
      }
      throw error
    }
  }
  public async startKeyImportWithRetry(
    hexPrivateKey: string,
    hexChainCode: string,
    additionalHeader?: string
  ) {
    await initializeMpcLib('eddsa')
    for (let i = 0; i < 3; i++) {
      try {
        const result = await this.startKeyImport(
          hexPrivateKey,
          hexChainCode,
          i,
          additionalHeader
        )
        if (result !== undefined) {
          return result
        }
      } catch (error) {
        console.error('schnorr key import error:', error)
      }
    }
    throw new Error('schnorr key import failed')
  }
}
