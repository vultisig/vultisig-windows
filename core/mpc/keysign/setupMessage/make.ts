import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { SignSession as DklsSignSession } from '@lib/dkls/vs_wasm'
import { SignSession as MldsaSignSession } from '@lib/mldsa/vs_wasm'
import { SignSession as SchnorrSignSession } from '@lib/schnorr/vs_schnorr_wasm'

import { toMpcLibKeyshare } from '../../lib/keyshare'

type SetupFn = (
  keyId: Uint8Array,
  chainPath: string,
  messageHash: Uint8Array,
  devices: string[]
) => Uint8Array

const mldsaLevel = 44

const setupByAlgorithm: Record<SignatureAlgorithm, SetupFn> = {
  ecdsa: (keyId, chainPath, messageHash, devices) =>
    DklsSignSession.setup(keyId, chainPath, messageHash, devices),
  eddsa: (keyId, chainPath, messageHash, devices) =>
    SchnorrSignSession.setup(keyId, chainPath, messageHash, devices),
  mldsa: (keyId, chainPath, messageHash, devices) =>
    MldsaSignSession.setup(mldsaLevel, keyId, chainPath, messageHash, devices),
}

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
  const ks = toMpcLibKeyshare({ keyShare, signatureAlgorithm })
  const keyId = ks.keyId()

  return setupByAlgorithm[signatureAlgorithm](
    keyId,
    chainPath,
    Buffer.from(message, 'hex'),
    devices
  )
}
