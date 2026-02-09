import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { usdc } from '@core/chain/coin/knownTokens'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useCombineQueries } from '@lib/ui/query/hooks/useCombineQueries'
import { Query } from '@lib/ui/query/Query'
import { useMemo } from 'react'

import { useCircleAccountUsdcBalanceQuery } from './circleAccountUsdcBalance'

type TransformInput = {
  balance: bigint
  price: number
}

const transformToFiatValue = ({ balance, price }: TransformInput) => {
  const amount = fromChainAmount(balance, usdc.decimals)
  return amount * price
}

export const useCircleAccountUsdcFiatBalanceQuery = (): Query<number> => {
  const balanceQuery = useCircleAccountUsdcBalanceQuery()
  const priceQuery = useCoinPriceQuery({ coin: usdc })

  const queriesRecord = useMemo(
    () => ({
      balance: balanceQuery,
      price: priceQuery,
    }),
    [balanceQuery, priceQuery]
  )

  return useCombineQueries({
    queries: queriesRecord,
    joinData: transformToFiatValue,
    eager: false,
  })
}
