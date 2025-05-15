import { getChainKind } from '@core/chain/ChainKind'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { findCoins } from '@core/chain/coin/find'
import { coinFinderChainKinds } from '@core/chain/coin/find/CoinFinderChainKind'
import { FindCoinsResolverInput } from '@core/chain/coin/find/FindCoinsResolver'
import { useCurrentVaultAddresses } from '@core/ui/vault/state/currentVaultCoins'
import { useQueriesToEagerQuery } from '@lib/ui/query/hooks/useQueriesToEagerQuery'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { toEntries } from '@lib/utils/record/toEntries'
import { convertDuration } from '@lib/utils/time/convertDuration'
import { useQueries } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

export const getCoinFinderQueryKey = (input: FindCoinsResolverInput) => [
  'coinFinder',
  input,
]

export const useCoinFinderQuery = () => {
  const addresses = useCurrentVaultAddresses()

  const coinFinderInputs = useMemo(() => {
    const result: FindCoinsResolverInput[] = []

    toEntries(addresses).forEach(({ key, value }) => {
      const chainKind = getChainKind(key)
      if (isOneOf(chainKind, coinFinderChainKinds)) {
        result.push({ chain: key, address: value })
      }
    })

    return result
  }, [addresses])

  const queries = useQueries({
    queries: coinFinderInputs.map(input => ({
      queryKey: getCoinFinderQueryKey(input),
      queryFn: () => findCoins(input),
      staleTime: convertDuration(1, 'h', 'ms'),
    })),
  })

  return useQueriesToEagerQuery({
    queries,
    joinData: useCallback((data: AccountCoin[][]) => data.flat(), []),
  })
}
