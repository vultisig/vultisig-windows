import { base64Encode } from '@lib/utils/base64Encode'
import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import { fromBase64 } from '@lib/utils/fromBase64'
import { retry } from '@lib/utils/query/retry'

import __wbg_init, { KeygenSession } from '../../../lib/dkls/vs_wasm'
import { getKeygenThreshold } from '../utils/getKeygenThreshold'
import { downloadSetupMessage } from './downloadSetupMessage'
import { uploadSetupMessage } from './uploadSetupMessage'

type InitSetupMessageInput = {
  isInitiatingDevice: boolean
  peers: string[]
  sessionId: string
  hexEncryptionKey: string
  serverUrl: string
  localPartyId: string
}

export const initSetupMessage = async ({
  isInitiatingDevice,
  peers,
  hexEncryptionKey,
  serverUrl,
  sessionId,
  localPartyId,
}: InitSetupMessageInput) => {
  await __wbg_init()

  const signers = [...peers, localPartyId]

  if (isInitiatingDevice) {
    const threshold = getKeygenThreshold(signers.length)
    const setupMessage = KeygenSession.setup(null, threshold, signers)

    const encryptedSetupMessage = base64Encode(
      encryptWithAesGcm({
        key: Buffer.from(hexEncryptionKey, 'hex'),
        value: Buffer.from(setupMessage),
      })
    )

    await uploadSetupMessage({
      serverUrl,
      message: encryptedSetupMessage,
      sessionId,
    })

    return setupMessage
  }
  const encodedSetupMessage = await retry({
    func: () =>
      downloadSetupMessage({
        serverUrl,
        sessionId,
      }),
    attempts: 10,
  })

  return decryptWithAesGcm({
    key: Buffer.from(hexEncryptionKey, 'hex'),
    value: fromBase64(encodedSetupMessage),
  })
}
