import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { getBondProviderRewardsQueryOptions } from './bondProviderRewardsQuery'
import { BondChurn } from './churns'
import { collectBondRewardHistory } from './collectBondRewardHistory'
import { BondChain } from './config'

type UseBondRewardHistoryQueryInput = {
  chain: BondChain
  nodeAddress: string
  churns: BondChurn[]
}

/**
 * What each past churn paid the current vault on a bonded node, newest
 * first. Only runs while mounted, so the history loads when the sheet opens
 * rather than with the bonded list, and a failure stays out of that list.
 */
export const useBondRewardHistoryQuery = ({
  chain,
  nodeAddress,
  churns,
}: UseBondRewardHistoryQueryInput) => {
  const bondAddress = useCurrentVaultAddress(chain)
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: [
      'defi',
      chain,
      'bondRewardHistory',
      { nodeAddress, bondAddress, churns },
    ],
    queryFn: ({ signal }) =>
      collectBondRewardHistory({
        churns,
        bondAddress,
        signal,
        getProviderRewards: height =>
          queryClient.fetchQuery(
            getBondProviderRewardsQueryOptions({ chain, nodeAddress, height })
          ),
      }),
    staleTime: Infinity,
  })
}
