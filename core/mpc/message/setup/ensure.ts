import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { getMessageHash } from '@core/mpc/getMessageHash'
import { prefixErrorWith } from '@lib/utils/error/prefixErrorWith'
import { transformError } from '@lib/utils/error/transformError'

import { makeSetupMessage } from '../../keysign/setupMessage/make'
import { fromMpcServerMessage, toMpcServerMessage } from '../server'
import { waitForSetupMessage } from './get'
import { uploadMpcSetupMessage } from './upload'

type EnsureSetupMessageInput = {
  keyShare: string
  signatureAlgorithm: SignatureAlgorithm
  message: string
  chainPath: string
  devices: string[]
  serverUrl: string
  sessionId: string
  hexEncryptionKey: string
  isInitiatingDevice: boolean
}

export const ensureSetupMessage = async ({
  keyShare,
  signatureAlgorithm,
  message,
  chainPath,
  devices,
  serverUrl,
  sessionId,
  hexEncryptionKey,
  isInitiatingDevice,
}: EnsureSetupMessageInput) => {
  const messageId = getMessageHash(message)

  if (isInitiatingDevice) {
    const setupMessage = makeSetupMessage({
      keyShare,
      chainPath,
      message,
      devices,
      signatureAlgorithm,
    })

    await transformError(
      uploadMpcSetupMessage({
        serverUrl,
        sessionId,
        message: toMpcServerMessage(setupMessage, hexEncryptionKey),
        messageId,
      }),
      prefixErrorWith('Failed to upload setup message')
    )

    return setupMessage
  }

  const serverSetupMessage = await transformError(
    waitForSetupMessage({
      serverUrl,
      sessionId,
      messageId,
    }),
    prefixErrorWith('Timed out while waiting for setup message')
  )

  return fromMpcServerMessage(serverSetupMessage, hexEncryptionKey)
}
