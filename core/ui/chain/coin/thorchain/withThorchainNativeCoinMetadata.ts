import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { thorchainNativeTokensMetadata } from '@vultisig/core-chain/coin/knownTokens/thorchain'

/**
 * Backfills `decimals` (and `logo`) for a stored coin whose metadata is known in
 * `thorchainNativeTokensMetadata` but was persisted incomplete. Some receipt
 * coins (e.g. sRUJI) were stored without `decimals` — which renders a `NaN`
 * balance in the send flow — so this repairs them on read. Coins that already
 * carry a finite `decimals`, or that aren't known THORChain native tokens, pass
 * through unchanged.
 */
export const withThorchainNativeCoinMetadata = (
  coin: AccountCoin
): AccountCoin => {
  if (!coin.id || Number.isFinite(coin.decimals)) {
    return coin
  }

  const known = thorchainNativeTokensMetadata[coin.id]
  if (!known) {
    return coin
  }

  return { ...coin, decimals: known.decimals, logo: coin.logo ?? known.logo }
}
