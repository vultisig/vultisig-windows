import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useVaults } from '@core/ui/storage/vaults'
import { persistQueryOptions } from '@lib/ui/query/utils/options'
import { useQueries } from '@tanstack/react-query'
import {
  AccountCoin,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import { accountCoinKeyToString } from '@vultisig/core-chain/coin/AccountCoin'
import { getCoinBalance } from '@vultisig/core-chain/coin/balance'
import { areEqualCoins, coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { getCoinValue } from '@vultisig/core-chain/coin/utils/getCoinValue'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { withoutDuplicates } from '@vultisig/lib-utils/array/withoutDuplicates'
import { useMemo } from 'react'

type CoinEntry = {
  vaultId: string
  coin: AccountCoin
}

export const useVaultsTotalBalances = () => {
  const vaults = useVaults()

  const coinEntries = useMemo<CoinEntry[]>(() => {
    return vaults.flatMap(vault => {
      const vaultId = getVaultId(vault)
      return vault.coins.map(coin => ({
        vaultId,
        coin,
      }))
    })
  }, [vaults])

  const uniqueCoinsForPrices = useMemo(
    () =>
      withoutDuplicates(
        coinEntries.map(({ coin }) => coin),
        areEqualCoins
      ).map(coin => ({
        chain: coin.chain,
        id: coin.id,
        priceProviderId: coin.priceProviderId,
      })),
    [coinEntries]
  )

  const priceQuery = useCoinPricesQuery({
    coins: uniqueCoinsForPrices,
  })

  const balanceQueries = useQueries({
    queries: coinEntries.map(({ coin, vaultId }) => {
      const key = extractAccountCoinKey(coin)

      return {
        queryKey: [
          'vaultCoinBalance',
          vaultId,
          accountCoinKeyToString(key),
        ] as const,
        queryFn: async () => ({
          amount: await getCoinBalance(key),
        }),
        ...persistQueryOptions,
      }
    }),
  })

  const isBalancesPending = balanceQueries.some(query => query.isPending)
  const balancesError = balanceQueries.find(query => query.error)?.error ?? null

  const priceError =
    'error' in priceQuery ? priceQuery.error : (priceQuery.errors[0] ?? null)

  const isPending = priceQuery.isPending || isBalancesPending
  const error = priceError ?? balancesError

  const totals = useMemo(() => {
    if (
      isPending ||
      error ||
      !priceQuery.data ||
      balanceQueries.some(query => !query.data)
    ) {
      return undefined
    }

    const priceRecord = priceQuery.data
    const result: Record<string, number> = {}

    coinEntries.forEach(({ vaultId, coin }, index) => {
      const amount = balanceQueries[index].data?.amount
      if (amount === undefined) return

      const price = priceRecord[coinKeyToString(coin)] ?? 0
      if (price === 0) return

      const value = getCoinValue({
        amount,
        decimals: coin.decimals,
        price,
      })

      result[vaultId] = (result[vaultId] ?? 0) + value
    })

    return result
  }, [balanceQueries, coinEntries, error, isPending, priceQuery.data])

  return {
    totals,
    isPending,
    error,
  }
}
