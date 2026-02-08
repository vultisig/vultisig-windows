import { CoinKey } from '@core/chain/coin/Coin'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

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
    queryKey: [StorageKey.coinFinderIgnore],
    queryFn: getCoinFinderIgnore,
    ...noRefetchQueryOptions,
  })
}

export const useCoinFinderIgnore = () => {
  const { data } = useCoinFinderIgnoreQuery()

  return shouldBePresent(data)
}

export const useAddToCoinFinderIgnoreMutation = () => {
  const { addToCoinFinderIgnore } = useCore()

  const refetch = useRefetchQueries()

  const mutationFn: AddToCoinFinderIgnoreFunction = async coinKey => {
    await addToCoinFinderIgnore(coinKey)

    await refetch([StorageKey.coinFinderIgnore])
  }

  return useMutation({
    mutationFn,
  })
}

export const useRemoveFromCoinFinderIgnoreMutation = () => {
  const { removeFromCoinFinderIgnore } = useCore()

  const refetch = useRefetchQueries()

  const mutationFn: RemoveFromCoinFinderIgnoreFunction = async coinKey => {
    await removeFromCoinFinderIgnore(coinKey)

    await refetch([StorageKey.coinFinderIgnore])
  }

  return useMutation({
    mutationFn,
  })
}
