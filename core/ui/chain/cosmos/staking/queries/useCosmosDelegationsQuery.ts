import { useQuery } from '@tanstack/react-query'
import {
  getCosmosDelegations,
  StakingChain,
} from '@vultisig/core-chain/chains/cosmos/staking/lcdQueries'

type UseCosmosDelegationsQueryInput = {
  chain: StakingChain
  delegatorAddress: string
}

/**
 * Fetches the active delegations (per-validator staked balances) for a
 * delegator on a Cosmos staking chain. Disabled until `delegatorAddress` is
 * known; results are cached for 30s.
 */
export const useCosmosDelegationsQuery = ({
  chain,
  delegatorAddress,
}: UseCosmosDelegationsQueryInput) =>
  useQuery({
    queryKey: ['cosmosDelegations', chain, delegatorAddress] as const,
    queryFn: () => getCosmosDelegations(chain, delegatorAddress),
    enabled: delegatorAddress.length > 0,
    staleTime: 30_000,
  })
