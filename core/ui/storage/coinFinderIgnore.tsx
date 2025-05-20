import { CoinKey } from '@core/chain/coin/Coin'
import { fixedDataQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useQuery } from '@tanstack/react-query'

import { coinFinderIgnoreQueryKey } from '../query/keys'
import { useCore } from '../state/core'

export type GetCoinFinderIgnoreFunction = () => Promise<CoinKey[]>

export type AddToCoinFinderIgnoreFunction = (coinKey: CoinKey) => Promise<void>

export type RemoveFromCoinFinderIgnoreFunction = (
  coinKey: CoinKey
) => Promise<void>

export type CoinFinderIgnoreStorage = {
  getCoinFinderIgnore: GetCoinFinderIgnoreFunction
  addToCoinFinderIgnore: AddToCoinFinderIgnoreFunction
  removeFromCoinFinderIgnore: RemoveFromCoinFinderIgnoreFunction
}

export const coinFinderIgnoreInitialValue: CoinKey[] = []

export const useCoinFinderIgnoreQuery = () => {
  const { getCoinFinderIgnore } = useCore()

  return useQuery({
    queryKey: coinFinderIgnoreQueryKey,
    queryFn: getCoinFinderIgnore,
    ...fixedDataQueryOptions,
  })
}

export const useCoinFinderIgnore = () => {
  const { data } = useCoinFinderIgnoreQuery()

  return shouldBePresent(data)
}
