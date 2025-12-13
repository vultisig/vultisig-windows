import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { usdc } from '@core/chain/coin/knownTokens'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { useMemo } from 'react'

import { useCircleAccountUsdcBalanceQuery } from '../queries/circleAccountUsdcBalance'

type TransformInput = {
  balance: bigint
  price: number
}

const transformToFiatValue = ({ balance, price }: TransformInput) => {
  const amount = fromChainAmount(balance, usdc.decimals)
  return amount * price
}

export const CircleAccountFiatBalance = () => {
  const balanceQuery = useCircleAccountUsdcBalanceQuery()
  const priceQuery = useCoinPriceQuery({ coin: usdc })
  const formatFiatAmount = useFormatFiatAmount()

  const queriesRecord = useMemo(
    () => ({
      balance: balanceQuery,
      price: priceQuery,
    }),
    [balanceQuery, priceQuery]
  )

  const query = useTransformQueriesData(queriesRecord, transformToFiatValue)

  return <MatchQuery value={query} success={formatFiatAmount} />
}
