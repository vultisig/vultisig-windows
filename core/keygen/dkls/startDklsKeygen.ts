import { base64Encode } from '@lib/utils/base64Encode'
import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import { fromBase64 } from '@lib/utils/fromBase64'
import { retry } from '@lib/utils/query/retry'

import { KeygenSession } from '../../../lib/dkls/vs_wasm'
import { getKeygenThreshold } from '../utils/getKeygenThreshold'
import { downloadSetupMessage } from './downloadSetupMessage'
import { uploadSetupMessage } from './uploadSetupMessage'

type StartDklsKeygenInput = {
  isInitiatingDevice: boolean
  peers: string[]
  sessionId: string
  hexEncryptionKey: string
  serverUrl: string
  localPartyId: string
}

export const startDklsKeygen = async ({
  isInitiatingDevice,
  peers,
  hexEncryptionKey,
  serverUrl,
  sessionId,
  localPartyId,
}: StartDklsKeygenInput) => {
  const signers = [...peers, localPartyId]

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
  } else {
    const encodedSetupMessage = await retry({
      func: () =>
        downloadSetupMessage({
          serverUrl,
          sessionId,
        }),
      attempts: 10,
    })

    console.log('encodedSetupMessage', encodedSetupMessage)

    const setupMessage = decryptWithAesGcm({
      key: hexEncryptionKey,
      value: fromBase64(encodedSetupMessage),
    })

    console.log('setupMessage', setupMessage)

    const keygenSession = new KeygenSession(setupMessage, localPartyId)

    console.log('keygenSession', keygenSession)
  }
}
