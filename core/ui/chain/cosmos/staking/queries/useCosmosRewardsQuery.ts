import { useQuery } from '@tanstack/react-query'
import { IbcEnabledCosmosChain } from '@vultisig/core-chain/Chain'
import { getCosmosDelegatorRewards } from '@vultisig/core-chain/chains/cosmos/staking/lcdQueries'

type UseCosmosRewardsQueryInput = {
  chain: IbcEnabledCosmosChain
  delegatorAddress: string
}

export const useCosmosRewardsQuery = ({
  chain,
  delegatorAddress,
}: UseCosmosRewardsQueryInput) =>
  useQuery({
    queryKey: ['cosmosRewards', chain, delegatorAddress] as const,
    queryFn: () => getCosmosDelegatorRewards(chain, delegatorAddress),
    staleTime: 30_000,
  })
