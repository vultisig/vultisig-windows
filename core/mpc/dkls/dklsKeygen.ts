import { base64Encode } from '@lib/utils/base64Encode'

import __wbg_init, { KeygenSession } from '../../../lib/dkls/vs_wasm'
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

export class DKLSKeygen {
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
    while (true) {
      const message = session.outputMessage()
      if (message === undefined) {
        if (this.isKeygenComplete) {
          return
        } else {
          await sleep(100) // backoff for 100ms
        }
        continue
      }
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
          this.cache[msg.hash] = ''
          const decryptedMessage = await decodeDecryptMessage(
            msg.body,
            this.hexEncryptionKey
          )
          const isFinish = session.inputMessage(decryptedMessage)
          if (isFinish) {
            this.isKeygenComplete = true
            return true
          }
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
    await __wbg_init()
    console.log('startKeygen attempt:', attempt)

    try {
      let setupMessage: Uint8Array
      if (this.isInitiateDevice) {
        const threshold = getKeygenThreshold(this.keygenCommittee.length)
        setupMessage = KeygenSession.setup(
          null,
          threshold,
          this.keygenCommittee
        )
        // upload setup message to server
        const encryptedSetupMsg = encodeEncryptMessage(
          setupMessage,
          this.hexEncryptionKey
        )

        await uploadSetupMessage({
          serverUrl: this.serverURL,
          message: base64Encode(encryptedSetupMsg),
          sessionId: this.sessionId,
          messageId: undefined,
          additionalHeaders: undefined,
        })
      } else {
        const encodedEncryptedSetupMsg = await waitForSetupMessage({
          serverURL: this.serverURL,
          sessionId: this.sessionId,
        })
        setupMessage = await decodeDecryptMessage(
          encodedEncryptedSetupMsg,
          this.hexEncryptionKey
        )
      }
      const session = new KeygenSession(setupMessage, this.localPartyId)
      const outbound = this.processOutbound(session)
      const inbound = this.processInbound(session)
      const [, inboundResult] = await Promise.all([outbound, inbound])
      if (inboundResult) {
        const keyShare = session.finish()
        
      }
    } catch (error) {
      console.error('DKLS keygen error:', error)
    }
  }

  public async startKeygenWithRetry() {}
}
