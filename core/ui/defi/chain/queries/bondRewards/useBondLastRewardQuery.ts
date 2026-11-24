import { useCore } from '@core/ui/state/core'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { getBondProviderRewardsQueryOptions } from './bondProviderRewardsQuery'
import { BondChurn, isWithinBondRewardFetchWindow } from './churns'
import { BondChain } from './config'
import { getBondProviderReward } from './providerRewards'
import {
  fromSavedBondRewardRows,
  getSavedBondRewardsKey,
} from './savedBondRewards'

type UseBondLastRewardQueryInput = {
  chain: BondChain
  nodeAddress: string
  churn: BondChurn
}

/**
 * What the given churn paid the current vault on a bonded node, in base
 * units. Resolves to null when the vault was not a bond provider on the node
 * yet, or when the churn is too old for the node to still hold its state and
 * no saved reward covers it, so there is no reward to show.
 */
export const useBondLastRewardQuery = ({
  chain,
  nodeAddress,
  churn,
}: UseBondLastRewardQueryInput) => {
  const bondAddress = useCurrentVaultAddress(chain)
  const queryClient = useQueryClient()
  const { getBondRewardHistories } = useCore()

  return useQuery({
    queryKey: [
      'defi',
      chain,
      'bondLastReward',
      { nodeAddress, bondAddress, height: churn.height },
    ],
    queryFn: async () => {
      if (isWithinBondRewardFetchWindow({ churn, now: Date.now() })) {
        const rewards = await queryClient.fetchQuery(
          getBondProviderRewardsQueryOptions({
            chain,
            nodeAddress,
            height: churn.height - 1,
          })
        )

        return getBondProviderReward({ rewards, bondAddress })
      }

      const key = getSavedBondRewardsKey({ chain, nodeAddress, bondAddress })
      const saved = fromSavedBondRewardRows(
        (await getBondRewardHistories())[key]
      ).find(({ height }) => height === churn.height)

      return saved?.amount ?? null
    },
    retry: false,
  })
}
