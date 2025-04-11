import { useCurrentVaultAddreses } from '@clients/desktop/src/vault/state/currentVaultCoins'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { toEntries } from '@lib/utils/record/toEntries'
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { findCoins, FindCoinsInput } from '../findCoins'
import { coinFinderChains } from '../findCoins/coinFinderChains'

export const getCoinFinderQueryKey = (input: FindCoinsInput) => [
  'coinFinder',
  input,
]

export const useCoinFinderQueries = () => {
  const addresses = useCurrentVaultAddreses()

  const coinFinderInputs = useMemo(() => {
    const result: FindCoinsInput[] = []

    toEntries(addresses).forEach(({ key, value }) => {
      if (isOneOf(key, coinFinderChains)) {
        result.push({ chain: key, address: value })
      }
    })

    return result
  }, [addresses])

  return useQueries({
    queries: coinFinderInputs.map(input => ({
      queryKey: getCoinFinderQueryKey(input),
      queryFn: () => findCoins(input),
    })),
  })
}
