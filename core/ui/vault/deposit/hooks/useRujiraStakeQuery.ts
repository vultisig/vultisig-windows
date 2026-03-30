import { useQuery } from '@tanstack/react-query'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { rujiraStakingConfig } from '@vultisig/core-chain/chains/cosmos/thor/rujira/config'
import { fetchRujiraStakeView } from '@vultisig/core-chain/chains/thorchain/ruji/services/fetchStakeView'

import { useCurrentVaultAddresses } from '../../state/currentVaultCoins'

export const useRujiraStakeQuery = () => {
  const addresses = useCurrentVaultAddresses() || []
  const [, address] =
    Object.entries(addresses).find(([chain]) => chain === Chain.THORChain) || []

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
