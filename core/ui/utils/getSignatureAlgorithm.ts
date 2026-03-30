import { type Chain } from '@vultisig/core-chain/Chain'
import { getChainKind } from '@vultisig/core-chain/ChainKind'
import {
  type SignatureAlgorithm,
  signatureAlgorithms,
} from '@vultisig/core-chain/signing/SignatureAlgorithm'

/** Published `@vultisig/core-chain` omits MLDSA and QBTC; windows still keysigns QBTC via local helpers. */
export type SignatureAlgorithmWithMldsa = SignatureAlgorithm | 'mldsa'

/**
 * Returns the signing algorithm for a chain, including per-chain overrides (e.g. QBTC → MLDSA)
 * that are not in the published SDK.
 */
export const getSignatureAlgorithm = (
  chain: Chain | 'QBTC'
): SignatureAlgorithmWithMldsa => {
  if (chain === 'QBTC') {
    return 'mldsa'
  }
  return signatureAlgorithms[getChainKind(chain)]
}
