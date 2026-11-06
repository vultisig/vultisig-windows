import { OnCloseProp } from '@lib/ui/props'

import { runeCoin } from '../../queries/tokens'
import { useTcyRewardHistoryQuery } from '../../queries/useTcyRewardHistoryQuery'
import { RewardHistorySheet } from '../rewards/RewardHistorySheet'

type TcyRewardHistorySheetProps = OnCloseProp & {
  title: string
  estimatedReward?: number
}

/** Total Rewards Earned from TCY staking; the history loads when the sheet opens. */
export const TcyRewardHistorySheet = ({
  title,
  estimatedReward,
  onClose,
}: TcyRewardHistorySheetProps) => {
  const historyQuery = useTcyRewardHistoryQuery()

  return (
    <RewardHistorySheet
      coin={runeCoin}
      subtitle={title}
      upcomingReward={estimatedReward}
      historyQuery={historyQuery}
      onClose={onClose}
    />
  )
}
