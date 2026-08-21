import { Chain } from '@vultisig/core-chain/Chain'
import { kaminoVaultRegistry } from '@vultisig/core-chain/chains/solana/kamino/registry'
import type { CoinKey } from '@vultisig/core-chain/coin/Coin'

/**
 * A Kamino Earn position is held as the vault's share token (a kToken), and
 * it is surfaced under DeFi → Earn, valued through the vault's share rate.
 *
 * The share mint is a real SPL token the coin finder can discover, so without
 * this filter the same position would be counted twice: once as a DeFi
 * position and again as a wallet token — and the wallet row would be priced
 * wrong, because a kToken has no price feed of its own and is only meaningful
 * multiplied by `tokensPerShare`.
 *
 * Every launch vault also auto-stakes its shares into a farm, so a discovered
 * balance is normally zero; the filter still matters for the window between a
 * deposit's mint and its stake, and for any vault whose farm is later removed.
 */
const kaminoShareMints = new Set(
  kaminoVaultRegistry.map(({ sharesMint }) => sharesMint)
)

/** Whether this coin is one of the curated vaults' share mints. */
export const isKaminoShareCoin = (coin: CoinKey): boolean =>
  coin.chain === Chain.Solana &&
  coin.id !== undefined &&
  kaminoShareMints.has(coin.id)

/**
 * Drops Kamino share entries. Returns the input array instance itself when
 * nothing is removed, so downstream `useMemo` deps stay stable for the typical
 * vault, which holds none — which is also why the parameter is a mutable
 * array: handing back a `readonly` input as mutable would launder away the
 * caller's guarantee.
 */
export const withoutKaminoShareCoins = <T extends CoinKey>(coins: T[]): T[] => {
  if (!coins.some(isKaminoShareCoin)) {
    return coins
  }

  return coins.filter(coin => !isKaminoShareCoin(coin))
}
