import { base64Encode } from '@lib/utils/base64Encode'

import __wbg_init, { KeygenSession } from '../../../lib/dkls/vs_wasm'
import { getKeygenThreshold } from '../getKeygenThreshold'
import { KeygenType } from '../tssType'
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
        await uploadSetupMessage({
          serverUrl: this.serverURL,
          message: base64EncodedSetupMsg,
          sessionId: this.sessionId,
          messageId: undefined,
          additionalHeaders: undefined,
        })
      } else {

      }
      const session = new KeygenSession(setupMessage, this.localPartyId)
    } catch (error) {
      console.error('DKLS keygen error:', error)
    }
  }

  public async startKeygenWithRetry() {}
}
