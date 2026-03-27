import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { SignSession as DklsSignSession } from '@lib/dkls/vs_wasm'
import { SignSession as MldsaSignSession } from '@lib/mldsa/vs_wasm'
import { SignSession as SchnorrSignSession } from '@lib/schnorr/vs_schnorr_wasm'
import { match } from '@lib/utils/match'

import { toMpcLibKeyshare } from '../../lib/keyshare'

type MakeSetupMessageInput = {
  keyShare: string
  chainPath: string
  message: string
  devices: string[]
  signatureAlgorithm: SignatureAlgorithm
}

const mldsaLevel = 44

export const makeSetupMessage = ({
  keyShare,
  chainPath,
  message,
  devices,
  signatureAlgorithm,
}: MakeSetupMessageInput) => {
  const ks = toMpcLibKeyshare({ keyShare, signatureAlgorithm })
  const keyId = ks.keyId()
  const messageHash = Buffer.from(message, 'hex')

  return match(signatureAlgorithm, {
    ecdsa: () => DklsSignSession.setup(keyId, chainPath, messageHash, devices),
    eddsa: () =>
      SchnorrSignSession.setup(keyId, chainPath, messageHash, devices),
    mldsa: () =>
      MldsaSignSession.setup(
        mldsaLevel,
        keyId,
        chainPath,
        messageHash,
        devices
      ),
  })
}
