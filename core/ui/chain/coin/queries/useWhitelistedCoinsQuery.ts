import { Chain } from '@core/chain/Chain'
import { useQuery } from '@tanstack/react-query'

import { fetchWhitelistedCoins } from './fetchWhitelistedCoins'

export const useWhitelistedCoinsQuery = (chain: Chain, enabled?: boolean) => {
  return useQuery({
    queryKey: ['whitelistedCoins', chain],
    enabled,
    queryFn: () => fetchWhitelistedCoins(chain),
  })
}
