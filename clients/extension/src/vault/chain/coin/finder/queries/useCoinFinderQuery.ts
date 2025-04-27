import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { useCurrentVaultAddreses } from '@core/ui/vault/state/currentVaultCoins'
import { useQueriesToEagerQuery } from '@lib/ui/query/hooks/useQueriesToEagerQuery'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { toEntries } from '@lib/utils/record/toEntries'
import { useQueries } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { findCoins, FindCoinsInput } from '../findCoins'
import { coinFinderChains } from '../findCoins/coinFinderChains'

const getCoinFinderQueryKey = (input: FindCoinsInput) => ['coinFinder', input]

export const useCoinFinderQuery = () => {
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

  const queries = useQueries({
    queries: coinFinderInputs.map(input => ({
      queryKey: getCoinFinderQueryKey(input),
      queryFn: () => findCoins(input),
      meta: {
        disablePersist: true,
      },
    })),
  })

  return useQueriesToEagerQuery({
    queries,
    joinData: useCallback((data: AccountCoin[][]) => data.flat(), []),
  })
}
