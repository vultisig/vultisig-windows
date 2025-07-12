import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { Keyshare as DklsKeyshare } from '@lib/dkls/vs_wasm'
import { Keyshare as SchnorrKeyshare } from '@lib/schnorr/vs_schnorr_wasm'

export const Keyshare: Record<
  SignatureAlgorithm,
  typeof DklsKeyshare | typeof SchnorrKeyshare
> = {
  ecdsa: DklsKeyshare,
  eddsa: SchnorrKeyshare,
}
