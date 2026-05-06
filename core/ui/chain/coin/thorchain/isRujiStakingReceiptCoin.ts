import { Chain } from '@vultisig/core-chain/Chain'
import type { CoinKey } from '@vultisig/core-chain/coin/Coin'

type RujiReceiptInput = CoinKey & { ticker?: string }

/**
 * RUJI stake is surfaced under DeFi (GraphQL bonded position). The on-chain
 * receipt token is not a spendable “wallet token” in product UX.
 *
 * **First principles:** Same pattern as TCY → `x/staking-tcy` (sTCY): the share
 * / receipt denom is excluded from coin-finder auto-add in `@vultisig/core-chain`
 * (`findCosmosCoins` skips `tcyAutoCompounderConfig.shareDenom`). RUJI receipts
 * should get the same upstream exclusion when core-chain is next touched; this
 * module is the app-side guarantee so balances, totals, and pickers stay
 * correct even if a receipt row already exists in vault storage.
 *
 * **Where to filter:** Prefer `usePortfolioVaultCoins` /
 * `usePortfolioVaultChainCoins` from `@core/ui/vault/state/currentVaultCoins`
 * instead of calling `withoutRujiStakingReceiptCoins` at each call site.
 *
 * **iOS parity:** Receipt denoms `x/staking-x/ruji` / `x/staking-ruji` (sRUJI)
 * are not treated like normal discoverable balances for the token list; stake
 * is shown from staking APIs (issue #3749).
 */
const rujiStakingReceiptDenoms = new Set(['x/staking-x/ruji', 'x/staking-ruji'])

export const isRujiStakingReceiptCoin = (coin: RujiReceiptInput): boolean => {
  if (coin.chain !== Chain.THORChain) {
    return false
  }

  if (coin.id !== undefined && coin.id !== null && coin.id !== '') {
    if (rujiStakingReceiptDenoms.has(String(coin.id).toLowerCase())) {
      return true
    }
  }

  return coin.ticker?.toLowerCase() === 'sruji'
}

/**
 * Drops RUJI staking receipt entries. Returns the input array instance when
 * nothing is removed so downstream `useMemo` deps stay stable for typical
 * vaults (no receipt row).
 */
export const withoutRujiStakingReceiptCoins = <T extends RujiReceiptInput>(
  coins: readonly T[]
): T[] => {
  if (!coins.some(isRujiStakingReceiptCoin)) {
    return coins as T[]
  }

  return coins.filter(coin => !isRujiStakingReceiptCoin(coin))
}
