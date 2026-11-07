import { getResolvedQuery, pendingQuery, Query } from '@lib/ui/query/Query'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  AccountCoin,
  accountCoinKeyToString,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'

import { useCoinPricesQuery } from '../../chain/coin/price/queries/useCoinPricesQuery'
import { useBalancesQuery } from '../../chain/coin/queries/useBalancesQuery'
import { usePortfolioVaultChainCoins } from '../state/currentVaultCoins'
import { VaultChainCoin } from './useVaultChainCoinsQuery'

/** Chain coins that have loaded so far, flagged while others are still loading or have failed. */
type ProgressiveVaultChainCoinsQuery = Query<VaultChainCoin[]> & {
  isUpdating: boolean
  isIncomplete: boolean
}

type CollectLoadedCoinsInput = {
  coins: AccountCoin[]
  prices: Record<string, number>
  balances: Record<string, bigint> | undefined
  failedCoins: string[]
}

/** Coins whose balance has loaded, with whether any are still loading or have failed. */
const collectLoadedCoins = ({
  coins,
  prices,
  balances,
  failedCoins,
}: CollectLoadedCoinsInput) => {
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

    rows.push({ ...coin, amount, price: prices[coinKeyToString(coin)] })
  })

  return { rows, hasLoadingCoin, hasFailedCoin }
}

type ResolveProgressiveVaultChainCoinsInput = {
  coins: AccountCoin[]
  prices: Record<string, number> | undefined
  isPricesPending: boolean
  priceError: unknown
  balances: Record<string, bigint> | undefined
  failedCoins: string[]
  balanceError: unknown
}

/**
 * Lists each coin whose balance has loaded once prices have settled, since a
 * row without a price reads as zero. A missing balance is reported as loading
 * or failed, never as an amount; a failed price read marks the list incomplete.
 */
const resolveProgressiveVaultChainCoins = ({
  coins,
  prices,
  isPricesPending,
  priceError,
  balances,
  failedCoins,
  balanceError,
}: ResolveProgressiveVaultChainCoinsInput): ProgressiveVaultChainCoinsQuery => {
  if (isPricesPending) {
    return { ...pendingQuery, isUpdating: true, isIncomplete: false }
  }

  if (!prices) {
    return {
      data: undefined,
      isPending: false,
      error: priceError ?? new Error('Failed to load prices'),
      isUpdating: false,
      isIncomplete: false,
    }
  }

  const { rows, hasLoadingCoin, hasFailedCoin } = collectLoadedCoins({
    coins,
    prices,
    balances,
    failedCoins,
  })

  if (rows.length === 0 && hasLoadingCoin) {
    return { ...pendingQuery, isUpdating: true, isIncomplete: false }
  }

  if (rows.length === 0 && hasFailedCoin) {
    return {
      data: undefined,
      isPending: false,
      error: balanceError ?? new Error('Failed to load balances'),
      isUpdating: false,
      isIncomplete: false,
    }
  }

  return {
    ...getResolvedQuery(rows),
    isUpdating: hasLoadingCoin,
    isIncomplete: hasFailedCoin || priceError !== undefined,
  }
}

/**
 * A chain's coins for display, each listed once its balance has loaded, so a
 * slow or failed read holds back only its own row. Use `useVaultChainCoinsQuery`
 * where every balance must be present at once.
 */
export const useProgressiveVaultChainCoinsQuery = (chain: Chain) => {
  const coins = usePortfolioVaultChainCoins(chain)
  const pricesQuery = useCoinPricesQuery({ coins })
  const balancesQuery = useBalancesQuery(coins.map(extractAccountCoinKey))

  return resolveProgressiveVaultChainCoins({
    coins,
    prices: pricesQuery.data,
    isPricesPending: pricesQuery.isPending,
    priceError: pricesQuery.errors[0],
    balances: balancesQuery.data,
    failedCoins: balancesQuery.failedCoins,
    balanceError: balancesQuery.errors[0],
  })
}
