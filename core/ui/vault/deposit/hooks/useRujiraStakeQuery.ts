import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { rujiraStakingConfig } from '@core/chain/chains/cosmos/thor/rujira/config'
import { fetchRujiraStakeView } from '@core/chain/chains/thorchain/ruji/services/fetchStakeView'
import { useQuery } from '@tanstack/react-query'

import { useCurrentVaultAddress } from '../../state/currentVaultCoins'

export const useRujiraStakeQuery = () => {
  const address = useCurrentVaultAddress(Chain.THORChain)

  return useQuery({
    queryKey: ['rujira', 'stakeView', address],
    queryFn: () => fetchRujiraStakeView(address!),
    select: res => ({
      bonded: fromChainAmount(
        res.stakeAmount,
        rujiraStakingConfig.bondDecimals
      ),
      rewardsUSDC: fromChainAmount(
        res.rewardsAmount,
        rujiraStakingConfig.revenueDecimals
      ),
    }),
  })
}
