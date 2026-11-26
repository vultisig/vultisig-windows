import { OnCloseProp } from '@lib/ui/props'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { formatWalletAddress } from '@vultisig/lib-utils/formatWalletAddress'
import { useTranslation } from 'react-i18next'

import { BondChurn } from '../../../queries/bondRewards/churns'
import { BondChain } from '../../../queries/bondRewards/config'
import { useBondRewardHistoryQuery } from '../../../queries/bondRewards/useBondRewardHistoryQuery'
import { RewardHistorySheet } from '../../rewards/RewardHistorySheet'

type BondRewardHistorySheetProps = OnCloseProp & {
  chain: BondChain
  coin: Coin
  nodeAddress: string
  nextReward: number
  recentChurns: BondChurn[]
}

/**
 * Total Rewards Earned on one bonded node: the churn payouts summed, the
 * share still accruing toward the next churn, then one row per past churn,
 * newest first, leaving out churns that paid nothing. The history loads when
 * the sheet opens.
 */
export const BondRewardHistorySheet = ({
  chain,
  coin,
  nodeAddress,
  nextReward,
  recentChurns,
  onClose,
}: BondRewardHistorySheetProps) => {
  const { t } = useTranslation()
  const historyQuery = useBondRewardHistoryQuery({
    chain,
    nodeAddress,
    churns: recentChurns,
  })
  const rewardsQuery = useTransformQueryData(historyQuery, rewards =>
    rewards.filter(({ amount }) => amount > 0n)
  )

  return (
    <RewardHistorySheet
      coin={coin}
      subtitle={t('bond_reward_history_node', {
        address: formatWalletAddress(nodeAddress),
      })}
      upcomingReward={nextReward}
      historyQuery={rewardsQuery}
      onClose={onClose}
    />
  )
}
