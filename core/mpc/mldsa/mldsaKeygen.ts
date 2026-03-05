import { base64Encode } from '@lib/utils/base64Encode'

import { KeygenSession, Keyshare } from '../../../lib/mldsa/vs_wasm'
import { getKeygenThreshold } from '../getKeygenThreshold'
import { getMessageHash } from '../getMessageHash'
import { deleteMpcRelayMessage } from '../message/relay/delete'
import { getMpcRelayMessages } from '../message/relay/get'
import { sendMpcRelayMessage } from '../message/relay/send'
import { fromMpcServerMessage, toMpcServerMessage } from '../message/server'
import { waitForSetupMessage } from '../message/setup/get'
import { uploadMpcSetupMessage } from '../message/setup/upload'
import { sleep } from '../sleep'
import { initializeMldsaLib } from './initializeMldsa'

const mldsaLevel = 44

export type MldsaKeygenResult = {
  keyshare: string
  publicKey: string
}

export class MldsaKeygen {
  private readonly isInitiateDevice: boolean
  private readonly serverURL: string
  private readonly sessionId: string
  private readonly localPartyId: string
  private readonly keygenCommittee: string[]
  private readonly hexEncryptionKey: string
  private readonly timeoutMs: number
  private isKeygenComplete: boolean = false
  private sequenceNo: number = 0
  private cache: Record<string, string> = {}
  private setupMessage: Uint8Array = new Uint8Array()

  constructor(
    isInitiateDevice: boolean,
    serverURL: string,
    sessionId: string,
    localPartyId: string,
    keygenCommittee: string[],
    hexEncryptionKey: string,
    options?: {
      timeoutMs?: number
    }
  ) {
    this.isInitiateDevice = isInitiateDevice
    this.serverURL = serverURL
    this.sessionId = sessionId
    this.localPartyId = localPartyId
    this.keygenCommittee = keygenCommittee
    this.hexEncryptionKey = hexEncryptionKey
    this.timeoutMs = options?.timeoutMs ?? 60000
  }

  private async processOutbound(session: KeygenSession): Promise<boolean> {
    try {
      const message = session.outputMessage()
      if (message === undefined) {
        if (this.isKeygenComplete) {
          return true
        }
        await sleep(100)
        return this.processOutbound(session)
      }

      const body = toMpcServerMessage(message.body, this.hexEncryptionKey)

      message.receivers.forEach(receiver => {
        sendMpcRelayMessage({
          serverUrl: this.serverURL,
          sessionId: this.sessionId,
          message: {
            session_id: this.sessionId,
            from: this.localPartyId,
            to: [receiver],
            body,
            hash: getMessageHash(base64Encode(message.body)),
            sequence_no: this.sequenceNo,
          },
          messageId: 'mldsa',
        })
        this.sequenceNo++
      })

      await sleep(100)
      return this.processOutbound(session)
    } catch (error) {
      console.error('MLDSA processOutbound error:', error)
      await sleep(100)
      return this.processOutbound(session)
    }
  }

  private async processInbound(
    session: KeygenSession,
    start: number
  ): Promise<boolean> {
    try {
      const parsedMessages = await getMpcRelayMessages({
        serverUrl: this.serverURL,
        localPartyId: this.localPartyId,
        sessionId: this.sessionId,
        messageId: 'mldsa',
      })

      if (parsedMessages.length === 0) {
        await sleep(100)
        return this.processInbound(session, start)
      }

      for (const msg of parsedMessages) {
        const cacheKey = `${msg.session_id}-${msg.from}-${msg.hash}`
        if (this.cache[cacheKey]) {
          continue
        }

        const decryptedMessage = fromMpcServerMessage(
          msg.body,
          this.hexEncryptionKey
        )
        const isFinish = session.inputMessage(decryptedMessage)
        if (isFinish) {
          await sleep(1000)
          this.isKeygenComplete = true
          return true
        }

        this.cache[cacheKey] = ''
        await deleteMpcRelayMessage({
          serverUrl: this.serverURL,
          localPartyId: this.localPartyId,
          sessionId: this.sessionId,
          messageHash: msg.hash,
          messageId: 'mldsa',
        })
      }

      const elapsed = Date.now() - start
      if (elapsed > this.timeoutMs * 2) {
        this.isKeygenComplete = true
        return false
      }

      await sleep(100)
      return this.processInbound(session, start)
    } catch (error) {
      console.error('MLDSA processInbound error:', error)
      await sleep(100)
      return this.processInbound(session, start)
    }
  }

  private async startKeygen(attempt: number): Promise<MldsaKeygenResult> {
    this.isKeygenComplete = false
    this.cache = {}
    this.sequenceNo = 0

    try {
      if (this.isInitiateDevice && attempt === 0) {
        const threshold = getKeygenThreshold(this.keygenCommittee.length)
        this.setupMessage = KeygenSession.setup(
          mldsaLevel,
          undefined,
          threshold,
          this.keygenCommittee
        )

        const encryptedSetupMsg = toMpcServerMessage(
          this.setupMessage,
          this.hexEncryptionKey
        )
        await uploadMpcSetupMessage({
          serverUrl: this.serverURL,
          message: encryptedSetupMsg,
          sessionId: this.sessionId,
          messageId: 'mldsa',
        })
      } else {
        const encodedEncryptedSetupMsg = await waitForSetupMessage({
          serverUrl: this.serverURL,
          sessionId: this.sessionId,
          messageId: 'mldsa',
        })
        this.setupMessage = fromMpcServerMessage(
          encodedEncryptedSetupMsg,
          this.hexEncryptionKey
        )
      }

      const session = new KeygenSession(this.setupMessage, this.localPartyId)

      const start = Date.now()
      const outbound = this.processOutbound(session)
      const inbound = this.processInbound(session, start)
      const [, inboundResult] = await Promise.all([outbound, inbound])

      if (inboundResult) {
        const keyShare: Keyshare = session.finish()
        return {
          keyshare: base64Encode(keyShare.toBytes()),
          publicKey: Buffer.from(keyShare.publicKey()).toString('hex'),
        }
      }

      throw new Error('MLDSA keygen failed')
    } catch (error) {
      if (error instanceof Error) {
        console.error('MLDSA keygen error:', error.message)
      }
      throw error
    }
  }

  public async startKeygenWithRetry(): Promise<MldsaKeygenResult> {
    await initializeMldsaLib()

    for (let i = 0; i < 3; i++) {
      try {
        return await this.startKeygen(i)
      } catch (error) {
        console.error(`MLDSA keygen attempt ${i} failed:`, error)
      }
    }
    throw new Error('MLDSA keygen failed after 3 attempts')
  }
}
