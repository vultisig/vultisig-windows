import { Coin, coinKeyToString } from '@core/chain/coin/Coin'
import { FiatCurrency } from '@core/config/FiatCurrency'
import { Query } from '@lib/ui/query/Query'
import { pick } from '@lib/utils/record/pick'
import { useMemo } from 'react'

import { useCoinPricesQuery } from './useCoinPricesQuery'

type UseCoinPricesQueryInput = {
  coin: Coin
  fiatCurrency?: FiatCurrency
}

export const useCoinPriceQuery = ({
  coin,
  fiatCurrency,
}: UseCoinPricesQueryInput): Query<number> => {
  const query = useCoinPricesQuery({
    coins: [coin],
    fiatCurrency,
  })

  return useMemo(() => {
    const error = query.errors[0] ?? null

    const data = query.data?.[coinKeyToString(coin)]

    return {
      data,
      ...pick(query, ['isPending', 'isLoading']),
      error,
    }
  }, [query, coin])
}
