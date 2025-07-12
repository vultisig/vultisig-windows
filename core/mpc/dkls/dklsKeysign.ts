import { base64Encode } from '@lib/utils/base64Encode'

import { SignSession } from '../../../lib/dkls/vs_wasm'
import { deleteRelayMessage } from '../deleteRelayMessage'
import { downloadRelayMessage, RelayMessage } from '../downloadRelayMessage'
import {
  decodeDecryptMessage,
  encodeEncryptMessage,
} from '../encodingAndEncryption'
import { getMessageHash } from '../getMessageHash'
import { sendRelayMessage } from '../sendRelayMessage'
import { sleep } from '../sleep'

export class DKLSKeysign {
  private readonly serverURL: string
  private readonly localPartyId: string
  private readonly sessionId: string
  private readonly hexEncryptionKey: string
  private isKeysignComplete: boolean = false
  private sequenceNo: number = 0
  private cache: Record<string, string> = {}
  constructor(
    serverURL: string,
    localPartyId: string,
    sessionId: string,
    hexEncryptionKey: string
  ) {
    this.serverURL = serverURL
    this.localPartyId = localPartyId
    this.sessionId = sessionId
    this.hexEncryptionKey = hexEncryptionKey
  }

  public async processOutbound(session: SignSession, messageId: string) {
    console.log('processOutbound')
    while (true) {
      try {
        const message = session.outputMessage()
        if (message === undefined) {
          if (this.isKeysignComplete) {
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
            messageId: messageId,
          })
          this.sequenceNo++
        })
      } catch (error) {
        console.error('processOutbound error:', error)
      }
    }
  }

  public async processInbound(session: SignSession, messageId: string) {
    const start = Date.now()
    while (true) {
      try {
        const downloadMsg = await downloadRelayMessage({
          serverURL: this.serverURL,
          localPartyId: this.localPartyId,
          sessionId: this.sessionId,
          messageId: messageId,
        })
        const parsedMessages: RelayMessage[] = JSON.parse(downloadMsg)
        for (const msg of parsedMessages) {
          const cacheKey = `${msg.session_id}-${msg.from}-${messageId}-${msg.hash}`
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
            this.isKeysignComplete = true
            console.log('keysign complete')
            return true
          }
          this.cache[cacheKey] = ''
          await deleteRelayMessage({
            serverURL: this.serverURL,
            localPartyId: this.localPartyId,
            sessionId: this.sessionId,
            messageHash: msg.hash,
            messageId: messageId,
          })
        }
        const end = Date.now()
        // timeout after 1 minute
        if (end - start > 1000 * 60) {
          console.log('timeout')
          this.isKeysignComplete = true
          return false
        }
      } catch (error) {
        console.error('processInbound error:', error)
      }
    }
  }
}
