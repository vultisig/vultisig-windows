import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { SignSession as DklsSignSession } from '@lib/dkls/vs_wasm'
import { SignSession as SchnorrSignSession } from '@lib/schnorr/vs_schnorr_wasm'

import { toMpcLibKeyshare } from './keyshare'

export const SignSession: Record<
  SignatureAlgorithm,
  typeof DklsSignSession | typeof SchnorrSignSession
> = {
  ecdsa: DklsSignSession,
  eddsa: SchnorrSignSession,
}

type MakeSignSessionInput = {
  setupMessage: Uint8Array
  localPartyId: string
  keyShare: string
  signatureAlgorithm: SignatureAlgorithm
}

export const makeSignSession = ({
  setupMessage,
  localPartyId,
  keyShare,
  signatureAlgorithm,
}: MakeSignSessionInput) =>
  new SignSession[signatureAlgorithm](
    setupMessage,
    localPartyId,
    toMpcLibKeyshare({
      keyShare,
      signatureAlgorithm,
    })
  )
