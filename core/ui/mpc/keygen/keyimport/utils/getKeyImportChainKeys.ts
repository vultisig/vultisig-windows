import { Chain } from '@vultisig/core-chain/Chain'

/** One KeyImport chain session's outcome. */
export type KeyImportChainResult = {
  chain: Chain
  result: { publicKey: string; keyshare: string }
}

type KeyImportChainKeys = {
  chainPublicKeys: Partial<Record<Chain, string>>
  chainKeyShares: Partial<Record<Chain, string>>
}

/** Chains sharing a public key keep the first session's share, like iOS and Android. */
export const getKeyImportChainKeys = (
  results: readonly KeyImportChainResult[]
): KeyImportChainKeys => {
  const chainPublicKeys: Partial<Record<Chain, string>> = {}
  const chainKeyShares: Partial<Record<Chain, string>> = {}
  const shareByPublicKey = new Map<string, string>()

  for (const { chain, result } of results) {
    const keyshare = shareByPublicKey.get(result.publicKey) ?? result.keyshare
    shareByPublicKey.set(result.publicKey, keyshare)
    chainPublicKeys[chain] = result.publicKey
    chainKeyShares[chain] = keyshare
  }

  return { chainPublicKeys, chainKeyShares }
}
