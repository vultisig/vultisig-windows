import { useCore } from '@core/ui/state/core'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { getBondProviderRewardsQueryOptions } from './bondProviderRewardsQuery'
import { fetchBondUnbondHeights } from './bondUnbonds'
import { BondChurn } from './churns'
import { collectBondRewardHistory } from './collectBondRewardHistory'
import { BondChain } from './config'
import {
  fromSavedBondRewardRows,
  getSavedBondRewardsKey,
  mergeSavedBondRewardRows,
} from './savedBondRewards'

type UseBondRewardHistoryQueryInput = {
  chain: BondChain
  nodeAddress: string
  churns: BondChurn[]
}

/**
 * What each past churn paid the current vault on a bonded node, newest
 * first. Only runs while mounted, so the history loads when the sheet opens
 * rather than with the bonded list, and a failure stays out of that list.
 * Every churn read is saved on the device for good, so the history grows
 * past the few days of state the node keeps. Fails only when a read failed
 * and there is nothing to show.
 */
export const useBondRewardHistoryQuery = ({
  chain,
  nodeAddress,
  churns,
}: UseBondRewardHistoryQueryInput) => {
  const bondAddress = useCurrentVaultAddress(chain)
  const queryClient = useQueryClient()
  const { getBondRewardHistories, setBondRewardHistories } = useCore()

  return useQuery({
    queryKey: [
      'defi',
      chain,
      'bondRewardHistory',
      { nodeAddress, bondAddress, churns },
    ],
    queryFn: async ({ signal }) => {
      const key = getSavedBondRewardsKey({ chain, nodeAddress, bondAddress })

      const { rewards, readings, readFailure } = await collectBondRewardHistory(
        {
          churns,
          savedReadings: fromSavedBondRewardRows(
            (await getBondRewardHistories())[key]
          ),
          bondAddress,
          getProviderRewards: height =>
            queryClient.fetchQuery(
              getBondProviderRewardsQueryOptions({ chain, nodeAddress, height })
            ),
          getUnbondHeights: range =>
            fetchBondUnbondHeights({
              chain,
              bondAddress,
              nodeAddress,
              ...range,
            }),
          now: Date.now(),
          signal,
        }
      )

      if (readings.length > 0) {
        // Merge into what is saved now, so a write since the walk began is kept.
        const saved = await getBondRewardHistories()
        await setBondRewardHistories({
          ...saved,
          [key]: mergeSavedBondRewardRows({ rows: saved[key], readings }),
        })
      }

      if (readFailure && rewards.length === 0) {
        throw readFailure.reason
      }

      return rewards
    },
    // Each height already retries once; retrying the walk would multiply that.
    retry: false,
  })
}
