import { useQuery } from '@tanstack/react-query'
import {
  getCosmosUnbondingDelegations,
  StakingChain,
} from '@vultisig/core-chain/chains/cosmos/staking/lcdQueries'

type UseCosmosUnbondingsQueryInput = {
  chain: StakingChain
  delegatorAddress: string
}

/**
 * Fetches the in-progress unbonding delegations (entries with their completion
 * times) for a delegator on a Cosmos staking chain. Disabled until
 * `delegatorAddress` is known; results are cached for 30s.
 */
export const useCosmosUnbondingsQuery = ({
  chain,
  delegatorAddress,
}: UseCosmosUnbondingsQueryInput) =>
  useQuery({
    queryKey: ['cosmosUnbondings', chain, delegatorAddress] as const,
    queryFn: () => getCosmosUnbondingDelegations(chain, delegatorAddress),
    enabled: delegatorAddress.length > 0,
    staleTime: 30_000,
  })
