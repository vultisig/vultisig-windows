import { toBatches } from '@vultisig/lib-utils/array/toBatches'

import { BondChurn } from './churns'
import { bondRewardHistoryBatchSize } from './config'
import { BondProviderRewards, getBondProviderReward } from './providerRewards'

/** What one churn paid a bond provider, in the chain's base units. */
type BondChurnReward = BondChurn & {
  amount: bigint
}

type CollectBondRewardHistoryInput = {
  churns: BondChurn[]
  bondAddress: string
  getProviderRewards: (height: number) => Promise<BondProviderRewards>
  signal?: AbortSignal
}

/**
 * Walks the churns newest first, reading each one's payouts one block before
 * it landed, while the award was still on the node. The walk stops at the
 * first churn where the address was not a bond provider, since nothing older
 * belongs to this position; churns that paid nothing are left out.
 *
 * Reads run in batches but are judged in order, so a failed read only fails
 * the history when the walk actually reaches it.
 */
export const collectBondRewardHistory = async ({
  churns,
  bondAddress,
  getProviderRewards,
  signal,
}: CollectBondRewardHistoryInput): Promise<BondChurnReward[]> => {
  const rewards: BondChurnReward[] = []

  for (const batch of toBatches(churns, bondRewardHistoryBatchSize)) {
    signal?.throwIfAborted()

    const results = await Promise.allSettled(
      batch.map(({ height }) => getProviderRewards(height - 1))
    )

    for (const [index, result] of results.entries()) {
      if (result.status === 'rejected') {
        throw result.reason
      }

      const amount = getBondProviderReward({
        rewards: result.value,
        bondAddress,
      })

      if (amount === null) {
        return rewards
      }

      if (amount > 0n) {
        rewards.push({ ...batch[index], amount })
      }
    }
  }

  return rewards
}
