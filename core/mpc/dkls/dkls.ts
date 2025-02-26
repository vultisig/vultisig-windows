import { base64Encode } from '@lib/utils/base64Encode'

import __wbg_init, { KeygenSession } from '../../../lib/dkls/vs_wasm'
import { deleteRelayMessage } from '../deleteRelayMessage'
import { downloadRelayMessage, RelayMessage } from '../downloadRelayMessage'
import { waitForSetupMessage } from '../downloadSetupMessage'
import {
  decodeDecryptMessage,
  encodeEncryptMessage,
} from '../encodingAndEncryption'
import { getKeygenThreshold } from '../getKeygenThreshold'
import { getMessageHash } from '../getMessageHash'
import { sendRelayMessage } from '../sendRelayMessage'
import { sleep } from '../sleep'
import { KeygenType } from '../tssType'
import { uploadSetupMessage } from '../uploadSetupMessage'

export class DKLS {
  private readonly tssType: KeygenType
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
  constructor(
    tssType: KeygenType,
    isInitiateDevice: boolean,
    serverURL: string,
    sessionId: string,
    localPartyId: string,
    keygenCommittee: string[],
    oldKeygenCommittee: string[],
    hexEncryptionKey: string
  ) {
    this.tssType = tssType
    this.isInitiateDevice = isInitiateDevice
    this.serverURL = serverURL
    this.sessionId = sessionId
    this.localPartyId = localPartyId
    this.keygenCommittee = keygenCommittee
    this.oldKeygenCommittee = oldKeygenCommittee
    this.hexEncryptionKey = hexEncryptionKey
  }

  private async processOutbound(session: KeygenSession) {
    console.log('processOutbound')
    while (true) {
      try {
        const message = session.outputMessage()
        if (message === undefined) {
          if (this.isKeygenComplete) {
            console.log('stop processOutbound')
            return
          } else {
            await sleep(100) // backoff for 100ms
          }
          continue
        }
        console.log('outbound message:', message)
        const messageToSend = await encodeEncryptMessage(
          message.body,
          this.hexEncryptionKey
        )
        message?.receivers.forEach(receiver => {
          // send message to receiver
          sendRelayMessage({
            serverURL: this.serverURL,
            localPartyId: this.localPartyId,
            sessionId: this.sessionId,
            message: messageToSend,
            to: receiver,
            sequenceNo: this.sequenceNo,
            messageHash: getMessageHash(base64Encode(message.body)),
          })
          this.sequenceNo++
        })
      } catch (error) {
        console.error('processOutbound error:', error)
      }
    }
  }

  private async processInbound(session: KeygenSession) {
    const start = Date.now()
    while (true) {
      try {
        const downloadMsg = await downloadRelayMessage({
          serverURL: this.serverURL,
          localPartyId: this.localPartyId,
          sessionId: this.sessionId,
        })
        const parsedMessages: RelayMessage[] = JSON.parse(downloadMsg)
        for (const msg of parsedMessages) {
          const cacheKey = `${msg.session_id}-${msg.from}-${msg.hash}`
          if (this.cache[cacheKey]) {
            continue
          }
          console.log(
            `got message from: ${msg.from},to: ${msg.to},key:${cacheKey}`
          )
          const decryptedMessage = await decodeDecryptMessage(
            msg.body,
            this.hexEncryptionKey
          )
          const isFinish = session.inputMessage(decryptedMessage)
          if (isFinish) {
            this.isKeygenComplete = true
            console.log('keygen complete')
            return true
          }
          this.cache[cacheKey] = ''
          await deleteRelayMessage({
            serverURL: this.serverURL,
            localPartyId: this.localPartyId,
            sessionId: this.sessionId,
            messageHash: msg.hash,
          })
        }
        const end = Date.now()
        // timeout after 1 minute
        if (end - start > 1000 * 60) {
          console.log('timeout')
          this.isKeygenComplete = true
          return false
        }
      } catch (error) {
        console.error('processInbound error:', error)
      }
    }
  }

  private async startKeygen(attempt: number) {
    console.log('startKeygen attempt:', attempt)
    console.log('session id:', this.sessionId)
    try {
      if (this.isInitiateDevice) {
        const threshold = getKeygenThreshold(this.keygenCommittee.length)
        this.setupMessage = KeygenSession.setup(
          undefined,
          threshold,
          this.keygenCommittee
        )
        // upload setup message to server
        const encryptedSetupMsg = await encodeEncryptMessage(
          this.setupMessage,
          this.hexEncryptionKey
        )

        await uploadSetupMessage({
          serverUrl: this.serverURL,
          message: encryptedSetupMsg,
          sessionId: this.sessionId,
          messageId: undefined,
          additionalHeaders: undefined,
        })
        console.log('uploaded setup message successfully')
      } else {
        const encodedEncryptedSetupMsg = await waitForSetupMessage({
          serverURL: this.serverURL,
          sessionId: this.sessionId,
        })
        this.setupMessage = await decodeDecryptMessage(
          encodedEncryptedSetupMsg,
          this.hexEncryptionKey
        )
      }
      const session = new KeygenSession(this.setupMessage, this.localPartyId)
      const outbound = this.processOutbound(session)
      const inbound = this.processInbound(session)
      const [, inboundResult] = await Promise.all([outbound, inbound])
      if (inboundResult) {
        const keyShare = session.finish()
        return {
          keyshare: base64Encode(keyShare.toBytes()),
          publicKey: Buffer.from(keyShare.publicKey()).toString('hex'),
          chaincode: Buffer.from(keyShare.rootChainCode()).toString('hex'),
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('DKLS keygen error:', error)
        console.error('DKLS keygen error:', error.stack)
      }
      throw error
    }
  }

  public async startKeygenWithRetry() {
    await __wbg_init()
    for (let i = 0; i < 3; i++) {
      try {
        const result = await this.startKeygen(i)
        if (result !== undefined) {
          return result
        }
      } catch (error) {
        console.error('DKLS keygen error:', error)
      }
    }
  }
  public getSetupMessage() {
    return this.setupMessage
  }
}
