import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { SignSession } from '@core/mpc/lib/signSession'

import { toMpcLibKeyshare } from '../../lib/keyshare'

type MakeSetupMessageInput = {
  keyShare: string
  chainPath: string
  message: string
  devices: string[]
  signatureAlgorithm: SignatureAlgorithm
}

export const makeSetupMessage = ({
  keyShare,
  chainPath,
  message,
  devices,
  signatureAlgorithm,
}: MakeSetupMessageInput) => {
  console.log('[makeSetupMessage] parsing keyshare...')
  const ks = toMpcLibKeyshare({ keyShare, signatureAlgorithm })
  console.log('[makeSetupMessage] keyshare parsed, getting keyId...')
  const keyId = ks.keyId()
  console.log('[makeSetupMessage] keyId obtained, creating setup message...', {
    chainPath,
    messageLen: message.length,
    devices,
  })
  try {
    const result = SignSession[signatureAlgorithm].setup(
      keyId,
      chainPath,
      Buffer.from(message, 'hex'),
      devices
    )
    console.log('[makeSetupMessage] setup message created, length:', result?.length)
    return result
  } catch (err) {
    console.error('[makeSetupMessage] FAILED at SignSession.setup:', err)
    throw err
  }
}
