import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { MpcLibKeyshare } from '@core/mpc/lib/keyshare'
import { SignSession } from '@core/mpc/lib/signSession'

type MakeSetupMessageInput = {
  keyShare: MpcLibKeyshare
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
    keyShare.keyId(),
    chainPath,
    Buffer.from(message, 'hex'),
    devices
  )
