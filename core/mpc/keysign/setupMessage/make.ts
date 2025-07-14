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
}: MakeSetupMessageInput) =>
  SignSession[signatureAlgorithm].setup(
    toMpcLibKeyshare({
      keyShare,
      signatureAlgorithm,
    }).keyId(),
    chainPath,
    Buffer.from(message, 'hex'),
    devices
  )
