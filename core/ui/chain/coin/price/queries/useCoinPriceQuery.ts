import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { CoinKey, coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { FiatCurrency } from '@vultisig/core-config/FiatCurrency'
import { useCallback } from 'react'

type UseCoinPricesQueryInput = {
  coin: CoinKey
  fiatCurrency?: FiatCurrency
}

export const useCoinPriceQuery = ({
  coin,
  fiatCurrency,
}: UseCoinPricesQueryInput) => {
  const query = useCoinPricesQuery({
    coins: [coin],
    fiatCurrency,
    eager: false,
  })

  return useTransformQueryData(
    query,
    useCallback(data => data[coinKeyToString(coin)], [coin])
  )
}
