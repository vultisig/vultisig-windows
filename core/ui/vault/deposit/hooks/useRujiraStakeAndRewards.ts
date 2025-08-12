import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { rujiraStakingConfig } from '@core/chain/chains/cosmos/thor/rujira/config'
import { fetchRujiraStakeView } from '@core/chain/chains/thorchain/ruji/services/fetchStakeView'
import { useQuery } from '@tanstack/react-query'

import { useCurrentVaultAddress } from '../../state/currentVaultCoins'

export const useRujiraStakeAndRewards = () => {
  const address = useCurrentVaultAddress(Chain.THORChain)

  return useQuery({
    queryKey: ['rujira', 'stakeView', address],
    queryFn: () => fetchRujiraStakeView(address!),
    select: res => ({
      bondedRaw: res.stakeAmount,
      bonded: fromChainAmount(
        res.stakeAmount,
        rujiraStakingConfig.bondDecimals
      ),
      rewardsRaw: res.rewardsAmount,
      rewardsUSDC: fromChainAmount(
        res.rewardsAmount,
        rujiraStakingConfig.revenueDecimals
      ),
    }),
  })
}
