import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { Coin, coinKeyToString } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { Query } from '@lib/ui/query/Query'
import { useMemo } from 'react'

import { useBalancesQuery } from '../../../../chain/coin/queries/useBalancesQuery'
import { useCurrentVaultCoins } from '../../../state/currentVaultCoins'

type ChainSummary = {
  feeCoinAmount: number
  totalUsd: number
}

export const useChainSummaries = (): Query<
  Record<Coin['chain'], ChainSummary>
> => {
  const coins = useCurrentVaultCoins()
  const balancesQuery = useBalancesQuery(coins.map(extractAccountCoinKey))
  const pricesQuery = useCoinPricesQuery({ coins })

  const transform = useMemo(
    () =>
      ({
        balances,
        prices,
      }: {
        balances: Record<string, number | bigint>
        prices: Record<string, number>
      }) => {
        const result: Record<Coin['chain'], ChainSummary> = {} as any

        for (const coin of coins) {
          const key = coinKeyToString(extractAccountCoinKey(coin))
          const rawBal = balances[key] ?? 0
          const amount = fromChainAmount(rawBal, coin.decimals)
          const price = prices[key] ?? 0
          const usd = amount * price

          const chain = coin.chain
          const bucket =
            result[chain] ?? (result[chain] = { feeCoinAmount: 0, totalUsd: 0 })

          bucket.totalUsd += usd
          if (isFeeCoin(coin)) bucket.feeCoinAmount = amount
        }

        return result
      },
    [coins]
  )

  return useTransformQueriesData(
    {
      balances: { ...balancesQuery, error: balancesQuery.errors[0] },
      prices: { ...pricesQuery, error: pricesQuery.errors[0] },
    },
    ({ balances, prices }) => transform({ balances, prices })
  )
}
