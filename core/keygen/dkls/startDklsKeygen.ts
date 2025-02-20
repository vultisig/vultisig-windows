import { KeygenSession } from '../../../lib/dkls/vs_wasm'
import { getKeygenThreshold } from '../utils/getKeygenThreshold'
import { encryptSetupMessage } from './encryptSetupMessge'
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

    const encryptedSetupMessage = encryptSetupMessage({
      message: setupMessage,
      hexEncryptionKey,
    })

    await uploadSetupMessage({
      serverUrl,
      message: encryptedSetupMessage,
      sessionId,
    })
  }
}
