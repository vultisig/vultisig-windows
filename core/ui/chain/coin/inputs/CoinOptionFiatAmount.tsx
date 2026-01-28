import { CoinKey } from '@core/chain/coin/Coin'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'

import { CoinOptionFiatValue } from './CoinOptionFiatValue'

type Props = {
  coin: CoinKey
  amount: number
}

export const CoinOptionFiatAmount = ({ coin, amount }: Props) => {
  const priceQuery = useCoinPriceQuery({ coin })

  return (
    <MatchQuery
      value={priceQuery}
      pending={() => <Skeleton />}
      success={price => <CoinOptionFiatValue value={amount * price} />}
    />
  )
}
