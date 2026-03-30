import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'

import { fetchWhitelistedCoins } from './fetchWhitelistedCoins'

export const useWhitelistedCoinsQuery = (chain: Chain, enabled?: boolean) => {
  return useQuery({
    queryKey: ['whitelistedCoins', chain],
    enabled,
    queryFn: () => fetchWhitelistedCoins(chain),
  })
}
