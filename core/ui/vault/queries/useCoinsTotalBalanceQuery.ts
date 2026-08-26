import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useBalancesQuery } from '@core/ui/chain/coin/queries/useBalancesQuery'
import {
  AccountCoin,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'

import {
  resolveCoinsTotalBalance,
  TotalBalanceQuery,
} from './resolveCoinsTotalBalance'

/**
 * Shared progressive fiat-total query used for both the vault-wide total and the
 * per-chain total. See {@link resolveCoinsTotalBalance} for the partial-sum,
 * `isUpdating` and `isIncomplete` semantics.
 */
export const useCoinsTotalBalanceQuery = (
  coins: AccountCoin[]
): TotalBalanceQuery => {
  const pricesQuery = useCoinPricesQuery({
    coins,
  })

  const balancesQuery = useBalancesQuery(coins.map(extractAccountCoinKey))

  return resolveCoinsTotalBalance({
    coins,
    prices: pricesQuery.data,
    balances: balancesQuery.data,
    failedCoins: balancesQuery.failedCoins,
    isPricesPending: pricesQuery.isPending,
    error: [...balancesQuery.errors, ...pricesQuery.errors][0] ?? null,
  })
}
