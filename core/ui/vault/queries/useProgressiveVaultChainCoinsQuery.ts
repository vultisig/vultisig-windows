import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useBalancesQuery } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { usePortfolioVaultChainCoins } from '@core/ui/vault/state/currentVaultCoins'
import { getResolvedQuery, pendingQuery, Query } from '@lib/ui/query/Query'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  AccountCoin,
  accountCoinKeyToString,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'

import { VaultChainCoin } from './useVaultChainCoinsQuery'

/** Chain coins that have loaded so far, flagged while others are still loading or have failed. */
export type ProgressiveVaultChainCoinsQuery = Query<VaultChainCoin[]> & {
  isUpdating: boolean
  isIncomplete: boolean
}

type ResolveProgressiveVaultChainCoinsInput = {
  coins: AccountCoin[]
  prices: Record<string, number> | undefined
  isPricesPending: boolean
  balances: Record<string, bigint> | undefined
  failedCoins: string[]
  error: unknown
}

/** Lists each coin whose balance has loaded; a missing balance is reported as loading or failed, never as an amount. */
const resolveProgressiveVaultChainCoins = ({
  coins,
  prices,
  isPricesPending,
  balances,
  failedCoins,
  error,
}: ResolveProgressiveVaultChainCoinsInput): ProgressiveVaultChainCoinsQuery => {
  const failedCoinKeys = new Set(failedCoins)
  const rows: VaultChainCoin[] = []
  let hasLoadingCoin = false
  let hasFailedCoin = false

  coins.forEach(coin => {
    const balanceKey = accountCoinKeyToString(extractAccountCoinKey(coin))
    const amount = balances?.[balanceKey]

    if (amount === undefined) {
      if (failedCoinKeys.has(balanceKey)) {
        hasFailedCoin = true
      } else {
        hasLoadingCoin = true
      }
      return
    }

    rows.push({ ...coin, amount, price: prices?.[coinKeyToString(coin)] })
  })

  if (rows.length === 0 && hasLoadingCoin) {
    return { ...pendingQuery, isUpdating: true, isIncomplete: false }
  }

  if (rows.length === 0 && hasFailedCoin) {
    return {
      data: undefined,
      isPending: false,
      error: error ?? new Error('Failed to load balances'),
      isUpdating: false,
      isIncomplete: false,
    }
  }

  return {
    ...getResolvedQuery(rows),
    isUpdating: hasLoadingCoin || isPricesPending,
    isIncomplete: hasFailedCoin,
  }
}

/**
 * A chain's coins for display, each listed once its balance has loaded, so a
 * slow or failed read holds back only its own row. Use `useVaultChainCoinsQuery`
 * where every balance must be present at once.
 */
export const useProgressiveVaultChainCoinsQuery = (
  chain: Chain
): ProgressiveVaultChainCoinsQuery => {
  const coins = usePortfolioVaultChainCoins(chain)
  const pricesQuery = useCoinPricesQuery({ coins })
  const balancesQuery = useBalancesQuery(coins.map(extractAccountCoinKey))

  return resolveProgressiveVaultChainCoins({
    coins,
    prices: pricesQuery.data,
    isPricesPending: pricesQuery.isPending,
    balances: balancesQuery.data,
    failedCoins: balancesQuery.failedCoins,
    error: balancesQuery.errors[0] ?? null,
  })
}
