import { base64Encode } from '@lib/utils/base64Encode'
import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'

import __wbg_init, { KeygenSession } from '../../../lib/dkls/vs_wasm'
import { getKeygenThreshold } from '../getKeygenThreshold'
import { KeygenType } from '../tssType'
import { waitForSetupMessage } from './downloadSetupMessage'
import { uploadSetupMessage } from './uploadSetupMessage'

export class DKLSKeygen {
  private readonly tssType: KeygenType
  private readonly isInitiateDevice: boolean
  private readonly serverURL: string
  private readonly sessionId: string
  private readonly localPartyId: string
  private readonly keygenCommittee: string[]
  private readonly oldKeygenCommittee: string[]
  private readonly hexEncryptionKey: string
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

  private decodeDecryptMessage(message: string) {
    const encryptedMessage = Buffer.from(message, 'base64')
    const decryptedMessage = decryptWithAesGcm({
      key: Buffer.from(this.hexEncryptionKey, 'hex'),
      value: encryptedMessage,
    })
    return Buffer.from(decryptedMessage.toString(), 'base64')
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
        const base64EncodedSetupMsg = base64Encode(setupMessage)
        const encryptedSetupMsg = encryptWithAesGcm({
          key: Buffer.from(this.hexEncryptionKey, 'hex'),
          value: Buffer.from(base64EncodedSetupMsg),
        })

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
        setupMessage = this.decodeDecryptMessage(encodedEncryptedSetupMsg)
      }
      const session = new KeygenSession(setupMessage, this.localPartyId)
    } catch (error) {
      console.error('DKLS keygen error:', error)
    }
  }

  public async startKeygenWithRetry() {}
}
