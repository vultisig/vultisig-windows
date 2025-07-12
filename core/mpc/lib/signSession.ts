import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { SignSession as DklsSignSession } from '@lib/dkls/vs_wasm'
import { SignSession as SchnorrSignSession } from '@lib/schnorr/vs_schnorr_wasm'

export const SignSession: Record<
  SignatureAlgorithm,
  typeof DklsSignSession | typeof SchnorrSignSession
> = {
  ecdsa: DklsSignSession,
  eddsa: SchnorrSignSession,
}
