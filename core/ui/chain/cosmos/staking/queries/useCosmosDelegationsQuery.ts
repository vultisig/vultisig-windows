import { useQuery } from '@tanstack/react-query'
import {
  getCosmosDelegations,
  StakingChain,
} from '@vultisig/core-chain/chains/cosmos/staking/lcdQueries'

type UseCosmosDelegationsQueryInput = {
  chain: StakingChain
  delegatorAddress: string
}

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
