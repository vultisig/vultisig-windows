import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useQuery } from '@tanstack/react-query'

import { getBondProviderRewardsQueryOptions } from './bondProviderRewardsQuery'
import { BondChurn } from './churns'
import { BondChain } from './config'
import { getBondProviderReward } from './providerRewards'

type UseBondLastRewardQueryInput = {
  chain: BondChain
  nodeAddress: string
  churn: BondChurn
}

/**
 * What the given churn paid the current vault on a bonded node, in base
 * units. Resolves to null when the vault was not a bond provider on the node
 * yet, so there is no reward to show.
 */
export const useBondLastRewardQuery = ({
  chain,
  nodeAddress,
  churn,
}: UseBondLastRewardQueryInput) => {
  const bondAddress = useCurrentVaultAddress(chain)

  return useQuery({
    ...getBondProviderRewardsQueryOptions({
      chain,
      nodeAddress,
      height: churn.height - 1,
    }),
    select: rewards => getBondProviderReward({ rewards, bondAddress }),
  })
}
