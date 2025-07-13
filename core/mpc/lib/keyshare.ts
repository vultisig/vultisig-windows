import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { Keyshare as DklsKeyshare } from '@lib/dkls/vs_wasm'
import { Keyshare as SchnorrKeyshare } from '@lib/schnorr/vs_schnorr_wasm'

const Keyshare: Record<
  SignatureAlgorithm,
  typeof DklsKeyshare | typeof SchnorrKeyshare
> = {
  ecdsa: DklsKeyshare,
  eddsa: SchnorrKeyshare,
}

type ToMpcLibKeyshareInput = {
  keyShare: string
  signatureAlgorithm: SignatureAlgorithm
}

export const toMpcLibKeyshare = ({
  keyShare,
  signatureAlgorithm,
}: ToMpcLibKeyshareInput) =>
  Keyshare[signatureAlgorithm].fromBytes(Buffer.from(keyShare, 'base64'))
