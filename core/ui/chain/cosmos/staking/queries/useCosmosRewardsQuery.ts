import { useQuery } from '@tanstack/react-query'
import {
  getCosmosDelegatorRewards,
  StakingChain,
} from '@vultisig/core-chain/chains/cosmos/staking/lcdQueries'

type UseCosmosRewardsQueryInput = {
  chain: StakingChain
  delegatorAddress: string
}

/**
 * Fetches the pending (unclaimed) staking rewards per validator for a delegator
 * on a Cosmos staking chain. Disabled until `delegatorAddress` is known;
 * results are cached for 30s.
 */
export const useCosmosRewardsQuery = ({
  chain,
  delegatorAddress,
}: UseCosmosRewardsQueryInput) =>
  useQuery({
    queryKey: ['cosmosRewards', chain, delegatorAddress] as const,
    queryFn: () => getCosmosDelegatorRewards(chain, delegatorAddress),
    enabled: delegatorAddress.length > 0,
    staleTime: 30_000,
  })
