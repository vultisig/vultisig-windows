import {
  fetchRujiraStakeView,
  toDisplayRUJI,
  toDisplayUSDC,
} from '@core/chain/chains/thorchain/ruji/services/fetchStakeView'
import { useQuery } from '@tanstack/react-query'

export const useRujiraStakeAndRewards = (address: string) =>
  useQuery({
    queryKey: ['rujira', 'stakeView', address],
    queryFn: () => fetchRujiraStakeView(address!),
    select: res => ({
      bondedRaw: res.stakeAmount,
      bonded: toDisplayRUJI(res.stakeAmount),
      pendingRaw: res.rewardsAmount,
      pendingUSDC: toDisplayUSDC(res.rewardsAmount),
    }),
  })
