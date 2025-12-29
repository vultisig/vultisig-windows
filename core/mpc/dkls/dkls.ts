import { base64Encode } from '@lib/utils/base64Encode'

import {
  KeygenSession,
  KeyImportInitiator,
  KeyImportSession,
  Keyshare,
  QcSession,
} from '../../../lib/dkls/vs_wasm'
import { getKeygenThreshold } from '../getKeygenThreshold'
import { getMessageHash } from '../getMessageHash'
import { KeygenOperation } from '../keygen/KeygenOperation'
import { initializeMpcLib } from '../lib/initialize'
import { MpcRelayMessage } from '../message/relay'
import { deleteMpcRelayMessage } from '../message/relay/delete'
import { getMpcRelayMessages } from '../message/relay/get'
import { sendMpcRelayMessage } from '../message/relay/send'
import { fromMpcServerMessage, toMpcServerMessage } from '../message/server'
import { waitForSetupMessage } from '../message/setup/get'
import { uploadMpcSetupMessage } from '../message/setup/upload'
import { combineReshareCommittee } from '../reshareCommittee'
import { sleep } from '../sleep'

export class DKLS {
  private readonly keygenOperation: KeygenOperation
  private readonly isInitiateDevice: boolean
  private readonly serverURL: string
  private readonly sessionId: string
  private readonly localPartyId: string
  private readonly keygenCommittee: string[]
  private readonly oldKeygenCommittee: string[]
  private readonly hexEncryptionKey: string
  private readonly timeoutMs: number
  private readonly onInboundSequenceNoChange?: (
    inboundSequenceNo: number
  ) => void
  private isKeygenComplete: boolean = false
  private sequenceNo: number = 0
  private inboundSequenceNo: number = 0
  private cache: Record<string, string> = {}
  private setupMessage: Uint8Array = new Uint8Array()
  private readonly localUI?: string
  private readonly publicKey?: string
  private readonly chainCode?: string
  constructor(
    keygenOperation: KeygenOperation,
    isInitiateDevice: boolean,
    serverURL: string,
    sessionId: string,
    localPartyId: string,
    keygenCommittee: string[],
    oldKeygenCommittee: string[],
    hexEncryptionKey: string,
    options?: {
      localUI?: string
      publicKey?: string
      chainCode?: string
      timeoutMs?: number
      onInboundSequenceNoChange?: (inboundSequenceNo: number) => void
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
    this.publicKey = options?.publicKey
    this.chainCode = options?.chainCode
    this.localUI = options?.localUI?.padEnd(64, '0')
    this.timeoutMs = options?.timeoutMs ?? 60000
    this.onInboundSequenceNoChange = options?.onInboundSequenceNoChange
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
          await sleep(100)
          return await this.processOutbound(session)
        }
      }
      console.log('outbound message:', message)
      const body = toMpcServerMessage(message.body, this.hexEncryptionKey)

      message?.receivers.forEach(receiver => {
        const relayMessage: MpcRelayMessage = {
          session_id: this.sessionId,
          from: this.localPartyId,
          to: [receiver],
          body: body,
          hash: getMessageHash(base64Encode(message.body)),
          sequence_no: this.sequenceNo,
        }
        // send message to receiver
        sendMpcRelayMessage({
          serverUrl: this.serverURL,
          message: relayMessage,
          sessionId: this.sessionId,
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
        this.inboundSequenceNo++
        this.onInboundSequenceNoChange?.(this.inboundSequenceNo)
        await deleteMpcRelayMessage({
          serverUrl: this.serverURL,
          localPartyId: this.localPartyId,
          sessionId: this.sessionId,
          messageHash: msg.hash,
        })
      }
      const end = Date.now()
      if (end - start > this.timeoutMs * 2) {
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
    console.log('startKeygen attempt:', attempt)
    console.log('session id:', this.sessionId)
    this.isKeygenComplete = false
    this.inboundSequenceNo = 0
    this.onInboundSequenceNoChange?.(this.inboundSequenceNo)
    try {
      if (this.isInitiateDevice && attempt === 0) {
        const threshold = getKeygenThreshold(this.keygenCommittee.length)
        this.setupMessage = KeygenSession.setup(
          undefined,
          threshold,
          this.keygenCommittee
        )
        // upload setup message to server
        const encryptedSetupMsg = toMpcServerMessage(
          this.setupMessage,
          this.hexEncryptionKey
        )

        await uploadMpcSetupMessage({
          serverUrl: this.serverURL,
          message: encryptedSetupMsg,
          sessionId: this.sessionId,
        })
        console.log('uploaded setup message successfully')
      } else {
        const encodedEncryptedSetupMsg = await waitForSetupMessage({
          serverUrl: this.serverURL,
          sessionId: this.sessionId,
        })
        this.setupMessage = fromMpcServerMessage(
          encodedEncryptedSetupMsg,
          this.hexEncryptionKey
        )
      }
      let session: KeygenSession | KeyImportInitiator
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
        console.log('migrate session:', session)
      } else {
        throw new Error('Invalid keygen operation')
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
      throw new Error('DKLS keygen failed')
    } catch (error) {
      if (error instanceof Error) {
        console.error('DKLS keygen error:', error)
        console.error('DKLS keygen error:', error.stack)
      }
      throw error
    }
  }

  public async startKeygenWithRetry() {
    await initializeMpcLib('ecdsa')
    for (let i = 0; i < 3; i++) {
      try {
        const result = await this.startKeygen(i)
        return result
      } catch (error) {
        console.error('DKLS keygen error:', error)
      }
    }
    throw new Error('DKLS keygen failed')
  }
  public getSetupMessage() {
    return this.setupMessage
  }

  private async startReshare(
    dklsKeyshare: string | undefined,
    attempt: number
  ) {
    console.log('startReshare dkls, attempt:', attempt)
    this.isKeygenComplete = false
    this.inboundSequenceNo = 0
    this.onInboundSequenceNoChange?.(this.inboundSequenceNo)
    let localKeyshare: Keyshare | null = null
    if (dklsKeyshare !== undefined && dklsKeyshare.length > 0) {
      localKeyshare = Keyshare.fromBytes(Buffer.from(dklsKeyshare, 'base64'))
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
        const newCommitteeIdxUint8 = new Uint8Array(newCommitteeIdx)
        const oldCommitteeIdxUint8 = new Uint8Array(oldCommitteeIdx)
        setupMessage = QcSession.setup(
          localKeyshare,
          allCommittee,
          oldCommitteeIdxUint8,
          threshold,
          newCommitteeIdxUint8
        )
        // upload setup message to server
        const encryptedSetupMsg = toMpcServerMessage(
          setupMessage,
          this.hexEncryptionKey
        )
        console.log('encrypted setup message:', encryptedSetupMsg)
        await uploadMpcSetupMessage({
          serverUrl: this.serverURL,
          message: encryptedSetupMsg,
          sessionId: this.sessionId,
        })
        console.log('uploaded setup message successfully')
      } else {
        const encodedEncryptedSetupMsg = await waitForSetupMessage({
          serverUrl: this.serverURL,
          sessionId: this.sessionId,
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
          const keyShare = session.finish()
          if (keyShare === undefined) {
            throw new Error('keyshare is null, dkls reshare failed')
          }
          return {
            keyshare: base64Encode(keyShare.toBytes()),
            publicKey: Buffer.from(keyShare.publicKey()).toString('hex'),
            chaincode: Buffer.from(keyShare.rootChainCode()).toString('hex'),
          }
        }
        throw new Error('DKLS reshare failed')
      } finally {
        session.free()
      }
    } catch (error) {
      console.error('DKLS reshare error:', error)
      if (error instanceof Error) {
        console.error('DKLS reshare error:', error.stack)
      }
      throw error
    }
  }

  public async startReshareWithRetry(keyshare: string | undefined) {
    await initializeMpcLib('ecdsa')
    for (let i = 0; i < 3; i++) {
      try {
        const result = await this.startReshare(keyshare, i)
        return result
      } catch (error) {
        console.error('DKLS reshare error:', error)
      }
    }
    throw new Error('DKLS reshare failed')
  }
  private async startKeyImport(
    hexPrivateKey: string,
    hexChainCode: string,
    attempt: number,
    additionalHeader?: string
  ) {
    console.log('startKeyImport attempt:', attempt)
    this.isKeygenComplete = false
    if (this.keygenCommittee.length != 3) {
      throw new Error('DKLS key import requires exactly 3 committee members')
    }
    try {
      let session: KeyImportInitiator | KeyImportSession | null = null
      if (this.isInitiateDevice) {
        const threshold = getKeygenThreshold(this.keygenCommittee.length)
        const privateKey = Buffer.from(hexPrivateKey, 'hex')
        const chainCode = Buffer.from(hexChainCode, 'hex')

        const keyImportSession = new KeyImportInitiator(
          Uint8Array.from(privateKey),
          Uint8Array.from(chainCode),
          threshold,
          this.keygenCommittee
        )
        this.setupMessage = keyImportSession.setup
        session = keyImportSession
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
        throw new Error('Invalid keygen operation')
      }
      if (session === null) {
        throw new Error('DKLS key import session is null')
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
      throw new Error('DKLS key import failed')
    } catch (error) {
      if (error instanceof Error) {
        console.error('DKLS key import error:', error)
        console.error('DKLS key import error:', error.stack)
      }
      throw error
    }
  }

  public async startKeyImportWithRetry(
    privateKey: string,
    chainCode: string,
    additionalHeader?: string
  ) {
    await initializeMpcLib('ecdsa')
    for (let i = 0; i < 3; i++) {
      try {
        const result = await this.startKeyImport(
          privateKey,
          chainCode,
          i,
          additionalHeader
        )
        return result
      } catch (error) {
        console.error('DKLS key import error:', error)
      }
    }
    throw new Error('DKLS key import failed')
  }
}
