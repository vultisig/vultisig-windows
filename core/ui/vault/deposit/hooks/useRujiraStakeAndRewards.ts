import { Chain } from '@core/chain/Chain'
import {
  fetchRujiraStakeView,
  toDisplayRUJI,
  toDisplayUSDC,
} from '@core/chain/chains/thorchain/ruji/services/fetchStakeView'
import { useQuery } from '@tanstack/react-query'

import { useCurrentVaultAddress } from '../../state/currentVaultCoins'

export const useRujiraStakeAndRewards = () => {
  const address = useCurrentVaultAddress(Chain.THORChain)

  return useQuery({
    queryKey: ['rujira', 'stakeView', address],
    queryFn: () => fetchRujiraStakeView(address!),
    select: res => ({
      bondedRaw: res.stakeAmount,
      bonded: toDisplayRUJI(res.stakeAmount),
      rewardsRaw: res.rewardsAmount,
      rewardsUSDC: toDisplayUSDC(res.rewardsAmount),
    }),
  })
}
