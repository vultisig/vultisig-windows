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
}: ToMpcLibKeyshareInput) => {
  const bytes = Buffer.from(keyShare, 'base64')
  console.log('[toMpcLibKeyshare]', {
    signatureAlgorithm,
    keyShareStringLen: keyShare.length,
    keySharePrefix: keyShare.slice(0, 30),
    decodedByteLen: bytes.length,
    firstBytes: Array.from(bytes.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' '),
  })
  try {
    const result = Keyshare[signatureAlgorithm].fromBytes(bytes)
    console.log('[toMpcLibKeyshare] success')
    return result
  } catch (err) {
    console.error('[toMpcLibKeyshare] FAILED:', err)
    throw err
  }
}
