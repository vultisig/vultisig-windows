import { Chain } from '@vultisig/core-chain/Chain'
import type { CoinKey } from '@vultisig/core-chain/coin/Coin'

type BondedRuneReceiptInput = CoinKey & { ticker?: string }

/**
 * ybRUNE (`x/staking-x/brune`) is the auto-compounding receipt for bonded RUNE
 * (bRUNE) staked via Rujira liquid bonding. Like the sRUJI receipt
 * ({@link isRujiStakingReceiptCoin}), it is a DeFi position rather than a
 * spendable wallet token, so it is excluded from the portfolio coin list,
 * cross-vault totals, and coin-finder auto-add, and is surfaced under DeFi.
 *
 * The share denom is already excluded from `@vultisig/core-chain` coin
 * auto-discovery (`findCosmosCoins` skips `bruneBondConfig.shareDenom`); this
 * module is the app-side guarantee so vaults that already persisted a receipt
 * row keep their balances, totals, and pickers correct.
 */
const bondedRuneReceiptDenoms = new Set(['x/staking-x/brune'])

export const isBondedRuneReceiptCoin = (
  coin: BondedRuneReceiptInput
): boolean => {
  if (coin.chain !== Chain.THORChain) {
    return false
  }

  if (coin.id !== undefined && coin.id !== null && coin.id !== '') {
    if (bondedRuneReceiptDenoms.has(String(coin.id).toLowerCase())) {
      return true
    }
  }

  return coin.ticker?.toLowerCase() === 'ybrune'
}

/**
 * Drops ybRUNE receipt entries. Returns the input array instance when nothing is
 * removed so downstream `useMemo` deps stay stable for typical vaults (no
 * receipt row).
 */
export const withoutBondedRuneReceiptCoins = <T extends BondedRuneReceiptInput>(
  coins: T[]
): T[] => {
  if (!coins.some(isBondedRuneReceiptCoin)) {
    return coins
  }

  return coins.filter(coin => !isBondedRuneReceiptCoin(coin))
}
