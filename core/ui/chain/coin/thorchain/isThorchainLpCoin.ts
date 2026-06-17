import { Chain } from '@vultisig/core-chain/Chain'
import type { CoinKey } from '@vultisig/core-chain/coin/Coin'

type ThorchainLpInput = CoinKey & { ticker?: string }

/**
 * THORChain (Rujira) liquidity-provider tokens — e.g.
 * `LP-THOR.RUJI/ETH.USDC-XYK`, `LP-GAIA.ATOM/ETH.USDC-XYK`. Their on-chain
 * bank-denom metadata `symbol` is the `LP-…` string surfaced here as the
 * ticker, so the prefix is a reliable, metadata-driven classifier.
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
export const isThorchainLpCoin = (coin: ThorchainLpInput): boolean =>
  coin.chain === Chain.THORChain &&
  coin.ticker?.toUpperCase().startsWith('LP-') === true

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
