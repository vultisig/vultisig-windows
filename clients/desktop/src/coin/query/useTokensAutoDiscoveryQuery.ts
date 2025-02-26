import { ChainAccount } from '@core/chain/ChainAccount'
import { useQuery } from '@tanstack/react-query'

import { findAccountCoins } from '../balance/find/findAccountCoins'

export const getTokensAutoDiscoveryQueryKey = (account: ChainAccount) => [
  'autoDiscoverTokens',
  account,
]

export const useTokensAutoDiscoveryQuery = (account: ChainAccount) => {
  return useQuery({
    queryKey: getTokensAutoDiscoveryQueryKey(account),
    queryFn: async () => {
      const coins = await findAccountCoins(account)
      return coins
    },
    staleTime: 5 * 60 * 1000,
  })
}
