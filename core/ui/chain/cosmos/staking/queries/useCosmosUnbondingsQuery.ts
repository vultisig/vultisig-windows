import { useQuery } from '@tanstack/react-query'
import { IbcEnabledCosmosChain } from '@vultisig/core-chain/Chain'
import { getCosmosUnbondingDelegations } from '@vultisig/core-chain/chains/cosmos/staking/lcdQueries'

type UseCosmosUnbondingsQueryInput = {
  chain: IbcEnabledCosmosChain
  delegatorAddress: string
}

export const useCosmosUnbondingsQuery = ({
  chain,
  delegatorAddress,
}: UseCosmosUnbondingsQueryInput) =>
  useQuery({
    queryKey: ['cosmosUnbondings', chain, delegatorAddress] as const,
    queryFn: () => getCosmosUnbondingDelegations(chain, delegatorAddress),
    staleTime: 30_000,
  })
