import { Chain } from '@vultisig/core-chain/Chain'
import type { CoinKey } from '@vultisig/core-chain/coin/Coin'

type ThorchainLpInput = CoinKey & { ticker?: string }

const bowLpDenomPrefix = 'x/bow-'

/**
 * THORChain (Rujira) liquidity-provider tokens. Their bank denoms are minted
 * by the BOW AMM under `x/bow-…` (e.g. `x/bow-xyk-gaia-atom-eth-usdc-0x…`),
 * which is the primary classifier. An `LP-…` ticker (e.g.
 * `LP-THOR.RUJI/ETH.USDC-XYK`, the on-chain bank-denom metadata `symbol`) also
 * classifies any row, with or without a denom, so LP rows stored under another
 * denom form stay hidden as before. The ticker alone is not enough:
 * `@vultisig/core-chain`'s known-token list names the same denoms
 * `ATOM/USDC.ETH`, and coin discovery prefers that metadata.
 *
 * **First principles:** LP tokens are DeFi positions, not spendable wallet
 * tokens. They belong in the DeFi tab (`DeFi → LPs`, fed independently from
 * Midgard / thornode), not the portfolio token list. iOS never models them as
 * wallet `Coin`s at all; this module is the app-side equivalent so balances,
 * fiat totals, and swap/send pickers stay free of LP entries even when a row
 * already exists in vault storage.
 *
 * **Where to filter:** Prefer `usePortfolioVaultCoins` /
 * `usePortfolioVaultChainCoins` from `@core/ui/vault/state/currentVaultCoins`
 * instead of calling `withoutThorchainLpCoins` at each call site. Mirrors the
 * {@link isRujiStakingReceiptCoin} pattern.
 */
export const isThorchainLpCoin = (coin: ThorchainLpInput): boolean => {
  if (coin.chain !== Chain.THORChain) {
    return false
  }

  if (coin.id?.toLowerCase().startsWith(bowLpDenomPrefix)) {
    return true
  }

  return coin.ticker?.toUpperCase().startsWith('LP-') === true
}

/**
 * Drops THORChain LP entries. Returns the input array instance when nothing is
 * removed so downstream `useMemo` deps stay stable for typical vaults (no LP
 * row).
 */
export const withoutThorchainLpCoins = <T extends ThorchainLpInput>(
  coins: readonly T[]
): T[] => {
  if (!coins.some(isThorchainLpCoin)) {
    return coins as T[]
  }

  return coins.filter(coin => !isThorchainLpCoin(coin))
}
