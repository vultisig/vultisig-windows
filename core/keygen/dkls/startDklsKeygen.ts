import { base64Encode } from '@lib/utils/base64Encode'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'

import { KeygenSession } from '../../../lib/dkls/vs_wasm'
import { getKeygenThreshold } from '../utils/getKeygenThreshold'
import { uploadSetupMessage } from './uploadSetupMessage'

type StartDklsKeygenInput = {
  isInitiatingDevice: boolean
  signers: string[]
  sessionId: string
  hexEncryptionKey: string
  serverUrl: string
}

export const startDklsKeygen = async ({
  isInitiatingDevice,
  signers,
  hexEncryptionKey,
  serverUrl,
  sessionId,
}: StartDklsKeygenInput) => {
  if (isInitiatingDevice) {
    const threshold = getKeygenThreshold(signers.length)
    const setupMessage = KeygenSession.setup(null, threshold, signers)

    const encryptedSetupMessage = base64Encode(
      encryptWithAesGcm({
        key: hexEncryptionKey,
        value: Buffer.from(setupMessage),
      })
    )

    await uploadSetupMessage({
      serverUrl,
      message: encryptedSetupMessage,
      sessionId,
    })
  }
}
